'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DashboardPage() {
  const [payments, setPayments] = useState([
    { id: 'pi_1234567890', amount: 1000, currency: 'AURX', status: 'succeeded', created: '2025-02-26T10:30:00Z', merchant: 'test@example.com' },
    { id: 'pi_0987654321', amount: 5000, currency: 'AURX', status: 'processing', created: '2025-02-26T09:15:00Z', merchant: 'test@example.com' },
    { id: 'pi_5555555555', amount: 2500, currency: 'AURX', status: 'pending', created: '2025-02-26T08:00:00Z', merchant: 'test@example.com' },
  ])

  const [newPaymentAmount, setNewPaymentAmount] = useState('')
  const [newPaymentEmail, setNewPaymentEmail] = useState('')

  const handleCreatePayment = async () => {
    if (!newPaymentAmount || !newPaymentEmail) return

    const newPayment = {
      id: `pi_${Date.now()}`,
      amount: parseInt(newPaymentAmount),
      currency: 'AURX',
      status: 'pending',
      created: new Date().toISOString(),
      merchant: newPaymentEmail,
    }

    setPayments([newPayment, ...payments])
    setNewPaymentAmount('')
    setNewPaymentEmail('')
  }

  const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0)
  const succeededPayments = payments.filter(p => p.status === 'succeeded').length
  const totalFees = Math.floor(totalVolume * 0.0029) + (payments.length * 5)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage payments, view analytics, and configure settings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVolume.toLocaleString()} AURX</div>
              <p className="text-xs text-muted-foreground mt-1">Across {payments.length} payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Succeeded Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{succeededPayments}</div>
              <p className="text-xs text-muted-foreground mt-1">{((succeededPayments/payments.length)*100).toFixed(0)}% success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFees}</div>
              <p className="text-xs text-muted-foreground mt-1">0.29% + $0.005</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Settlement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalVolume - totalFees).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Available in 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Payment Intent</CardTitle>
                <CardDescription>Generate a new payment for your customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Amount (AURX)</label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={newPaymentAmount}
                      onChange={(e) => setNewPaymentAmount(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Customer Email</label>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      value={newPaymentEmail}
                      onChange={(e) => setNewPaymentEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleCreatePayment} className="w-full">
                    Create Payment Intent
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Last 50 transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-mono text-sm">{payment.id}</div>
                        <div className="text-xs text-muted-foreground mt-1">{payment.merchant}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{payment.amount} {payment.currency}</div>
                        <div className={`text-xs font-medium mt-1 ${
                          payment.status === 'succeeded' ? 'text-green-600' :
                          payment.status === 'processing' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {payment.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settlements Tab */}
          <TabsContent value="settlements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settlement History</CardTitle>
                <CardDescription>Track your payouts and settlements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { id: 'st_001', amount: 9500, date: '2025-02-25', status: 'completed' },
                    { id: 'st_002', amount: 8750, date: '2025-02-24', status: 'completed' },
                    { id: 'st_003', amount: 12300, date: '2025-02-23', status: 'completed' },
                  ].map((settlement) => (
                    <div
                      key={settlement.id}
                      className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                    >
                      <div>
                        <div className="font-mono text-sm">{settlement.id}</div>
                        <div className="text-xs text-muted-foreground mt-1">{settlement.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{settlement.amount.toLocaleString()} AURX</div>
                        <div className="text-xs text-green-600 font-medium mt-1">{settlement.status.toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API keys for integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Live Key</label>
                    <div className="font-mono text-sm bg-background rounded mt-2 p-3 break-all">
                      aur_live_sk_1234567890abcdefghij
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Test Key</label>
                    <div className="font-mono text-sm bg-background rounded mt-2 p-3 break-all">
                      aur_test_sk_0987654321zyxwvutsrq
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Rotate Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Configure webhooks for payment events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[
                    { id: 'wh_001', url: 'https://example.com/webhooks', events: ['payment.succeeded', 'payment.failed'], status: 'active' },
                  ].map((webhook) => (
                    <div key={webhook.id} className="p-3 border border-border/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-sm">{webhook.url}</div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{webhook.status}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Events: {webhook.events.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full">Add Webhook</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
