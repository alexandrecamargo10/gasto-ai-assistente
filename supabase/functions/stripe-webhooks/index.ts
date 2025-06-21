
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err });
        return new Response("Webhook signature verification failed", { status: 400 });
      }
    } else {
      event = JSON.parse(body);
      logStep("Processing webhook without signature verification");
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          logStep("Checkout completed", { userId, plan, sessionId: session.id });
          
          // Atualizar perfil do usuário
          await supabaseClient
            .from("profiles")
            .update({
              plan: plan,
              stripe_customer_id: session.customer as string,
              subscription_status: "active",
              updated_at: new Date().toISOString()
            })
            .eq("id", userId);

          // Criar registro de assinatura
          if (session.subscription) {
            await supabaseClient
              .from("subscriptions")
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                plan: plan,
                status: "active"
              });
          }

          logStep("User profile and subscription updated");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Buscar usuário pelo customer ID
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          const isActive = subscription.status === "active";
          const plan = subscription.status === "active" ? 
            (subscription.items.data[0].price.unit_amount === 990 ? "STANDARD" : "TOP") : 
            "FREE";

          await supabaseClient
            .from("profiles")
            .update({
              plan: plan,
              subscription_status: subscription.status,
              subscription_end_date: subscription.status === "active" ? 
                new Date(subscription.current_period_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq("id", profile.id);

          await supabaseClient
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("stripe_subscription_id", subscription.id);

          logStep("Subscription updated", { userId: profile.id, status: subscription.status });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabaseClient
            .from("profiles")
            .update({
              plan: "FREE",
              subscription_status: "canceled",
              subscription_end_date: null,
              updated_at: new Date().toISOString()
            })
            .eq("id", profile.id);

          await supabaseClient
            .from("subscriptions")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString()
            })
            .eq("stripe_subscription_id", subscription.id);

          logStep("Subscription canceled", { userId: profile.id });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          logStep("Payment succeeded", { subscriptionId: invoice.subscription });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const customerId = invoice.customer as string;
          
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profile) {
            await supabaseClient
              .from("profiles")
              .update({
                subscription_status: "past_due",
                updated_at: new Date().toISOString()
              })
              .eq("id", profile.id);

            logStep("Payment failed - marked as past_due", { userId: profile.id });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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
