package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "aurexia-pay/backend/internal/auth"
    "aurexia-pay/backend/internal/bridge"
    "aurexia-pay/backend/internal/payment"
    "aurexia-pay/backend/internal/token"
    "aurexia-pay/backend/internal/analytics"
    "aurexia-pay/backend/internal/utils"
    
    "github.com/gorilla/mux"
    "github.com/rs/cors"
    "go.uber.org/zap"
)

func main() {
    // Initialize logger
    logger, _ := zap.NewProduction()
    defer logger.Sync()
    
    // Load configuration
    config := utils.LoadConfig()
    
    // Initialize database
    db := utils.InitDatabase(config)
    
    // Initialize Redis
    redis := utils.InitRedis(config)
    
    // Initialize services
    authService := auth.NewAuthService(db, redis, logger)
    tokenService := token.NewTokenService(db, redis, logger)
    paymentService := payment.NewPaymentService(db, redis, logger)
    bridgeService := bridge.NewBridgeService(db, redis, logger)
    analyticsService := analytics.NewAnalyticsService(db, redis, logger)
    
    // Setup router
    router := mux.NewRouter()
    
    // API routes
    api := router.PathPrefix("/api/v1").Subrouter()
    
    // Public routes
    api.HandleFunc("/health", healthCheck).Methods("GET")
    api.HandleFunc("/auth/login", authService.Login).Methods("POST")
    api.HandleFunc("/auth/register", authService.Register).Methods("POST")
    
    // Protected routes
    protected := api.PathPrefix("/").Subrouter()
    protected.Use(auth.AuthMiddleware(authService))
    
    // Token management
    protected.HandleFunc("/tokens", tokenService.CreateToken).Methods("POST")
    protected.HandleFunc("/tokens", tokenService.ListTokens).Methods("GET")
    protected.HandleFunc("/tokens/{id}", tokenService.GetToken).Methods("GET")
    protected.HandleFunc("/tokens/{id}/transfer", tokenService.Transfer).Methods("POST")
    
    // Payments
    protected.HandleFunc("/payments", paymentService.CreatePayment).Methods("POST")
    protected.HandleFunc("/payments", paymentService.ListPayments).Methods("GET")
    protected.HandleFunc("/payments/{id}", paymentService.GetPayment).Methods("GET")
    protected.HandleFunc("/payments/{id}/confirm", paymentService.ConfirmPayment).Methods("POST")
    
    // Cross-chain bridge
    protected.HandleFunc("/bridge/chains", bridgeService.GetChains).Methods("GET")
    protected.HandleFunc("/bridge/transfer", bridgeService.Transfer).Methods("POST")
    protected.HandleFunc("/bridge/status/{id}", bridgeService.GetStatus).Methods("GET")
    
    // Analytics
    protected.HandleFunc("/analytics/volume", analyticsService.GetVolume).Methods("GET")
    protected.HandleFunc("/analytics/transactions", analyticsService.GetTransactions).Methods("GET")
    protected.HandleFunc("/analytics/users", analyticsService.GetUserStats).Methods("GET")
    
    // WebSocket for real-time updates
    router.HandleFunc("/ws", authService.HandleWebSocket)
    
    // CORS setup
    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"*"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Authorization", "Content-Type"},
        AllowCredentials: true,
    })
    
    handler := c.Handler(router)
    
    // Create server
    srv := &http.Server{
        Addr:         ":" + config.ServerPort,
        Handler:      handler,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }
    
    // Start server in goroutine
    go func() {
        logger.Info("Starting API Gateway", zap.String("port", config.ServerPort))
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            logger.Fatal("Server failed", zap.Error(err))
        }
    }()
    
    // Wait for interrupt signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    logger.Info("Shutting down server...")
    
    // Graceful shutdown
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := srv.Shutdown(ctx); err != nil {
        logger.Fatal("Server forced to shutdown", zap.Error(err))
    }
    
    logger.Info("Server exited")
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"ok","timestamp":"` + time.Now().UTC().String() + `"}`))
}
