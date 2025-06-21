
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { plan } = await req.json();
    if (!plan || !['STANDARD', 'TOP'].includes(plan)) {
      throw new Error("Invalid plan specified");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verificar se já existe um customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Definir preços baseado no plano
    const priceData = {
      STANDARD: {
        currency: "brl",
        product_data: { name: "gastoZ Standard" },
        unit_amount: 990, // R$ 9,90
        recurring: { interval: "month" },
      },
      TOP: {
        currency: "brl",
        product_data: { name: "gastoZ TOP" },
        unit_amount: 1990, // R$ 19,90
        recurring: { interval: "month" },
      }
    };

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    const sessionConfig: any = {
      customer: customerId,
      line_items: [
        {
          price_data: priceData[plan as keyof typeof priceData],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        plan: plan
      }
    };

    // Adicionar trial apenas para plano TOP
    if (plan === 'TOP') {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          plan: plan
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
