
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, FileText, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportsPanel = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, dateRange]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      const now = new Date();

      switch (dateRange) {
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'year':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
      }

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          custom_categories (
            name,
            color
          )
        `)
        .eq('user_id', user?.id)
        .gte('expense_date', startDate.toISOString().split('T')[0])
        .lte('expense_date', endDate.toISOString().split('T')[0])
        .order('expense_date', { ascending: true });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Erro ao buscar gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const category = expense.custom_categories?.name || expense.category || 'Outros';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }));
  };

  const getMonthlyData = () => {
    const monthlyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const month = format(new Date(expense.expense_date), 'MMM', { locale: ptBR });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(expense.amount);
    });

    return Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount
    }));
  };

  const getDailyData = () => {
    const dailyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const day = format(new Date(expense.expense_date), 'dd/MM');
      dailyTotals[day] = (dailyTotals[day] || 0) + Number(expense.amount);
    });

    return Object.entries(dailyTotals).map(([day, amount]) => ({
      day,
      amount
    }));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getAverageDaily = () => {
    const days = new Set(expenses.map(e => e.expense_date)).size;
    return days > 0 ? getTotalExpenses() / days : 0;
  };

  const getMostExpensiveCategory = () => {
    const categoryData = getCategoryData();
    return categoryData.length > 0 
      ? categoryData.reduce((max, cat) => cat.value > max.value ? cat : max)
      : { name: 'N/A', value: 0 };
  };

  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();
  const dailyData = getDailyData();
  const totalExpenses = getTotalExpenses();
  const averageDaily = getAverageDaily();
  const mostExpensiveCategory = getMostExpensiveCategory();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="h-20 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de Período */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Período do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant={dateRange === 'month' ? 'default' : 'outline'}
              onClick={() => setDateRange('month')}
              className={dateRange === 'month' ? 'bg-teal-600 hover:bg-teal-700' : 'border-white/20 text-white hover:bg-white/10'}
            >
              Este Mês
            </Button>
            <Button
              variant={dateRange === 'year' ? 'default' : 'outline'}
              onClick={() => setDateRange('year')}
              className={dateRange === 'year' ? 'bg-teal-600 hover:bg-teal-700' : 'border-white/20 text-white hover:bg-white/10'}
            >
              Este Ano
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-white/60">
              {expenses.length} transações
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Média Diária</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {averageDaily.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-white/60">
              Por dia
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Maior Categoria</CardTitle>
            <TrendingDown className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {mostExpensiveCategory.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-white/60">
              {mostExpensiveCategory.name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras por Categoria */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Gastos por Categoria</CardTitle>
            <CardDescription className="text-white/60">
              Distribuição dos gastos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                />
                <Bar dataKey="value" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Proporção por Categoria</CardTitle>
            <CardDescription className="text-white/60">
              Percentual de cada categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha Temporal */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Evolução dos Gastos</CardTitle>
          <CardDescription className="text-white/60">
            {dateRange === 'month' ? 'Gastos diários do mês' : 'Gastos mensais do ano'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dateRange === 'month' ? dailyData : monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey={dateRange === 'month' ? 'day' : 'month'}
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ações de Export */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Exportar Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => {
                // Implementar export CSV
                console.log('Export CSV');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => {
                // Implementar export PDF
                console.log('Export PDF');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPanel;
