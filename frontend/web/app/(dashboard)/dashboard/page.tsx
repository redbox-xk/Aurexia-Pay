'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'
import { useWeb3 } from '@/lib/web3/hooks'
import { formatCurrency, formatDate } from '@/lib/utils/format'

export default function DashboardPage() {
  const { account, balance, connect } = useWeb3()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('usd')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/api/v1/payments')
      setPayments(response.data.data || [])
    } catch (error) {
      console.error('[v0] Error fetching payments:', error)
    }
  }

  const createPayment = async () => {
    if (!account) {
      toast({ title: 'Error', description: 'Please connect your wallet first', variant: 'destructive' })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/v1/payments', {
        amount: parseFloat(amount) * 100,
        currency,
        customer_email: account,
        metadata: { wallet: account }
      })

      toast({ title: 'Success', description: 'Payment created successfully!' })
      fetchPayments()
      setAmount('')
    } catch (error) {
      console.error('[v0] Payment creation error:', error)
      toast({ title: 'Error', description: 'Failed to create payment', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { title: 'Total Volume', value: '$124.5k', description: 'All time volume', icon: '💰' },
    { title: 'Transactions', value: '1,234', description: 'Total payments', icon: '🔄' },
    { title: 'Success Rate', value: '99.2%', description: 'Payment success', icon: '✅' },
    { title: 'Wallet Balance', value: balance ? `${balance} ETH` : '—', description: 'Current balance', icon: '🪙' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slideIn">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your payment overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
          : stats.map((stat, i) => (
              <Card key={i} className="animate-slideIn" style={{ animationDelay: `${i * 100}ms` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{stat.title}</span>
                    <span className="text-2xl">{stat.icon}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">{stat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Wallet Status */}
      {account && (
        <Card className="mb-8 animate-slideIn border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Wallet Connected</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account</p>
              <p className="font-mono text-sm">{account}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {}}>
              Disconnect
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="animate-slideIn">
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
                disabled={!account}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="w-full px-3 py-2 border rounded-md bg-background transition-smooth disabled:opacity-50"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={!account}
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
            </div>
            {!account ? (
              <Button className="w-full" onClick={connect} variant="outline">
                Connect Wallet First
              </Button>
            ) : (
              <Button className="w-full" onClick={createPayment} disabled={loading || !amount}>
                {loading ? 'Creating...' : 'Create Payment'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slideIn">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-auto">
              {payments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  No payments yet. Create one to get started!
                </p>
              ) : (
                payments.slice(0, 5).map((payment, i) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-muted/80 transition-smooth"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium text-sm font-mono">{payment.id?.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.created)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        {formatCurrency(payment.amount / 100, payment.currency || 'usd')}
                      </p>
                      <Badge variant="default" className="text-xs mt-1">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
