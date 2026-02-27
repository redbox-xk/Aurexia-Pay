# Multi-stage build for Aurexia Pay

# Stage 1: Build consensus node (Rust)
FROM rust:1.74 AS consensus-builder
WORKDIR /app
COPY consensus/Cargo.toml consensus/Cargo.lock ./
COPY consensus/src ./src
COPY consensus/config ./config
COPY consensus/core ./core
COPY consensus/p2p ./p2p
COPY consensus/rpc ./rpc
RUN cargo build --release

# Stage 2: Build backend (Go)
FROM golang:1.21 AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY backend/ ./backend/
RUN go build -o /aurexia-backend ./backend/cmd/api-gateway

# Stage 3: Build frontend (Node)
FROM node:20 AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 4: Consensus runtime
FROM debian:bookworm-slim AS consensus
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=consensus-builder /app/target/release/aurexiad /usr/local/bin/
COPY --from=consensus-builder /app/target/release/aurexia-cli /usr/local/bin/
COPY genesis.json config.toml ./
EXPOSE 30303 8545 8546
CMD ["aurexiad", "--config", "config.toml"]

# Stage 5: API runtime
FROM debian:bookworm-slim AS api
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=backend-builder /aurexia-backend /usr/local/bin/
COPY backend/configs ./configs
EXPOSE 8080
CMD ["aurexia-backend"]

# Stage 6: Frontend runtime
FROM node:20-alpine AS frontend
WORKDIR /app
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package*.json ./
COPY --from=frontend-builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
