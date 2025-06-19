
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      <nav className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">gastoZ</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Entrar / Cadastrar
          </Button>
        </div>
      </nav>
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
