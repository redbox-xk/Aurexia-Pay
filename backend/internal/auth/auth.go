package auth

import (
    "context"
    "encoding/json"
    "net/http"
    "time"
    
    "github.com/dgrijalva/jwt-go"
    "github.com/gorilla/mux"
    "github.com/gorilla/websocket"
    "go.uber.org/zap"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
    "github.com/go-redis/redis/v8"
)

type AuthService struct {
    db     *gorm.DB
    redis  *redis.Client
    logger *zap.Logger
    upgrader websocket.Upgrader
}

type User struct {
    ID        uint      `gorm:"primarykey" json:"id"`
    Email     string    `gorm:"uniqueIndex" json:"email"`
    Password  string    `json:"-"`
    ApiKey    string    `gorm:"uniqueIndex" json:"apiKey"`
    Role      string    `json:"role"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type RegisterRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type AuthResponse struct {
    Token     string    `json:"token"`
    User      User      `json:"user"`
    ExpiresAt time.Time `json:"expiresAt"`
}

type Claims struct {
    UserID uint   `json:"userId"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.StandardClaims
}

func NewAuthService(db *gorm.DB, redis *redis.Client, logger *zap.Logger) *AuthService {
    db.AutoMigrate(&User{})
    
    return &AuthService{
        db:     db,
        redis:  redis,
        logger: logger,
        upgrader: websocket.Upgrader{
            CheckOrigin: func(r *http.Request) bool {
                return true // Configure properly in production
            },
        },
    }
}

func (s *AuthService) Login(w http.ResponseWriter, r *http.Request) {
    var req LoginRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    var user User
    if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }
    
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }
    
    token, expiresAt, err := s.generateToken(&user)
    if err != nil {
        http.Error(w, "Failed to generate token", http.StatusInternalServerError)
        return
    }
    
    response := AuthResponse{
        Token:     token,
        User:      user,
        ExpiresAt: expiresAt,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func (s *AuthService) Register(w http.ResponseWriter, r *http.Request) {
    var req RegisterRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Failed to hash password", http.StatusInternalServerError)
        return
    }
    
    user := User{
        Email:    req.Email,
        Password: string(hashedPassword),
        ApiKey:   generateAPIKey(),
        Role:     "user",
    }
    
    if err := s.db.Create(&user).Error; err != nil {
        http.Error(w, "Failed to create user", http.StatusInternalServerError)
        return
    }
    
    token, expiresAt, err := s.generateToken(&user)
    if err != nil {
        http.Error(w, "Failed to generate token", http.StatusInternalServerError)
        return
    }
    
    response := AuthResponse{
        Token:     token,
        User:      user,
        ExpiresAt: expiresAt,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func (s *AuthService) generateToken(user *User) (string, time.Time, error) {
    expirationTime := time.Now().Add(24 * time.Hour)
    
    claims := &Claims{
        UserID: user.ID,
        Email:  user.Email,
        Role:   user.Role,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: expirationTime.Unix(),
            IssuedAt:  time.Now().Unix(),
            Issuer:    "aurexia-pay",
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString([]byte("your-secret-key-change-this"))
    
    return tokenString, expirationTime, err
}

func (s *AuthService) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := s.upgrader.Upgrade(w, r, nil)
    if err != nil {
        s.logger.Error("WebSocket upgrade failed", zap.Error(err))
        return
    }
    defer conn.Close()
    
    // Authenticate WebSocket connection
    token := r.URL.Query().Get("token")
    if token == "" {
        conn.WriteMessage(websocket.TextMessage, []byte("unauthorized"))
        return
    }
    
    claims, err := s.validateToken(token)
    if err != nil {
        conn.WriteMessage(websocket.TextMessage, []byte("unauthorized"))
        return
    }
    
    // Handle WebSocket messages
    for {
        var msg map[string]interface{}
        err := conn.ReadJSON(&msg)
        if err != nil {
            break
        }
        
        // Process message based on type
        switch msg["type"] {
        case "subscribe":
            channel := msg["channel"].(string)
            s.handleSubscribe(conn, claims.UserID, channel)
        case "unsubscribe":
            channel := msg["channel"].(string)
            s.handleUnsubscribe(conn, claims.UserID, channel)
        }
    }
}

func (s *AuthService) validateToken(tokenString string) (*Claims, error) {
    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return []byte("your-secret-key-change-this"), nil
    })
    
    if err != nil || !token.Valid {
        return nil, err
    }
    
    return claims, nil
}

func (s *AuthService) handleSubscribe(conn *websocket.Conn, userID uint, channel string) {
    // Store subscription in Redis
    ctx := context.Background()
    key := "ws:subscriptions:" + channel
    s.redis.SAdd(ctx, key, userID)
    
    conn.WriteJSON(map[string]interface{}{
        "type":    "subscribed",
        "channel": channel,
    })
}

func (s *AuthService) handleUnsubscribe(conn *websocket.Conn, userID uint, channel string) {
    ctx := context.Background()
    key := "ws:subscriptions:" + channel
    s.redis.SRem(ctx, key, userID)
    
    conn.WriteJSON(map[string]interface{}{
        "type":      "unsubscribed",
        "channel":   channel,
    })
}

func AuthMiddleware(auth *AuthService) mux.MiddlewareFunc {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            token := r.Header.Get("Authorization")
            if token == "" {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            
            // Remove "Bearer " prefix
            if len(token) > 7 && token[:7] == "Bearer " {
                token = token[7:]
            }
            
            claims, err := auth.validateToken(token)
            if err != nil {
                http.Error(w, "Invalid token", http.StatusUnauthorized)
                return
            }
            
            // Add user info to context
            ctx := context.WithValue(r.Context(), "user", claims)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

func generateAPIKey() string {
    b := make([]byte, 32)
    // In production, use crypto/rand
    for i := range b {
        b[i] = byte(i + 65)
    }
    return string(b)
}
