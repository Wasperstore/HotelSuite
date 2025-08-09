import { Star } from "lucide-react";

const testimonials = [
  {
    text: "The offline capabilities saved us during a power outage. We didn't lose a single booking and everything synced perfectly when we came back online.",
    name: "Michael Chen",
    title: "General Manager, Azure Resort",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150"
  },
  {
    text: "The multi-tenant setup is perfect for our hotel chain. Each property feels independent while we maintain centralized control and reporting.", 
    name: "Sarah Williams",
    title: "Operations Director, Luxury Hotels Group",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
  },
  {
    text: "The WhatsApp integration has revolutionized our guest communication. Check-in confirmations and special offers have never been easier to send.",
    name: "David Rodriguez", 
    title: "Front Desk Manager, Oceanview Boutique",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150"
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4" data-testid="testimonials-title">
            Trusted by Hotels Worldwide
          </h2>
          <p className="text-xl text-gray-600" data-testid="testimonials-subtitle">
            See what our customers have to say about their experience with LuxuryHotelSaaS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-200"
              data-testid={`testimonial-${index}`}
            >
              <div className="mb-6">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed" data-testid={`testimonial-text-${index}`}>
                  "{testimonial.text}"
                </p>
              </div>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={`${testimonial.name} portrait`}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                  data-testid={`testimonial-image-${index}`}
                />
                <div>
                  <p className="font-semibold text-text-primary" data-testid={`testimonial-name-${index}`}>
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600" data-testid={`testimonial-title-${index}`}>
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
