
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    totalLastMonth: 0,
    totalExpenses: 0,
    categoriesCount: 0
  });
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOverviewData();
    }
  }, [user]);

  const fetchOverviewData = async () => {
    try {
      const currentMonth = new Date();
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const firstDayCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      // Total this month
      const { data: thisMonthData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user?.id)
        .gte('expense_date', firstDayCurrentMonth.toISOString().split('T')[0]);

      // Total last month
      const { data: lastMonthData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user?.id)
        .gte('expense_date', lastMonth.toISOString().split('T')[0])
        .lt('expense_date', firstDayCurrentMonth.toISOString().split('T')[0]);

      // Total expenses count
      const { count: totalExpenses } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Categories count
      const { count: categoriesCount } = await supabase
        .from('custom_categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Recent expenses
      const { data: recent } = await supabase
        .from('expenses')
        .select('*, custom_categories(name)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalThisMonth: thisMonthData?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0,
        totalLastMonth: lastMonthData?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0,
        totalExpenses: totalExpenses || 0,
        categoriesCount: categoriesCount || 0
      });

      setRecentExpenses(recent || []);
    } catch (error) {
      console.error('Erro ao buscar dados da overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  const monthlyGrowth = stats.totalLastMonth > 0 
    ? ((stats.totalThisMonth - stats.totalLastMonth) / stats.totalLastMonth) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos Este Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalThisMonth)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mês Anterior
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalLastMonth)}</div>
            <p className="text-xs text-muted-foreground">
              Comparativo mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Gastos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              Registros totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categorias
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoriesCount}</div>
            <p className="text-xs text-muted-foreground">
              Categorias personalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos Recentes</CardTitle>
          <CardDescription>
            Seus últimos 5 gastos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum gasto registrado ainda
              </p>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category || expense.custom_categories?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(Number(expense.amount))}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.expense_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
