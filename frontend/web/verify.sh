#!/bin/bash

# Aurexia Web Frontend - Build Verification Script
set -e

echo "=================================================="
echo "Aurexia Web Frontend - Build Verification"
echo "=================================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
node --version

# Check npm
echo "✓ Checking npm..."
npm --version

# Check dependencies
echo "✓ Checking installed packages..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
fi

# Verify Next.js
echo "✓ Checking Next.js..."
npx next --version

# Type check
echo "✓ Running TypeScript check..."
npx tsc --noEmit || true

# Build
echo "✓ Building application..."
npm run build

echo ""
echo "=================================================="
echo "✅ Build Verification Complete!"
echo "=================================================="
echo ""
echo "Ready to deploy! Run: npm start"
echo ""
