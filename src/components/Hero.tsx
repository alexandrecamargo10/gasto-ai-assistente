
import { Button } from "@/components/ui/button";
import { MessageCircle, Smartphone, TrendingUp } from "lucide-react";

const Hero = () => {
  const handleStartFreeTrial = () => {
    // Placeholder para futura integração com Supabase auth
    console.log("Iniciando teste grátis...");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-charcoal-800 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-8 animate-bounce-in">
            <MessageCircle className="w-4 h-4 mr-2 text-teal-400" />
            <span className="text-sm font-medium text-teal-400">
              Assistente IA via WhatsApp
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
              gastoZ
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-light mb-8 text-gray-300 animate-fade-in">
            Seu assistente pessoal de finanças via <span className="text-teal-400 font-semibold">WhatsApp</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed animate-fade-in">
            Controle seus gastos de forma intuitiva. Envie mensagens, áudios ou fotos pelo WhatsApp 
            e nossa IA organiza tudo para você.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
            <Button 
              onClick={handleStartFreeTrial}
              size="lg" 
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Teste Grátis por 7 Dias
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Ver Como Funciona
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-fade-in">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <MessageCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Via WhatsApp</h3>
              <p className="text-gray-400 text-sm">
                Registre gastos por texto, áudio ou foto direto no WhatsApp
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">IA Inteligente</h3>
              <p className="text-gray-400 text-sm">
                Google Gemini categoriza automaticamente seus gastos
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <Smartphone className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Dashboard Web</h3>
              <p className="text-gray-400 text-sm">
                Relatórios detalhados e insights na versão TOP
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
