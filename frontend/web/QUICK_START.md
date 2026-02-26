# Quick Start Guide - Aurexia Pay Frontend

## 1 Minute Setup

```bash
# Navigate to project
cd frontend/web

# Install dependencies
npm install

# Create environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:8080' > .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` - Done!

## Common Commands

```bash
# Development
npm run dev              # Start dev server on port 3000

# Production
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Utilities
npx tsc --noEmit        # Check TypeScript errors
rm -rf .next            # Clear Next.js cache (if build fails)
npm ci                  # Clean install (CI/CD)
```

## File Locations

| Component | Location |
|-----------|----------|
| Landing page | `app/page.tsx` |
| Dashboard | `app/(dashboard)/dashboard/page.tsx` |
| Payments | `app/(dashboard)/dashboard/payments/page.tsx` |
| Checkout | `app/pay/[sessionId]/page.tsx` |
| UI Components | `components/ui/` |
| API Client | `lib/api/client.ts` |
| Web3 Hooks | `lib/web3/hooks.ts` |
| Global Styles | `styles/globals.css` |

## Key Features by File

### Authentication & Wallet
```typescript
import { useWeb3 } from '@/lib/web3/hooks'

const { account, balance, connect, disconnect } = useWeb3()
```

### API Calls
```typescript
import { api } from '@/lib/api/client'

const payments = await api.get('/api/v1/payments')
await api.post('/api/v1/payments', { amount: 100 })
```

### UI Components
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

// Use them
<Button onClick={handleClick}>Click</Button>
<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>
<Badge>New</Badge>
<Spinner size="md" />
<Alert variant="destructive"><AlertTitle>Error</AlertTitle></Alert>
```

### Utilities
```typescript
import { formatCurrency, formatDate, truncateAddress } from '@/lib/utils/format'

formatCurrency(100, 'USD')        // $100.00
formatDate('2024-01-15')          // January 15, 2024
truncateAddress('0x123...789')    // 0x12...789
```

## Common Tasks

### Add a New Page
```bash
# Create file structure
mkdir -p app/(dashboard)/dashboard/mynewpage
touch app/(dashboard)/dashboard/mynewpage/page.tsx

# Copy template (edit accordingly):
cat > app/(dashboard)/dashboard/mynewpage/page.tsx << 'EOF'
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content here</CardContent>
      </Card>
    </div>
  )
}
EOF
```

### Add Sidebar Navigation
Edit `components/layout/sidebar.tsx` and add to `menuItems` array:
```typescript
{ label: 'My Page', href: '/dashboard/mynewpage', icon: '📄' }
```

### Create a Loading Skeleton
```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function MyComponentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12" />
      <Skeleton className="h-24" />
    </div>
  )
}
```

### Handle API Errors
```typescript
try {
  const data = await api.get('/endpoint')
} catch (error) {
  console.error('[v0] API Error:', error)
  toast({ 
    title: 'Error', 
    description: 'Failed to fetch data',
    variant: 'destructive'
  })
}
```

### Connect Wallet
```tsx
import { useWeb3 } from '@/lib/web3/hooks'

export function WalletButton() {
  const { account, connect, disconnect, isConnecting } = useWeb3()

  return account ? (
    <button onClick={disconnect}>{account.slice(0, 6)}...</button>
  ) : (
    <button onClick={connect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
```

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Web3 Configuration  
NEXT_PUBLIC_WEB3_PROVIDER=http://localhost:8545

# Optional for Vercel
NEXT_PUBLIC_VERCEL_URL=https://yourdomain.com
```

## Debugging

### Enable Debug Logs
All debug logs use `[v0]` prefix in console:
```typescript
console.log('[v0] User connected:', account)
console.error('[v0] Error occurred:', error)
```

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Clear Cache & Reinstall
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## Deployment Quick Links

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
# Set env vars in Vercel dashboard
```

### Docker
```bash
docker build -t aurexia-web .
docker run -p 3000:3000 aurexia-web
```

### Traditional Server
```bash
npm run build
NODE_ENV=production npm start
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | `npm run dev -- -p 3001` |
| Wallet not connecting | Ensure MetaMask is installed and unlocked |
| API errors | Check `NEXT_PUBLIC_API_URL` in `.env.local` |
| Build fails | Run `rm -rf .next && npm install && npm run build` |
| Components not found | Check imports use `@/components/` alias |

## Best Practices

1. **Always use component variants**: `<Button variant="outline">` instead of custom classes
2. **Use animations consistently**: Apply `animate-slideIn` for new elements
3. **Add loading states**: Show `<Spinner>` or `<Skeleton>` while loading
4. **Format currency**: Use `formatCurrency(amount, currency)` for all prices
5. **Handle errors**: Wrap async operations in try/catch with toast notifications
6. **Use TypeScript**: Define interfaces for API responses
7. **Mobile first**: Build for mobile, then enhance for larger screens
8. **Accessible**: Always include labels with form inputs
9. **Performance**: Use lazy loading for heavy components
10. **Security**: Never commit secrets to version control

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [ethers.js](https://docs.ethers.org)
- [TypeScript](https://www.typescriptlang.org)

## Support

For detailed setup and deployment information, see:
- `DEPLOYMENT.md` - Full deployment guide
- `BUILD_SUMMARY.md` - Complete project overview

---

**Happy coding!** 🚀
