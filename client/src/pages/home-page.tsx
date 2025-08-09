import NavigationHeader from "@/components/layout/navigation-header";
import HeroSection from "@/components/sections/hero-section";
import FeaturesSection from "@/components/sections/features-section";
import DashboardPreview from "@/components/sections/dashboard-preview";
import PricingSection from "@/components/sections/pricing-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import CTASection from "@/components/sections/cta-section";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <NavigationHeader />
      <HeroSection />
      <FeaturesSection />
      <DashboardPreview />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
