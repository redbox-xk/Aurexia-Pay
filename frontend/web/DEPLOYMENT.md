# Aurexia-Pay Frontend Deployment Guide

## Overview

This is a production-ready Next.js 14 frontend for the Aurexia-Pay blockchain payment platform. It features a complete merchant dashboard, payment system, NFC card management, and Web3 integration.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- MetaMask or Web3 wallet (for testing)

### Installation

```bash
cd frontend/web

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local

# Update .env.local with your values:
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WEB3_PROVIDER=http://localhost:8545
```

### Development

```bash
npm run dev
# Server runs on http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## Architecture

### Folder Structure

```
frontend/web/
├── app/                           # Next.js App Router
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── payments/             # Payment management
│   │   ├── invoices/             # Invoice system
│   │   ├── subscriptions/        # Recurring payments
│   │   ├── nfc-cards/            # NFC card management
│   │   ├── analytics/            # Analytics & charts
│   │   └── settings/             # Account settings
│   ├── pay/[sessionId]/          # Payment checkout
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── not-found.tsx             # 404 page
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── spinner.tsx
│   │   ├── skeleton.tsx
│   │   ├── alert.tsx
│   │   └── ... (more components)
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx           # Dashboard sidebar
│   │   └── navbar.tsx            # Top navigation
│   └── error-boundary.tsx        # Error handling
├── lib/
│   ├── api/
│   │   └── client.ts             # API client with interceptors
│   ├── web3/
│   │   ├── hooks.ts              # Web3 integration hooks
│   │   └── client.ts             # ethers.js wrapper
│   └── utils/
│       └── format.ts             # Utility functions
├── styles/
│   └── globals.css               # Global styles & animations
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
└── package.json
```

## Key Features

### 1. Dashboard System
- **Merchant Dashboard**: Real-time metrics, payment overview, wallet status
- **Payment Management**: Create, track, and manage payments with advanced filtering
- **Invoice System**: Generate and manage invoices with PDF export
- **NFC Cards**: Link physical NFC cards, manage card status, freeze/unfreeze
- **Subscriptions**: Set up recurring billing and manage subscription plans
- **Analytics**: Real-time charts, transaction metrics, success rates
- **Settings**: API keys, webhook configuration, notification preferences

### 2. Payment Processing
- Multiple payment methods (credit card, crypto, NFC)
- Real-time payment status updates
- Webhook support for payment events
- Comprehensive transaction history
- Instant settlement with Aurexia blockchain

### 3. Web3 Integration
- MetaMask wallet connection
- Balance display and real-time updates
- Multi-chain support
- Crypto payment processing
- Gas estimation and optimization

### 4. UI/UX Excellence
- Smooth animations and transitions
- Skeleton loaders for perceived performance
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- WCAG AA accessibility compliance

### 5. Security
- Secure API client with interceptors
- Protected dashboard routes
- API key management
- Webhook signature verification
- Rate limiting ready

## Environment Variables

Create `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Web3 Configuration
NEXT_PUBLIC_WEB3_PROVIDER=http://localhost:8545

# Optional: Vercel deployment
NEXT_PUBLIC_VERCEL_URL=https://yourdomain.com
```

## Component Library

### Pre-built Components

```tsx
// Buttons
<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Cards
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Forms
<Input placeholder="Enter text" />
<Label>Label text</Label>
<Checkbox />
<Switch />

// Feedback
<Badge>New</Badge>
<Alert variant="default">Alert message</Alert>
<Spinner size="md" />
<Skeleton className="h-12" />
```

## API Integration

### Authentication

```typescript
import { api } from '@/lib/api/client'

// Requests automatically include auth token from localStorage
const response = await api.get('/api/v1/payments')
const newPayment = await api.post('/api/v1/payments', { amount: 100 })
```

### Web3 Integration

```typescript
import { useWeb3 } from '@/lib/web3/hooks'

export function MyComponent() {
  const { account, balance, connect, disconnect } = useWeb3()

  return (
    <button onClick={connect}>
      {account ? `${account.slice(0, 6)}...` : 'Connect Wallet'}
    </button>
  )
}
```

## Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: System fonts with fallbacks
- **Animations**: CSS-based for smooth 60fps performance
- **Lazy Loading**: Components load on demand

### Lighthouse Targets
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL
# NEXT_PUBLIC_WEB3_PROVIDER
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY .next ./.next
COPY public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t aurexia-pay-web .
docker run -p 3000:3000 aurexia-pay-web
```

### Traditional Server (Node.js)

```bash
# Build
npm run build

# Start
NODE_ENV=production npm start
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Debugging

Console debug logs use the `[v0]` prefix:

```bash
# Filter logs in console
console.log("[v0] User connected:", account)
```

## Troubleshooting

### Wallet Connection Issues
1. Ensure MetaMask is installed
2. Check network connection
3. Verify `NEXT_PUBLIC_WEB3_PROVIDER` is correct

### API Errors
1. Verify backend is running
2. Check `NEXT_PUBLIC_API_URL` is correct
3. Check CORS configuration

### Build Errors
1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npx tsc --noEmit`

## Performance Monitoring

- Use Vercel Analytics for real-world performance data
- Monitor Core Web Vitals
- Track page load times
- Monitor error rates

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use HTTPS** in production
3. **Validate inputs** on client and server
4. **Rotate API keys** regularly
5. **Monitor for suspicious activity**

## Future Enhancements

- [ ] Two-factor authentication
- [ ] Advanced fraud detection
- [ ] Machine learning for predictive analytics
- [ ] Native mobile apps (React Native)
- [ ] GraphQL API support
- [ ] Real-time WebSocket updates
- [ ] Advanced reporting and exports

## Support

For issues and questions:
1. Check DEPLOYMENT.md (this file)
2. Review code comments with `[v0]` prefix
3. Check GitHub issues
4. Contact support@aurexia.capital

## License

Proprietary - Aurexia Capital 2024
