
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Crown, Smartphone, CreditCard } from 'lucide-react';

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
    whatsapp_number: '',
    plan: 'FREE'
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
        whatsapp_number: data.whatsapp_number || '',
        plan: data.plan || 'FREE'
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
        .update({
          name: profile.name,
          phone: profile.phone,
          whatsapp_number: profile.whatsapp_number
        })
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

  const handleUpgradeStandard = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'STANDARD' }
      });

      if (error) throw error;

      // Abrir checkout em nova aba
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo de pagamento",
        variant: "destructive"
      });
    }
  };

  const handleUpgradeTop = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'TOP' }
      });

      if (error) throw error;

      // Abrir checkout em nova aba
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo de pagamento",
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      // Abrir portal em nova aba
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Erro ao abrir portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento",
        variant: "destructive"
      });
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-500';
      case 'STANDARD': return 'bg-blue-500';
      case 'TOP': return 'bg-purple-500';
      default: return 'bg-gray-500';
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

          <div className="space-y-2">
            <Label className="text-white">Plano Atual</Label>
            <Badge className={getPlanColor(profile.plan)}>
              {profile.plan === 'TOP' && <Crown className="h-4 w-4 mr-1" />}
              {profile.plan === 'STANDARD' && <Smartphone className="h-4 w-4 mr-1" />}
              {profile.plan}
            </Badge>
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

      {/* Upgrade do Plano */}
      {(profile.plan === 'FREE' || profile.plan === 'STANDARD') && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Upgrade do Plano</CardTitle>
            <CardDescription className="text-white/60">
              Faça upgrade para desbloquear mais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.plan === 'FREE' && (
              <div className="border border-white/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Smartphone className="h-5 w-5 text-blue-400" />
                      <span>STANDARD</span>
                    </h3>
                    <p className="text-white/60">Para uso pessoal completo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">R$ 9,90</p>
                    <p className="text-white/60">/mês</p>
                  </div>
                </div>
                <ul className="text-sm text-white/80 space-y-1">
                  <li>• Transações ilimitadas via WhatsApp</li>
                  <li>• Relatórios avançados (até 1 ano)</li>
                  <li>• Categorias personalizadas</li>
                  <li>• Alertas de orçamento</li>
                  <li>• Suporte prioritário</li>
                </ul>
                <Button 
                  onClick={handleUpgradeStandard}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade para Standard
                </Button>
              </div>
            )}

            <div className="border-2 border-purple-500 rounded-lg p-4 space-y-3 relative">
              <div className="absolute -top-3 left-4">
                <Badge className="bg-purple-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-purple-400" />
                    <span>TOP</span>
                  </h3>
                  <p className="text-white/60">Experiência completa + Dashboard</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">R$ 19,90</p>
                  <p className="text-white/60">/mês</p>
                </div>
              </div>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Tudo do Standard +</li>
                <li>• Dashboard web completa</li>
                <li>• Gráficos e insights avançados</li>
                <li>• Análises preditivas</li>
                <li>• Gestão avançada de categorias</li>
                <li>• Export em múltiplos formatos</li>
                <li>• 7 dias grátis para testar</li>
              </ul>
              <Button 
                onClick={handleUpgradeTop}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Teste Grátis 7 Dias (TOP)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gerenciar Assinatura para usuários pagos */}
      {(profile.plan === 'STANDARD' || profile.plan === 'TOP') && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Gerenciar Assinatura</CardTitle>
            <CardDescription className="text-white/60">
              Altere seu plano, método de pagamento ou cancele sua assinatura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleManageSubscription}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Gerenciar no Stripe
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsPanel;
