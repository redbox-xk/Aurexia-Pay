package analytics

import (
    "encoding/json"
    "net/http"
    "time"
    
    "go.uber.org/zap"
    "gorm.io/gorm"
    "github.com/go-redis/redis/v8"
    "github.com/shopspring/decimal"
)

type AnalyticsService struct {
    db     *gorm.DB
    redis  *redis.Client
    logger *zap.Logger
}

type VolumeStats struct {
    Date         string          `json:"date"`
    TotalVolume  decimal.Decimal `json:"totalVolume"`
    TransactionCount int64       `json:"transactionCount"`
    UniqueUsers  int64           `json:"uniqueUsers"`
}

type TransactionStats struct {
    Pending  int64 `json:"pending"`
    Completed int64 `json:"completed"`
    Failed   int64 `json:"failed"`
    Total    int64 `json:"total"`
}

type UserStats struct {
    TotalUsers     int64 `json:"totalUsers"`
    ActiveToday    int64 `json:"activeToday"`
    ActiveThisWeek int64 `json:"activeThisWeek"`
    ActiveThisMonth int64 `json:"activeThisMonth"`
    NewUsersToday  int64 `json:"newUsersToday"`
}

func NewAnalyticsService(db *gorm.DB, redis *redis.Client, logger *zap.Logger) *AnalyticsService {
    return &AnalyticsService{
        db:     db,
        redis:  redis,
        logger: logger,
    }
}

func (s *AnalyticsService) GetVolume(w http.ResponseWriter, r *http.Request) {
    // Get time range from query params
    from := r.URL.Query().Get("from")
    to := r.URL.Query().Get("to")
    
    if from == "" {
        from = time.Now().AddDate(0, -30, 0).Format("2006-01-02")
    }
    if to == "" {
        to = time.Now().Format("2006-01-02")
    }
    
    var stats []VolumeStats
    
    // Query from database (simplified)
    rows, err := s.db.Raw(`
        SELECT 
            DATE(created_at) as date,
            SUM(amount) as total_volume,
            COUNT(*) as transaction_count,
            COUNT(DISTINCT from_user_id) as unique_users
        FROM payments
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    `, from, to).Rows()
    
    if err != nil {
        http.Error(w, "Failed to fetch volume stats", http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    
    for rows.Next() {
        var stat VolumeStats
        var totalVolume float64
        
        rows.Scan(&stat.Date, &totalVolume, &stat.TransactionCount, &stat.UniqueUsers)
        stat.TotalVolume = decimal.NewFromFloat(totalVolume)
        stats = append(stats, stat)
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(stats)
}

func (s *AnalyticsService) GetTransactions(w http.ResponseWriter, r *http.Request) {
    var stats TransactionStats
    
    // Get transaction counts by status
    s.db.Raw(`
        SELECT 
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
            COUNT(*) as total
        FROM payments
    `).Scan(&stats)
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(stats)
}

func (s *AnalyticsService) GetUserStats(w http.ResponseWriter, r *http.Request) {
    var stats UserStats
    
    today := time.Now().Format("2006-01-02")
    weekAgo := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
    monthAgo := time.Now().AddDate(0, -1, 0).Format("2006-01-02")
    
    // Get user statistics
    s.db.Raw(`
        SELECT 
            COUNT(DISTINCT id) as total_users,
            COUNT(DISTINCT CASE WHEN DATE(last_login) = ? THEN id END) as active_today,
            COUNT(DISTINCT CASE WHEN DATE(last_login) >= ? THEN id END) as active_this_week,
            COUNT(DISTINCT CASE WHEN DATE(last_login) >= ? THEN id END) as active_this_month,
            COUNT(DISTINCT CASE WHEN DATE(created_at) = ? THEN id END) as new_users_today
        FROM users
    `, today, weekAgo, monthAgo, today).Scan(&stats)
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(stats)
}
