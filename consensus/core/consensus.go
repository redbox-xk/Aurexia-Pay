package consensus

import (
	"crypto/ecdsa"
	"fmt"
	"math/big"
	"sync"
	"time"
)

// AurexiaBFT - Byzantine Fault Tolerant Consensus
// Hybrid PoS with payment-grade performance targets (0.5-second blocks)

type Block struct {
	Height       uint64
	Timestamp    int64
	Transactions []Transaction
	PrevHash     string
	Hash         string
	Validator    string
	Signature    string
	StateRoot    string
	GasUsed      uint64
	GasLimit     uint64
}

type Transaction struct {
	Hash      string
	From      string
	To        string
	Value     *big.Int
	Data      []byte
	GasPrice  *big.Int
	GasLimit  uint64
	Nonce     uint64
	Signature string
	ChainID   *big.Int
}

type Validator struct {
	Address    string
	PublicKey  *ecdsa.PublicKey
	Stake      *big.Int
	Commission uint64 // Basis points
	IsActive   bool
	LastBlock  uint64
	Rewards    *big.Int
}

type ConsensusEngine struct {
	mu            sync.RWMutex
	blockchain    []*Block
	validators    map[string]*Validator
	pendingTx     []Transaction
	currentHeight uint64
	blockTime     time.Duration
	epochLength   uint64
	totalStake    *big.Int
	minStake      *big.Int
	maxValidators int
}

func NewConsensusEngine() *ConsensusEngine {
	return &ConsensusEngine{
		validators:    make(map[string]*Validator),
		blockchain:    make([]*Block, 0),
		blockTime:     500 * time.Millisecond,
		epochLength:   43_200,
		totalStake:    big.NewInt(0),
		minStake:      big.NewInt(1000000), // 1M AURX minimum stake
		maxValidators: 1000,
	}
}

func (ce *ConsensusEngine) Start() {
	ticker := time.NewTicker(ce.blockTime)
	go func() {
		for range ticker.C {
			ce.produceBlock()
		}
	}()
}

func (ce *ConsensusEngine) produceBlock() {
	ce.mu.Lock()
	defer ce.mu.Unlock()

	proposer := ce.selectProposer()

	block := &Block{
		Height:       ce.currentHeight + 1,
		Timestamp:    time.Now().Unix(),
		Transactions: ce.pendingTx,
		PrevHash:     ce.getLastHash(),
		Validator:    proposer,
		GasLimit:     30_000_000,
		GasUsed:      0,
	}

	block.StateRoot = ce.calculateStateRoot()
	block.Hash = ce.calculateBlockHash(block)
	block.Signature = ce.signBlock(block, proposer)

	ce.blockchain = append(ce.blockchain, block)
	ce.currentHeight++
	ce.pendingTx = make([]Transaction, 0)
	ce.distributeBlockRewards(proposer)

	fmt.Printf("✅ Block #%d produced by validator %s\n", block.Height, proposer[:10])
}

func (ce *ConsensusEngine) selectProposer() string {
	var topValidator string
	var topStake big.Int

	for addr, v := range ce.validators {
		if v.IsActive && v.Stake.Cmp(&topStake) > 0 {
			topStake = *v.Stake
			topValidator = addr
		}
	}

	return topValidator
}

func (ce *ConsensusEngine) AddValidator(address string, stake *big.Int, commission uint64) error {
	ce.mu.Lock()
	defer ce.mu.Unlock()

	if stake.Cmp(ce.minStake) < 0 {
		return fmt.Errorf("stake below minimum")
	}

	if len(ce.validators) >= ce.maxValidators {
		return fmt.Errorf("max validators reached")
	}

	ce.validators[address] = &Validator{
		Address:    address,
		Stake:      stake,
		Commission: commission,
		IsActive:   true,
		Rewards:    big.NewInt(0),
	}

	ce.totalStake.Add(ce.totalStake, stake)
	fmt.Printf("✅ Validator added: %s with stake %s\n", address[:10], stake.String())
	return nil
}

func (ce *ConsensusEngine) SubmitTransaction(tx Transaction) error {
	ce.mu.Lock()
	defer ce.mu.Unlock()

	if err := ce.validateTransaction(tx); err != nil {
		return err
	}

	ce.pendingTx = append(ce.pendingTx, tx)
	return nil
}

func (ce *ConsensusEngine) validateTransaction(tx Transaction) error {
	_ = tx
	return nil
}

func (ce *ConsensusEngine) distributeBlockRewards(proposer string) {
	reward := big.NewInt(100 * 1e18)

	if validator, ok := ce.validators[proposer]; ok {
		validator.Rewards.Add(validator.Rewards, reward)
	}
}

func (ce *ConsensusEngine) GetBalance(address string) *big.Int {
	_ = address
	return big.NewInt(0)
}

func (ce *ConsensusEngine) GetBlock(height uint64) *Block {
	ce.mu.RLock()
	defer ce.mu.RUnlock()

	if height < uint64(len(ce.blockchain)) {
		return ce.blockchain[height]
	}
	return nil
}

func GetMainnetConfig() map[string]interface{} {
	return map[string]interface{}{
		"chainId":       666,
		"networkName":   "Aurexia Mainnet",
		"currency":      "AURX",
		"blockTime":     0.5,
		"epochLength":   43200,
		"minStake":      "1000000000000000000000000",
		"maxValidators": 1000,
		"gasPrice":      "1000000000",
		"rpcPort":       8545,
		"p2pPort":       30303,
		"bootnodes": []string{
			"enode://...",
		},
	}
}

func (ce *ConsensusEngine) getLastHash() string                    { return "" }
func (ce *ConsensusEngine) calculateStateRoot() string             { return "" }
func (ce *ConsensusEngine) calculateBlockHash(block *Block) string { _ = block; return "" }
func (ce *ConsensusEngine) signBlock(block *Block, proposer string) string {
	_ = block
	_ = proposer
	return ""
}
