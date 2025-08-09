import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for small boutique hotels",
    features: [
      "Up to 20 rooms",
      "Basic booking engine", 
      "Payment integration",
      "Email support"
    ],
    popular: false
  },
  {
    name: "Professional", 
    price: "$149",
    description: "Ideal for growing hotels",
    features: [
      "Up to 100 rooms",
      "Advanced booking engine",
      "OTA integrations", 
      "WhatsApp & SMS",
      "Priority support"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "$499", 
    description: "For large hotel chains",
    features: [
      "Unlimited rooms",
      "Custom integrations",
      "Advanced analytics",
      "Dedicated support",
      "Custom domain"
    ],
    popular: false
  }
];

export default function PricingSection() {
  const [, setLocation] = useLocation();

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4" data-testid="pricing-title">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600" data-testid="pricing-subtitle">
            Choose the plan that fits your hotel's needs. All plans include core features and 24/7 support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white p-8 rounded-xl hover:shadow-lg transition-shadow relative ${
                plan.popular ? "border-2 border-brand-red" : "border border-gray-200"
              }`}
              data-testid={`pricing-plan-${index}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-red text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="font-semibold text-xl mb-2" data-testid={`plan-name-${index}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-text-primary" data-testid={`plan-price-${index}`}>
                    {plan.price}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600" data-testid={`plan-description-${index}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center" data-testid={`plan-feature-${index}-${featureIndex}`}>
                    <Check className="text-success mr-3 w-4 h-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-3 font-medium transition-all duration-300 ${
                  plan.popular
                    ? "gradient-brand text-white hover:shadow-lg"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
                onClick={() => setLocation('/auth')}
                data-testid={`plan-button-${index}`}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
