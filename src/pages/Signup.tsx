
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Crown, Star, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UserPlan = Database['public']['Enums']['user_plan'];

const Signup = () => {
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Type the selectedPlan properly
  const planParam = searchParams.get('plan');
  const selectedPlan: UserPlan | null = planParam && ['FREE', 'STANDARD', 'TOP'].includes(planParam) 
    ? planParam as UserPlan 
    : null;
  
  const paymentSuccess = searchParams.get('payment') === 'success';
  
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Mostrar mensagem se chegou aqui sem pagamento para planos pagos
  useEffect(() => {
    if (!paymentSuccess && selectedPlan && selectedPlan !== 'FREE') {
      toast({
        title: "Pagamento necessário",
        description: "Você precisa efetuar o pagamento antes de se cadastrar para planos pagos.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [paymentSuccess, selectedPlan, navigate, toast]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signUp(signupEmail, signupPassword, signupName);
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Se tem plano selecionado e pagamento confirmado, atualizar o plano
      if (selectedPlan && paymentSuccess && ['STANDARD', 'TOP'].includes(selectedPlan)) {
        // Aguardar um pouco para o usuário ser criado
        setTimeout(async () => {
          try {
            const updateData: any = { 
              plan: selectedPlan,
              subscription_status: 'active'
            };

            // Adicionar trial apenas para plano TOP
            if (selectedPlan === 'TOP') {
              updateData.trial_ends_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            }

            const { error: updateError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('email', signupEmail);

            if (updateError) {
              console.error('Erro ao atualizar plano:', updateError);
            } else {
              toast({
                title: "Cadastro realizado!",
                description: `Sua conta foi criada com o plano ${selectedPlan}. Verifique seu email para confirmar.`
              });
            }
          } catch (error) {
            console.error('Erro ao atualizar plano:', error);
          }
        }, 2000);
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta."
        });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro no cadastro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan: UserPlan) => {
    switch (plan) {
      case 'STANDARD': return <Star className="h-4 w-4" />;
      case 'TOP': return <Crown className="h-4 w-4" />;
      default: return null;
    }
  };

  const getPlanColor = (plan: UserPlan) => {
    switch (plan) {
      case 'STANDARD': return 'bg-blue-500';
      case 'TOP': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-charcoal-800 p-4">
      {/* Botão de voltar */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 flex items-center space-x-2 text-white hover:text-teal-300 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Voltar para a página inicial</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-teal-600">gastoZ</CardTitle>
          <CardDescription>
            Complete seu cadastro para acessar o gastoZ
          </CardDescription>
          
          {/* Mostrar sucesso do pagamento */}
          {paymentSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Pagamento realizado com sucesso!</span>
              </div>
              <p className="text-sm text-green-600 mt-2 text-center">
                Complete seu cadastro para acessar sua conta
              </p>
            </div>
          )}
          
          {/* Mostrar plano selecionado */}
          {selectedPlan && selectedPlan !== 'FREE' && (
            <div className="mt-4">
              <Badge className={`${getPlanColor(selectedPlan)} text-white`}>
                {getPlanIcon(selectedPlan)}
                <span className="ml-1">Plano {selectedPlan} Selecionado</span>
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {selectedPlan === 'TOP' && 'Você terá 7 dias grátis para testar!'}
                {selectedPlan === 'STANDARD' && 'Controle completo das suas finanças!'}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Senha</Label>
              <Input
                id="signup-password"
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
            
            {paymentSuccess && selectedPlan && (
              <p className="text-xs text-green-600 text-center">
                Seu plano {selectedPlan} será ativado automaticamente após o cadastro
              </p>
            )}
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/auth" className="text-teal-600 hover:text-teal-700 font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
