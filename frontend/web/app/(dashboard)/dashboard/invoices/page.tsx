'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function InvoicesPage() {
  const [loading] = useState(false)
  const [invoices] = useState([
    {
      id: 'INV-001',
      amount: 1500,
      customer: 'Acme Corp',
      status: 'paid',
      date: '2024-01-15',
    },
    {
      id: 'INV-002',
      amount: 2500,
      customer: 'Tech Solutions',
      status: 'pending',
      date: '2024-01-14',
    },
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slideIn">
        <h1 className="text-4xl font-bold mb-2">Invoices</h1>
        <p className="text-muted-foreground">Create and manage invoices</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">1</p>
          </CardContent>
        </Card>
        <Card className="animate-slideIn">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">1</p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slideIn">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>{invoices.length} total invoices</CardDescription>
          </div>
          <Button>Create Invoice</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">ID</th>
                  <th className="text-left p-3 text-sm font-medium">Customer</th>
                  <th className="text-left p-3 text-sm font-medium">Amount</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Date</th>
                  <th className="text-left p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-muted/50 transition-smooth">
                    <td className="p-3 text-sm font-mono">{inv.id}</td>
                    <td className="p-3 text-sm">{inv.customer}</td>
                    <td className="p-3 text-sm font-medium">${inv.amount}</td>
                    <td className="p-3">
                      <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{inv.date}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
