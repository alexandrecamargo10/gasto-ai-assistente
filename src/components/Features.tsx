
import { Brain, FileImage, MessageSquare, PieChart, AlertTriangle, Calendar } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Registro Intuitivo",
      description: "Envie mensagens simples como 'gastei 50 reais no almoço' e pronto! Nossa IA entende e categoriza automaticamente.",
      highlight: "Texto, áudio e imagens"
    },
    {
      icon: Brain,
      title: "IA Google Gemini",
      description: "Tecnologia avançada de processamento de linguagem natural para extrair informações e categorizar seus gastos com precisão.",
      highlight: "Categorização automática"
    },
    {
      icon: FileImage,
      title: "OCR Inteligente",
      description: "Fotografe notas fiscais, comprovantes e extratos. Nossa IA extrai automaticamente valores, datas e descrições.",
      highlight: "Reconhecimento de texto"
    },
    {
      icon: PieChart,
      title: "Relatórios Detalhados",
      description: "Solicite relatórios por período diretamente no WhatsApp. Visualize gastos por categoria com gráficos intuitivos.",
      highlight: "Export para PDF"
    },
    {
      icon: AlertTriangle,
      title: "Alertas Inteligentes",
      description: "Defina limites de gastos e receba avisos personalizados quando se aproximar ou ultrapassar seus objetivos.",
      highlight: "Notificações via WhatsApp"
    },
    {
      icon: Calendar,
      title: "Histórico Completo",
      description: "Acesse todo seu histórico financeiro organizado por categorias, com filtros por período e tipo de gasto.",
      highlight: "Dados sempre seguros"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Como o <span className="text-teal-500">gastoZ</span> funciona
          </h2>
          <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
            Uma experiência completa de controle financeiro, desde o registro via WhatsApp 
            até insights detalhados no dashboard web.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-navy-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-charcoal-600 mb-4 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
                {feature.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Demo Section */}
        <div className="mt-20 bg-gradient-to-r from-navy-900 to-charcoal-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Simples como uma conversa
              </h3>
              <p className="text-xl text-gray-300">
                Veja como é fácil registrar seus gastos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">V</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm mb-1">Você</p>
                      <p className="text-white">Gastei 45 reais no supermercado</p>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-500/20 backdrop-blur-sm rounded-2xl p-4 border border-teal-500/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-teal-300 text-sm mb-1">gastoZ</p>
                      <p className="text-white">✅ Gasto registrado: R$ 45,00 em Alimentação</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h4 className="text-2xl font-bold mb-4 text-teal-400">
                  Pronto! É só isso.
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Nossa IA processou sua mensagem, identificou o valor, categorizou como "Alimentação" 
                  e registrou automaticamente. Você pode acompanhar tudo no dashboard ou solicitar 
                  relatórios diretamente no WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
