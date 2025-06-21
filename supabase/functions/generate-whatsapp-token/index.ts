
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-TOKEN] ${step}${detailsStr}`);
};

// Função para gerar token seguro
function generateSecureToken(userId: string): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${userId.slice(0, 8)}_${timestamp}_${randomString}`;
}

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Desativar tokens antigos
    await supabaseClient
      .from("whatsapp_tokens")
      .update({ is_active: false })
      .eq("user_id", user.id);

    // Gerar novo token
    const newToken = generateSecureToken(user.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Token válido por 30 dias

    const { data: tokenData, error: tokenError } = await supabaseClient
      .from("whatsapp_tokens")
      .insert({
        user_id: user.id,
        token: newToken,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (tokenError) throw tokenError;

    logStep("Token generated", { tokenId: tokenData.id });

    // Gerar link do WhatsApp (você pode configurar seu número aqui)
    const whatsappNumber = "+5511999999999"; // Substitua pelo seu número
    const whatsappLink = `https://wa.me/${whatsappNumber.replace('+', '')}?text=start_gastoZ_${newToken}`;

    return new Response(JSON.stringify({ 
      token: newToken,
      whatsapp_link: whatsappLink,
      expires_at: expiresAt.toISOString()
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
