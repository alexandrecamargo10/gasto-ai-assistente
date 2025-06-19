
-- Enum para os planos de usuário
CREATE TYPE public.user_plan AS ENUM ('FREE', 'STANDARD', 'TOP');

-- Enum para status de assinatura
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'trial', 'expired');

-- Enum para categorias de gastos
CREATE TYPE public.expense_category AS ENUM (
  'alimentacao', 'transporte', 'moradia', 'saude', 'educacao', 
  'lazer', 'vestuario', 'contas', 'investimentos', 'salario', 
  'diversos', 'assinaturas'
);

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  plan user_plan NOT NULL DEFAULT 'FREE',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan user_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'trial',
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações do usuário
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assistant_name TEXT DEFAULT 'gastoZ',
  assistant_tone TEXT DEFAULT 'amigavel',
  total_budget_limit DECIMAL(10,2),
  alert_percentage INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de categorias personalizadas
CREATE TABLE public.custom_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de limites por categoria
CREATE TABLE public.category_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category expense_category,
  custom_category_id UUID REFERENCES public.custom_categories(id) ON DELETE CASCADE,
  limit_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK ((category IS NOT NULL) OR (custom_category_id IS NOT NULL))
);

-- Tabela de gastos
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category expense_category,
  custom_category_id UUID REFERENCES public.custom_categories(id),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK ((category IS NOT NULL) OR (custom_category_id IS NOT NULL))
);

-- Tabela de cupons
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  plan_granted user_plan NOT NULL,
  days_granted INTEGER NOT NULL,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de uso de cupons
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas RLS para user_settings
CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para custom_categories
CREATE POLICY "Users can manage their own categories" ON public.custom_categories
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para category_limits
CREATE POLICY "Users can manage their own category limits" ON public.category_limits
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para expenses
CREATE POLICY "Users can manage their own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para coupons (apenas leitura para usuários)
CREATE POLICY "Users can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

-- Políticas RLS para coupon_usages
CREATE POLICY "Users can view their own coupon usage" ON public.coupon_usages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create coupon usage" ON public.coupon_usages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, plan, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'TOP',
    NOW() + INTERVAL '7 days'
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER custom_categories_updated_at BEFORE UPDATE ON public.custom_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER category_limits_updated_at BEFORE UPDATE ON public.category_limits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
