'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AnalyticsPage() {
  const metrics = [
    { label: 'Total Volume', value: '$124.5k', change: '+15.2%', icon: '📈' },
    { label: 'Transactions', value: '1,234', change: '+8.5%', icon: '🔄' },
    { label: 'Avg Transaction', value: '$101', change: '+3.2%', icon: '💰' },
    { label: 'Success Rate', value: '99.2%', change: '+0.5%', icon: '✅' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slideIn">
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Monitor your payment metrics and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, i) => (
          <Card key={i} className="animate-slideIn" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{metric.label}</span>
                <span className="text-2xl">{metric.icon}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">{metric.value}</p>
              <Badge variant="outline" className="text-green-600">
                {metric.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <Card className="mb-6 animate-slideIn">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">📊 Chart visualization coming soon</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="animate-slideIn">
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>By hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">📊 Chart coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slideIn">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { method: 'Credit Card', percentage: 45 },
                { method: 'Wallet', percentage: 30 },
                { method: 'NFC Card', percentage: 15 },
                { method: 'Bank Transfer', percentage: 10 },
              ].map((item) => (
                <div key={item.method}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{item.method}</span>
                    <span className="text-sm font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-smooth"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
