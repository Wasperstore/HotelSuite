import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { 
  Hotel, 
  Shield, 
  Smartphone, 
  Zap, 
  CreditCard, 
  MessageCircle, 
  BarChart3, 
  Users, 
  Calendar, 
  Settings, 
  ArrowRight, 
  Star, 
  CheckCircle,
  Play
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // Redirect authenticated users based on their role
  if (!isLoading && user) {
    switch (user.role) {
      case "SUPER_ADMIN":
        return <Redirect to="/super-admin" />;
      case "DEVELOPER_ADMIN":
        return <Redirect to="/developer" />;
      case "HOTEL_OWNER":
        return <Redirect to="/owner" />;
      default:
        return <Redirect to="/auth" />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Hotel className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LuxuryHotelSaaS
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
              <Button asChild data-testid="button-login">
                <a href="/auth">Login</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Hotel, Fully Digital —{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Offline or Online
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The first hotel management platform built for Africa. Handle power outages, 
              unreliable internet, and grow your revenue with our offline-first PWA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="button-start-trial">
                <Play className="w-5 h-5 mr-2" />
                Start 30-Day Free Trial
              </Button>
              <Button variant="outline" size="lg" data-testid="button-demo">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                30-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                Setup in 5 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for African Hotels
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature designed to handle the unique challenges of hospitality in Africa —
              from power cuts to mobile-first guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Zap className="text-blue-600 w-6 h-6" />
                </div>
                <CardTitle>Offline-First PWA</CardTitle>
                <CardDescription>
                  Keep working during power outages. All data syncs when internet returns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                  <Settings className="text-green-600 w-6 h-6" />
                </div>
                <CardTitle>Generator Tracking</CardTitle>
                <CardDescription>
                  Monitor diesel usage, runtime, and maintenance schedules to cut operational costs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
                  <CreditCard className="text-yellow-600 w-6 h-6" />
                </div>
                <CardTitle>Local Payments</CardTitle>
                <CardDescription>
                  Paystack, Flutterwave, and Stripe integration for seamless African payments.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  <MessageCircle className="text-purple-600 w-6 h-6" />
                </div>
                <CardTitle>WhatsApp Integration</CardTitle>
                <CardDescription>
                  Engage guests via WhatsApp and SMS for bookings, confirmations, and support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <Smartphone className="text-indigo-600 w-6 h-6" />
                </div>
                <CardTitle>QR Code Features</CardTitle>
                <CardDescription>
                  Self check-in kiosks, digital menus, and contactless guest services.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
              <CardHeader>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                  <Shield className="text-red-600 w-6 h-6" />
                </div>
                <CardTitle>Multi-Tenant Security</CardTitle>
                <CardDescription>
                  Role-based access control with hotel-specific permissions and data isolation.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              From setup to taking bookings in under 5 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
              <p className="text-gray-600">
                Sign up as a hotel owner and get instant access to your dashboard.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Import Your Data</h3>
              <p className="text-gray-600">
                CSV import wizard or start fresh with our quick setup templates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Taking Bookings</h3>
              <p className="text-gray-600">
                Your branded booking portal goes live instantly at yourhotel.luxuryhotelsaas.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your hotel size. Always 30 days free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative border-2 border-gray-200">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  ₦35,000<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <CardDescription className="mt-2">Perfect for small hotels</CardDescription>
                <Badge variant="outline" className="w-fit mx-auto mt-2">≤25 Rooms</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {['Core booking system', 'Front desk management', 'Payment processing', 'Mobile app', 'Basic reports'].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6" data-testid="button-starter-plan">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Growth Plan */}
            <Card className="relative border-2 border-blue-500 shadow-lg transform scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl">Growth</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  ₦65,000<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <CardDescription className="mt-2">For growing properties</CardDescription>
                <Badge variant="outline" className="w-fit mx-auto mt-2">26–75 Rooms</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {['Everything in Starter', 'OTA iCal sync', 'POS integration', 'Advanced reports', 'WhatsApp/SMS credits', 'Staff management'].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600" data-testid="button-growth-plan">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-gray-200">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mt-4">
                  ₦120,000<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <CardDescription className="mt-2">For large hotels & resorts</CardDescription>
                <Badge variant="outline" className="w-fit mx-auto mt-2">75+ Rooms</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {['Everything in Growth', 'Generator tracker', 'Self check-in kiosk', 'Advanced analytics', 'Custom integrations', 'Priority support'].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6" data-testid="button-pro-plan">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              <strong>Add-ons:</strong> Custom domain setup (₦50,000), Training & onboarding (₦75,000)
            </p>
            <p className="text-sm text-gray-500">
              All prices in Nigerian Naira. Plans can be cancelled anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by African Hoteliers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Adunni Okafor",
                title: "Owner, Lagos Beach Resort",
                content: "Finally, a system that works offline! Our front desk keeps running even when NEPA cuts power.",
                rating: 5
              },
              {
                name: "Kwame Asante", 
                title: "Manager, Gold Coast Hotel",
                content: "The generator tracking feature has saved us thousands in diesel costs. ROI in the first month!",
                rating: 5
              },
              {
                name: "Amara Ndidi",
                title: "Owner, Abuja Suites", 
                content: "WhatsApp integration is a game-changer. Our guests love booking via WhatsApp.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base text-gray-700">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Hotel className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold">LuxuryHotelSaaS</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The first hotel management platform built specifically for African hotels. 
                Handle power outages, unreliable internet, and grow your revenue.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">API Documentation</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Integrations</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Training</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Status Page</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LuxuryHotelSaaS. All rights reserved. Built for African hospitality.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}