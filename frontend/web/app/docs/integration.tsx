'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function IntegrationGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Integration Guide</h1>
          <p className="text-muted-foreground mt-1">Get started with Aurexia Payment API</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get up and running in 5 minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-semibold">Create API Keys</p>
                  <p className="text-sm text-muted-foreground">Generate your API keys from the dashboard</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-semibold">Install SDK</p>
                  <p className="text-sm text-muted-foreground">Add the Aurexia SDK to your project</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-semibold">Initialize Client</p>
                  <p className="text-sm text-muted-foreground">Set up the client with your API key</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="font-semibold">Create Payments</p>
                  <p className="text-sm text-muted-foreground">Start accepting payments from customers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Tabs defaultValue="javascript" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="go">Go</TabsTrigger>
            <TabsTrigger value="rest">REST</TabsTrigger>
          </TabsList>

          {/* JavaScript */}
          <TabsContent value="javascript">
            <Card>
              <CardHeader>
                <CardTitle>JavaScript/Node.js</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`// Install SDK
npm install @aurexia/sdk

// Import and initialize
import Aurexia from '@aurexia/sdk'

const aurexia = new Aurexia({
  apiKey: 'aur_live_sk_...',
  environment: 'production'
})

// Create payment intent
const payment = await aurexia.payments.create({
  amount: 1000,
  currency: 'AURX',
  description: 'Premium subscription',
  customerEmail: 'user@example.com'
})

console.log(payment.id)
console.log(payment.clientSecret)`}</pre>
                </div>
                <Button>View Full Documentation</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Python */}
          <TabsContent value="python">
            <Card>
              <CardHeader>
                <CardTitle>Python</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`# Install SDK
pip install aurexia-sdk

# Import and initialize
from aurexia import AurexiaClient

aurexia = AurexiaClient(
    api_key='aur_live_sk_...',
    environment='production'
)

# Create payment intent
payment = aurexia.payments.create(
    amount=1000,
    currency='AURX',
    description='Premium subscription',
    customer_email='user@example.com'
)

print(payment['id'])
print(payment['client_secret'])`}</pre>
                </div>
                <Button>View Full Documentation</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Go */}
          <TabsContent value="go">
            <Card>
              <CardHeader>
                <CardTitle>Go</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`// Install SDK
go get github.com/aurexia/sdk-go

// Import and initialize
import "github.com/aurexia/sdk-go"

client := aurexia.NewClient(
    "aur_live_sk_...",
    aurexia.EnvironmentProduction,
)

// Create payment intent
payment, err := client.Payments.Create(context.Background(), 
    &aurexia.CreatePaymentRequest{
        Amount:        1000,
        Currency:      "AURX",
        Description:   "Premium subscription",
        CustomerEmail: "user@example.com",
    })

if err != nil {
    log.Fatal(err)
}

fmt.Println(payment.ID)`}</pre>
                </div>
                <Button>View Full Documentation</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REST */}
          <TabsContent value="rest">
            <Card>
              <CardHeader>
                <CardTitle>REST API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`# Create Payment Intent
curl -X POST https://api.aurexia.io/v1/payments \\
  -H "Authorization: Bearer aur_live_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000,
    "currency": "AURX",
    "description": "Premium subscription",
    "customer_email": "user@example.com"
  }'

# Response
{
  "id": "pi_1234567890",
  "client_secret": "pi_1234567890_secret_xyz",
  "amount": 1000,
  "status": "pending"
}`}</pre>
                </div>
                <Button>View Full API Reference</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>Everything you need for payment processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Payment Intents', desc: 'Stripe-compatible payment flow' },
                { title: 'Webhooks', desc: 'Real-time event delivery' },
                { title: 'Refunds', desc: 'Process refunds instantly' },
                { title: 'Settlements', desc: 'Track your payouts' },
                { title: 'Reporting', desc: 'Detailed analytics' },
                { title: 'Multi-Currency', desc: 'Accept AURX and stablecoins' },
              ].map((feature) => (
                <div key={feature.title} className="p-3 border border-border/50 rounded-lg">
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">Read API Documentation</Button>
            <Button variant="outline" className="w-full">View Code Examples</Button>
            <Button variant="outline" className="w-full">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
