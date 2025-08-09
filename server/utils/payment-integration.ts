import { storage } from '../storage';

export interface PaymentProvider {
  name: string;
  id: 'PAYSTACK' | 'FLUTTERWAVE' | 'STRIPE';
  supportedCurrencies: string[];
  supportedCountries: string[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  reference: string;
  description: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  authorizationUrl?: string;
  accessCode?: string;
  paymentId?: string;
  error?: string;
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    name: 'Paystack',
    id: 'PAYSTACK',
    supportedCurrencies: ['NGN', 'USD', 'GHS', 'ZAR'],
    supportedCountries: ['NG', 'GH', 'ZA']
  },
  {
    name: 'Flutterwave',
    id: 'FLUTTERWAVE',
    supportedCurrencies: ['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'KES', 'UGX', 'TZS'],
    supportedCountries: ['NG', 'KE', 'UG', 'TZ', 'RW', 'ZM', 'US', 'GB', 'CA']
  },
  {
    name: 'Stripe',
    id: 'STRIPE',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'],
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NG']
  }
];

class PaymentService {
  private paystackSecretKey: string | undefined;
  private flutterwaveSecretKey: string | undefined;
  private stripeSecretKey: string | undefined;

  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    this.flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  }

  async initializePayment(
    provider: 'PAYSTACK' | 'FLUTTERWAVE' | 'STRIPE',
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      let result: PaymentResponse;

      switch (provider) {
        case 'PAYSTACK':
          result = await this.initializePaystack(request);
          break;
        case 'FLUTTERWAVE':
          result = await this.initializeFlutterwave(request);
          break;
        case 'STRIPE':
          result = await this.initializeStripe(request);
          break;
        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }

      // Log payment initialization
      await this.logPaymentAttempt({
        provider,
        reference: request.reference,
        amount: request.amount,
        currency: request.currency,
        status: result.success ? 'initialized' : 'failed',
        customerEmail: request.customerEmail
      });

      return result;
    } catch (error) {
      console.error(`Payment initialization failed for ${provider}:`, error);
      return {
        success: false,
        reference: request.reference,
        error: error instanceof Error ? error.message : 'Payment initialization failed'
      };
    }
  }

  private async initializePaystack(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: request.customerEmail,
        amount: Math.round(request.amount * 100), // Convert to kobo
        reference: request.reference,
        currency: request.currency,
        callback_url: request.callbackUrl,
        metadata: {
          customer_name: request.customerName,
          customer_phone: request.customerPhone,
          ...request.metadata
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Paystack initialization failed');
    }

    return {
      success: true,
      reference: request.reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      paymentId: data.data.reference
    };
  }

  private async initializeFlutterwave(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.flutterwaveSecretKey) {
      throw new Error('Flutterwave secret key not configured');
    }

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: request.reference,
        amount: request.amount,
        currency: request.currency,
        redirect_url: request.callbackUrl,
        customer: {
          email: request.customerEmail,
          name: request.customerName,
          phonenumber: request.customerPhone
        },
        customizations: {
          title: 'LuxuryHotelSaaS',
          description: request.description,
          logo: 'https://luxuryhotelsaas.com/logo.png'
        },
        meta: request.metadata
      }),
    });

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'Flutterwave initialization failed');
    }

    return {
      success: true,
      reference: request.reference,
      authorizationUrl: data.data.link,
      paymentId: data.data.id
    };
  }

  private async initializeStripe(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    // Create Stripe checkout session
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': request.currency.toLowerCase(),
        'line_items[0][price_data][product_data][name]': request.description,
        'line_items[0][price_data][unit_amount]': (request.amount * 100).toString(),
        'line_items[0][quantity]': '1',
        mode: 'payment',
        'success_url': request.callbackUrl || 'https://luxuryhotelsaas.com/payment/success',
        'cancel_url': 'https://luxuryhotelsaas.com/payment/cancel',
        'client_reference_id': request.reference,
        'customer_email': request.customerEmail,
        'metadata[customer_name]': request.customerName,
        'metadata[customer_phone]': request.customerPhone || ''
      }).toString()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Stripe initialization failed');
    }

    return {
      success: true,
      reference: request.reference,
      authorizationUrl: data.url,
      paymentId: data.id
    };
  }

  async verifyPayment(
    provider: 'PAYSTACK' | 'FLUTTERWAVE' | 'STRIPE',
    reference: string
  ): Promise<{ verified: boolean; amount?: number; currency?: string; status?: string }> {
    try {
      switch (provider) {
        case 'PAYSTACK':
          return await this.verifyPaystack(reference);
        case 'FLUTTERWAVE':
          return await this.verifyFlutterwave(reference);
        case 'STRIPE':
          return await this.verifyStripe(reference);
        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Payment verification failed for ${provider}:`, error);
      return { verified: false };
    }
  }

  private async verifyPaystack(reference: string) {
    if (!this.paystackSecretKey) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Paystack verification failed');
    }

    return {
      verified: data.data.status === 'success',
      amount: data.data.amount / 100, // Convert from kobo
      currency: data.data.currency,
      status: data.data.status
    };
  }

  private async verifyFlutterwave(reference: string) {
    if (!this.flutterwaveSecretKey) {
      throw new Error('Flutterwave secret key not configured');
    }

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
      },
    });

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'Flutterwave verification failed');
    }

    return {
      verified: data.data.status === 'successful',
      amount: data.data.amount,
      currency: data.data.currency,
      status: data.data.status
    };
  }

  private async verifyStripe(sessionId: string) {
    if (!this.stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${this.stripeSecretKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Stripe verification failed');
    }

    return {
      verified: data.payment_status === 'paid',
      amount: data.amount_total / 100, // Convert from cents
      currency: data.currency?.toUpperCase(),
      status: data.payment_status
    };
  }

  private async logPaymentAttempt(details: {
    provider: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail: string;
  }) {
    try {
      console.log('Payment Log:', details);
      // In production, this would save to the payments table
    } catch (error) {
      console.error('Failed to log payment attempt:', error);
    }
  }

  // Get best payment provider for country/currency
  getBestProvider(country: string, currency: string): PaymentProvider | null {
    const availableProviders = PAYMENT_PROVIDERS.filter(provider => 
      provider.supportedCountries.includes(country.toUpperCase()) &&
      provider.supportedCurrencies.includes(currency.toUpperCase())
    );

    // Priority: Paystack for Nigeria, Flutterwave for other African countries, Stripe for international
    if (country.toUpperCase() === 'NG' && availableProviders.find(p => p.id === 'PAYSTACK')) {
      return availableProviders.find(p => p.id === 'PAYSTACK')!;
    }

    if (['KE', 'UG', 'TZ', 'RW', 'ZM'].includes(country.toUpperCase()) && 
        availableProviders.find(p => p.id === 'FLUTTERWAVE')) {
      return availableProviders.find(p => p.id === 'FLUTTERWAVE')!;
    }

    // Fallback to Stripe for international
    return availableProviders.find(p => p.id === 'STRIPE') || availableProviders[0] || null;
  }
}

export const paymentService = new PaymentService();