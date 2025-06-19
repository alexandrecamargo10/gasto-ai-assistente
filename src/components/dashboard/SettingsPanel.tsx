import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const SettingsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    assistant_name: 'gastoZ',
    assistant_tone: 'amigavel',
    total_budget_limit: '',
    alert_percentage: 80
  });

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    whatsapp_number: ''
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchProfile();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          assistant_name: data.assistant_name || 'gastoZ',
          assistant_tone: data.assistant_tone || 'amigavel',
          total_budget_limit: data.total_budget_limit?.toString() || '',
          alert_percentage: data.alert_percentage || 80
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      setProfile({
        name: data.name || '',
        phone: data.phone || '',
        whatsapp_number: data.whatsapp_number || ''
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        ...settings,
        total_budget_limit: settings.total_budget_limit ? parseFloat(settings.total_budget_limit) : null,
        user_id: user?.id
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Configurações do Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número do WhatsApp</Label>
            <Input
              id="whatsapp"
              value={profile.whatsapp_number}
              onChange={(e) => setProfile({...profile, whatsapp_number: e.target.value})}
              placeholder="5511999999999"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </CardContent>
      </Card>

      {/* Configurações do Assistente */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Assistente</CardTitle>
          <CardDescription>
            Personalize como o assistente interage com você
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assistant_name">Nome do Assistente</Label>
              <Input
                id="assistant_name"
                value={settings.assistant_name}
                onChange={(e) => setSettings({...settings, assistant_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assistant_tone">Tom de Voz</Label>
              <Select 
                value={settings.assistant_tone} 
                onValueChange={(value) => setSettings({...settings, assistant_tone: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amigavel">Amigável</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="direto">Direto</SelectItem>
                  <SelectItem value="encorajador">Encorajador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>

      {/* Configurações de Orçamento */}
      <Card>
        <CardHeader>
          <CardTitle>Limites de Orçamento</CardTitle>
          <CardDescription>
            Configure seus limites de gastos e alertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_limit">Limite de Orçamento Total (R$)</Label>
              <Input
                id="budget_limit"
                type="number"
                step="0.01"
                value={settings.total_budget_limit}
                onChange={(e) => setSettings({...settings, total_budget_limit: e.target.value})}
                placeholder="Ex: 3000.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alert_percentage">Porcentagem para Alerta (%)</Label>
              <Input
                id="alert_percentage"
                type="number"
                min="1"
                max="100"
                value={settings.alert_percentage}
                onChange={(e) => setSettings({...settings, alert_percentage: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Limites'}
          </Button>
        </CardContent>
      </Card>

      {/* Campo para Cupom */}
      <Card>
        <CardHeader>
          <CardTitle>Cupom de Desconto</CardTitle>
          <CardDescription>
            Insira um cupom promocional para desbloquear benefícios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Digite o código do cupom"
              className="flex-1"
            />
            <Button>
              Aplicar Cupom
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
