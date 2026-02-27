#!/bin/bash

set -e

echo "Deploying Aurexia L1 Network..."

# Check if genesis file exists
if [ ! -f genesis.json ]; then
    echo "Error: genesis.json not found"
    exit 1
fi

# Initialize data directory
rm -rf data
mkdir -p data

# Initialize genesis
./build/aurexiad init --genesis genesis.json --datadir ./data

# Generate node key
./build/aurexia-cli generate-nodekey --datadir ./data

# Start node
./build/aurexiad \
    --config config.toml \
    --datadir ./data \
    --rpc \
    --ws \
    --bootstrap &

echo "L1 Network deployed successfully"
