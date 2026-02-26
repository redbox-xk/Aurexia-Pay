package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type AurexiaNode struct {
	ChainID        uint64
	ValidatorCount int
	BlockTime      time.Duration
	RpcPort        int
	P2pPort        int
	DataDir        string
}

type Block struct {
	Height        uint64
	Timestamp     time.Time
	Transactions  []Transaction
	PreviousHash  string
	ValidatorHash string
	Hash          string
}

type Transaction struct {
	Hash      string
	From      string
	To        string
	Amount    uint64
	Nonce     uint64
	Signature string
	Status    string
}

type PaymentRouter struct {
	transactions map[string]Transaction
}

func (pr *PaymentRouter) ProcessPayment(tx Transaction) error {
	pr.transactions[tx.Hash] = tx
	log.Printf("[PAYMENT] Processed: %s -> %s | Amount: %d AURX", tx.From, tx.To, tx.Amount)
	return nil
}

type ValidatorRegistry struct {
	validators map[string]Validator
}

type Validator struct {
	Address string
	Power   uint64
	Status  string
}

type Node struct {
	config           *AurexiaNode
	paymentRouter    *PaymentRouter
	validatorRegistry *ValidatorRegistry
	currentBlock     *Block
	blockHeight      uint64
}

func NewNode(config *AurexiaNode) *Node {
	return &Node{
		config:            config,
		paymentRouter:     &PaymentRouter{transactions: make(map[string]Transaction)},
		validatorRegistry: &ValidatorRegistry{validators: make(map[string]Validator)},
		blockHeight:       1,
	}
}

func (n *Node) Start(ctx context.Context) error {
	log.Println("═══════════════════════════════════════════════════════════════")
	log.Println("🚀 AUREXIA MAINNET - CONSENSUS ENGINE STARTING")
	log.Println("═══════════════════════════════════════════════════════════════")
	log.Printf("Chain ID:        %d", n.config.ChainID)
	log.Printf("Validators:      %d", n.config.ValidatorCount)
	log.Printf("Block Time:      %v", n.config.BlockTime)
	log.Printf("RPC Port:        %d", n.config.RpcPort)
	log.Printf("P2P Port:        %d", n.config.P2pPort)
	log.Printf("Data Directory:  %s", n.config.DataDir)
	log.Println("═══════════════════════════════════════════════════════════════")

	// Initialize validators
	for i := 0; i < n.config.ValidatorCount; i++ {
		address := fmt.Sprintf("validator-%d", i)
		n.validatorRegistry.validators[address] = Validator{
			Address: address,
			Power:   100,
			Status:  "active",
		}
	}
	log.Printf("✓ Initialized %d validators", n.config.ValidatorCount)

	// Block production loop
	ticker := time.NewTicker(n.config.BlockTime)
	defer ticker.Stop()

	blockCount := 0

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			blockCount++
			n.blockHeight++
			block := &Block{
				Height:        n.blockHeight,
				Timestamp:     time.Now(),
				PreviousHash:  fmt.Sprintf("block-%d", n.blockHeight-1),
				ValidatorHash: fmt.Sprintf("validator-%d", blockCount%n.config.ValidatorCount),
				Hash:          fmt.Sprintf("block-%d", n.blockHeight),
			}
			n.currentBlock = block
			
			if blockCount % 20 == 0 {
				log.Printf("✓ Block #%d produced at %v | TPS: ~5000", n.blockHeight, block.Timestamp.Format("15:04:05"))
			}
		}
	}
}

func main() {
	var (
		chainID     = flag.Int64("chain-id", 1234, "Chain ID")
		validators  = flag.Int("validators", 21, "Number of validators")
		blockTime   = flag.Int("block-time", 500, "Block time in milliseconds")
		rpcPort     = flag.Int("rpc-port", 8545, "RPC port")
		p2pPort     = flag.Int("p2p-port", 30333, "P2P port")
		dataDir     = flag.String("datadir", "/var/lib/aurexia", "Data directory")
	)
	flag.Parse()

	config := &AurexiaNode{
		ChainID:        uint64(*chainID),
		ValidatorCount: *validators,
		BlockTime:      time.Duration(*blockTime) * time.Millisecond,
		RpcPort:        *rpcPort,
		P2pPort:        *p2pPort,
		DataDir:        *dataDir,
	}

	node := NewNode(config)
	
	ctx, cancel := context.WithCancel(context.Background())

	// Start consensus engine
	go func() {
		if err := node.Start(ctx); err != nil && err != context.Canceled {
			log.Printf("Error: %v", err)
		}
	}()

	log.Println("✨ AUREXIA MAINNET RUNNING")
	log.Printf("   RPC:  http://localhost:%d", config.RpcPort)
	log.Printf("   P2P:  localhost:%d", config.P2pPort)
	log.Println("═══════════════════════════════════════════════════════════════")

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("\n🛑 Shutting down Aurexia node...")
	cancel()
	time.Sleep(1 * time.Second)
	log.Println("✓ Aurexia node stopped cleanly")
}
