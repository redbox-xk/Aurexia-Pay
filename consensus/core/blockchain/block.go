package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"
)

// Block represents a blockchain block
type Block struct {
	Height        uint64
	Timestamp     int64
	PreviousHash  string
	Transactions  []*Transaction
	MerkleRoot    string
	ValidatorHash string
	Hash          string
	Signature     string
	GasUsed       uint64
	GasLimit      uint64
}

// Transaction represents a blockchain transaction
type Transaction struct {
	Hash      string
	From      string
	To        string
	Amount    uint64
	Data      []byte
	GasPrice  uint64
	GasLimit  uint64
	Nonce     uint64
	Signature string
	Status    string
	Timestamp int64
}

// NewBlock creates a new block
func NewBlock(height uint64, previousHash string, transactions []*Transaction) *Block {
	block := &Block{
		Height:       height,
		Timestamp:    time.Now().Unix(),
		PreviousHash: previousHash,
		Transactions: transactions,
		GasLimit:     30000000,
	}

	// Calculate merkle root
	block.MerkleRoot = calculateMerkleRoot(transactions)

	// Calculate block hash
	block.Hash = block.CalculateHash()

	return block
}

// CalculateHash calculates the block hash
func (b *Block) CalculateHash() string {
	data := struct {
		Height       uint64
		Timestamp    int64
		PreviousHash string
		MerkleRoot   string
	}{
		Height:       b.Height,
		Timestamp:    b.Timestamp,
		PreviousHash: b.PreviousHash,
		MerkleRoot:   b.MerkleRoot,
	}

	jsonData, _ := json.Marshal(data)
	hash := sha256.Sum256(jsonData)
	return hex.EncodeToString(hash[:])
}

// Validate validates the block
func (b *Block) Validate() error {
	if b.Height == 0 {
		return fmt.Errorf("invalid block height")
	}

	if len(b.Transactions) > 10000 {
		return fmt.Errorf("too many transactions in block")
	}

	expectedHash := b.CalculateHash()
	if b.Hash != expectedHash {
		return fmt.Errorf("block hash mismatch")
	}

	return nil
}

// NewTransaction creates a new transaction
func NewTransaction(from, to string, amount uint64) *Transaction {
	tx := &Transaction{
		From:      from,
		To:        to,
		Amount:    amount,
		GasPrice:  1000000000, // 1 gwei
		GasLimit:  21000,
		Timestamp: time.Now().Unix(),
		Status:    "pending",
	}

	tx.Hash = tx.CalculateHash()
	return tx
}

// CalculateHash calculates the transaction hash
func (tx *Transaction) CalculateHash() string {
	data := struct {
		From      string
		To        string
		Amount    uint64
		Nonce     uint64
		Timestamp int64
	}{
		From:      tx.From,
		To:        tx.To,
		Amount:    tx.Amount,
		Nonce:     tx.Nonce,
		Timestamp: tx.Timestamp,
	}

	jsonData, _ := json.Marshal(data)
	hash := sha256.Sum256(jsonData)
	return hex.EncodeToString(hash[:])
}

// Validate validates the transaction
func (tx *Transaction) Validate() error {
	if tx.From == "" {
		return fmt.Errorf("sender address is required")
	}

	if tx.To == "" {
		return fmt.Errorf("recipient address is required")
	}

	if tx.Amount == 0 {
		return fmt.Errorf("amount must be greater than 0")
	}

	return nil
}

// calculateMerkleRoot calculates the merkle root of transactions
func calculateMerkleRoot(transactions []*Transaction) string {
	if len(transactions) == 0 {
		hash := sha256.Sum256([]byte(""))
		return hex.EncodeToString(hash[:])
	}

	var hashes []string
	for _, tx := range transactions {
		hashes = append(hashes, tx.Hash)
	}

	for len(hashes) > 1 {
		var nextLevel []string
		for i := 0; i < len(hashes); i += 2 {
			var combined string
			if i+1 < len(hashes) {
				combined = hashes[i] + hashes[i+1]
			} else {
				combined = hashes[i]
			}
			hash := sha256.Sum256([]byte(combined))
			nextLevel = append(nextLevel, hex.EncodeToString(hash[:]))
		}
		hashes = nextLevel
	}

	return hashes[0]
}
