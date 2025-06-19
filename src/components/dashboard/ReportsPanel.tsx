
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
import jsPDF from 'jspdf';

type ExpenseCategory = 'alimentacao' | 'transporte' | 'moradia' | 'saude' | 'educacao' | 'lazer' | 'vestuario' | 'contas' | 'investimentos' | 'salario' | 'diversos' | 'assinaturas';

const ReportsPanel = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  const defaultCategories: { value: ExpenseCategory; label: string }[] = [
    { value: 'alimentacao', label: 'Alimentação' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'moradia', label: 'Moradia' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'lazer', label: 'Lazer' },
    { value: 'vestuario', label: 'Vestuário' },
    { value: 'contas', label: 'Contas' },
    { value: 'investimentos', label: 'Investimentos' },
    { value: 'salario', label: 'Salário' },
    { value: 'diversos', label: 'Diversos' },
    { value: 'assinaturas', label: 'Assinaturas' }
  ];

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchProfile();
    }
  }, [user, dateRange, selectedCategory]);

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
    }
  };

  const fetchExpenses = async () => {
    try {
      let query = supabase
        .from('expenses')
        .select('*, custom_categories(name)')
        .eq('user_id', user?.id)
        .gte('expense_date', dateRange.start)
        .lte('expense_date', dateRange.end)
        .order('expense_date', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header com logo gastoZ
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.text('gastoZ', 20, 25);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Relatório de Gastos', 20, 40);
    
    // Informações do usuário
    doc.setFontSize(12);
    doc.text(`Nome: ${profile?.name || 'Não informado'}`, 20, 55);
    doc.text(`Email: ${user?.email}`, 20, 65);
    doc.text(`WhatsApp: ${profile?.whatsapp_number || 'Não informado'}`, 20, 75);
    
    // Período do relatório
    doc.text(`Período: ${new Date(dateRange.start).toLocaleDateString('pt-BR')} a ${new Date(dateRange.end).toLocaleDateString('pt-BR')}`, 20, 85);
    
    if (selectedCategory) {
      const categoryLabel = defaultCategories.find(cat => cat.value === selectedCategory)?.label || selectedCategory;
      doc.text(`Categoria: ${categoryLabel}`, 20, 95);
    }
    
    // Linha separadora
    doc.line(20, 105, pageWidth - 20, 105);
    
    // Resumo
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    doc.setFontSize(14);
    doc.text('Resumo:', 20, 120);
    doc.setFontSize(12);
    doc.text(`Total de gastos: ${formatCurrency(totalAmount)}`, 20, 135);
    doc.text(`Número de transações: ${expenses.length}`, 20, 145);
    
    // Lista de gastos
    let yPosition = 165;
    doc.setFontSize(14);
    doc.text('Detalhamento dos Gastos:', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(10);
    expenses.forEach((expense, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const date = new Date(expense.expense_date).toLocaleDateString('pt-BR');
      const category = expense.category || expense.custom_categories?.name || 'Outros';
      const amount = formatCurrency(Number(expense.amount));
      
      doc.text(`${date} - ${expense.description}`, 20, yPosition);
      doc.text(`${category} - ${amount}`, 20, yPosition + 8);
      yPosition += 20;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 20, doc.internal.pageSize.height - 10);
    }
    
    doc.save(`relatorio-gastos-${dateRange.start}-${dateRange.end}.pdf`);
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
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Filtros do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-white">Data Inicial</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-white">Data Final</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {defaultCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportToCSV} className="border-white/20 text-white hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF} className="border-white/20 text-white hover:bg-white/10">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Total do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-sm text-white/60">
              {expenses.length} transações
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Média Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(totalAmount / 30)}
            </div>
            <p className="text-sm text-white/60">
              Baseado em 30 dias
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Maior Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {expenses.length > 0 ? formatCurrency(Math.max(...expenses.map(e => Number(e.amount)))) : formatCurrency(0)}
            </div>
            <p className="text-sm text-white/60">
              Gasto individual máximo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Gastos por Categoria</CardTitle>
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

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Evolução Mensal</CardTitle>
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
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Gastos Detalhados</CardTitle>
          <CardDescription className="text-white/60">
            Lista completa dos gastos no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-center text-white/60 py-8">
                Nenhum gasto encontrado no período selecionado
              </p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/5">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-white">{expense.description}</p>
                        <p className="text-sm text-white/60">
                          {expense.category || expense.custom_categories?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg text-white">{formatCurrency(Number(expense.amount))}</p>
                    <p className="text-sm text-white/60">
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
