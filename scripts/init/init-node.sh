#!/bin/bash

set -e

echo "Initializing Aurexia Node..."

# Create directories
mkdir -p data logs

# Generate validator key
./build/aurexia-cli generate-validator-key --output ./data/validator.key

# Create account
./build/aurexia-cli account new --password password.txt --output ./data/keystore

# Initialize database
./build/aurexiad init \
    --genesis genesis.json \
    --datadir ./data \
    --networkid 1337

echo "Node initialized successfully"
