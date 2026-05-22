import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui/Toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Nexa Payment Crypto - Instant Payments. On-Chain Settlement.',
  description: 'Military-grade security meets lightning-fast crypto payments. The future of payments is here.',
  keywords: ['crypto payments', 'blockchain', 'instant payments', 'on-chain settlement', 'defi', 'web3'],
  openGraph: {
    title: 'Nexa Payment Crypto',
    description: 'Instant Payments. On-Chain Settlement.',
    type: 'website',
    url: 'https://nexa.payment',
    siteName: 'Nexa Payment Crypto',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexa Payment Crypto',
    description: 'Military-grade security meets lightning-fast crypto payments.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#00D4FF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
