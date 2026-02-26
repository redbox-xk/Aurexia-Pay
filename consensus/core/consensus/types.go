package consensus

import (
    "encoding/json"
    "fmt"
    "time"

    "github.com/cometbft/cometbft/libs/bytes"
)

// Block represents a blockchain block
type Block struct {
    Header       Header        `json:"header"`
    Transactions []Transaction `json:"transactions"`
    Hash         []byte        `json:"hash"`
}

// Header represents a block header
type Header struct {
    Height        uint64    `json:"height"`
    Round         int32     `json:"round"`
    Time          uint64    `json:"time"`
    Proposer      string    `json:"proposer"`
    PrevBlockHash []byte    `json:"prev_block_hash"`
    TxsHash       []byte    `json:"txs_hash"`
    StateRoot     []byte    `json:"state_root"`
    GasUsed       uint64    `json:"gas_used"`
    GasLimit      uint64    `json:"gas_limit"`
    NumTxs        uint64    `json:"num_txs"`
    ValidatorHash []byte    `json:"validator_hash"`
}

// Hash computes the block hash
func (b *Block) Hash() []byte {
    data, _ := json.Marshal(b.Header)
    return crypto.Keccak256(data)
}

// Validate validates the block
func (b *Block) Validate() error {
    if b.Header.Height == 0 {
        return fmt.Errorf("invalid height")
    }
    if b.Header.Time == 0 {
        return fmt.Errorf("invalid time")
    }
    if len(b.Transactions) > 10000 {
        return fmt.Errorf("too many transactions")
    }
    return nil
}

// Transaction represents a blockchain transaction
type Transaction struct {
    Hash      []byte `json:"hash"`
    From      []byte `json:"from"`
    To        []byte `json:"to"`
    Value     uint64 `json:"value"`
    Data      []byte `json:"data"`
    GasPrice  uint64 `json:"gas_price"`
    GasLimit  uint64 `json:"gas_limit"`
    Nonce     uint64 `json:"nonce"`
    Signature []byte `json:"signature"`
    ChainID   uint64 `json:"chain_id"`
    Timestamp uint64 `json:"timestamp"`
}

// Hash computes the transaction hash
func (tx *Transaction) Hash() []byte {
    data, _ := json.Marshal(struct {
        From      []byte
        To        []byte
        Value     uint64
        Nonce     uint64
        Timestamp uint64
    }{
        From:      tx.From,
        To:        tx.To,
        Value:     tx.Value,
        Nonce:     tx.Nonce,
        Timestamp: tx.Timestamp,
    })
    return crypto.Keccak256(data)
}

// VerifySignature verifies the transaction signature
func (tx *Transaction) VerifySignature() bool {
    // In production, implement proper signature verification
    return true
}

// Log represents an event log
type Log struct {
    Address     []byte   `json:"address"`
    Topics      [][]byte `json:"topics"`
    Data        []byte   `json:"data"`
    BlockNumber uint64   `json:"block_number"`
    TxHash      []byte   `json:"tx_hash"`
    Index       uint     `json:"index"`
}

// Receipt represents a transaction receipt
type Receipt struct {
    TxHash          []byte `json:"tx_hash"`
    Status          uint64 `json:"status"`
    GasUsed         uint64 `json:"gas_used"`
    CumulativeGasUsed uint64 `json:"cumulative_gas_used"`
    Logs            []*Log `json:"logs"`
    ContractAddress []byte `json:"contract_address"`
}
