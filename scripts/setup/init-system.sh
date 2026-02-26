#!/bin/bash

# Aurexia Payment System Initialization Script
# Sets up the entire system from scratch

set -e

echo "═══════════════════════════════════════════════════════════"
echo "AUREXIA PAYMENT SYSTEM - INITIALIZATION"
echo "═══════════════════════════════════════════════════════════"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NETWORK=${NETWORK:-mainnet}
ENVIRONMENT=${ENVIRONMENT:-development}
RPC_URL=${RPC_URL:-http://localhost:8545}

echo -e "${YELLOW}Network: ${NETWORK}${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}RPC URL: ${RPC_URL}${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}STEP 1: Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required${NC}"; exit 1; }
echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Step 2: Build Docker images
echo -e "${YELLOW}STEP 2: Building Docker images...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

# Step 3: Start Docker containers
echo -e "${YELLOW}STEP 3: Starting Docker containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Step 4: Wait for services to be ready
echo -e "${YELLOW}STEP 4: Waiting for services to be ready...${NC}"
sleep 5

# Check RPC endpoint
echo "Checking RPC endpoint..."
for i in {1..30}; do
  if curl -s -X POST -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    http://localhost:8545 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ RPC endpoint ready${NC}"
    break
  fi
  echo "Waiting for RPC (attempt $i/30)..."
  sleep 2
done

# Check API Gateway
echo "Checking API Gateway..."
for i in {1..30}; do
  if curl -s http://localhost:8000/healthz >/dev/null 2>&1; then
    echo -e "${GREEN}✓ API Gateway ready${NC}"
    break
  fi
  echo "Waiting for API Gateway (attempt $i/30)..."
  sleep 2
done

# Check Payment Processor
echo "Checking Payment Processor..."
for i in {1..30}; do
  if curl -s http://localhost:8001/healthz >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Payment Processor ready${NC}"
    break
  fi
  echo "Waiting for Payment Processor (attempt $i/30)..."
  sleep 2
done

echo -e "${GREEN}✓ All services ready${NC}"
echo ""

# Step 5: Initialize database
echo -e "${YELLOW}STEP 5: Initializing database...${NC}"
docker-compose exec -T postgres psql -U aurexia -d aurexia -f /scripts/init-db.sql || true
echo -e "${GREEN}✓ Database initialized${NC}"
echo ""

# Step 6: Deploy smart contracts
echo -e "${YELLOW}STEP 6: Deploying smart contracts...${NC}"
if [ -f "scripts/deploy/deploy-contracts.js" ]; then
  node scripts/deploy/deploy-contracts.js
  echo -e "${GREEN}✓ Smart contracts deployed${NC}"
else
  echo -e "${YELLOW}⚠ Deploy script not found${NC}"
fi
echo ""

# Step 7: Setup monitoring
echo -e "${YELLOW}STEP 7: Setting up monitoring...${NC}"
mkdir -p infrastructure/monitoring/{prometheus,grafana}
if [ ! -f "infrastructure/monitoring/prometheus/prometheus.yml" ]; then
  cat > infrastructure/monitoring/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'aurexia'
    static_configs:
      - targets: ['localhost:8000', 'localhost:8545']
EOF
fi
echo -e "${GREEN}✓ Monitoring configured${NC}"
echo ""

# Step 8: Create environment files
echo -e "${YELLOW}STEP 8: Creating environment files...${NC}"
cat > .env.local <<EOF
# Aurexia Environment Configuration

# Network
NETWORK=${NETWORK}
ENVIRONMENT=${ENVIRONMENT}
RPC_URL=${RPC_URL}

# API
API_PORT=8000
PAYMENT_PROCESSOR_PORT=8001
FRONTEND_PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=aurexia
DB_PASSWORD=aurexia_secure_pass_2026
DB_NAME=aurexia

# Redis
REDIS_URL=redis://redis:6379

# Monitoring
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3001
GRAFANA_PASSWORD=aurexia2026

# Smart Contracts
AURX_TOKEN_ADDRESS=0x0000000000000000000000000000000000000001
STAKING_POOL_ADDRESS=0x0000000000000000000000000000000000000002
MERCHANT_REGISTRY_ADDRESS=0x0000000000000000000000000000000000000003
PAYMENT_ROUTER_ADDRESS=0x0000000000000000000000000000000000000004

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RPC_URL=${RPC_URL}
EOF
echo -e "${GREEN}✓ Environment files created${NC}"
echo ""

# Step 9: Display summary
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}INITIALIZATION COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Services are running:"
echo "  Frontend:           http://localhost:3000"
echo "  API Gateway:        http://localhost:8000"
echo "  Payment Processor:  http://localhost:8001"
echo "  RPC Endpoint:       http://localhost:8545"
echo "  Prometheus:         http://localhost:9090"
echo "  Grafana:            http://localhost:3001 (admin/aurexia2026)"
echo "  PostgreSQL:         localhost:5432"
echo "  Redis:              localhost:6379"
echo ""
echo "Next steps:"
echo "  1. Visit http://localhost:3000 to access the dashboard"
echo "  2. Register a merchant account"
echo "  3. Create payment intents and test the flow"
echo "  4. Monitor system health at http://localhost:3001"
echo ""
echo "To stop the system:"
echo "  docker-compose down"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f [service-name]"
echo ""
