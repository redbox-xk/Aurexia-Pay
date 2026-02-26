'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Payments', href: '/dashboard/payments', icon: '💳' },
  { label: 'Invoices', href: '/dashboard/invoices', icon: '📄' },
  { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: '🔄' },
  { label: 'NFC Cards', href: '/dashboard/nfc-cards', icon: '💎' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-muted/30 p-4 hidden md:flex flex-col h-screen sticky top-0">
      <div className="mb-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">Aurexia</span>
          <span className="text-xs text-muted-foreground">Pay</span>
        </Link>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 transition-smooth',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border pt-4">
        <Button variant="ghost" className="w-full justify-start">
          🚪 Logout
        </Button>
      </div>
    </aside>
  )
}
