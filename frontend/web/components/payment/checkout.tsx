'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CheckoutProps {
  paymentId: string
  amount: number
  currency: string
  merchantName: string
  description?: string
}

export function Checkout({ paymentId, amount, currency, merchantName, description }: CheckoutProps) {
  const [step, setStep] = useState<'review' | 'payment' | 'confirm'>('review')
  const [walletAddress, setWalletAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const feesData = {
    baseFee: Math.floor(amount * 0.0029),
    fixedFee: 5,
  }
  const totalFees = feesData.baseFee + feesData.fixedFee
  const finalAmount = amount + totalFees

  const handleConnect = async () => {
    setStep('payment')
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true)
    try {
      // Simulate blockchain transaction
      const response = await fetch('/api/v1/payments/' + paymentId + '/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer_address: walletAddress,
          transaction_hash: '0x' + Math.random().toString(16).slice(2),
        }),
      })

      if (response.ok) {
        setStep('confirm')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-8">
      <div className="container mx-auto px-4 max-w-md">
        {step === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Order Review</CardTitle>
              <CardDescription>Verify your payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Merchant Info */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Merchant</p>
                <p className="font-semibold">{merchantName}</p>
              </div>

              {description && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{description}</p>
                </div>
              )}

              {/* Amount Breakdown */}
              <div className="space-y-3 border-t border-b py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{amount} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee (0.29% + $0.005)</span>
                  <span className="font-medium">{totalFees} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{finalAmount} {currency}</span>
                </div>
              </div>

              {/* Action */}
              <Button onClick={handleConnect} className="w-full" size="lg">
                Connect Wallet & Continue
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By proceeding, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Enter your wallet details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Wallet Address</label>
                <Input
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Your {currency} address</p>
              </div>

              {/* Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payment Amount</span>
                  <span className="font-medium">{finalAmount} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>To Address</span>
                  <span className="font-mono text-xs">{merchantName}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={handleConfirmPayment}
                  disabled={!walletAddress || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Payment'}
                </Button>
                <Button
                  onClick={() => setStep('review')}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  Back
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                You will be prompted to sign with your wallet
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'confirm' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Successful</CardTitle>
              <CardDescription>Your transaction is being processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success Indicator */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 bg-muted p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono">{paymentId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{finalAmount} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-600 font-medium">Confirmed</span>
                </div>
              </div>

              {/* Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Your payment is being settled. You should receive a confirmation email shortly.
                </p>
              </div>

              <Button className="w-full" size="lg">
                Return to Merchant
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
