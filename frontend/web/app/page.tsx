'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm fixed w-full z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Aurexia</span>
            <span className="text-sm text-muted-foreground">Capital</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/docs" className="text-sm hover:text-primary transition-colors">
              Docs
            </Link>
            <Button variant="default" size="sm">
              Launch App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            The Ultimate Payment Layer 1 Blockchain
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stripe-like simplicity • Visa-scale throughput • 99.999% uptime • 100,000 TPS
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Building
            </Button>
            <Button size="lg" variant="outline">
              Read Whitepaper
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">100k</div>
              <div className="text-sm text-muted-foreground">TPS</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">0.5s</div>
              <div className="text-sm text-muted-foreground">Block Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">99.999%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">$100B+</div>
              <div className="text-sm text-muted-foreground">Capacity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>⚡ Lightning Fast</CardTitle>
                <CardDescription>0.5 second block times with instant finality</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Experience near-instant transactions with our proprietary AurexiaBFT consensus.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🌉 Cross-Chain Native</CardTitle>
                <CardDescription>Bridge to Ethereum, Polygon, Arbitrum, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Unified liquidity across all major chains with our advanced bridge infrastructure.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🏭 Token Generator</CardTitle>
                <CardDescription>Create custom tokens with 7+ fee structures</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No-code token creation with reflective, auto-LP, reward, and custom fee types.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
