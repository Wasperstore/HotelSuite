import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CTASection() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-20 gradient-brand">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6" data-testid="cta-title">
          Ready to Transform Your Hotel Operations?
        </h2>
        <p className="text-xl text-white text-opacity-90 mb-8 leading-relaxed" data-testid="cta-subtitle">
          Join hundreds of hotels already using LuxuryHotelSaaS to streamline operations, increase revenue, and delight guests.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setLocation('/auth')}
            className="bg-white text-brand-red px-8 py-4 text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            data-testid="button-cta-trial"
          >
            Start 14-Day Free Trial
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-2 border-white text-white px-8 py-4 text-lg hover:bg-white hover:text-brand-red transition-all duration-300"
            data-testid="button-cta-demo"
          >
            Schedule Demo
          </Button>
        </div>
        <p className="text-white text-opacity-75 text-sm mt-4" data-testid="cta-disclaimer">
          No credit card required • Full access to all features • 24/7 support included
        </p>
      </div>
    </section>
  );
}
