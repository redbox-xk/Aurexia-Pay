#!/bin/bash

# Aurexia Web Frontend Installation Script
set -e

echo "=================================================="
echo "Aurexia Web Frontend - Installation & Setup"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "⚠️  Please update .env.local with your configuration"
fi

echo ""
echo "=================================================="
echo "✅ Installation Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your settings"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
