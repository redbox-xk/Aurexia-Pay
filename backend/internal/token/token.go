package token

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

type TokenService struct {
    db     *gorm.DB
    redis  *redis.Client
    logger *zap.Logger
}

type Token struct {
    ID          string          `gorm:"primarykey" json:"id"`
    Name        string          `json:"name"`
    Symbol      string          `json:"symbol"`
    TotalSupply decimal.Decimal  `json:"totalSupply"`
    Decimals    int             `json:"decimals"`
    OwnerID     uint            `json:"ownerId"`
    ContractAddress string       `json:"contractAddress"`
    ChainID     int             `json:"chainId"`
    IsMintable  bool            `json:"isMintable"`
    IsBurnable  bool            `json:"isBurnable"`
    CreatedAt   time.Time       `json:"createdAt"`
    UpdatedAt   time.Time       `json:"updatedAt"`
}

type CreateTokenRequest struct {
    Name        string `json:"name"`
    Symbol      string `json:"symbol"`
    TotalSupply string `json:"totalSupply"`
    Decimals    int    `json:"decimals"`
    ChainID     int    `json:"chainId"`
    IsMintable  bool   `json:"isMintable"`
    IsBurnable  bool   `json:"isBurnable"`
}

type TransferRequest struct {
    To      string `json:"to"`
    Amount  string `json:"amount"`
    TokenID string `json:"tokenId"`
}

func NewTokenService(db *gorm.DB, redis *redis.Client, logger *zap.Logger) *TokenService {
    db.AutoMigrate(&Token{})
    
    return &TokenService{
        db:     db,
        redis:  redis,
        logger: logger,
    }
}

func (s *TokenService) CreateToken(w http.ResponseWriter, r *http.Request) {
    var req CreateTokenRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    // Get user from context
    claims := r.Context().Value("user").(*auth.Claims)
    
    totalSupply, err := decimal.NewFromString(req.TotalSupply)
    if err != nil {
        http.Error(w, "Invalid total supply", http.StatusBadRequest)
        return
    }
    
    // Generate token ID and contract address
    tokenID := generateTokenID()
    contractAddress := generateContractAddress(req.ChainID)
    
    token := Token{
        ID:              tokenID,
        Name:            req.Name,
        Symbol:          req.Symbol,
        TotalSupply:     totalSupply,
        Decimals:        req.Decimals,
        OwnerID:         claims.UserID,
        ContractAddress: contractAddress,
        ChainID:         req.ChainID,
        IsMintable:      req.IsMintable,
        IsBurnable:      req.IsBurnable,
    }
    
    if err := s.db.Create(&token).Error; err != nil {
        s.logger.Error("Failed to create token", zap.Error(err))
        http.Error(w, "Failed to create token", http.StatusInternalServerError)
        return
    }
    
    // Deploy smart contract (async)
    go s.deployTokenContract(&token)
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(token)
}

func (s *TokenService) ListTokens(w http.ResponseWriter, r *http.Request) {
    claims := r.Context().Value("user").(*auth.Claims)
    
    var tokens []Token
    if err := s.db.Where("owner_id = ?", claims.UserID).Find(&tokens).Error; err != nil {
        http.Error(w, "Failed to fetch tokens", http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(tokens)
}

func (s *TokenService) GetToken(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    tokenID := vars["id"]
    
    var token Token
    if err := s.db.First(&token, "id = ?", tokenID).Error; err != nil {
        http.Error(w, "Token not found", http.StatusNotFound)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(token)
}

func (s *TokenService) Transfer(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    tokenID := vars["id"]
    
    var req TransferRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    claims := r.Context().Value("user").(*auth.Claims)
    
    // Verify token ownership
    var token Token
    if err := s.db.First(&token, "id = ? AND owner_id = ?", tokenID, claims.UserID).Error; err != nil {
        http.Error(w, "Token not found or unauthorized", http.StatusNotFound)
        return
    }
    
    amount, err := decimal.NewFromString(req.Amount)
    if err != nil {
        http.Error(w, "Invalid amount", http.StatusBadRequest)
        return
    }
    
    if amount.GreaterThan(token.TotalSupply) {
        http.Error(w, "Insufficient balance", http.StatusBadRequest)
        return
    }
    
    // Create transfer transaction
    txHash, err := s.createTransferTransaction(&token, req.To, amount)
    if err != nil {
        http.Error(w, "Failed to create transfer", http.StatusInternalServerError)
        return
    }
    
    response := map[string]interface{}{
        "transactionHash": txHash,
        "status":         "pending",
        "from":           claims.UserID,
        "to":             req.To,
        "amount":         amount,
        "tokenId":        tokenID,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func (s *TokenService) deployTokenContract(token *Token) {
    // Deploy ERC20 token contract to blockchain
    // This would interact with the consensus node
    s.logger.Info("Deploying token contract", 
        zap.String("tokenId", token.ID),
        zap.String("contract", token.ContractAddress))
    
    // Update token status in database after deployment
    s.db.Model(token).Update("status", "deployed")
}

func (s *TokenService) createTransferTransaction(token *Token, to string, amount decimal.Decimal) (string, error) {
    // Create and sign transaction
    // Submit to blockchain
    txHash := generateTransactionHash()
    
    return txHash, nil
}

func generateTokenID() string {
    return "tok_" + time.Now().Format("20060102150405") + randomString(6)
}

func generateContractAddress(chainID int) string {
    return "0x" + randomString(40)
}

func generateTransactionHash() string {
    return "0x" + randomString(64)
}

func randomString(n int) string {
    const letters = "0123456789abcdef"
    b := make([]byte, n)
    for i := range b {
        b[i] = letters[i%len(letters)]
    }
    return string(b)
}
