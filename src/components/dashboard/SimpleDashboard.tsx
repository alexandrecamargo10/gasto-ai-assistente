import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, User, Smartphone, CreditCard } from 'lucide-react';
import WhatsAppConnection from './WhatsAppConnection';

interface Profile {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  subscription_status: string | null;
  subscription_end_date: string | null;
}

const SimpleDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleUpgradeStandard = () => {
    window.open('https://buy.stripe.com/test_bJedR93DC8xicDV8Ylao800', '_blank');
  };

  const handleUpgradeTop = () => {
    window.open('https://buy.stripe.com/test_00w00j3DC5l69rJdeBao801', '_blank');
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      // Abrir portal em nova aba
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Erro ao abrir portal:', error);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-500';
      case 'STANDARD': return 'bg-blue-500';
      case 'TOP': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'TOP': return <Crown className="h-4 w-4" />;
      case 'STANDARD': return <Smartphone className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getPlanLimitations = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return [
          "• 5 lançamentos por dia",
          "• Relatórios diários e semanais apenas",
          "• Histórico limitado a 1 semana",
          "• Acesso via WhatsApp"
        ];
      case 'STANDARD':
        return [
          "• Lançamentos ilimitados",
          "• Relatórios de até 1 ano",
          "• Histórico completo",
          "• Acesso via WhatsApp"
        ];
      case 'TOP':
        return [
          "• Sem limitações",
          "• Dashboard web completa",
          "• Histórico ilimitado",
          "• Relatórios avançados"
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-charcoal-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações do Perfil */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Meu Perfil</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60">Nome</p>
              <p className="text-white">{profile?.name || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Email</p>
              <p className="text-white">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Plano Atual</p>
              <Badge className={getPlanColor(profile?.plan || 'FREE')}>
                {getPlanIcon(profile?.plan || 'FREE')}
                <span className="ml-1">{profile?.plan || 'FREE'}</span>
              </Badge>
            </div>
            {profile?.subscription_end_date && (
              <div>
                <p className="text-sm text-white/60">Renovação</p>
                <p className="text-white">
                  {new Date(profile.subscription_end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Limitações do Plano Atual */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Seu Plano: {profile?.plan || 'FREE'}</CardTitle>
          <CardDescription className="text-white/60">
            Funcionalidades disponíveis no seu plano atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-white/80 space-y-2">
            {getPlanLimitations(profile?.plan || 'FREE').map((limitation, index) => (
              <li key={index}>{limitation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Conexão WhatsApp */}
      <WhatsAppConnection />

      {/* Planos Disponíveis */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Upgrade do Plano</CardTitle>
          <CardDescription className="text-white/60">
            Faça upgrade para desbloquear mais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.plan !== 'STANDARD' && profile?.plan !== 'TOP' && (
            <div className="border border-white/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-blue-400" />
                    <span>STANDARD</span>
                  </h3>
                  <p className="text-white/60">Para uso pessoal completo</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">R$ 9,90</p>
                  <p className="text-white/60">/mês</p>
                </div>
              </div>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Transações ilimitadas via WhatsApp</li>
                <li>• Relatórios avançados (até 1 ano)</li>
                <li>• Categorias personalizadas</li>
                <li>• Alertas de orçamento</li>
                <li>• Suporte prioritário</li>
              </ul>
              <Button 
                onClick={handleUpgradeStandard}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade para Standard
              </Button>
            </div>
          )}

          {profile?.plan !== 'TOP' && (
            <div className="border-2 border-purple-500 rounded-lg p-4 space-y-3 relative">
              <div className="absolute -top-3 left-4">
                <Badge className="bg-purple-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-purple-400" />
                    <span>TOP</span>
                  </h3>
                  <p className="text-white/60">Experiência completa + Dashboard</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">R$ 19,90</p>
                  <p className="text-white/60">/mês</p>
                </div>
              </div>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Tudo do Standard +</li>
                <li>• Dashboard web completa</li>
                <li>• Gráficos e insights avançados</li>
                <li>• Análises preditivas</li>
                <li>• Gestão avançada de categorias</li>
                <li>• Export em múltiplos formatos</li>
                <li>• 7 dias grátis para testar</li>
              </ul>
              <Button 
                onClick={handleUpgradeTop}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Teste Grátis 7 Dias (TOP)
              </Button>
            </div>
          )}

          {(profile?.plan === 'STANDARD' || profile?.plan === 'TOP') && (
            <div className="border border-white/20 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white">Gerenciar Assinatura</h3>
              <p className="text-white/60">
                Altere seu plano, método de pagamento ou cancele sua assinatura
              </p>
              <Button 
                onClick={handleManageSubscription}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Gerenciar no Stripe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funcionalidades Bloqueadas */}
      {profile?.plan !== 'TOP' && (
        <Card className="bg-orange-500/10 backdrop-blur-md border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-orange-400">Funcionalidades Premium</CardTitle>
            <CardDescription className="text-orange-300/80">
              Disponíveis apenas no plano TOP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-orange-200 space-y-2">
              <li>• Dashboard completa com gráficos</li>
              <li>• Relatórios avançados e análises</li>
              <li>• Gestão avançada de categorias</li>
              <li>• Limites por categoria</li>
              <li>• Configurações personalizadas</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleDashboard;
