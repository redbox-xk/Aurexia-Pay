'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWeb3 } from '@/lib/web3/hooks'
import { useState } from 'react'

export default function HomePage() {
  const { account, connect, disconnect, isConnecting } = useWeb3()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Lightning Fast',
      description: 'Fusing crypto to lightning with the blockchain.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Bank-Grade Security',
      description: 'Bank-grade transaction processing for development.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'Seamless Settlement',
      description: 'Underlying payments are fulfilled by multiple gateways.',
    },
  ]

  const trustedBy = [
    'Corpart', 'Abgup', 'Supork', 'Goter', 'Sotroee', 'TuBlot', 'Youdee'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/nexa-logo.png"
                alt="Nexa Payment Crypto"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                NEXA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                Product
              </Link>
              <div className="relative group">
                <button className="text-sm font-medium text-slate-700 hover:text-primary transition-colors flex items-center gap-1">
                  Solutions
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="relative group">
                <button className="text-sm font-medium text-slate-700 hover:text-primary transition-colors flex items-center gap-1">
                  Developers
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="relative group">
                <button className="text-sm font-medium text-slate-700 hover:text-primary transition-colors flex items-center gap-1">
                  Pricing
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="relative group">
                <button className="text-sm font-medium text-slate-700 hover:text-primary transition-colors flex items-center gap-1">
                  Company
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-3">
              {account ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={disconnect}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40">
                    Launch App
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 animate-slideIn">
              <div className="flex flex-col gap-4">
                <Link href="#" className="text-sm font-medium text-slate-700 py-2">Product</Link>
                <Link href="#" className="text-sm font-medium text-slate-700 py-2">Solutions</Link>
                <Link href="#" className="text-sm font-medium text-slate-700 py-2">Developers</Link>
                <Link href="#" className="text-sm font-medium text-slate-700 py-2">Pricing</Link>
                <Link href="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    Launch App
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                Hero
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight animate-slideIn">
                Instant Payments.
                <br />
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  On-Chain Settlement.
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0 animate-slideIn" style={{ animationDelay: '100ms' }}>
                Military-grade security meets lightning-fast crypto payments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slideIn" style={{ animationDelay: '200ms' }}>
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 px-8">
                    Get Started
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 hover:bg-slate-100">
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right Content - Shield Illustration */}
            <div className="relative flex justify-center lg:justify-end animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Glowing background */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl" />
                
                {/* Shield SVG */}
                <svg className="relative w-full h-full drop-shadow-2xl" viewBox="0 0 200 200" fill="none">
                  <defs>
                    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#94A3B8" />
                      <stop offset="50%" stopColor="#CBD5E1" />
                      <stop offset="100%" stopColor="#E2E8F0" />
                    </linearGradient>
                    <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                  </defs>
                  {/* Shield body */}
                  <path 
                    d="M100 20L170 50V95C170 135 140 170 100 185C60 170 30 135 30 95V50L100 20Z" 
                    fill="url(#shieldGradient)"
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                  {/* Inner shield */}
                  <path 
                    d="M100 35L155 60V95C155 125 130 155 100 168C70 155 45 125 45 95V60L100 35Z" 
                    fill="white"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  {/* Checkmark */}
                  <path 
                    d="M75 100L92 117L125 84" 
                    stroke="url(#checkGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 px-4 border-y border-slate-200 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <p className="text-center text-sm font-medium text-slate-500 mb-8">Trusted by the best</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {trustedBy.map((company, i) => (
              <span key={i} className="text-slate-400 font-semibold text-sm md:text-base tracking-wide">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card 
                key={i} 
                className="bg-white/80 backdrop-blur border-slate-200/60 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 animate-slideIn"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview + Enterprise CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Dashboard Preview */}
            <div className="relative animate-slideIn">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-2xl blur-2xl" />
              <div className="relative bg-slate-900 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">N</div>
                      <span className="text-white text-sm font-medium">Dashboard</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">Live</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Balance</span>
                      <span className="text-white font-semibold">$124,500.00</span>
                    </div>
                    <div className="h-20 bg-slate-700/50 rounded-lg flex items-end gap-1 p-2">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85].map((h, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-slate-700/30 rounded p-2">
                        <p className="text-slate-400 text-xs">Today</p>
                        <p className="text-cyan-400 text-sm font-medium">+$2,340</p>
                      </div>
                      <div className="bg-slate-700/30 rounded p-2">
                        <p className="text-slate-400 text-xs">Week</p>
                        <p className="text-cyan-400 text-sm font-medium">+$12,450</p>
                      </div>
                      <div className="bg-slate-700/30 rounded p-2">
                        <p className="text-slate-400 text-xs">Month</p>
                        <p className="text-cyan-400 text-sm font-medium">+$45,200</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise CTA */}
            <div className="animate-slideIn" style={{ animationDelay: '200ms' }}>
              <Badge className="mb-4 bg-red-500/10 text-red-500 border-red-500/20">
                Contact Sales
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Enterprise Ready
              </h2>
              <p className="text-slate-600 mb-6">
                Built for businesses of all sizes. From startups processing their first payment to enterprises handling millions of transactions daily.
              </p>
              <ul className="space-y-3 mb-8">
                {['Custom integration support', 'Dedicated account manager', 'Volume-based pricing', 'SLA guarantees'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-slideIn">
            Ready to Transform Your Payments?
          </h2>
          <p className="text-cyan-100 text-lg mb-8 max-w-2xl mx-auto animate-slideIn" style={{ animationDelay: '100ms' }}>
            Join thousands of merchants using Nexa for fast, secure, and affordable crypto payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideIn" style={{ animationDelay: '200ms' }}>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-cyan-50 shadow-lg">
                Get Started Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-400">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/images/nexa-logo.png"
                  alt="Nexa"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-lg font-bold text-white">NEXA</span>
              </Link>
              <p className="text-sm">
                The future of crypto payments. Fast, secure, and seamless.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">SDKs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Nexa Payment Crypto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
