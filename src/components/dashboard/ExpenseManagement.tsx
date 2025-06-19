
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
    category: '',
    custom_category_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: ''
  });

  const defaultCategories = [
    'alimentacao', 'transporte', 'moradia', 'saude', 'educacao',
    'lazer', 'vestuario', 'contas', 'investimentos', 'salario',
    'diversos', 'assinaturas'
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
        ...formData,
        amount: parseFloat(formData.amount),
        user_id: user?.id,
        category: formData.custom_category_id ? null : formData.category,
        custom_category_id: formData.custom_category_id || null
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
          .insert([expenseData]));
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gerenciar Gastos</CardTitle>
              <CardDescription>
                Adicione, edite ou remova seus gastos
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
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
                          setFormData({...formData, category: value, custom_category_id: ''});
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                    <Input
                      id="payment_method"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      placeholder="Ex: Cartão de crédito, Dinheiro, PIX..."
                    />
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
              <p className="text-center text-muted-foreground py-8">
                Nenhum gasto registrado ainda
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
                      <div className="text-right">
                        <p className="font-medium text-lg">{formatCurrency(Number(expense.amount))}</p>
                        <p className="text-sm text-muted-foreground">
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
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
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
