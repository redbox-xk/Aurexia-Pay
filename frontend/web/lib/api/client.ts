/**
 * Aurexia Payment API Client
 * Stripe-like REST API for payment operations
 */

export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  created: string
  fees: {
    fee_amount: number
    settlement_amount: number
    fee_percent: number
  }
}

export interface CreatePaymentRequest {
  amount: number
  currency?: string
  description?: string
  customer_email?: string
  metadata?: Record<string, any>
}

export interface PaymentConfirmRequest {
  payer_address: string
  transaction_hash: string
}

export interface Refund {
  id: string
  payment_id: string
  amount: number
  status: 'pending' | 'succeeded' | 'failed'
  created: string
}

export interface Settlement {
  id: string
  payment_id: string
  merchant_id: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  timestamp: string
}

export interface Analytics {
  total_payments: number
  succeeded_payments: number
  total_volume: number
  total_fees: number
  success_rate: number
  average_fee_percent: number
}

class AurexiaClient {
  private baseUrl: string
  private apiKey: string | null = null

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  setApiKey(key: string) {
    this.apiKey = key
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    return headers
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Request failed',
        }
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Payment Intent Operations
  async createPaymentIntent(
    request: CreatePaymentRequest
  ): Promise<{ success: boolean; data?: PaymentIntent; error?: string }> {
    return this.request<PaymentIntent>('POST', '/api/v1/payments', request)
  }

  async getPaymentIntent(
    paymentId: string
  ): Promise<{ success: boolean; data?: PaymentIntent; error?: string }> {
    return this.request<PaymentIntent>('GET', `/api/v1/payments/${paymentId}`)
  }

  async confirmPayment(
    paymentId: string,
    request: PaymentConfirmRequest
  ): Promise<{ success: boolean; data?: PaymentIntent; error?: string }> {
    return this.request<PaymentIntent>(
      'POST',
      `/api/v1/payments/${paymentId}/confirm`,
      request
    )
  }

  async refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<{ success: boolean; data?: Refund; error?: string }> {
    return this.request<Refund>(
      'POST',
      `/api/v1/payments/${paymentId}/refund`,
      amount ? { amount } : undefined
    )
  }

  // Settlement Operations
  async getMerchantSettlements(
    merchantId: string
  ): Promise<{
    success: boolean
    data?: {
      merchant_id: string
      total_settled: number
      settlements: Settlement[]
      count: number
    }
    error?: string
  }> {
    return this.request(
      'GET',
      `/api/v1/merchants/${merchantId}/settlements`
    )
  }

  // Webhook Operations
  async registerWebhook(
    merchantId: string,
    url: string
  ): Promise<{ success: boolean; data?: { webhook_id: string }; error?: string }> {
    return this.request(
      'POST',
      '/api/v1/webhooks/register',
      { merchant_id: merchantId, url }
    )
  }

  // Analytics
  async getAnalytics(): Promise<{
    success: boolean
    data?: Analytics
    error?: string
  }> {
    return this.request<Analytics>('GET', '/api/v1/analytics')
  }

  // Health Check
  async healthCheck(): Promise<{
    success: boolean
    data?: { status: string; service: string; version: string }
    error?: string
  }> {
    return this.request('GET', '/healthz')
  }
}

// Export singleton instance
export const aurexiaClient = new AurexiaClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
)

export default aurexiaClient
