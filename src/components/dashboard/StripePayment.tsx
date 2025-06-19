
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Star, Zap, CreditCard } from 'lucide-react';

const StripePayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string, priceId: string) => {
    setProcessingPayment(true);
    try {
      // Aqui você implementaria a lógica do Stripe
      // Por enquanto, apenas uma simulação
      toast({
        title: "Stripe não configurado",
        description: "A integração com Stripe precisa ser configurada com suas chaves de API",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const plans = [
    {
      name: 'FREE',
      price: 'Grátis',
      description: 'Para começar',
      features: [
        'Até 10 transações por mês',
        'Categorias básicas',
        'Relatórios simples'
      ],
      current: profile?.plan === 'FREE'
    },
    {
      name: 'STANDARD',
      price: 'R$ 19,90/mês',
      description: 'Para uso pessoal',
      features: [
        'Transações ilimitadas',
        'Categorias personalizadas',
        'Relatórios avançados',
        'Alertas de orçamento',
        'Suporte por email'
      ],
      current: profile?.plan === 'STANDARD',
      priceId: 'price_standard'
    },
    {
      name: 'TOP',
      price: 'R$ 39,90/mês',
      description: 'Para máximo controle',
      features: [
        'Tudo do Standard',
        'Dashboard completa',
        'Integração WhatsApp',
        'IA personalizada',
        'Relatórios em PDF',
        'Suporte prioritário',
        'Limites por categoria'
      ],
      current: profile?.plan === 'TOP',
      popular: true,
      priceId: 'price_top'
    }
  ];

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Escolha seu Plano</CardTitle>
          <CardDescription className="text-white/60">
            Upgrade para desbloquear mais funcionalidades
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative bg-white/10 backdrop-blur-md border-white/20 ${
              plan.current ? 'ring-2 ring-blue-500' : ''
            } ${plan.popular ? 'ring-2 ring-yellow-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-black">
                  <Crown className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            {plan.current && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-blue-500">
                  <Check className="h-3 w-3 mr-1" />
                  Atual
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {plan.name === 'FREE' && <Zap className="h-8 w-8 text-gray-400" />}
                {plan.name === 'STANDARD' && <Star className="h-8 w-8 text-blue-400" />}
                {plan.name === 'TOP' && <Crown className="h-8 w-8 text-yellow-400" />}
              </div>
              <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-white">{plan.price}</div>
              <CardDescription className="text-white/60">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-white/80">
                    <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {!plan.current && plan.priceId && (
                <Button 
                  onClick={() => handleUpgrade(plan.name, plan.priceId)}
                  disabled={processingPayment}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {processingPayment ? 'Processando...' : `Upgrade para ${plan.name}`}
                </Button>
              )}

              {plan.current && (
                <Button disabled className="w-full">
                  Plano Atual
                </Button>
              )}

              {plan.name === 'FREE' && !plan.current && (
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Downgrade para FREE
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Informações sobre Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
            <div>
              <h4 className="font-medium text-white mb-2">Métodos de Pagamento</h4>
              <ul className="space-y-1">
                <li>• Cartão de Crédito (Visa, Mastercard)</li>
                <li>• Cartão de Débito</li>
                <li>• PIX (em breve)</li>
                <li>• Boleto (em breve)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Termos</h4>
              <ul className="space-y-1">
                <li>• Cobrança mensal automática</li>
                <li>• Cancele a qualquer momento</li>
                <li>• Reembolso em 7 dias</li>
                <li>• Sem taxas ocultas</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-4">
            <p className="text-xs text-white/60">
              Pagamentos processados com segurança pelo Stripe. Seus dados estão protegidos com criptografia de ponta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripePayment;
