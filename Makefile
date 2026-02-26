.PHONY: all build-consensus test clean run-local help

GO_VERSION := 1.21
COMMIT_HASH := $(shell git rev-parse --short HEAD)
BUILD_TIME := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
VERSION := 1.0.0
LDFLAGS := -ldflags "-X main.Version=$(VERSION) -X main.CommitHash=$(COMMIT_HASH) -X main.BuildTime=$(BUILD_TIME)"

all: build-consensus

build-consensus:
	@echo "🔨 Building Aurexia consensus node..."
	go build $(LDFLAGS) -o build/aurexiad ./consensus/...
	@echo "✅ Consensus node build completed"

test:
	@echo "🧪 Running Go tests..."
	go test ./...
	@echo "✅ Go tests completed"

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf build/
	@echo "✅ Clean complete"

run-local:
	@echo "🌐 Running local development setup (placeholder)"
	@echo "Use your local orchestration for full multi-service startup."

help:
	@echo "Available commands:"
	@echo "  make build-consensus - Build consensus artifacts"
	@echo "  make test            - Run repository tests"
	@echo "  make clean           - Remove build artifacts"
	@echo "  make run-local       - Start local dev placeholder"
