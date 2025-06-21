
-- Adicionar colunas necessárias à tabela profiles se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Criar tabela para tokens de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar políticas RLS para whatsapp_tokens se não existirem
ALTER TABLE public.whatsapp_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tokens" ON public.whatsapp_tokens;
CREATE POLICY "Users can view their own tokens" 
  ON public.whatsapp_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tokens" ON public.whatsapp_tokens;
CREATE POLICY "Users can update their own tokens" 
  ON public.whatsapp_tokens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.whatsapp_tokens;
CREATE POLICY "Users can insert their own tokens" 
  ON public.whatsapp_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar função para atualizar updated_at automaticamente se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para whatsapp_tokens
DROP TRIGGER IF EXISTS update_whatsapp_tokens_updated_at ON public.whatsapp_tokens;
CREATE TRIGGER update_whatsapp_tokens_updated_at 
  BEFORE UPDATE ON public.whatsapp_tokens 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
