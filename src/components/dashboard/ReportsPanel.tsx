import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign, FileText, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
const ReportsPanel = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [exportingPDF, setExportingPDF] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchProfile();
    }
  }, [user, dateRange, customStartDate, customEndDate]);
  const fetchProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      const now = new Date();
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        switch (dateRange) {
          case 'week':
            startDate = startOfWeek(now, {
              locale: ptBR
            });
            endDate = endOfWeek(now, {
              locale: ptBR
            });
            break;
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
      }
      const {
        data,
        error
      } = await supabase.from('expenses').select(`
          *,
          custom_categories (
            name,
            color
          )
        `).eq('user_id', user?.id).gte('expense_date', startDate.toISOString().split('T')[0]).lte('expense_date', endDate.toISOString().split('T')[0]).order('expense_date', {
        ascending: true
      });
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Erro ao buscar gastos:', error);
    } finally {
      setLoading(false);
    }
  };
  const generatePDFReport = async () => {
    setExportingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;

      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(6, 182, 212); // teal-500
      doc.text('gastoZ - Relatório de Gastos', margin, margin);

      // Nome do usuário
      doc.setFontSize(14);
      doc.setTextColor(6, 182, 212);
      const userName = profile?.name || user?.email?.split('@')[0] || 'Usuário';
      doc.text(`Usuário: ${userName}`, margin, margin + 10);

      // Período
      const periodText = dateRange === 'week' ? 'Esta Semana' : dateRange === 'month' ? 'Este Mês' : dateRange === 'year' ? 'Este Ano' : 'Período Personalizado';
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Período: ${periodText}`, margin, margin + 20);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', {
        locale: ptBR
      })}`, margin, margin + 28);
      let currentY = margin + 40;

      // Resumo
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212);
      doc.text('Resumo', margin, currentY);
      currentY += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de Gastos: R$ ${getTotalExpenses().toLocaleString('pt-BR', {
        minimumFractionDigits: 2
      })}`, margin, currentY);
      currentY += 8;
      doc.text(`Média Diária: R$ ${getAverageDaily().toLocaleString('pt-BR', {
        minimumFractionDigits: 2
      })}`, margin, currentY);
      currentY += 8;
      doc.text(`Total de Transações: ${expenses.length}`, margin, currentY);
      currentY += 8;
      doc.text(`Maior Categoria: ${getMostExpensiveCategory().name} (R$ ${getMostExpensiveCategory().value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2
      })})`, margin, currentY);
      currentY += 18;

      // Gastos por categoria
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212);
      doc.text('Gastos por Categoria', margin, currentY);
      currentY += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const categoryData = getCategoryData();
      categoryData.forEach(category => {
        doc.text(`${category.name}: R$ ${category.value.toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })}`, margin, currentY);
        currentY += 6;
        if (currentY > 250) {
          doc.addPage();
          currentY = margin;
        }
      });
      currentY += 12;

      // Lista de transações
      if (currentY > 200) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212);
      doc.text('Transações Detalhadas', margin, currentY);
      currentY += 10;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      expenses.slice(0, 50).forEach(expense => {
        const date = format(new Date(expense.expense_date), 'dd/MM/yyyy');
        const category = expense.custom_categories?.name || expense.category || 'Outros';
        const amount = `R$ ${Number(expense.amount).toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })}`;
        doc.text(`${date} - ${category} - ${amount}`, margin, currentY);
        if (expense.description) {
          currentY += 5;
          doc.text(`   ${expense.description}`, margin + 5, currentY);
        }
        currentY += 6;
        if (currentY > 270) {
          doc.addPage();
          currentY = margin;
        }
      });
      doc.save(`gastoz-relatorio-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast({
        title: "PDF Exportado!",
        description: "O relatório foi baixado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    } finally {
      setExportingPDF(false);
    }
  };
  const getCategoryData = () => {
    const categoryTotals: {
      [key: string]: number;
    } = {};
    expenses.forEach(expense => {
      const category = expense.custom_categories?.name || expense.category || 'Outros';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }));
  };
  const getMonthlyData = () => {
    const monthlyTotals: {
      [key: string]: number;
    } = {};
    expenses.forEach(expense => {
      const month = format(new Date(expense.expense_date), 'MMM', {
        locale: ptBR
      });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(expense.amount);
    });
    return Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount
    }));
  };
  const getDailyData = () => {
    const dailyTotals: {
      [key: string]: number;
    } = {};
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
    return categoryData.length > 0 ? categoryData.reduce((max, cat) => cat.value > max.value ? cat : max) : {
      name: 'N/A',
      value: 0
    };
  };
  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();
  const dailyData = getDailyData();
  const totalExpenses = getTotalExpenses();
  const averageDaily = getAverageDaily();
  const mostExpensiveCategory = getMostExpensiveCategory();
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];
  if (loading) {
    return <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="h-20 bg-white/10 rounded"></div>
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }
  return <div className="space-y-6">
      {/* Controles de Período */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Período do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-500 hover:bg-gray-400">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant={dateRange === 'week' ? 'default' : 'outline'} onClick={() => {
            setDateRange('week');
            setCustomStartDate(undefined);
            setCustomEndDate(undefined);
          }} className={dateRange === 'week' ? 'bg-teal-600 hover:bg-teal-700' : 'border-white/20 text-white hover:bg-white/10'}>
              Esta Semana
            </Button>
            <Button variant={dateRange === 'month' ? 'default' : 'outline'} onClick={() => {
            setDateRange('month');
            setCustomStartDate(undefined);
            setCustomEndDate(undefined);
          }} className={dateRange === 'month' ? 'bg-teal-600 hover:bg-teal-700' : 'border-white/20 text-white hover:bg-white/10'}>
              Este Mês
            </Button>
            <Button variant={dateRange === 'year' ? 'default' : 'outline'} onClick={() => {
            setDateRange('year');
            setCustomStartDate(undefined);
            setCustomEndDate(undefined);
          }} className={dateRange === 'year' ? 'bg-teal-600 hover:bg-teal-700' : 'border-white/20 text-white hover:bg-white/10'}>
              Este Ano
            </Button>
          </div>
          
          {/* Seletor de Período Personalizado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label className="text-white text-sm">Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-white/20 text-white hover:bg-white/10", !customStartDate && "text-white/60")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "dd/MM/yyyy") : <span>Selecionar</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label className="text-white text-sm">Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-white/20 text-white hover:bg-white/10", !customEndDate && "text-white/60")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "dd/MM/yyyy") : <span>Selecionar</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button onClick={() => {
            if (customStartDate && customEndDate) {
              setDateRange('custom');
            }
          }} disabled={!customStartDate || !customEndDate} className="bg-teal-600 hover:bg-teal-700 text-white">
              Aplicar Período
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
              R$ {totalExpenses.toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}
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
              R$ {averageDaily.toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}
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
              R$ {mostExpensiveCategory.value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}
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
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} tickFormatter={value => `R$ ${value}`} />
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }} formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', {
                minimumFractionDigits: 2
              })}`, 'Valor']} />
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
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }} formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', {
                minimumFractionDigits: 2
              })}`, 'Valor']} />
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
            {dateRange === 'week' ? 'Gastos diários da semana' : dateRange === 'month' ? 'Gastos diários do mês' : dateRange === 'year' ? 'Gastos mensais do ano' : 'Gastos do período selecionado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dateRange === 'year' ? monthlyData : dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey={dateRange === 'year' ? 'month' : 'day'} stroke="rgba(255,255,255,0.6)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} tickFormatter={value => `R$ ${value}`} />
              <Tooltip contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px'
            }} formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}`, 'Valor']} />
              <Line type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2} dot={{
              fill: '#06b6d4',
              strokeWidth: 2,
              r: 4
            }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ações de Export - Apenas PDF */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Exportar Relatório</span>
          </CardTitle>
          <CardDescription className="text-white/60">
            Baixe um relatório completo em PDF com todos os dados e gráficos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generatePDFReport} disabled={exportingPDF} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            {exportingPDF ? 'Gerando PDF...' : 'Exportar PDF'}
          </Button>
        </CardContent>
      </Card>
    </div>;
};
export default ReportsPanel;