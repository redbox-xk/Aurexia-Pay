'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useWeb3 } from '@/lib/web3/hooks'
import { formatCurrency, formatDate } from '@/lib/utils/format'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DashboardPage() {
  const { account, balance, connect, disconnect, isConnected } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')

  // Fetch dashboard stats with SWR
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR(
    '/api/dashboard/stats',
    fetcher,
    { refreshInterval: 30000 }
  )

  // Fetch transactions with SWR
  const { data: txData, error: txError, mutate: mutateTx } = useSWR(
    '/api/transactions',
    fetcher
  )

  const stats = statsData?.data || {
    transactions: { total: 0, volume: 0, todayCount: 0, todayVolume: 0 },
    users: { total: 0 },
    merchants: { total: 0 }
  }

  const transactions = txData?.data || []

  const createTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          payment_method: 'crypto',
          metadata: { wallet: account }
        })
      })
      
      if (response.ok) {
        mutateTx()
        setAmount('')
      }
    } catch (error) {
      console.error('[v0] Transaction creation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      title: 'Total Volume', 
      value: formatCurrency(stats.transactions.volume, 'USD'),
      description: 'All time volume',
      icon: (
        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      title: 'Transactions', 
      value: stats.transactions.total.toLocaleString(),
      description: 'Total payments',
      icon: (
        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      title: 'Today', 
      value: formatCurrency(stats.transactions.todayVolume, 'USD'),
      description: `${stats.transactions.todayCount} transactions`,
      icon: (
        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      title: 'Wallet Balance', 
      value: isConnected ? `${parseFloat(balance || '0').toFixed(4)} ETH` : '---',
      description: isConnected ? 'Connected' : 'Not connected',
      icon: (
        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="animate-slideIn">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/images/nexa-logo.png"
                alt="Nexa"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <p className="text-slate-600">Welcome back! Here is your payment overview.</p>
          </div>
          
          <div className="flex items-center gap-3 animate-slideIn" style={{ animationDelay: '100ms' }}>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 font-mono text-xs">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={disconnect}
                  className="border-slate-300"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                onClick={connect}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading
            ? Array(4).fill(0).map((_, i) => (
                <Card key={i} className="bg-white border-slate-200">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat, i) => (
                <Card 
                  key={i} 
                  className="bg-white border-slate-200 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 animate-slideIn"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                      <span>{stat.title}</span>
                      {stat.icon}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">{stat.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Transaction */}
          <Card className="bg-white border-slate-200 animate-slideIn" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Create Transaction</CardTitle>
              <CardDescription>Process a new payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-700">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-slate-700">Currency</Label>
                <select
                  id="currency"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
                onClick={createTransaction}
                disabled={loading || !amount}
              >
                {loading ? 'Processing...' : 'Create Transaction'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-white border-slate-200 animate-slideIn" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Recent Transactions</CardTitle>
              <CardDescription>Your latest activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-auto">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-slate-500 text-sm">No transactions yet</p>
                    <p className="text-slate-400 text-xs mt-1">Create one to get started</p>
                  </div>
                ) : (
                  transactions.slice(0, 6).map((tx: any, i: number) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900 font-mono">
                            {tx.id?.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-slate-900">
                          {formatCurrency(tx.amount, tx.currency || 'USD')}
                        </p>
                        <Badge 
                          className={`text-xs ${
                            tx.status === 'completed' 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideIn" style={{ animationDelay: '400ms' }}>
          {[
            { label: 'Payments', href: '/dashboard/payments', icon: '💳' },
            { label: 'Invoices', href: '/dashboard/invoices', icon: '📄' },
            { label: 'NFC Cards', href: '/dashboard/nfc-cards', icon: '📱' },
            { label: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:shadow-cyan-500/5 hover:border-cyan-500/30 transition-all duration-300"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-medium text-slate-900">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
