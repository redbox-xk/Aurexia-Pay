package main

import (
    "context"
    "encoding/json"
    "flag"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "time"

    "github.com/gorilla/mux"
    "github.com/gorilla/handlers"
    "go.uber.org/zap"
)

// Config holds the API gateway configuration
type Config struct {
    Port         int
    Environment  string
    LogLevel     string
    ReadTimeout  time.Duration
    WriteTimeout time.Duration
    IdleTimeout  time.Duration
}

// PaymentIntent represents a Stripe-like payment intent
type PaymentIntent struct {
    ID            string    `json:"id"`
    Amount        int64     `json:"amount"`
    Currency      string    `json:"currency"`
    Description   string    `json:"description,omitempty"`
    CustomerEmail string    `json:"customer_email,omitempty"`
    Status        string    `json:"status"`
    ClientSecret  string    `json:"client_secret"`
    Created       time.Time `json:"created"`
    Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// CreatePaymentRequest represents the request to create a payment
type CreatePaymentRequest struct {
    Amount        int64                  `json:"amount"`
    Currency      string                  `json:"currency"`
    Description   string                  `json:"description,omitempty"`
    CustomerEmail string                  `json:"customer_email,omitempty"`
    Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// APIResponse represents a standard API response
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   string      `json:"error,omitempty"`
}

var (
    logger *zap.Logger
    config Config
)

func main() {
    // Parse flags
    port := flag.Int("port", 8080, "API server port")
    env := flag.String("env", "development", "Environment (development/production)")
    flag.Parse()

    config = Config{
        Port:         *port,
        Environment:  *env,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // Initialize logger
    var err error
    if config.Environment == "production" {
        logger, err = zap.NewProduction()
    } else {
        logger, err = zap.NewDevelopment()
    }
    if err != nil {
        log.Fatalf("Failed to initialize logger: %v", err)
    }
    defer logger.Sync()

    // Create router
    router := mux.NewRouter()

    // Middleware
    router.Use(loggingMiddleware)
    router.Use(corsMiddleware)
    router.Use(recoveryMiddleware)

    // Health check
    router.HandleFunc("/healthz", healthHandler).Methods("GET")

    // API v1 routes
    apiV1 := router.PathPrefix("/api/v1").Subrouter()
    apiV1.HandleFunc("/payments", createPaymentHandler).Methods("POST")
    apiV1.HandleFunc("/payments/{id}", getPaymentHandler).Methods("GET")
    apiV1.HandleFunc("/payments/{id}/confirm", confirmPaymentHandler).Methods("POST")

    // Create server
    server := &http.Server{
        Addr:         fmt.Sprintf(":%d", config.Port),
        Handler:      handlers.CompressHandler(router),
        ReadTimeout:  config.ReadTimeout,
        WriteTimeout: config.WriteTimeout,
        IdleTimeout:  config.IdleTimeout,
    }

    // Start server
    logger.Info("Starting API gateway", 
        zap.Int("port", config.Port),
        zap.String("environment", config.Environment),
    )

    go func() {
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            logger.Fatal("Server failed", zap.Error(err))
        }
    }()

    // Wait for interrupt signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt)
    <-quit

    // Graceful shutdown
    logger.Info("Shutting down server...")
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        logger.Fatal("Server forced to shutdown", zap.Error(err))
    }

    logger.Info("Server stopped")
}

// Middleware

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        logger.Info("Request received",
            zap.String("method", r.Method),
            zap.String("path", r.URL.Path),
            zap.String("remote_addr", r.RemoteAddr),
        )
        next.ServeHTTP(w, r)
        logger.Info("Request completed",
            zap.String("method", r.Method),
            zap.String("path", r.URL.Path),
            zap.Duration("duration", time.Since(start)),
        )
    })
}

func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}

func recoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                logger.Error("Panic recovered", zap.Any("error", err))
                jsonResponse(w, http.StatusInternalServerError, APIResponse{
                    Success: false,
                    Error:   "Internal server error",
                })
            }
        }()
        next.ServeHTTP(w, r)
    })
}

// Handlers

func healthHandler(w http.ResponseWriter, r *http.Request) {
    jsonResponse(w, http.StatusOK, APIResponse{
        Success: true,
        Data: map[string]interface{}{
            "status": "healthy",
            "timestamp": time.Now().Unix(),
            "version": "1.0.0",
        },
    })
}

func createPaymentHandler(w http.ResponseWriter, r *http.Request) {
    var req CreatePaymentRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        jsonResponse(w, http.StatusBadRequest, APIResponse{
            Success: false,
            Error:   "Invalid request body",
        })
        return
    }

    // Validate request
    if req.Amount <= 0 {
        jsonResponse(w, http.StatusBadRequest, APIResponse{
            Success: false,
            Error:   "Amount must be positive",
        })
        return
    }

    if req.Currency == "" {
        jsonResponse(w, http.StatusBadRequest, APIResponse{
            Success: false,
            Error:   "Currency is required",
        })
        return
    }

    // Generate payment intent ID
    paymentID := fmt.Sprintf("pi_%d", time.Now().UnixNano())
    
    payment := PaymentIntent{
        ID:           paymentID,
        Amount:       req.Amount,
        Currency:     req.Currency,
        Description:  req.Description,
        CustomerEmail: req.CustomerEmail,
        Status:       "requires_payment_method",
        ClientSecret: fmt.Sprintf("%s_secret_%d", paymentID, time.Now().UnixNano()),
        Created:      time.Now(),
        Metadata:     req.Metadata,
    }

    logger.Info("Payment intent created", 
        zap.String("id", payment.ID),
        zap.Int64("amount", payment.Amount),
        zap.String("currency", payment.Currency),
    )

    jsonResponse(w, http.StatusCreated, APIResponse{
        Success: true,
        Data:    payment,
    })
}

func getPaymentHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    paymentID := vars["id"]

    // Mock payment retrieval
    payment := PaymentIntent{
        ID:           paymentID,
        Amount:       1000,
        Currency:     "usd",
        Status:       "succeeded",
        ClientSecret: fmt.Sprintf("%s_secret_mock", paymentID),
        Created:      time.Now().Add(-5 * time.Minute),
    }

    jsonResponse(w, http.StatusOK, APIResponse{
        Success: true,
        Data:    payment,
    })
}

func confirmPaymentHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    paymentID := vars["id"]

    var body map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        jsonResponse(w, http.StatusBadRequest, APIResponse{
            Success: false,
            Error:   "Invalid request body",
        })
        return
    }

    payment := PaymentIntent{
        ID:           paymentID,
        Amount:       1000,
        Currency:     "usd",
        Status:       "succeeded",
        ClientSecret: fmt.Sprintf("%s_secret_mock", paymentID),
        Created:      time.Now().Add(-5 * time.Minute),
    }

    logger.Info("Payment confirmed", 
        zap.String("id", payment.ID),
        zap.Any("payment_method", body["payment_method"]),
    )

    jsonResponse(w, http.StatusOK, APIResponse{
        Success: true,
        Data:    payment,
    })
}

// Helper functions

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}
