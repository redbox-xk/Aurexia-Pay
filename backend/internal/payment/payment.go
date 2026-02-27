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
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(payments)
}

func (s *PaymentService) GetPayment(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    paymentID := vars["id"]
    
    var payment Payment
    if err := s.db.First(&payment, "id = ?", paymentID).Error; err != nil {
        http.Error(w, "Payment not found", http.StatusNotFound)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(payment)
}

func (s *PaymentService) ConfirmPayment(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    paymentID := vars["id"]
    
    var payment Payment
    if err := s.db.First(&payment, "id = ?", paymentID).Error; err != nil {
        http.Error(w, "Payment not found", http.StatusNotFound)
        return
    }
    
    if payment.Status != "pending" {
        http.Error(w, "Payment already processed", http.StatusBadRequest)
        return
    }
    
    // In production, this would verify on-chain confirmation
    payment.Status = "confirmed"
    payment.UpdatedAt = time.Now()
    
    s.db.Save(&payment)
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(payment)
}

func (s *PaymentService) processPayment(payment *Payment) {
    // Simulate blockchain transaction
    time.Sleep(2 * time.Second)
    
    payment.Status = "processing"
    s.db.Save(payment)
    
    // Submit to blockchain
    time.Sleep(3 * time.Second)
    
    payment.Status = "completed"
    payment.TxHash = "0x" + randomString(64)
    s.db.Save(payment)
    
    // Publish event via WebSocket
    s.publishPaymentEvent(payment)
}

func (s *PaymentService) publishPaymentEvent(payment *Payment) {
    // Publish to Redis for WebSocket distribution
    ctx := context.Background()
    event := map[string]interface{}{
        "type":    "payment_update",
        "payment": payment,
    }
    
    data, _ := json.Marshal(event)
    s.redis.Publish(ctx, "payments:"+payment.ID, data)
}

func generatePaymentID() string {
    return "pay_" + time.Now().Format("20060102150405") + randomString(6)
}

func randomString(n int) string {
    const letters = "0123456789abcdefghijklmnopqrstuvwxyz"
    b := make([]byte, n)
    for i := range b {
        b[i] = letters[i%len(letters)]
    }
    return string(b)
}
