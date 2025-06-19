
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
    assistant_tone: 'amigavel'
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
          assistant_tone: data.assistant_tone || 'amigavel'
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
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Configurações do Perfil */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Informações do Perfil</CardTitle>
          <CardDescription className="text-white/60">
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-white">Número do WhatsApp</Label>
            <Input
              id="whatsapp"
              value={profile.whatsapp_number}
              onChange={(e) => setProfile({...profile, whatsapp_number: e.target.value})}
              placeholder="5511999999999"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </CardContent>
      </Card>

      {/* Configurações do Assistente */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Configurações do Assistente</CardTitle>
          <CardDescription className="text-white/60">
            Personalize como o assistente interage com você
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assistant_name" className="text-white">Nome do Assistente</Label>
              <Input
                id="assistant_name"
                value={settings.assistant_name}
                onChange={(e) => setSettings({...settings, assistant_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assistant_tone" className="text-white">Tom de Voz</Label>
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

          <Button onClick={handleSaveSettings} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>

      {/* Campo para Cupom */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Cupom de Desconto</CardTitle>
          <CardDescription className="text-white/60">
            Insira um cupom promocional para desbloquear benefícios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Digite o código do cupom"
              className="flex-1"
            />
            <Button className="bg-teal-600 hover:bg-teal-700">
              Aplicar Cupom
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
