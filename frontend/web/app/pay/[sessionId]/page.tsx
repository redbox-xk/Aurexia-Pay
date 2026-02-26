'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'
import { useWeb3 } from '@/lib/web3/hooks'
import { formatCurrency, truncateAddress } from '@/lib/utils/format'

export default function PaymentPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const { account, connect, balance, isConnecting } = useWeb3()
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedToken, setSelectedToken] = useState('ETH')

  useEffect(() => {
    fetchPayment()
  }, [sessionId])

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/api/v1/payments/${sessionId}`)
      setPayment(response.data.data)
    } catch (error) {
      console.error('[v0] Error fetching payment:', error)
      toast({ title: 'Error', description: 'Payment not found', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (!account) {
      const success = await connect()
      if (!success) return
      return
    }

    setProcessing(true)
    try {
      const response = await api.post(`/api/v1/payments/${sessionId}/confirm`, {
        payment_method: 'crypto',
        token: selectedToken,
        wallet: account
      })

      toast({ title: 'Success', description: 'Payment successful!' })
      fetchPayment()
    } catch (error) {
      console.error('[v0] Payment error:', error)
      toast({ title: 'Error', description: 'Payment failed', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/10">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment...</p>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/10 px-4">
        <Card className="w-full max-w-md animate-slideIn">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <CardTitle>Payment Not Found</CardTitle>
            <CardDescription>
              The payment you're looking for doesn't exist or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const isPaymentComplete = payment.status === 'succeeded'

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-slideIn">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center gap-2 mb-4">
            {isPaymentComplete && <span className="text-4xl">✅</span>}
            {processing && <Spinner size="md" />}
            {!isPaymentComplete && !processing && <span className="text-4xl">💳</span>}
          </div>
          <CardTitle className="text-2xl">
            {isPaymentComplete ? 'Payment Complete' : 'Complete Payment'}
          </CardTitle>
          <CardDescription className="mt-2">
            {isPaymentComplete 
              ? 'Your payment has been processed successfully' 
              : 'Pay with crypto to complete your transaction'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount Display */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
            <div className="flex justify-between items-baseline">
              <p className="text-3xl font-bold">
                {formatCurrency(payment.amount / 100, payment.currency)}
              </p>
              <p className="text-sm text-muted-foreground">{payment.currency.toUpperCase()}</p>
            </div>
          </div>

          {/* Description */}
          {payment.description && (
            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{payment.description}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Status */}
          {isPaymentComplete ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-700 font-medium text-center">
                ✓ Payment completed successfully
              </p>
              <p className="text-xs text-green-600 text-center mt-2 font-mono">
                {sessionId.slice(0, 12)}...
              </p>
            </div>
          ) : (
            <>
              {/* Wallet Connection */}
              {account ? (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Connected Wallet</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-semibold">{truncateAddress(account)}</p>
                    <Badge variant="default" className="text-xs">Connected</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Balance: {balance} ETH</p>
                </div>
              ) : (
                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <AlertDescription>
                    <p className="text-sm text-yellow-700">
                      Connect your wallet to complete payment
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Token Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Payment Token</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['ETH', 'USDC', 'AURX'].map(token => (
                    <button
                      key={token}
                      onClick={() => setSelectedToken(token)}
                      className={`p-3 rounded-lg border transition-smooth text-sm font-medium ${
                        selectedToken === token
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-muted'
                      }`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter>
          {isPaymentComplete ? (
            <Button className="w-full" variant="outline">
              Back to Merchant
            </Button>
          ) : (
            <Button 
              className="w-full"
              onClick={handlePay}
              disabled={processing || isConnecting}
            >
              {processing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing Payment...
                </>
              ) : isConnecting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Connecting Wallet...
                </>
              ) : account ? (
                `Pay ${formatCurrency(payment.amount / 100, payment.currency)} with ${selectedToken}`
              ) : (
                'Connect Wallet to Pay'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
