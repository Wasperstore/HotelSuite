import { Hotel, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function NavigationHeader() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2" data-testid="logo">
                <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                  <Hotel className="text-white text-sm" />
                </div>
                <span className="font-display font-bold text-xl text-text-primary">LuxuryHotelSaaS</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-brand-red transition-colors font-medium"
                data-testid="nav-features"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-brand-red transition-colors font-medium"
                data-testid="nav-pricing"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-600 hover:text-brand-red transition-colors font-medium"
                data-testid="nav-testimonials"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-600 hover:text-brand-red transition-colors font-medium"
                data-testid="nav-contact"
              >
                Contact
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.fullName || user.email}</span>
                <Button 
                  onClick={() => setLocation('/dashboard')}
                  className="gradient-brand"
                  data-testid="button-dashboard"
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setLocation('/auth')}
                  className="text-gray-600 hover:text-brand-red transition-colors font-medium"
                  data-testid="nav-signin"
                >
                  Sign In
                </button>
                <Button 
                  onClick={() => setLocation('/auth')}
                  className="gradient-brand"
                  data-testid="button-trial"
                >
                  Start Free Trial
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
