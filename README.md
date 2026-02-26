# Aurexia Payment Layer 1 Blockchain

A high-performance, Stripe-like payment processing blockchain with 100,000 TPS capacity and 99.999% uptime.

## Overview

Aurexia is a Layer 1 blockchain designed specifically for payment processing with:

- **100,000 TPS** - Visa-scale throughput
- **0.5s Block Time** - Near-instant finality
- **99.999% Uptime** - Enterprise-grade reliability
- **Stripe-Like API** - Familiar payment integration
- **0.29% + $0.005 Fees** - Industry-leading pricing
- **Cross-Chain Bridges** - Multi-chain liquidity

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────┐
│           Frontend (Next.js Dashboard)              │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │         API Gateway (Go + REST)              │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │   Payment Processor (Python FastAPI)         │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │  Aurexia Consensus Layer (Go/Rust)           │   │
│  │  - AurexiaBFT Consensus                      │   │
│  │  - 21 Validators                             │   │
│  │  - Instant Finality                          │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Smart Contracts (Solidity)                         │
│  ├─ AurexiaToken (AURX)                            │
│  ├─ StakingPool                                    │
│  ├─ PaymentRouter                                  │
│  └─ MerchantRegistry                               │
└─────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Go 1.21+
- Python 3.11+

### Installation

```bash
# Clone the repository
git clone https://github.com/aurexia/aurexia-pay.git
cd aurexia-pay

# Run the initialization script
chmod +x scripts/setup/init-system.sh
./scripts/setup/init-system.sh

# Access the system
# Frontend: http://localhost:3000
# API: http://localhost:8000
# Monitoring: http://localhost:3001
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Payment Processing Flow

### 1. Create Payment Intent

```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "AURX",
    "description": "Premium subscription"
  }'
```

### 2. Confirm Payment

```bash
curl -X POST http://localhost:8000/api/v1/payments/pi_123/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "payer_address": "0x742d35Cc6634C0532925a3b844Bc5e8ef2F29eD",
    "transaction_hash": "0xabc123..."
  }'
```

## Smart Contracts

### AURX Token
- Total Supply: 1 billion
- Distribution: Foundation (200M), Team (150M), Community (300M), Ecosystem (200M), Liquidity (150M)

### Staking Pool
- APY: 12-24% based on lockup period
- Minimum Stake: 100 AURX
- Validator Requirements: 1,000 AURX

### Payment Router
- Stripe-like payment intents
- Refund processing
- Settlement tracking
- Webhook notifications

### Merchant Registry
- KYC verification
- Tier-based limits
- Transaction monitoring

## API Reference

### Payment Endpoints
```
POST   /api/v1/payments                      # Create payment intent
GET    /api/v1/payments/{id}                # Get payment status
POST   /api/v1/payments/{id}/confirm        # Confirm payment
POST   /api/v1/payments/{id}/refund         # Refund payment
GET    /api/v1/merchants/{id}/settlements   # Get settlements
```

### Health & Status
```
GET    /healthz                             # Health check
GET    /api/v1/analytics                    # Platform analytics
GET    /metrics                             # Prometheus metrics
```

## Monitoring

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/aurexia2026)

## Configuration

Environment variables in `.env.local`:

```bash
NETWORK=mainnet
RPC_URL=http://localhost:8545
API_PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Project Structure
```
aurexia-pay/
├── consensus/              # Core blockchain
├── contracts/             # Smart contracts
├── backend/              # Backend services
├── frontend/             # Next.js dashboard
├── infrastructure/       # DevOps & deployment
└── scripts/              # Deployment & setup
```

### Running Locally

```bash
# Terminal 1: Consensus node
cd consensus && go run main.go

# Terminal 2: API gateway
cd backend && go run cmd/api-gateway/main.go

# Terminal 3: Payment processor
cd backend && python cmd/payment-processor/main.py

# Terminal 4: Frontend
cd frontend/web && npm run dev
```

## Performance Metrics

- **TPS**: 100,000+ transactions per second
- **Block Time**: 0.5 seconds
- **Finality**: Instant
- **Gas Limit**: 30,000,000 per block
- **Transaction Cost**: 0.29% + $0.005

## Support & Documentation

- **API Docs**: https://api.aurexia.io/docs
- **Email**: support@aurexia.io

## License

MIT License - See LICENSE file for details
