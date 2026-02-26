'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'
import { useWeb3 } from '@/lib/web3/hooks'
import { formatCurrency } from '@/lib/utils/format'

export default function PaymentPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const { account, connect } = useWeb3()
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPayment()
  }, [sessionId])

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/api/v1/payments/${sessionId}`)
      setPayment(response.data.data)
    } catch (error) {
      console.error('Error fetching payment:', error)
      toast.error('Payment not found')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (!account) {
      await connect()
      return
    }

    setProcessing(true)
    try {
      const response = await api.post(`/api/v1/payments/${sessionId}/confirm`, {
        payment_method: 'crypto',
        wallet: account
      })

      toast.success('Payment successful!')
      fetchPayment()
    } catch (error) {
      toast.error('Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment Not Found</CardTitle>
            <CardDescription>
              The payment you're looking for doesn't exist or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
          <CardDescription>
            Pay with crypto to complete your transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between p-4 bg-muted rounded-lg">
            <span className="font-medium">Amount:</span>
            <span className="text-primary font-bold">
              {formatCurrency(payment.amount / 100, payment.currency)}
            </span>
          </div>

          {payment.description && (
            <div className="p-4 bg-muted rounded-lg">
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-muted-foreground">{payment.description}</p>
            </div>
          )}

          {payment.status === 'succeeded' ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 text-center">
                Payment completed successfully!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 text-center">
                  Connect your wallet to complete payment
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Pay with</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">ETH</Button>
                  <Button variant="outline" className="flex-1">USDC</Button>
                  <Button variant="outline" className="flex-1">AURX</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handlePay}
            disabled={payment.status === 'succeeded' || processing}
          >
            {processing ? 'Processing...' : payment.status === 'succeeded' ? 'Paid' : 'Pay Now'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
