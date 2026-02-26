```markdown
# 🚀 AUREXIA-CAPITAL - The Ultimate Payment Layer 1 Blockchain

```

╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                    ║
║   █████╗ ██╗   ██╗██████╗ ███████╗██╗  ██╗██╗ █████╗         ██████╗ █████╗     ║
║  ██╔══██╗██║   ██║██╔══██╗██╔════╝██║  ██║██║██╔══██╗       ██╔════╝██╔══██╗    ║
║  ███████║██║   ██║██████╔╝███████╗███████║██║███████║       ██║     ███████║    ║
║  ██╔══██║██║   ██║██╔══██╗╚════██║██╔══██║██║██╔══██║       ██║     ██╔══██║    ║
║  ██║  ██║╚██████╔╝██║  ██║███████║██║  ██║██║██║  ██║       ╚██████╗██║  ██║    ║
║  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝        ╚═════╝╚═╝  ╚═╝    ║
║                                                                                    ║
║                    THE ULTIMATE PAYMENT LAYER 1 BLOCKCHAIN                        ║
║                    Stripe-like Simplicity • Visa-scale Throughput                 ║
║                    99.999% Uptime • 100,000 TPS • 0.5s Finality                   ║
╚══════════════════════════════════════════════════════════════════════════════════╝

```

## 🎯 Quick Start

```bash
# Clone the repository
git clone https://github.com/aurexia-capital/aurexia.git
cd aurexia

# Build everything
make build

# Run API gateway locally
make run-api

# In another terminal, test the API
curl http://localhost:8080/healthz
curl -X POST http://localhost:8080/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"currency":"usd"}'

# Run frontend
cd frontend/web && npm install && npm run dev

# Visit http://localhost:3000
```

📊 Performance

Metric Target
Transaction Throughput 100,000 TPS
Block Time 0.5 seconds
Finality 1 second
API Response Time < 50ms
Uptime SLA 99.999%

🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Dashboard  │  │  Payments   │  │  Bridge     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Go)                        │
│              REST API • WebSockets • GraphQL                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Aurexia Mainnet (Layer 1)                  │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│    │ Consensus   │  │    State    │  │    Bridge   │       │
│    │ (AurexiaBFT)│  │             │  │             │       │
│    └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

🔧 Components

Backend API Gateway (Go)

· REST API with Stripe-compatible endpoints
· CORS support for web integration
· Request validation and logging
· Health checks and monitoring

Frontend (Next.js)

· Modern React with TypeScript
· Tailwind CSS for styling
· Web3 wallet integration
· Responsive dashboard

UI Components

· Button, Card, Input, Label
· Modal, Toast notifications
· Switch, Checkbox
· Alert dialogs

📝 API Examples

```bash
# Health check
curl http://localhost:8080/healthz

# Create payment
curl -X POST http://localhost:8080/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"currency":"usd","description":"Test payment"}'

# Get payment status
curl http://localhost:8080/api/v1/payments/pi_123456
```

🚢 Deployment

```bash
# Deploy to development
make deploy-dev

# Deploy to production
make deploy-prod

# Deploy smart contracts
make deploy-contracts
```

📚 Documentation

· API Reference
· Integration Guide
· Token Generator
· Bridge Usage

🛠️ Built With

· Consensus: Go • CometBFT
· Backend: Go • Gorilla Mux • Zap
· Frontend: Next.js • React • TypeScript
· Smart Contracts: Solidity • Hardhat
· Infrastructure: Docker • Kubernetes • Terraform

🤝 Contributing

Please read CONTRIBUTING.md for details.

📄 License

This project is licensed under the MIT License - see LICENSE.

📞 Support

· Website: aurexia.capital
· Email: support@aurexia.capital
· Twitter: @aurexia_capital
· Discord: discord.gg/aurexia

---

Built with ❤️ for the future of payments

```

## ✅ **TESTING COMMANDS**

```bash
# Test API gateway
cd backend/cmd/api-gateway
go run main.go &
curl http://localhost:8080/healthz
curl -X POST http://localhost:8080/api/v1/payments -H "Content-Type: application/json" -d '{"amount":1000,"currency":"usd"}'

# Test frontend
cd frontend/web
npm install
npm run dev
# Visit http://localhost:3000

# Test consensus node (if Go installed)
cd consensus
go build ./cmd/aurexiad
./aurexiad --help
```
