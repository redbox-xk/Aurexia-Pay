package bridge

import (
    "encoding/json"
    "net/http"
    "time"
    
    "github.com/gorilla/mux"
    "go.uber.org/zap"
    "gorm.io/gorm"
    "github.com/go-redis/redis/v8"
    "github.com/shopspring/decimal"
)

type BridgeService struct {
    db     *gorm.DB
    redis  *redis.Client
    logger *zap.Logger
}

type Chain struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    RPCURL      string `json:"rpcUrl"`
    BridgeAddress string `json:"bridgeAddress"`
    ExplorerURL string `json:"explorerUrl"`
    Active      bool   `json:"active"`
}

type CrossChainTransfer struct {
    ID              string          `gorm:"primarykey" json:"id"`
    FromChain       int             `json:"fromChain"`
    ToChain         int             `json:"toChain"`
    FromAddress     string          `json:"fromAddress"`
    ToAddress       string          `json:"toAddress"`
    TokenAddress    string          `json:"tokenAddress"`
    Amount          decimal.Decimal `json:"amount"`
    Status          string          `json:"status"`
    SourceTxHash    string          `json:"sourceTxHash"`
    DestinationTxHash string        `json:"destinationTxHash"`
    UserID          uint            `json:"userId"`
    CreatedAt       time.Time       `json:"createdAt"`
    UpdatedAt       time.Time       `json:"updatedAt"`
}

type TransferRequest struct {
    FromChain    int    `json:"fromChain"`
    ToChain      int    `json:"toChain"`
    FromAddress  string `json:"fromAddress"`
    ToAddress    string `json:"toAddress"`
    TokenAddress string `json:"tokenAddress"`
    Amount       string `json:"amount"`
}

func NewBridgeService(db *gorm.DB, redis *redis.Client, logger *zap.Logger) *BridgeService {
    db.AutoMigrate(&CrossChainTransfer{})
    
    return &BridgeService{
        db:     db,
        redis:  redis,
        logger: logger,
    }
}

func (s *BridgeService) GetChains(w http.ResponseWriter, r *http.Request) {
    chains := []Chain{
        {ID: 1, Name: "Ethereum", RPCURL: "https://eth-mainnet.g.alchemy.com/v2/...", BridgeAddress: "0x...", ExplorerURL: "https://etherscan.io", Active: true},
        {ID: 56, Name: "BSC", RPCURL: "https://bsc-dataseed.binance.org", BridgeAddress: "0x...", ExplorerURL: "https://bscscan.com", Active: true},
        {ID: 137, Name: "Polygon", RPCURL: "https://polygon-rpc.com", BridgeAddress: "0x...", ExplorerURL: "https://polygonscan.com", Active: true},
        {ID: 43114, Name: "Avalanche", RPCURL: "https://api.avax.network/ext/bc/C/rpc", BridgeAddress: "0x...", ExplorerURL: "https://snowtrace.io", Active: true},
        {ID: 42161, Name: "Arbitrum", RPCURL: "https://arb1.arbitrum.io/rpc", BridgeAddress: "0x...", ExplorerURL: "https://arbiscan.io", Active: true},
        {ID: 10, Name: "Optimism", RPCURL: "https://mainnet.optimism.io", BridgeAddress: "0x...", ExplorerURL: "https://optimistic.etherscan.io", Active: true},
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(chains)
}

func (s *BridgeService) Transfer(w http.ResponseWriter, r *http.Request) {
    var req TransferRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    claims := r.Context().Value("user").(*auth.Claims)
    
    amount, err := decimal.NewFromString(req.Amount)
    if err != nil {
        http.Error(w, "Invalid amount", http.StatusBadRequest)
        return
    }
    
    transfer := CrossChainTransfer{
        ID:           generateTransferID(),
        FromChain:    req.FromChain,
        ToChain:      req.ToChain,
        FromAddress:  req.FromAddress,
        ToAddress:    req.ToAddress,
        TokenAddress: req.TokenAddress,
        Amount:       amount,
        Status:       "pending",
        UserID:       claims.UserID,
    }
    
    if err := s.db.Create(&transfer).Error; err != nil {
        s.logger.Error("Failed to create transfer", zap.Error(err))
        http.Error(w, "Failed to create transfer", http.StatusInternalServerError)
        return
    }
    
    // Initiate cross-chain transfer
    go s.processCrossChainTransfer(&transfer)
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusAccepted)
    json.NewEncoder(w).Encode(transfer)
}

func (s *BridgeService) GetStatus(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    transferID := vars["id"]
    
    var transfer CrossChainTransfer
    if err := s.db.First(&transfer, "id = ?", transferID).Error; err != nil {
        http.Error(w, "Transfer not found", http.StatusNotFound)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(transfer)
}

func (s *BridgeService) processCrossChainTransfer(transfer *CrossChainTransfer) {
    // Step 1: Lock tokens on source chain
    s.logger.Info("Locking tokens on source chain", 
        zap.Int("chain", transfer.FromChain),
        zap.String("transfer", transfer.ID))
    
    txHash, err := s.lockTokens(transfer)
    if err != nil {
        transfer.Status = "failed"
        s.db.Save(transfer)
        return
    }
    
    transfer.SourceTxHash = txHash
    transfer.Status = "locked"
    s.db.Save(transfer)
    
    // Step 2: Wait for confirmations
    time.Sleep(12 * time.Second) // Wait for block confirmations
    
    // Step 3: Mint tokens on destination chain
    s.logger.Info("Minting tokens on destination chain",
        zap.Int("chain", transfer.ToChain))
    
    destTxHash, err := s.mintTokens(transfer)
    if err != nil {
        transfer.Status = "failed"
        s.db.Save(transfer)
        return
    }
    
    transfer.DestinationTxHash = destTxHash
    transfer.Status = "completed"
    s.db.Save(transfer)
    
    // Notify user
    s.sendNotification(transfer)
}

func (s *BridgeService) lockTokens(transfer *CrossChainTransfer) (string, error) {
    // Interact with source chain bridge contract
    // This would create a real transaction
    return "0x" + randomString(64), nil
}

func (s *BridgeService) mintTokens(transfer *CrossChainTransfer) (string, error) {
    // Interact with destination chain bridge contract
    // This would create a real transaction
    return "0x" + randomString(64), nil
}

func (s *BridgeService) sendNotification(transfer *CrossChainTransfer) {
    // Send email/push notification
    s.logger.Info("Transfer completed notification sent", 
        zap.String("transfer", transfer.ID))
}

func generateTransferID() string {
    return "xfer_" + time.Now().Format("20060102150405") + randomString(6)
}

func randomString(n int) string {
    const letters = "0123456789abcdef"
    b := make([]byte, n)
    for i := range b {
        b[i] = letters[i%len(letters)]
    }
    return string(b)
}
