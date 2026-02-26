import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/Toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aurexia Capital - The Ultimate Payment Layer 1 Blockchain',
  description: 'Stripe-like simplicity • Visa-scale throughput • 99.999% uptime • 100,000 TPS',
  keywords: ['blockchain', 'payments', 'layer1', 'crypto', 'defi'],
  openGraph: {
    title: 'Aurexia Capital',
    description: 'The Ultimate Payment Layer 1 Blockchain',
    type: 'website',
    url: 'https://aurexia.capital',
    siteName: 'Aurexia Capital',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurexia Capital',
    description: 'The Ultimate Payment Layer 1 Blockchain',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
