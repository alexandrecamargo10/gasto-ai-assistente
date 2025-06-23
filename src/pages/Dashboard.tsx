
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ExpenseManagement from '@/components/dashboard/ExpenseManagement';
import CategoryManagement from '@/components/dashboard/CategoryManagement';
import SettingsPanel from '@/components/dashboard/SettingsPanel';
import ReportsPanel from '@/components/dashboard/ReportsPanel';
import CategoryLimits from '@/components/dashboard/CategoryLimits';
import SimpleDashboard from '@/components/dashboard/SimpleDashboard';
import { LogOut, User, Settings, BarChart3, PlusCircle, Tags, DollarSign, Crown, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkCheckoutStatus();
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

  const checkCheckoutStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkout = urlParams.get('checkout');
    
    if (checkout === 'success') {
      toast({
        title: "Pagamento realizado!",
        description: "Sua assinatura foi ativada com sucesso."
      });
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Atualizar perfil
      fetchProfile();
    } else if (checkout === 'cancelled') {
      toast({
        title: "Pagamento cancelado",
        description: "O processo de pagamento foi cancelado.",
        variant: "destructive"
      });
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-500';
      case 'STANDARD': return 'bg-blue-500';
      case 'TOP': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const isTrialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const trialDaysLeft = profile?.trial_ends_at 
    ? Math.ceil((new Date(profile.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-charcoal-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Dashboard simples para planos FREE e STANDARD
  if (profile?.plan === 'FREE' || profile?.plan === 'STANDARD') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-charcoal-800">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md shadow-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">gastoZ</h1>
                <Badge className={getPlanBadgeColor(profile?.plan)}>
                  {profile?.plan}
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-white/80">
                  Olá, {profile?.name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={signOut} className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-navy-900">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TooltipProvider>
            <Tabs defaultValue="settings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-md">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="overview" disabled className="flex items-center space-x-2 text-white/50 cursor-not-allowed">
                      <Lock className="h-4 w-4" />
                      <span>Visão Geral</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Disponível apenas no Plano TOP</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="expenses" disabled className="flex items-center space-x-2 text-white/50 cursor-not-allowed">
                      <Lock className="h-4 w-4" />
                      <span>Gastos</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Disponível apenas no Plano TOP</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="categories" disabled className="flex items-center space-x-2 text-white/50 cursor-not-allowed">
                      <Lock className="h-4 w-4" />
                      <span>Categorias</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Disponível apenas no Plano TOP</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="limits" disabled className="flex items-center space-x-2 text-white/50 cursor-not-allowed">
                      <Lock className="h-4 w-4" />
                      <span>Limites</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Disponível apenas no Plano TOP</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="reports" disabled className="flex items-center space-x-2 text-white/50 cursor-not-allowed">
                      <Lock className="h-4 w-4" />
                      <span>Relatórios</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Disponível apenas no Plano TOP</p>
                  </TooltipContent>
                </Tooltip>

                <TabsTrigger value="settings" className="flex items-center space-x-2 text-white data-[state=active]:bg-white/20">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-6">
                <SettingsPanel />
              </TabsContent>
            </Tabs>
          </TooltipProvider>
        </main>
      </div>
    );
  }

  // Dashboard completa para plano TOP
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-charcoal-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">gastoZ</h1>
              <Badge className={getPlanBadgeColor(profile?.plan)}>
                <Crown className="h-4 w-4 mr-1" />
                {profile?.plan}
              </Badge>
              {isTrialActive && (
                <Badge variant="outline" className="text-teal-300 border-teal-300">
                  Trial: {trialDaysLeft} dias restantes
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/80">
                Olá, {profile?.name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut} className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-navy-900">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="overview" className="flex items-center space-x-2 text-white data-[state=active]:bg-white/20">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center space-x-2 text-white data-[state=active]:bg-white/20">
              <PlusCircle className="h-4 w-4" />
              <span>Gastos</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2 text-white data-[state=active]:bg-white/20">
              <Tags className="h-4 w-4" />
              <span>Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center space-x-2 text-white data-[state=active]:bg-white/20">
              <DollarSign className="h-4 w-4" />
              <span>Limites</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2 text-white data-[state=active]:bg-white/20">
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 text-white data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseManagement />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="limits" className="space-y-6">
            <CategoryLimits />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
