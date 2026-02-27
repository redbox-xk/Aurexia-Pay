#!/bin/bash

set -e

echo "Building Aurexia Consensus Node..."

# Build Rust consensus node
cd consensus
cargo build --release

# Copy binary to build directory
mkdir -p ../build
cp target/release/aurexiad ../build/
cp target/release/aurexia-cli ../build/

echo "Consensus node built successfully"
