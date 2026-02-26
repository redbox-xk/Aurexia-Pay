# 🚀 Aurexia-Capital

A payment-focused Layer 1 blockchain concept focused on Stripe-like developer ergonomics and institutional reliability.

## Vision

Aurexia-Capital aims to combine:
- **Stripe-like simplicity** for API consumers.
- **Visa-scale throughput goals** (targeting up to 100,000 TPS).
- **Low-latency finality objectives** (sub-second block cadence and near-instant confirmation).
- **Institutional-grade operational posture** with clear validator/economic constraints.

## Repository Snapshot

- `consensus/` — consensus engine prototype and chain configuration.
- `contracts/` — smart contract modules for token generation and bridge routing.
- `frontend/` — token generator UX components.
- `docs/` — technical documentation and whitepaper material.
- `scripts/` — deployment helper scripts.

## Quick Start

```bash
# 1) Build consensus prototype
make build-consensus

# 2) Run test suite
make test

# 3) Inspect chain config
cat config.toml
cat genesis.json
```

## Mainnet Parameters (Current Defaults)

| Parameter | Value |
|---|---|
| Chain ID | `666` |
| Block Time | `0.5s` |
| Block Gas Limit | `30,000,000` |
| Max Validators | `1000` |
| Epoch Length | `43,200` |
| Min Validator Stake | `1,000,000 AURX` |

## Status

This repository currently contains a foundation/prototype layout for Aurexia-Capital. The consensus/state engine and infrastructure are scaffolding-oriented and intended to evolve into production-grade modules.
