'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useWeb3 } from '@/lib/web3/hooks'
import { truncateAddress } from '@/lib/utils/format'

export function Navbar() {
  const { account, connect, disconnect } = useWeb3()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Aurexia</span>
            <span className="text-sm text-muted-foreground">Capital</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm hover:text-primary transition-smooth">
              Dashboard
            </Link>
            <Link href="/#features" className="text-sm hover:text-primary transition-smooth">
              Features
            </Link>
            {account ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-md bg-muted text-sm font-mono">
                  {truncateAddress(account)}
                </div>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={connect}>
                Connect Wallet
              </Button>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 animate-slideIn">
            <Link href="/dashboard" className="block text-sm hover:text-primary p-2">
              Dashboard
            </Link>
            <Link href="/#features" className="block text-sm hover:text-primary p-2">
              Features
            </Link>
            {account ? (
              <Button variant="outline" size="sm" className="w-full" onClick={disconnect}>
                Disconnect {truncateAddress(account)}
              </Button>
            ) : (
              <Button size="sm" className="w-full" onClick={connect}>
                Connect Wallet
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
