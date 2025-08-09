import { Wifi, Users, CreditCard, Calendar, TrendingUp, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Wifi,
    title: "Offline-First PWA",
    description: "Keep working even without internet. Our PWA caches critical data and syncs automatically when connection is restored."
  },
  {
    icon: Users,
    title: "Multi-Tenant Architecture", 
    description: "Manage multiple hotels with role-based access control. Each property gets its own domain and customized experience."
  },
  {
    icon: CreditCard,
    title: "Integrated Payments",
    description: "Accept payments with Paystack, Flutterwave, and Stripe. Secure webhooks ensure booking confirmations are never missed."
  },
  {
    icon: Calendar,
    title: "OTA Integration",
    description: "Sync with Booking.com, Airbnb, and other OTAs via iCal. Prevent double bookings with real-time availability updates."
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Track occupancy, revenue, generator costs, and staff performance with detailed reports and real-time dashboards."
  },
  {
    icon: MessageSquare,
    title: "WhatsApp & SMS",
    description: "Automated guest communication via WhatsApp and SMS. Send booking confirmations, check-in reminders, and special offers."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4" data-testid="features-title">
            Everything You Need to Run Your Hotel
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="features-subtitle">
            From front desk operations to revenue management, our platform handles every aspect of hotel management with enterprise-grade reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 gradient-brand rounded-lg flex items-center justify-center mb-6">
                  <IconComponent className="text-white text-xl" />
                </div>
                <h3 className="font-semibold text-xl mb-4" data-testid={`feature-title-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed" data-testid={`feature-description-${index}`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
