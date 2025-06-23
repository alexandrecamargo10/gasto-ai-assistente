
import { Button } from "@/components/ui/button";
import { Check, Crown, Gift, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "FREE",
      price: "Grátis",
      period: "sempre",
      description: "Ideal para começar a organizar suas finanças",
      features: [
        "5 lançamentos por dia",
        "Relatórios diários e semanais",
        "Histórico de 1 semana",
        "Acesso exclusivo via WhatsApp",
        "Categorização automática por IA"
      ],
      cta: "Começar Grátis",
      popular: false,
      color: "charcoal",
      checkoutUrl: null
    },
    {
      name: "STANDARD",
      price: "R$ 9,90",
      period: "/mês",
      description: "Para quem quer controle completo via WhatsApp",
      features: [
        "Lançamentos ilimitados",
        "Todos os tipos de relatórios",
        "Histórico de 1 ano",
        "Alertas personalizados",
        "Export para PDF",
        "Suporte prioritário"
      ],
      cta: "Escolher Standard",
      popular: false,
      color: "teal",
      checkoutUrl: "https://buy.stripe.com/test_bJedR93DC8xicDV8Ylao800"
    },
    {
      name: "TOP",
      price: "R$ 19,90",
      period: "/mês",
      description: "Experiência completa com dashboard avançado",
      features: [
        "Tudo do Standard +",
        "Dashboard web completo",
        "Gráficos e insights avançados",
        "Histórico ilimitado",
        "Gestão de categorias personalizadas",
        "Múltiplos formatos de export",
        "Análises preditivas"
      ],
      cta: "Teste Grátis 7 Dias",
      popular: true,
      color: "gradient",
      checkoutUrl: "https://buy.stripe.com/test_00w00j3DC5l69rJdeBao801"
    }
  ];

  const handlePlanSelection = (planName: string, checkoutUrl: string | null) => {
    if (planName === 'FREE') {
      // Para plano FREE, redirecionar para página de auth sem plano selecionado
      navigate('/auth');
    } else if (checkoutUrl) {
      // Para planos pagos, adicionar parâmetros para redirecionamento correto
      const currentOrigin = window.location.origin;
      const modifiedUrl = checkoutUrl.replace(
        /success_url=[^&]*/,
        `success_url=${encodeURIComponent(`${currentOrigin}/auth?plan=${planName}&payment=success`)}`
      );
      window.open(modifiedUrl, '_blank');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Escolha seu plano
          </h2>
          <p className="text-xl text-charcoal-600 max-w-3xl mx-auto mb-8">
            Comece grátis e evolua conforme suas necessidades. 
            Todos os planos incluem nossa IA avançada.
          </p>
          
          {/* Trial Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg">
            <Gift className="w-5 h-5 mr-2" />
            7 dias grátis da versão TOP para novos usuários
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 border-2 transition-all duration-300 transform hover:scale-105 ${
                plan.popular
                  ? 'border-teal-500 bg-white shadow-2xl'
                  : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-full font-semibold text-sm flex items-center">
                    <Crown className="w-4 h-4 mr-2" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-navy-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-navy-900">
                    {plan.price}
                  </span>
                  <span className="text-charcoal-600 ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-charcoal-600">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <div className="bg-teal-100 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-charcoal-700">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelection(plan.name, plan.checkoutUrl)}
                className={`w-full py-3 font-semibold text-lg transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl'
                    : plan.name === 'FREE'
                    ? 'bg-charcoal-600 hover:bg-charcoal-700 text-white'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                {plan.name === 'TOP' && <Smartphone className="w-5 h-5 mr-2" />}
                {plan.cta}
              </Button>

              {plan.name === 'TOP' && (
                <p className="text-center text-sm text-charcoal-500 mt-3">
                  Cancele a qualquer momento
                </p>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Quick Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-navy-900 mb-8">
            Perguntas Frequentes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-navy-900 mb-2">
                Como funciona o teste grátis?
              </h4>
              <p className="text-charcoal-600 text-sm">
                Você tem 7 dias completos para usar todas as funcionalidades da versão TOP. 
                Não cobramos nada durante o período de teste.
              </p>
            </div>
            
            <div className="text-left bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-navy-900 mb-2">
                Posso cancelar a qualquer momento?
              </h4>
              <p className="text-charcoal-600 text-sm">
                Sim! Não há fidelidade. Você pode cancelar seu plano a qualquer momento 
                diretamente pelo WhatsApp ou dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
