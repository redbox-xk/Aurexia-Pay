'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SubscriptionsPage() {
  const subscriptions = [
    { id: 'SUB-001', name: 'Basic Plan', amount: 29, interval: 'monthly', status: 'active', nextBilling: '2024-02-15' },
    { id: 'SUB-002', name: 'Pro Plan', amount: 99, interval: 'monthly', status: 'active', nextBilling: '2024-02-10' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slideIn">
        <h1 className="text-4xl font-bold mb-2">Subscriptions</h1>
        <p className="text-muted-foreground">Manage recurring payments and billing cycles</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${subscriptions.reduce((sum, s) => sum + s.amount, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">MRR Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">+12%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 animate-slideIn">
        <CardHeader>
          <CardTitle>Create New Subscription Plan</CardTitle>
          <CardDescription>Set up a recurring payment plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input id="planName" placeholder="e.g., Premium Plan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planPrice">Monthly Price</Label>
              <Input id="planPrice" type="number" placeholder="99.99" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="planDesc">Description</Label>
            <textarea
              id="planDesc"
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="Describe what's included in this plan"
              rows={3}
            />
          </div>
          <Button className="w-full">Create Plan</Button>
        </CardContent>
      </Card>

      <Card className="animate-slideIn">
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>Your subscription plans and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{sub.name}</p>
                    <Badge variant="default">{sub.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Next billing: {sub.nextBilling}
                  </p>
                </div>

                <div className="text-right mr-4">
                  <p className="font-semibold">${sub.amount}</p>
                  <p className="text-xs text-muted-foreground">per {sub.interval}</p>
                </div>

                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
