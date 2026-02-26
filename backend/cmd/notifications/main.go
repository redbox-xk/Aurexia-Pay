package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
)

// Notification types
type NotificationType string

const (
	PaymentCreated        NotificationType = "payment.created"
	PaymentSucceeded      NotificationType = "payment.succeeded"
	PaymentFailed         NotificationType = "payment.failed"
	RefundCreated         NotificationType = "refund.created"
	SettlementCompleted   NotificationType = "settlement.completed"
	MerchantVerified      NotificationType = "merchant.verified"
	MerchantSuspended     NotificationType = "merchant.suspended"
	ValidatorSlashed      NotificationType = "validator.slashed"
)

// Notification represents a system notification
type Notification struct {
	ID        string                 `json:"id"`
	Type      NotificationType       `json:"type"`
	Recipient string                 `json:"recipient"`
	Title     string                 `json:"title"`
	Message   string                 `json:"message"`
	Data      map[string]interface{} `json:"data"`
	Status    string                 `json:"status"` // unread, read, archived
	CreatedAt time.Time              `json:"created_at"`
	ReadAt    *time.Time             `json:"read_at,omitempty"`
}

// NotificationChannel represents a delivery channel
type NotificationChannel string

const (
	EmailChannel     NotificationChannel = "email"
	SMSChannel       NotificationChannel = "sms"
	PushChannel      NotificationChannel = "push"
	InAppChannel     NotificationChannel = "in_app"
	WebhookChannel   NotificationChannel = "webhook"
)

// In-memory storage
var (
	notifications   = make(map[string][]Notification)
	notificationLog = make([]Notification, 0)
)

// Health check
func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "healthy",
		"service": "Aurexia Notification Service",
		"version": "1.0.0",
	})
}

// Create notification
func createNotification(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Type      NotificationType       `json:"type"`
		Recipient string                 `json:"recipient"`
		Title     string                 `json:"title"`
		Message   string                 `json:"message"`
		Data      map[string]interface{} `json:"data"`
		Channels  []NotificationChannel  `json:"channels"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Create notification
	notif := Notification{
		ID:        generateID(),
		Type:      req.Type,
		Recipient: req.Recipient,
		Title:     req.Title,
		Message:   req.Message,
		Data:      req.Data,
		Status:    "unread",
		CreatedAt: time.Now(),
	}

	// Store notification
	notifications[req.Recipient] = append(notifications[req.Recipient], notif)
	notificationLog = append(notificationLog, notif)

	// Send through channels
	for _, channel := range req.Channels {
		go sendNotification(&notif, channel)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"notification_id": notif.ID,
			"status":          "created",
		},
	})
}

// Get notifications for user
func getNotifications(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	recipientID := vars["recipient_id"]

	userNotifications := notifications[recipientID]

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"notifications": userNotifications,
			"count":         len(userNotifications),
		},
	})
}

// Mark notification as read
func markAsRead(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	notificationID := vars["notification_id"]

	// Find and update notification
	for recipient, notifs := range notifications {
		for i, notif := range notifs {
			if notif.ID == notificationID {
				now := time.Now()
				notifications[recipient][i].Status = "read"
				notifications[recipient][i].ReadAt = &now
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(map[string]interface{}{
					"success": true,
					"message": "Notification marked as read",
				})
				return
			}
		}
	}

	http.Error(w, "Notification not found", http.StatusNotFound)
}

// Get unread count
func getUnreadCount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	recipientID := vars["recipient_id"]

	userNotifications := notifications[recipientID]
	unreadCount := 0

	for _, notif := range userNotifications {
		if notif.Status == "unread" {
			unreadCount++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"unread_count": unreadCount,
			"total_count":  len(userNotifications),
		},
	})
}

// Get notification preferences
func getPreferences(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	recipientID := vars["recipient_id"]

	preferences := map[string]interface{}{
		"recipient_id": recipientID,
		"email_enabled": true,
		"push_enabled": true,
		"sms_enabled": false,
		"notification_types": map[string]bool{
			"payment.created":       true,
			"payment.succeeded":     true,
			"payment.failed":        true,
			"settlement.completed":  true,
			"merchant.verified":     true,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    preferences,
	})
}

// Update notification preferences
func updatePreferences(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	recipientID := vars["recipient_id"]

	var preferences map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&preferences); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// In production, save preferences to database
	log.Printf("Updated preferences for %s: %v", recipientID, preferences)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Preferences updated",
	})
}

// Send notification through channel
func sendNotification(notif *Notification, channel NotificationChannel) {
	switch channel {
	case EmailChannel:
		sendEmail(notif)
	case SMSChannel:
		sendSMS(notif)
	case PushChannel:
		sendPush(notif)
	case InAppChannel:
		// Already stored in notifications map
		log.Printf("In-app notification created: %s", notif.ID)
	case WebhookChannel:
		sendWebhook(notif)
	}
}

// Send email notification
func sendEmail(notif *Notification) {
	log.Printf("Sending email to %s: %s", notif.Recipient, notif.Title)
	// TODO: Integrate with email service (SendGrid, AWS SES, etc.)
}

// Send SMS notification
func sendSMS(notif *Notification) {
	log.Printf("Sending SMS to %s: %s", notif.Recipient, notif.Message)
	// TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
}

// Send push notification
func sendPush(notif *Notification) {
	log.Printf("Sending push notification to %s: %s", notif.Recipient, notif.Title)
	// TODO: Integrate with push service (Firebase, OneSignal, etc.)
}

// Send webhook notification
func sendWebhook(notif *Notification) {
	log.Printf("Sending webhook notification for %s", notif.Type)
	// TODO: Send webhook to registered endpoints
}

// Get analytics
func getAnalytics(w http.ResponseWriter, r *http.Request) {
	var totalSent, totalRead, totalUnread int64
	var byType = make(map[string]int64)

	for _, notifs := range notifications {
		for _, notif := range notifs {
			totalSent++
			if notif.Status == "read" {
				totalRead++
			} else if notif.Status == "unread" {
				totalUnread++
			}
			byType[string(notif.Type)]++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"total_notifications": totalSent,
			"total_read":         totalRead,
			"total_unread":       totalUnread,
			"by_type":            byType,
		},
	})
}

// Generate unique ID
func generateID() string {
	return fmt.Sprintf("notif_%d", time.Now().UnixNano())
}

func main() {
	port := flag.String("port", ":8003", "Port to listen on")
	flag.Parse()

	router := mux.NewRouter()

	// Health check
	router.HandleFunc("/healthz", healthCheck).Methods("GET")

	// Notification management
	router.HandleFunc("/api/v1/notifications", createNotification).Methods("POST")
	router.HandleFunc("/api/v1/users/{recipient_id}/notifications", getNotifications).Methods("GET")
	router.HandleFunc("/api/v1/notifications/{notification_id}/read", markAsRead).Methods("POST")
	router.HandleFunc("/api/v1/users/{recipient_id}/notifications/unread", getUnreadCount).Methods("GET")

	// Preferences
	router.HandleFunc("/api/v1/users/{recipient_id}/notification-preferences", getPreferences).Methods("GET")
	router.HandleFunc("/api/v1/users/{recipient_id}/notification-preferences", updatePreferences).Methods("PUT")

	// Analytics
	router.HandleFunc("/api/v1/notifications/analytics", getAnalytics).Methods("GET")

	server := &http.Server{
		Addr:    *port,
		Handler: router,
	}

	log.Printf("Aurexia Notification Service listening on %s", *port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
