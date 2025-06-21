
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-TOKEN] ${step}${detailsStr}`);
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

    const { token, whatsapp_number } = await req.json();
    if (!token) throw new Error("Token is required");

    logStep("Validating token", { token: token.slice(0, 10) + "..." });

    // Buscar token no banco
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from("whatsapp_tokens")
      .select("*, profiles!inner(id, email, name)")
      .eq("token", token)
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      logStep("Token not found or expired");
      return new Response(JSON.stringify({ 
        valid: false, 
        message: "Token inválido ou expirado" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Token validated", { userId: tokenData.user_id });

    // Associar número do WhatsApp ao token se fornecido
    if (whatsapp_number) {
      await supabaseClient
        .from("whatsapp_tokens")
        .update({ whatsapp_number })
        .eq("id", tokenData.id);

      logStep("WhatsApp number associated", { whatsapp_number });
    }

    return new Response(JSON.stringify({
      valid: true,
      user_id: tokenData.user_id,
      user_email: tokenData.profiles.email,
      user_name: tokenData.profiles.name,
      whatsapp_number: whatsapp_number || tokenData.whatsapp_number
    }), {
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
