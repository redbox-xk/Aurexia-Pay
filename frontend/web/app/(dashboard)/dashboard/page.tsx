'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/toast'
import api from '@/lib/api/client'
import { useWeb3 } from '@/lib/web3/hooks'

export default function DashboardPage() {
  const { account, balance, connect } = useWeb3()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('usd')

  useEffect(() => {
    if (account) {
      fetchPayments()
    }
  }, [account])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/api/v1/payments')
      setPayments(response.data.data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
  }

  const createPayment = async () => {
    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/v1/payments', {
        amount: parseFloat(amount) * 100, // Convert to cents
        currency,
        customer_email: account,
        metadata: {
          wallet: account
        }
      })

      toast.success('Payment created successfully!')
      fetchPayments()
      setAmount('')
    } catch (error) {
      toast.error('Failed to create payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Merchant Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Volume</CardTitle>
            <CardDescription>All time payment volume</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">$124.5k</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Total number of payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
            <CardDescription>Payment success percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">99.2%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Payment</CardTitle>
            <CardDescription>Generate a new payment link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
            </div>
            <Button 
              className="w-full" 
              onClick={createPayment}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Payment'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{payment.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.created).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${payment.amount / 100}</p>
                    <p className="text-sm text-green-600">Completed</p>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No payments yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
