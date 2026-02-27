package utils

import (
    "log"
    "os"
    
    "github.com/go-redis/redis/v8"
    "github.com/spf13/viper"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

type Config struct {
    ServerPort string
    DBHost     string
    DBPort     string
    DBUser     string
    DBPassword string
    DBName     string
    RedisHost  string
    RedisPort  string
    RedisPassword string
    JWTSecret  string
}

func LoadConfig() *Config {
    viper.SetConfigFile(".env")
    viper.AutomaticEnv()
    
    if err := viper.ReadInConfig(); err != nil {
        log.Printf("Error reading config file: %s", err)
    }
    
    return &Config{
        ServerPort:   getEnv("SERVER_PORT", "8080"),
        DBHost:       getEnv("DB_HOST", "localhost"),
        DBPort:       getEnv("DB_PORT", "5432"),
        DBUser:       getEnv("DB_USER", "aurexia"),
        DBPassword:   getEnv("DB_PASSWORD", "password"),
        DBName:       getEnv("DB_NAME", "aurexia"),
        RedisHost:    getEnv("REDIS_HOST", "localhost"),
        RedisPort:    getEnv("REDIS_PORT", "6379"),
        RedisPassword: getEnv("REDIS_PASSWORD", ""),
        JWTSecret:    getEnv("JWT_SECRET", "your-secret-key"),
    }
}

func getEnv(key, fallback string) string {
    if value, exists := os.LookupEnv(key); exists {
        return value
    }
    return fallback
}

func InitDatabase(config *Config) *gorm.DB {
    dsn := "host=" + config.DBHost + 
           " user=" + config.DBUser + 
           " password=" + config.DBPassword + 
           " dbname=" + config.DBName + 
           " port=" + config.DBPort + 
           " sslmode=disable TimeZone=UTC"
    
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    
    return db
}

func InitRedis(config *Config) *redis.Client {
    client := redis.NewClient(&redis.Options{
        Addr:     config.RedisHost + ":" + config.RedisPort,
        Password: config.RedisPassword,
        DB:       0,
    })
    
    return client
}
