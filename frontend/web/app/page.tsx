'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWeb3 } from '@/lib/web3/hooks'

export default function HomePage() {
  const { account, connect, disconnect, isConnecting } = useWeb3()

  const features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: '0.5 second block times with instant finality',
      details: 'Experience near-instant transactions with our proprietary AurexiaBFT consensus.',
    },
    {
      icon: '🌉',
      title: 'Cross-Chain Native',
      description: 'Bridge to Ethereum, Polygon, Arbitrum, and more',
      details: 'Unified liquidity across all major chains with our advanced bridge infrastructure.',
    },
    {
      icon: '🏭',
      title: 'Token Generator',
      description: 'Create custom tokens with 7+ fee structures',
      details: 'No-code token creation with reflective, auto-LP, reward, and custom fee types.',
    },
    {
      icon: '💳',
      title: 'NFC Payment Cards',
      description: 'Tap-to-pay with blockchain security',
      details: 'Physical NFC cards linked to your wallet for seamless in-person payments.',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Real-time transaction monitoring',
      details: 'Comprehensive dashboards tracking every transaction with detailed metrics.',
    },
    {
      icon: '🔐',
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and compliance',
      details: 'Multi-sig wallets, RLS policies, and full audit trails for your peace of mind.',
    },
  ]

  const stats = [
    { value: '100k', label: 'TPS' },
    { value: '0.5s', label: 'Block Time' },
    { value: '99.999%', label: 'Uptime' },
    { value: '$100B+', label: 'Capacity' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Aurexia</span>
            <span className="text-sm text-muted-foreground">Capital</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/#features" className="text-sm hover:text-primary transition-smooth">
              Features
            </Link>
            <Link href="/#stats" className="text-sm hover:text-primary transition-smooth">
              Stats
            </Link>
            <Link href="/dashboard" className="text-sm hover:text-primary transition-smooth">
              Dashboard
            </Link>
            {account ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{account.slice(0, 6)}...{account.slice(-4)}</Badge>
                <Button size="sm" variant="outline" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={connect} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-slideIn mb-6">
            <Badge variant="outline" className="mb-4">
              🚀 Now Live on Mainnet
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-slideIn">
            The Ultimate Payment Layer 1 Blockchain
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slideIn" style={{ animationDelay: '100ms' }}>
            Stripe-like simplicity • Visa-scale throughput • 99.999% uptime • 100,000 TPS
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center animate-slideIn" style={{ animationDelay: '200ms' }}>
            <Link href="/dashboard">
              <Button size="lg" className="w-full md:w-auto">
                Launch Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full md:w-auto">
              Read Whitepaper
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-slideIn" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slideIn">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for merchants, enterprises, and developers who demand more
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="animate-slideIn hover:shadow-lg transition-smooth" style={{ animationDelay: `${i * 50}ms` }}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{feature.icon}</div>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center max-w-3xl animate-slideIn">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Payments?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of merchants and enterprises using Aurexia for fast, secure, and affordable payments.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Get Started Now</Button>
            </Link>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Aurexia Capital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
