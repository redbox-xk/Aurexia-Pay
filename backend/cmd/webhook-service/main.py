"""
Aurexia Webhook Service
Handles event delivery and retry logic for webhook notifications
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import asyncio
import httpx
import logging
from datetime import datetime, timedelta
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aurexia Webhook Service", version="1.0.0")

class EventType(str, Enum):
    PAYMENT_CREATED = "payment.created"
    PAYMENT_SUCCEEDED = "payment.succeeded"
    PAYMENT_FAILED = "payment.failed"
    REFUND_CREATED = "refund.created"
    SETTLEMENT_COMPLETED = "settlement.completed"
    MERCHANT_VERIFIED = "merchant.verified"

class WebhookEvent(BaseModel):
    event_type: EventType
    data: Dict[str, Any]
    timestamp: Optional[str] = None
    idempotency_key: Optional[str] = None

class WebhookEndpoint(BaseModel):
    url: str
    active: bool = True
    events: List[EventType]
    secret: Optional[str] = None

class WebhookDelivery(BaseModel):
    id: str
    webhook_id: str
    event_type: str
    url: str
    payload: Dict[str, Any]
    status: str  # pending, delivered, failed
    attempts: int = 0
    last_error: Optional[str] = None
    created_at: str
    next_retry: Optional[str] = None

# In-memory storage
webhooks_db: Dict[str, WebhookEndpoint] = {}
deliveries_db: Dict[str, WebhookDelivery] = {}
events_db: List[Dict[str, Any]] = []

# Configuration
MAX_RETRIES = 5
RETRY_DELAYS = [60, 300, 900, 3600, 86400]  # 1m, 5m, 15m, 1h, 1d

def calculate_signature(payload: str, secret: str) -> str:
    """Calculate HMAC signature for webhook payload"""
    import hmac
    import hashlib
    return hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

@app.get("/healthz")
async def health_check():
    return {
        "status": "healthy",
        "service": "Aurexia Webhook Service",
        "timestamp": datetime.utcnow().isoformat()
    }

# Webhook Management
@app.post("/api/v1/webhooks")
async def create_webhook(endpoint: str, merchant_id: str, events: List[str]):
    """Create a new webhook endpoint"""
    webhook_id = f"wh_{uuid.uuid4().hex[:24]}"
    secret = f"whsec_{uuid.uuid4().hex[:32]}"
    
    webhook = WebhookEndpoint(
        url=endpoint,
        events=[EventType[e.upper()] for e in events if e.upper() in EventType.__members__],
        secret=secret,
        active=True
    )
    
    webhooks_db[webhook_id] = webhook
    
    logger.info(f"Webhook created: {webhook_id} | URL: {endpoint}")
    
    return {
        "success": True,
        "data": {
            "webhook_id": webhook_id,
            "secret": secret,
            "url": endpoint,
            "events": [e.value for e in webhook.events]
        }
    }

@app.get("/api/v1/webhooks/{webhook_id}")
async def get_webhook(webhook_id: str):
    """Get webhook details"""
    if webhook_id not in webhooks_db:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    webhook = webhooks_db[webhook_id]
    return {
        "success": True,
        "data": {
            "webhook_id": webhook_id,
            "url": webhook.url,
            "active": webhook.active,
            "events": [e.value for e in webhook.events]
        }
    }

@app.delete("/api/v1/webhooks/{webhook_id}")
async def delete_webhook(webhook_id: str):
    """Delete a webhook"""
    if webhook_id not in webhooks_db:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    del webhooks_db[webhook_id]
    logger.info(f"Webhook deleted: {webhook_id}")
    
    return {"success": True, "message": "Webhook deleted"}

# Event Delivery
@app.post("/api/v1/events")
async def emit_event(event: WebhookEvent, background_tasks: BackgroundTasks):
    """Emit an event and deliver to webhooks"""
    if not event.timestamp:
        event.timestamp = datetime.utcnow().isoformat()
    
    if not event.idempotency_key:
        event.idempotency_key = str(uuid.uuid4())
    
    # Store event
    event_data = {
        "type": event.event_type.value,
        "data": event.data,
        "timestamp": event.timestamp,
        "idempotency_key": event.idempotency_key
    }
    events_db.append(event_data)
    
    # Find matching webhooks
    matching_webhooks = [
        (wh_id, wh) for wh_id, wh in webhooks_db.items()
        if wh.active and event.event_type in wh.events
    ]
    
    logger.info(f"Event {event.event_type.value} matched {len(matching_webhooks)} webhooks")
    
    # Schedule deliveries
    for webhook_id, webhook in matching_webhooks:
        delivery_id = f"del_{uuid.uuid4().hex[:24]}"
        delivery = WebhookDelivery(
            id=delivery_id,
            webhook_id=webhook_id,
            event_type=event.event_type.value,
            url=webhook.url,
            payload=event_data,
            status="pending",
            created_at=datetime.utcnow().isoformat()
        )
        deliveries_db[delivery_id] = delivery
        background_tasks.add_task(deliver_webhook, delivery_id)
    
    return {
        "success": True,
        "data": {
            "event_id": event.idempotency_key,
            "event_type": event.event_type.value,
            "deliveries": len(matching_webhooks)
        }
    }

async def deliver_webhook(delivery_id: str):
    """Deliver webhook with retry logic"""
    await asyncio.sleep(0.1)  # Small delay to ensure webhook is in DB
    
    if delivery_id not in deliveries_db:
        logger.error(f"Delivery not found: {delivery_id}")
        return
    
    delivery = deliveries_db[delivery_id]
    webhook = webhooks_db.get(delivery.webhook_id)
    
    if not webhook:
        logger.error(f"Webhook not found: {delivery.webhook_id}")
        delivery.status = "failed"
        delivery.last_error = "Webhook not found"
        return
    
    # Prepare payload
    payload = delivery.payload.copy()
    payload["delivery_id"] = delivery_id
    
    # Add signature if secret exists
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Aurexia-Webhooks/1.0"
    }
    
    if webhook.secret:
        import json
        payload_json = json.dumps(payload, sort_keys=True)
        signature = calculate_signature(payload_json, webhook.secret)
        headers["X-Aurexia-Signature"] = signature
        headers["X-Aurexia-Delivery-ID"] = delivery_id
    
    # Attempt delivery with retries
    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    delivery.url,
                    json=payload,
                    headers=headers
                )
                
                if response.status_code == 200:
                    delivery.status = "delivered"
                    delivery.attempts = attempt + 1
                    logger.info(f"Webhook delivered: {delivery_id} | Attempts: {attempt + 1}")
                    return
                else:
                    raise Exception(f"HTTP {response.status_code}")
        
        except Exception as error:
            delivery.last_error = str(error)
            delivery.attempts = attempt + 1
            
            if attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[attempt]
                next_retry = datetime.utcnow() + timedelta(seconds=delay)
                delivery.next_retry = next_retry.isoformat()
                delivery.status = "pending"
                logger.warning(f"Webhook delivery failed (attempt {attempt + 1}): {error} | Retry in {delay}s")
                await asyncio.sleep(delay)
            else:
                delivery.status = "failed"
                logger.error(f"Webhook delivery failed permanently: {delivery_id} | Error: {error}")

@app.get("/api/v1/deliveries/{delivery_id}")
async def get_delivery(delivery_id: str):
    """Get delivery status"""
    if delivery_id not in deliveries_db:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    delivery = deliveries_db[delivery_id]
    return {
        "success": True,
        "data": {
            "delivery_id": delivery.id,
            "webhook_id": delivery.webhook_id,
            "event_type": delivery.event_type,
            "status": delivery.status,
            "attempts": delivery.attempts,
            "last_error": delivery.last_error,
            "created_at": delivery.created_at,
            "next_retry": delivery.next_retry
        }
    }

# Analytics
@app.get("/api/v1/webhooks/stats")
async def webhook_stats():
    """Get webhook statistics"""
    total_deliveries = len(deliveries_db)
    delivered = sum(1 for d in deliveries_db.values() if d.status == "delivered")
    pending = sum(1 for d in deliveries_db.values() if d.status == "pending")
    failed = sum(1 for d in deliveries_db.values() if d.status == "failed")
    
    return {
        "success": True,
        "data": {
            "total_webhooks": len(webhooks_db),
            "active_webhooks": sum(1 for w in webhooks_db.values() if w.active),
            "total_deliveries": total_deliveries,
            "delivered": delivered,
            "pending": pending,
            "failed": failed,
            "success_rate": (delivered / total_deliveries * 100) if total_deliveries > 0 else 0
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
