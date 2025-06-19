
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ExpenseManagement from '@/components/dashboard/ExpenseManagement';
import CategoryManagement from '@/components/dashboard/CategoryManagement';
import SettingsPanel from '@/components/dashboard/SettingsPanel';
import ReportsPanel from '@/components/dashboard/ReportsPanel';
import { LogOut, User, Settings, BarChart3, PlusCircle, Tags } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
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

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-500';
      case 'STANDARD': return 'bg-blue-500';
      case 'TOP': return 'bg-gold-500';
      default: return 'bg-gray-500';
    }
  };

  const isTrialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const trialDaysLeft = profile?.trial_ends_at 
    ? Math.ceil((new Date(profile.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">gastoZ</h1>
              <Badge className={getPlanBadgeColor(profile?.plan)}>
                {profile?.plan}
              </Badge>
              {isTrialActive && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Trial: {trialDaysLeft} dias restantes
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {profile?.name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile?.plan !== 'TOP' ? (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">
                Dashboard Disponível Apenas no Plano TOP
              </CardTitle>
              <CardDescription className="text-orange-600">
                Faça upgrade para o plano TOP para acessar todas as funcionalidades da dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Fazer Upgrade
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center space-x-2">
                <PlusCircle className="h-4 w-4" />
                <span>Gastos</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <Tags className="h-4 w-4" />
                <span>Categorias</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
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

            <TabsContent value="reports" className="space-y-6">
              <ReportsPanel />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SettingsPanel />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
