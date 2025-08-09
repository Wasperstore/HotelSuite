import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Smartphone, 
  Globe, 
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign
} from "lucide-react";

interface PaymentIntegrationProps {
  amount: number;
  currency?: string;
  bookingId: string;
  hotelId: string;
  customerEmail: string;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
}

export default function PaymentIntegration({
  amount,
  currency = "NGN",
  bookingId,
  hotelId,
  customerEmail,
  onSuccess,
  onError
}: PaymentIntegrationProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePaystackPayment = async () => {
    setLoading('paystack');
    try {
      // Initialize Paystack payment
      const response = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100, // Paystack expects kobo
          email: customerEmail,
          currency,
          bookingId,
          hotelId,
          callback_url: `${window.location.origin}/payment/callback`,
        }),
      });

      const data = await response.json();
      
      if (data.status) {
        // Redirect to Paystack checkout
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error(data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
      toast({
        title: "Payment Error",
        description: "Failed to initialize Paystack payment",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleFlutterwavePayment = async () => {
    setLoading('flutterwave');
    try {
      // Initialize Flutterwave payment
      const response = await fetch('/api/payments/flutterwave/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          email: customerEmail,
          tx_ref: `HOTEL_${bookingId}_${Date.now()}`,
          bookingId,
          hotelId,
          redirect_url: `${window.location.origin}/payment/callback`,
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Redirect to Flutterwave checkout
        window.location.href = data.data.link;
      } else {
        throw new Error(data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
      toast({
        title: "Payment Error",
        description: "Failed to initialize Flutterwave payment",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleStripePayment = async () => {
    setLoading('stripe');
    try {
      // Initialize Stripe payment
      const response = await fetch('/api/payments/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Stripe expects cents
          currency: currency.toLowerCase(),
          bookingId,
          hotelId,
          customer_email: customerEmail,
          success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/payment/cancel`,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create Stripe session');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
      toast({
        title: "Payment Error",
        description: "Failed to initialize Stripe payment",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBankTransfer = () => {
    toast({
      title: "Bank Transfer",
      description: "Please contact the hotel directly for bank transfer details.",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Payment Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600" data-testid="text-payment-amount">
                {formatAmount(amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
        
        {/* Paystack Payment */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handlePaystackPayment}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Paystack</h4>
                  <p className="text-sm text-gray-600">Card, Bank Transfer, USSD</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Local</Badge>
                {loading === 'paystack' && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flutterwave Payment */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleFlutterwavePayment}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Flutterwave</h4>
                  <p className="text-sm text-gray-600">Mobile Money, Cards, Bank</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Africa</Badge>
                {loading === 'flutterwave' && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Payment */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleStripePayment}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Stripe</h4>
                  <p className="text-sm text-gray-600">International Cards</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Global</Badge>
                {loading === 'stripe' && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleBankTransfer}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                  <p className="text-sm text-gray-600">Direct bank deposit</p>
                </div>
              </div>
              <Badge variant="outline">Manual</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Secure Payment</p>
            <p>All payments are processed securely through certified payment providers. Your card details are never stored on our servers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}