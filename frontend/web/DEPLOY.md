# Deployment Guide - Aurexia Web Frontend

## Quick Start (3 minutes)

### Local Development
```bash
cd frontend/web

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
# Build application
npm run build

# Test production build locally
npm start
```

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

### Option 2: Docker
```bash
# Build Docker image
docker build -t aurexia-web:latest .

# Run container
docker run -p 3000:3000 aurexia-web:latest

# Or use Docker Compose
docker-compose up -d
```

### Option 3: Traditional Server (Ubuntu/Debian)
```bash
# SSH into server
ssh user@server.com

# Clone repository
git clone <repo-url>
cd frontend/web

# Install PM2 globally
sudo npm install -g pm2

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start "npm start" --name "aurexia-web"

# Save PM2 process
pm2 save
sudo pm2 startup
```

### Option 4: AWS
```bash
# Using Elastic Beanstalk
eb init -p "Node.js 20 running on 64bit Amazon Linux 2" aurexia-web
eb create aurexia-web-env
eb deploy
```

## Configuration

### Required Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API endpoint

### Optional Environment Variables
- `NEXT_PUBLIC_CHAIN_ID` - Ethereum chain ID (default: 1)
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_GA_ID` - Google Analytics

## Health Checks

### Verify Build
```bash
npm run build
```

### Verify Types
```bash
npx tsc --noEmit
```

### Run Tests
```bash
npm test
```

## Performance Optimization

### Bundle Analysis
```bash
npm run build -- --analyze
```

### Lighthouse Audit
```bash
npm install -g lighthouse
lighthouse http://localhost:3000
```

## Troubleshooting

### Error: "next: command not found"
**Solution**: Install dependencies
```bash
npm install
```

### Error: "Turbopack/Webpack conflict"
**Solution**: Already fixed in next.config.js. Just run npm install.

### Port 3000 already in use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Memory issues during build
```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## Monitoring

### Check Application Health
```bash
curl http://localhost:3000
```

### View Logs
```bash
pm2 logs aurexia-web
# or
docker logs <container-id>
```

### CPU & Memory Usage
```bash
pm2 monit
# or
docker stats
```

## Rollback

### From Vercel
```bash
vercel --prod --rollback
```

### From Docker
```bash
docker rollback <container-id>
```

### From PM2
```bash
pm2 restart aurexia-web
```

## Security Checklist

- [ ] HTTPS/TLS enabled
- [ ] Environment variables configured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set (X-Frame-Options, CSP, etc.)
- [ ] Regular dependency updates
- [ ] Secrets not committed to git

## Performance Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.8s
- **Lighthouse Score**: > 90

## Support

For issues or questions, open an issue on GitHub or contact support@aurexia.capital
