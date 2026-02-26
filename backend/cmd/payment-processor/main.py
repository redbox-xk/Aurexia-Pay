"""
Aurexia Payment Processor - FastAPI Backend
Handles payment processing, settlement, and webhooks
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
import asyncio
import logging
from datetime import datetime, timedelta
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aurexia Payment Processor", version="1.0.0")

# Enums
class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"

class RefundStatus(str, Enum):
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"

# Data Models
class PaymentRequest(BaseModel):
    merchant_id: str
    amount: int
    currency: str = "AURX"
    description: Optional[str] = None
    customer_email: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PaymentConfirmRequest(BaseModel):
    payment_id: str
    payer_address: str
    transaction_hash: str

class WebhookPayload(BaseModel):
    event: str
    data: Dict[str, Any]

# In-memory storage (in production, use database)
payments_db: Dict[str, Dict] = {}
webhooks_db: Dict[str, Dict] = {}
settlements: Dict[str, Dict] = {}

# Stripe-like Fee Structure
BASE_FEE_PERCENT = 0.29  # 0.29%
FIXED_FEE_WEI = 500000000000000  # $0.005 in wei
MIN_SETTLEMENT_AMOUNT = 1000 * 10**18  # 1000 AURX

def calculate_fees(amount: int) -> Dict[str, int]:
    """Calculate processing fees (Stripe-like)"""
    fee = int(amount * (BASE_FEE_PERCENT / 100)) + FIXED_FEE_WEI
    return {
        "fee_amount": fee,
        "settlement_amount": amount - fee,
        "fee_percent": BASE_FEE_PERCENT
    }

# Health Check
@app.get("/healthz")
async def health_check():
    return {
        "status": "healthy",
        "service": "Aurexia Payment Processor",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# Payment Intent Creation (Stripe-like)
@app.post("/api/v1/payments")
async def create_payment_intent(request: PaymentRequest):
    """Create a payment intent"""
    try:
        payment_id = f"pi_{uuid.uuid4().hex[:24]}"
        client_secret = f"{payment_id}_secret_{uuid.uuid4().hex[:32]}"
        
        # Calculate fees
        fees = calculate_fees(request.amount)
        
        payment_data = {
            "id": payment_id,
            "merchant_id": request.merchant_id,
            "amount": request.amount,
            "currency": request.currency,
            "description": request.description,
            "customer_email": request.customer_email,
            "status": PaymentStatus.PENDING.value,
            "client_secret": client_secret,
            "created": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
            "fees": fees,
            "metadata": request.metadata or {}
        }
        
        payments_db[payment_id] = payment_data
        
        logger.info(f"Payment intent created: {payment_id} | Amount: {request.amount} {request.currency}")
        
        return {
            "success": True,
            "data": {
                "id": payment_id,
                "client_secret": client_secret,
                "amount": request.amount,
                "currency": request.currency,
                "status": PaymentStatus.PENDING.value,
                "created": payment_data["created"],
                "fees": fees
            }
        }
    except Exception as e:
        logger.error(f"Error creating payment: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Get Payment Status
@app.get("/api/v1/payments/{payment_id}")
async def get_payment(payment_id: str):
    """Get payment details"""
    if payment_id not in payments_db:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment = payments_db[payment_id]
    return {
        "success": True,
        "data": payment
    }

# Confirm Payment (after blockchain confirmation)
@app.post("/api/v1/payments/{payment_id}/confirm")
async def confirm_payment(payment_id: str, request: PaymentConfirmRequest, background_tasks: BackgroundTasks):
    """Confirm payment after blockchain transaction"""
    if payment_id not in payments_db:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment = payments_db[payment_id]
    
    if payment["status"] != PaymentStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Payment already processed")
    
    # Update status
    payment["status"] = PaymentStatus.PROCESSING.value
    payment["transaction_hash"] = request.transaction_hash
    payment["payer_address"] = request.payer_address
    
    # Process settlement in background
    background_tasks.add_task(process_settlement, payment_id)
    
    logger.info(f"Payment confirmed: {payment_id} | TX: {request.transaction_hash}")
    
    return {
        "success": True,
        "data": {
            "id": payment_id,
            "status": PaymentStatus.PROCESSING.value,
            "message": "Payment is being processed"
        }
    }

async def process_settlement(payment_id: str):
    """Process payment settlement (background task)"""
    await asyncio.sleep(2)  # Simulate blockchain confirmation time
    
    payment = payments_db[payment_id]
    merchant_id = payment["merchant_id"]
    settlement_amount = payment["fees"]["settlement_amount"]
    
    # Record settlement
    settlement_id = f"st_{uuid.uuid4().hex[:24]}"
    settlements[settlement_id] = {
        "id": settlement_id,
        "payment_id": payment_id,
        "merchant_id": merchant_id,
        "amount": settlement_amount,
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Update payment status
    payment["status"] = PaymentStatus.SUCCEEDED.value
    payment["settlement_id"] = settlement_id
    
    logger.info(f"Payment settled: {payment_id} | Settlement: {settlement_id} | Amount: {settlement_amount}")
    
    # Trigger webhook
    await trigger_webhook(payment_id, "payment.succeeded", payment)

# Refund Endpoint
@app.post("/api/v1/payments/{payment_id}/refund")
async def refund_payment(payment_id: str, amount: Optional[int] = None):
    """Refund a payment"""
    if payment_id not in payments_db:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment = payments_db[payment_id]
    
    if payment["status"] != PaymentStatus.SUCCEEDED.value:
        raise HTTPException(status_code=400, detail="Only succeeded payments can be refunded")
    
    refund_amount = amount or payment["amount"]
    
    refund_data = {
        "id": f"rf_{uuid.uuid4().hex[:24]}",
        "payment_id": payment_id,
        "amount": refund_amount,
        "status": RefundStatus.SUCCEEDED.value,
        "created": datetime.utcnow().isoformat()
    }
    
    logger.info(f"Payment refunded: {payment_id} | Amount: {refund_amount}")
    
    return {
        "success": True,
        "data": refund_data
    }

# Merchant Settlements
@app.get("/api/v1/merchants/{merchant_id}/settlements")
async def get_merchant_settlements(merchant_id: str):
    """Get merchant settlements"""
    merchant_settlements = [s for s in settlements.values() if s["merchant_id"] == merchant_id]
    
    total_settled = sum(s["amount"] for s in merchant_settlements if s["status"] == "completed")
    
    return {
        "success": True,
        "data": {
            "merchant_id": merchant_id,
            "total_settled": total_settled,
            "settlements": merchant_settlements,
            "count": len(merchant_settlements)
        }
    }

# Webhook Management
@app.post("/api/v1/webhooks/register")
async def register_webhook(merchant_id: str, url: str):
    """Register webhook for merchant"""
    webhook_id = f"wh_{uuid.uuid4().hex[:24]}"
    webhooks_db[webhook_id] = {
        "id": webhook_id,
        "merchant_id": merchant_id,
        "url": url,
        "created": datetime.utcnow().isoformat(),
        "active": True
    }
    
    logger.info(f"Webhook registered: {webhook_id} | Merchant: {merchant_id}")
    
    return {
        "success": True,
        "data": {"webhook_id": webhook_id}
    }

async def trigger_webhook(payment_id: str, event: str, data: Dict):
    """Trigger webhooks for a payment event"""
    payment = data
    merchant_id = payment["merchant_id"]
    
    # Find webhooks for this merchant
    merchant_webhooks = [w for w in webhooks_db.values() 
                        if w["merchant_id"] == merchant_id and w["active"]]
    
    for webhook in merchant_webhooks:
        # In production, make actual HTTP POST request
        logger.info(f"Webhook triggered: {webhook['url']} | Event: {event}")

# Analytics
@app.get("/api/v1/analytics")
async def get_analytics():
    """Get platform analytics"""
    total_payments = len(payments_db)
    succeeded_payments = sum(1 for p in payments_db.values() if p["status"] == PaymentStatus.SUCCEEDED.value)
    total_volume = sum(p["amount"] for p in payments_db.values() if p["status"] == PaymentStatus.SUCCEEDED.value)
    total_fees = sum(p["fees"]["fee_amount"] for p in payments_db.values() if p["status"] == PaymentStatus.SUCCEEDED.value)
    
    return {
        "success": True,
        "data": {
            "total_payments": total_payments,
            "succeeded_payments": succeeded_payments,
            "total_volume": total_volume,
            "total_fees": total_fees,
            "success_rate": (succeeded_payments / total_payments * 100) if total_payments > 0 else 0,
            "average_fee_percent": BASE_FEE_PERCENT
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
