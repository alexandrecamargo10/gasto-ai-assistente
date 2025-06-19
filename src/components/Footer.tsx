
import { MessageCircle, Mail, Shield, Smartphone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent">
              gastoZ
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Seu assistente pessoal de finanças via WhatsApp. Controle seus gastos de forma 
              intuitiva com o poder da inteligência artificial do Google Gemini.
            </p>
            
            <div className="flex space-x-4">
              <div className="bg-teal-500/20 p-3 rounded-xl">
                <MessageCircle className="w-6 h-6 text-teal-400" />
              </div>
              <div className="bg-teal-500/20 p-3 rounded-xl">
                <Smartphone className="w-6 h-6 text-teal-400" />
              </div>
              <div className="bg-teal-500/20 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-teal-400">
              Links Rápidos
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-white transition-colors duration-200">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-teal-400">
              Suporte
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#help" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Termos de Uso
                </a>
              </li>
              <li className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2 text-teal-400" />
                <span className="text-sm">suporte@gastoz.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} gastoZ. Todos os direitos reservados.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-teal-400" />
                Dados Seguros
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-teal-400" />
                WhatsApp Oficial
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
