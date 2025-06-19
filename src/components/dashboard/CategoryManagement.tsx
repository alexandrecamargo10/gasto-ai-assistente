
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

const CategoryManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...formData,
        user_id: user?.id
      };

      let error;
      if (editingCategory) {
        ({ error } = await supabase
          .from('custom_categories')
          .update(categoryData)
          .eq('id', editingCategory.id));
      } else {
        ({ error } = await supabase
          .from('custom_categories')
          .insert([categoryData]));
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Categoria ${editingCategory ? 'atualizada' : 'criada'} com sucesso!`
      });

      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a categoria",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!"
      });

      fetchCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6'
    });
    setEditingCategory(null);
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color
    });
    setDialogOpen(true);
  };

  const defaultCategories = [
    { name: 'Alimentação', value: 'alimentacao' },
    { name: 'Transporte', value: 'transporte' },
    { name: 'Moradia', value: 'moradia' },
    { name: 'Saúde', value: 'saude' },
    { name: 'Educação', value: 'educacao' },
    { name: 'Lazer', value: 'lazer' },
    { name: 'Vestuário', value: 'vestuario' },
    { name: 'Contas', value: 'contas' },
    { name: 'Investimentos', value: 'investimentos' },
    { name: 'Salário', value: 'salario' },
    { name: 'Diversos', value: 'diversos' },
    { name: 'Assinaturas', value: 'assinaturas' }
  ];

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Categorias Padrão */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias Padrão do Sistema</CardTitle>
          <CardDescription>
            Categorias pré-definidas disponíveis para todos os usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {defaultCategories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                <Tag className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{category.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorias Personalizadas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Categorias Personalizadas</CardTitle>
              <CardDescription>
                Crie e gerencie suas próprias categorias
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Categoria</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Atualizar' : 'Criar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma categoria personalizada criada ainda
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
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

export default CategoryManagement;
