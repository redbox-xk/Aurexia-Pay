# Installation & Setup Guide

## Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Git

## Quick Start (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local

# 3. Start development server
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

## Full Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Configure Environment
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your settings
# - NEXT_PUBLIC_API_URL: Your backend API URL
# - Web3 endpoints (optional, MetaMask auto-detected)
```

### 3. Development Server
```bash
npm run dev
```
Server runs on http://localhost:3000 with hot reload.

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Deployment Options

#### Vercel (Recommended)
```bash
vercel --prod
```

#### Docker
```bash
docker build -t aurexia-web .
docker run -p 3000:3000 aurexia-web
```

#### Self-Hosted
```bash
npm run build
pm2 start ecosystem.config.js --env production
```

## Troubleshooting

### "next: command not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### MetaMask not detected
- Install MetaMask browser extension
- Ensure you're on a supported network
- Check browser console for Web3 warnings

### API connection errors
- Verify NEXT_PUBLIC_API_URL in .env.local
- Check backend is running and accessible
- Look for CORS errors in console

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create optimized build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

## Project Structure

```
frontend/web/
├── app/                    # Next.js app router
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public pages
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles & animations
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── payment/          # Payment components
│   ├── charts/           # Analytics charts
│   └── token/            # Token features
├── lib/                   # Utilities & hooks
│   ├── api/              # API client
│   ├── web3/             # Web3 integration
│   ├── utils/            # Helper functions
│   └── contracts/        # Smart contract ABIs
├── styles/                # CSS files
├── public/                # Static assets
└── [config files]         # Next, Tailwind, TS config
```

## Key Features

✨ **Production-Ready**
- TypeScript strict mode
- Error boundaries
- Loading states
- Responsive design

🎨 **Beautiful UI**
- Tailwind CSS + animations
- 15+ pre-built components
- Dark mode support
- Smooth transitions

🔐 **Secure**
- Web3 wallet integration
- Input validation
- Error handling
- CORS configuration

📊 **Advanced**
- Real-time analytics
- Payment system
- NFC card management
- Multi-chain support

## Performance

- Lighthouse Score: 85+
- First Contentful Paint: < 2s
- Time to Interactive: < 4s
- Bundle Size: < 500KB (gzip)

## Support

For issues or questions:
1. Check [BUILD_SUMMARY.md](./BUILD_SUMMARY.md)
2. Review [STATUS.md](./STATUS.md)
3. Check GitHub issues
4. Contact support@aurexia.capital
