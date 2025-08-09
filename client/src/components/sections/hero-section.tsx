import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center text-white">
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6" data-testid="hero-title">
            The Future of
            <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Hotel Management
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed" data-testid="hero-subtitle">
            Multi-tenant, offline-first hotel management platform with integrated payments, OTA sync, and powerful analytics. Built for modern hoteliers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation('/auth')}
              className="gradient-brand text-white px-8 py-4 text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              data-testid="button-hero-trial"
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-8 py-4 text-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300"
              data-testid="button-hero-demo"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
