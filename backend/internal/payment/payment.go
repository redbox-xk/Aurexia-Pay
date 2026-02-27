package payment

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

type PaymentService struct {
    db     *gorm.DB
    redis  *redis.Client
    logger *zap.Logger
}

type Payment struct {
    ID          string          `gorm:"primarykey" json:"id"`
    FromUserID  uint            `json:"fromUserId"`
    ToAddress   string          `json:"toAddress"`
    Amount      decimal.Decimal `json:"amount"`
    TokenID     string          `json:"tokenId"`
    Status      string          `json:"status"`
    TxHash      string          `json:"txHash"`
    Description string          `json:"description"`
    CreatedAt   time.Time       `json:"createdAt"`
    UpdatedAt   time.Time       `json:"updatedAt"`
}

type CreatePaymentRequest struct {
    ToAddress   string `json:"toAddress"`
    Amount      string `json:"amount"`
    TokenID     string `json:"tokenId"`
    Description string `json:"description"`
}

func NewPaymentService(db *gorm.DB, redis *redis.Client, logger *zap.Logger) *PaymentService {
    db.AutoMigrate(&Payment{})
    
    return &PaymentService{
        db:     db,
        redis:  redis,
        logger: logger,
    }
}

func (s *PaymentService) CreatePayment(w http.ResponseWriter, r *http.Request) {
    var req CreatePaymentRequest
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
    
    payment := Payment{
        ID:          generatePaymentID(),
        FromUserID:  claims.UserID,
        ToAddress:   req.ToAddress,
        Amount:      amount,
        TokenID:     req.TokenID,
        Status:      "pending",
        Description: req.Description,
    }
    
    if err := s.db.Create(&payment).Error; err != nil {
        s.logger.Error("Failed to create payment", zap.Error(err))
        http.Error(w, "Failed to create payment", http.StatusInternalServerError)
        return
    }
    
    // Process payment asynchronously
    go s.processPayment(&payment)
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(payment)
}

func (s *PaymentService) ListPayments(w http.ResponseWriter, r *http.Request) {
    claims := r.Context().Value("user").(*auth.Claims)
    
    var payments []Payment
    if err := s.db.Where("from_user_id = ?", claims.UserID).Order("created_at desc").Find(&payments).Error; err != nil {
        http.Error(w, "Failed to fetch payments", http.StatusInternalServerError)
       
