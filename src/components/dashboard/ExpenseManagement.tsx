
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

type ExpenseCategory = 'alimentacao' | 'transporte' | 'moradia' | 'saude' | 'educacao' | 'lazer' | 'vestuario' | 'contas' | 'investimentos' | 'salario' | 'diversos' | 'assinaturas';

const ExpenseManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '' as ExpenseCategory | '',
    custom_category_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: ''
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

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'credito', label: 'Crédito' },
    { value: 'debito', label: 'Débito' }
  ];

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchCustomCategories();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, custom_categories(name)')
        .eq('user_id', user?.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Erro ao buscar gastos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os gastos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        user_id: user?.id,
        category: formData.custom_category_id ? null : (formData.category as ExpenseCategory),
        custom_category_id: formData.custom_category_id || null,
        expense_date: formData.expense_date,
        payment_method: formData.payment_method || 'não informado'
      };

      let error;
      if (editingExpense) {
        ({ error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id));
      } else {
        ({ error } = await supabase
          .from('expenses')
          .insert(expenseData));
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Gasto ${editingExpense ? 'atualizado' : 'adicionado'} com sucesso!`
      });

      setDialogOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error('Erro ao salvar gasto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o gasto",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Gasto excluído com sucesso!"
      });

      fetchExpenses();
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o gasto",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: '',
      custom_category_id: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: ''
    });
    setEditingExpense(null);
  };

  const openEditDialog = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category || '',
      custom_category_id: expense.custom_category_id || '',
      expense_date: expense.expense_date,
      payment_method: expense.payment_method || ''
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
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Gerenciar Gastos</CardTitle>
              <CardDescription className="text-white/60">
                Adicione, edite ou remova seus gastos
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Gasto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? 'Editar Gasto' : 'Adicionar Novo Gasto'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_date">Data</Label>
                      <Input
                        id="expense_date"
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>

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
                    <Label htmlFor="payment_method">Forma de Pagamento</Label>
                    <Select 
                      value={formData.payment_method} 
                      onValueChange={(value) => setFormData({...formData, payment_method: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingExpense ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-center text-white/60 py-8">
                Nenhum gasto registrado ainda
              </p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/5">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-white">{expense.description}</p>
                        <p className="text-sm text-white/60">
                          {expense.category || expense.custom_categories?.name} • {expense.payment_method || 'não informado'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg text-white">{formatCurrency(Number(expense.amount))}</p>
                        <p className="text-sm text-white/60">
                          {new Date(expense.expense_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(expense)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      className="border-red-300 text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default ExpenseManagement;
