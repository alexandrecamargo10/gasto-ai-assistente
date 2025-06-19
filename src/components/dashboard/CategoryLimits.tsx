import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type ExpenseCategory = 'alimentacao' | 'transporte' | 'moradia' | 'saude' | 'educacao' | 'lazer' | 'vestuario' | 'contas' | 'investimentos' | 'salario' | 'diversos' | 'assinaturas';

const CategoryLimits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [limits, setLimits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    category: '' as ExpenseCategory | '',
    custom_category_id: '',
    limit_amount: '',
    alert_percentage: '80'
  });

  const [budgetSettings, setBudgetSettings] = useState({
    total_budget_limit: '',
    alert_percentage: 80
  });

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
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchLimits(),
        fetchCustomCategories(),
        fetchExpenses(),
        fetchBudgetSettings()
      ]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('total_budget_limit, alert_percentage')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setBudgetSettings({
          total_budget_limit: data.total_budget_limit?.toString() || '',
          alert_percentage: data.alert_percentage || 80
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de orçamento:', error);
    }
  };

  const handleSaveBudgetSettings = async () => {
    try {
      const settingsData = {
        total_budget_limit: budgetSettings.total_budget_limit ? parseFloat(budgetSettings.total_budget_limit) : null,
        alert_percentage: budgetSettings.alert_percentage,
        user_id: user?.id
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações de orçamento salvas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de orçamento",
        variant: "destructive"
      });
    }
  };

  const fetchLimits = async () => {
    const { data, error } = await supabase
      .from('category_limits')
      .select('*, custom_categories(name)')
      .eq('user_id', user?.id);

    if (error) throw error;
    setLimits(data || []);
  };

  const fetchCustomCategories = async () => {
    const { data, error } = await supabase
      .from('custom_categories')
      .select('*')
      .eq('user_id', user?.id);

    if (error) throw error;
    setCategories(data || []);
  };

  const fetchExpenses = async () => {
    const currentMonth = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user?.id)
      .gte('expense_date', firstDay.toISOString().split('T')[0]);

    if (error) throw error;
    setExpenses(data || []);
  };

  const getCategorySpent = (category: string, isCustomCategory: boolean) => {
    return expenses
      .filter(expense => 
        isCustomCategory 
          ? expense.custom_category_id === category
          : expense.category === category
      )
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const limitData = {
        user_id: user?.id,
        category: formData.custom_category_id ? null : (formData.category as ExpenseCategory),
        custom_category_id: formData.custom_category_id || null,
        limit_amount: parseFloat(formData.limit_amount),
        alert_percentage: parseInt(formData.alert_percentage)
      };

      let error;
      if (editingLimit) {
        ({ error } = await supabase
          .from('category_limits')
          .update(limitData)
          .eq('id', editingLimit.id));
      } else {
        ({ error } = await supabase
          .from('category_limits')
          .insert(limitData));
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Limite ${editingLimit ? 'atualizado' : 'adicionado'} com sucesso!`
      });

      setDialogOpen(false);
      resetForm();
      fetchLimits();
    } catch (error) {
      console.error('Erro ao salvar limite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o limite",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('category_limits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Limite excluído com sucesso!"
      });

      fetchLimits();
    } catch (error) {
      console.error('Erro ao excluir limite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o limite",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      custom_category_id: '',
      limit_amount: '',
      alert_percentage: '80'
    });
    setEditingLimit(null);
  };

  const openEditDialog = (limit: any) => {
    setEditingLimit(limit);
    setFormData({
      category: limit.category || '',
      custom_category_id: limit.custom_category_id || '',
      limit_amount: limit.limit_amount.toString(),
      alert_percentage: limit.alert_percentage?.toString() || '80'
    });
    setDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Configurações de Orçamento Total */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Limite de Orçamento Total</CardTitle>
          <CardDescription className="text-white/60">
            Configure seu limite de gastos total e porcentagem de alerta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_budget_limit" className="text-white">Limite de Orçamento Total (R$)</Label>
              <Input
                id="total_budget_limit"
                type="number"
                step="0.01"
                value={budgetSettings.total_budget_limit}
                onChange={(e) => setBudgetSettings({...budgetSettings, total_budget_limit: e.target.value})}
                placeholder="Ex: 3000.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="total_alert_percentage" className="text-white">Porcentagem para Alerta (%)</Label>
              <Input
                id="total_alert_percentage"
                type="number"
                min="1"
                max="100"
                value={budgetSettings.alert_percentage}
                onChange={(e) => setBudgetSettings({...budgetSettings, alert_percentage: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <Button onClick={handleSaveBudgetSettings} className="bg-teal-600 hover:bg-teal-700">
            Salvar Limite Total
          </Button>
        </CardContent>
      </Card>

      {/* Limites por Categoria */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Limites por Categoria</CardTitle>
              <CardDescription className="text-white/60">
                Configure limites de gastos para cada categoria
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Limite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingLimit ? 'Editar Limite' : 'Adicionar Novo Limite'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select 
                      value={formData.custom_category_id || formData.category} 
                      onValueChange={(value) => {
                        if (categories.find(cat => cat.id === value)) {
                          setFormData({...formData, custom_category_id: value, category: ''});
                        } else {
                          setFormData({...formData, category: value as ExpenseCategory, custom_category_id: ''});
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name} (Personalizada)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limit_amount">Limite (R$)</Label>
                    <Input
                      id="limit_amount"
                      type="number"
                      step="0.01"
                      value={formData.limit_amount}
                      onChange={(e) => setFormData({...formData, limit_amount: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert_percentage">Porcentagem para Alerta (%)</Label>
                    <Input
                      id="alert_percentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.alert_percentage}
                      onChange={(e) => setFormData({...formData, alert_percentage: e.target.value})}
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                      {editingLimit ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {limits.length === 0 ? (
              <p className="text-center text-white/60 py-8">
                Nenhum limite configurado ainda
              </p>
            ) : (
              limits.map((limit) => {
                const categoryName = limit.category 
                  ? defaultCategories.find(cat => cat.value === limit.category)?.label || limit.category
                  : limit.custom_categories?.name;
                const spent = getCategorySpent(
                  limit.category || limit.custom_category_id, 
                  !!limit.custom_category_id
                );
                const alertPercentage = limit.alert_percentage || 80;
                const percentage = (spent / Number(limit.limit_amount)) * 100;
                const isOverLimit = percentage > 100;
                const isNearLimit = percentage > alertPercentage;

                return (
                  <div key={limit.id} className="p-4 border border-white/20 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white">{categoryName}</h3>
                        {isOverLimit && <AlertTriangle className="h-4 w-4 text-red-400" />}
                        {isNearLimit && !isOverLimit && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(limit)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(limit.id)}
                          className="border-red-300 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">
                          Gasto: {formatCurrency(spent)}
                        </span>
                        <span className="text-white/60">
                          Limite: {formatCurrency(Number(limit.limit_amount))}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                      />
                      <div className="text-xs text-white/60 text-center">
                        {percentage.toFixed(1)}% do limite utilizado (Alerta em {alertPercentage}%)
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryLimits;
