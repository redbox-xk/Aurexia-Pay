'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'
import { useWeb3 } from '@/lib/web3/hooks'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  customer_email: string
  created: string
}

export default function PaymentsPage() {
  const { account, connect } = useWeb3()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/v1/payments')
      setPayments(response.data.data || [])
    } catch (error) {
      console.error('[v0] Error fetching payments:', error)
      toast({ title: 'Error', description: 'Failed to fetch payments', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter
    const matchesSearch = p.id.includes(searchTerm) || p.customer_email.includes(searchTerm)
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slideIn">
        <h1 className="text-4xl font-bold mb-2">Payments</h1>
        <p className="text-muted-foreground">Manage and monitor all your payments</p>
      </div>

      {!account && (
        <Alert className="mb-6 animate-slideIn border-yellow-200 bg-yellow-50">
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            <Button variant="link" size="sm" onClick={connect} className="p-0">
              Connect your wallet to view and manage payments
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6 animate-slideIn">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search by Payment ID or Email</Label>
            <Input
              id="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'completed', 'pending', 'failed'].map(status => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slideIn">
        <CardHeader>
          <CardTitle>Payment List</CardTitle>
          <CardDescription>{filteredPayments.length} payments found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No payments found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-sm font-medium p-3">Payment ID</th>
                    <th className="text-left text-sm font-medium p-3">Customer</th>
                    <th className="text-left text-sm font-medium p-3">Amount</th>
                    <th className="text-left text-sm font-medium p-3">Status</th>
                    <th className="text-left text-sm font-medium p-3">Date</th>
                    <th className="text-left text-sm font-medium p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, i) => (
                    <tr
                      key={payment.id}
                      className="border-b hover:bg-muted/50 transition-smooth"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <td className="p-3 text-sm font-mono">{payment.id.slice(0, 8)}...</td>
                      <td className="p-3 text-sm">{payment.customer_email}</td>
                      <td className="p-3 text-sm font-medium">
                        {formatCurrency(payment.amount / 100, payment.currency)}
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(payment.created)}
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
