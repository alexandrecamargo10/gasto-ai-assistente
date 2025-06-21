
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Copy, RefreshCw, ExternalLink } from 'lucide-react';

interface WhatsAppToken {
  id: string;
  token: string;
  whatsapp_number: string | null;
  expires_at: string;
  is_active: boolean;
}

const WhatsAppConnection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [token, setToken] = useState<WhatsAppToken | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCurrentToken();
    }
  }, [user]);

  const fetchCurrentToken = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setToken(data);
        // Gerar link do WhatsApp
        const whatsappNumber = "+5511999999999"; // Substitua pelo seu número
        const link = `https://wa.me/${whatsappNumber.replace('+', '')}?text=start_gastoZ_${data.token}`;
        setWhatsappLink(link);
      }
    } catch (error) {
      console.log('No active token found');
    } finally {
      setLoading(false);
    }
  };

  const generateNewToken = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-whatsapp-token');
      
      if (error) throw error;

      setToken({
        id: 'new',
        token: data.token,
        whatsapp_number: null,
        expires_at: data.expires_at,
        is_active: true
      });
      setWhatsappLink(data.whatsapp_link);

      toast({
        title: "Token gerado!",
        description: "Novo token de WhatsApp criado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o token do WhatsApp",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência."
    });
  };

  const openWhatsApp = () => {
    window.open(whatsappLink, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-white" />
            <span className="text-white">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Conexão WhatsApp</span>
        </CardTitle>
        <CardDescription className="text-white/60">
          Conecte seu WhatsApp para gerenciar gastos via mensagem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {token ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Status da Conexão</p>
                <Badge className="bg-green-500">
                  {token.whatsapp_number ? `Conectado: ${token.whatsapp_number}` : 'Token Ativo'}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Expira em</p>
                <p className="text-sm text-white">{formatDate(token.expires_at)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Link de Conexão:</p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => copyToClipboard(whatsappLink)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button
                  onClick={openWhatsApp}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </div>
            </div>

            <Button
              onClick={generateNewToken}
              disabled={generating}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo Token
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-white/80">
              Nenhum token ativo encontrado. Gere um novo token para conectar seu WhatsApp.
            </p>
            <Button
              onClick={generateNewToken}
              disabled={generating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Gerar Token do WhatsApp
                </>
              )}
            </Button>
          </div>
        )}

        <div className="border-t border-white/20 pt-4">
          <h4 className="text-sm font-medium text-white mb-2">Como funciona:</h4>
          <ol className="text-xs text-white/70 space-y-1">
            <li>1. Clique em "Gerar Token do WhatsApp" ou use o link acima</li>
            <li>2. Será aberto o WhatsApp com uma mensagem pré-formatada</li>
            <li>3. Envie a mensagem para conectar seu número</li>
            <li>4. Pronto! Agora pode gerenciar gastos via WhatsApp</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppConnection;
