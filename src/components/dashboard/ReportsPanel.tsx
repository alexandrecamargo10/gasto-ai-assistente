
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText } from 'lucide-react';

const ReportsPanel = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, dateRange]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, custom_categories(name)')
        .eq('user_id', user?.id)
        .gte('expense_date', dateRange.start)
        .lte('expense_date', dateRange.end)
        .order('expense_date', { ascending: false });

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
      const category = expense.category || expense.custom_categories?.name || 'Outros';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
    });

    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: colors[index % colors.length]
    }));
  };

  const getMonthlyData = () => {
    const monthlyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const month = new Date(expense.expense_date).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(expense.amount);
    });

    return Object.entries(monthlyTotals).map(([month, total]) => ({
      month,
      total
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportToPDF = () => {
    // Implementar exportação para PDF
    console.log('Exportar para PDF');
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Forma de Pagamento'],
      ...expenses.map(expense => [
        new Date(expense.expense_date).toLocaleDateString('pt-BR'),
        expense.description,
        expense.category || expense.custom_categories?.name || '',
        expense.amount,
        expense.payment_method || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${dateRange.start}_${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Inicial</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">Data Final</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-sm text-muted-foreground">
              {expenses.length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Média Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalAmount / 30)}
            </div>
            <p className="text-sm text-muted-foreground">
              Baseado em 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maior Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {expenses.length > 0 ? formatCurrency(Math.max(...expenses.map(e => Number(e.amount)))) : formatCurrency(0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Gasto individual máximo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Bar dataKey="total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos Detalhados</CardTitle>
          <CardDescription>
            Lista completa dos gastos no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum gasto encontrado no período selecionado
              </p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category || expense.custom_categories?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">{formatCurrency(Number(expense.amount))}</p>
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

export default ReportsPanel;
