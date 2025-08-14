from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import os
import json
import logging
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth, firestore
import hmac
import hashlib
import base64
from pydantic import BaseModel, EmailStr
import requests
import uuid

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lotaya AI API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/lotaya_ai")
client = MongoClient(MONGO_URL)
db = client.lotaya_ai

# Collections
users_collection = db.users
transactions_collection = db.transactions
payments_collection = db.payments

# Firebase Configuration
try:
    firebase_config = {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
        "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    }
    
    if not firebase_admin._apps:
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)
    
    firebase_db = firestore.client()
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.warning(f"Firebase initialization failed: {e}")
    firebase_db = None

# Security
security = HTTPBearer()

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    firebase_uid: str

class CreditTopUp(BaseModel):
    amount: int
    payment_method: str = "myanmar_pgw"

class CreditDeduction(BaseModel):
    amount: int
    service: str
    description: str

class PaymentCallback(BaseModel):
    merchant_user_id: str
    request_id: str
    payment_method: str
    amount: float
    currency: str
    invoice_no: str
    transaction_reference_number: str
    transaction_id: str
    resp_code: str
    resp_description: str
    signature: str

# Myanmar Payment Gateway Configuration
PGW_CONFIG = {
    'merchant_user_id': os.getenv('PGW_MERCHANT_USER_ID'),
    'channel': os.getenv('PGW_CHANNEL'),
    'access_key': os.getenv('PGW_ACCESS_KEY'),
    'secret_key': os.getenv('PGW_SECRET_KEY'),
    'env': os.getenv('PGW_ENV', 'UAT')
}

PGW_URLS = {
    'UAT': 'https://uatpgw.transactease.com.mm',
    'PRODUCTION': 'https://pgw.transactease.com.mm'
}

def compute_hmac_sha256(plain_text: str, secret_key: str) -> str:
    """Compute HMAC SHA256 signature"""
    return base64.b64encode(
        hmac.new(secret_key.encode(), plain_text.encode(), hashlib.sha256).digest()
    ).decode()

def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Firebase token and return user info"""
    try:
        if not firebase_db:
            raise HTTPException(status_code=503, detail="Firebase not available")
        
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "mongodb": "connected" if client.admin.command('ping') else "disconnected",
            "firebase": "connected" if firebase_db else "disconnected"
        }
    }

@app.post("/api/auth/register")
async def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = users_collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user document
        user_doc = {
            "user_id": str(uuid.uuid4()),
            "name": user_data.name,
            "email": user_data.email,
            "firebase_uid": user_data.firebase_uid,
            "credits": 100,  # Welcome credits
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_active": True
        }
        
        # Insert into MongoDB
        result = users_collection.insert_one(user_doc)
        
        # Create welcome transaction
        welcome_transaction = {
            "transaction_id": str(uuid.uuid4()),
            "user_id": user_doc["user_id"],
            "type": "credit",
            "amount": 100,
            "description": "Welcome bonus credits",
            "service": "registration",
            "status": "completed",
            "created_at": datetime.now(timezone.utc)
        }
        transactions_collection.insert_one(welcome_transaction)
        
        # Sync with Firebase Firestore
        if firebase_db:
            firebase_db.collection('users').document(user_data.firebase_uid).set({
                'user_id': user_doc["user_id"],
                'name': user_data.name,
                'email': user_data.email,
                'credits': 100,
                'created_at': firestore.SERVER_TIMESTAMP
            })
        
        return {
            "message": "User registered successfully",
            "user_id": user_doc["user_id"],
            "credits": 100
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.get("/api/user/profile")
async def get_user_profile(token_data = Depends(verify_firebase_token)):
    """Get user profile information"""
    try:
        user = users_collection.find_one({"firebase_uid": token_data["uid"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "credits": user["credits"],
            "created_at": user["created_at"],
            "is_active": user["is_active"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@app.get("/api/user/transactions")
async def get_user_transactions(
    limit: int = 20,
    offset: int = 0,
    token_data = Depends(verify_firebase_token)
):
    """Get user transaction history"""
    try:
        user = users_collection.find_one({"firebase_uid": token_data["uid"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        transactions = list(
            transactions_collection.find({"user_id": user["user_id"]})
            .sort("created_at", -1)
            .skip(offset)
            .limit(limit)
        )
        
        # Convert ObjectId to string and format dates
        for transaction in transactions:
            transaction["_id"] = str(transaction["_id"])
            if isinstance(transaction["created_at"], datetime):
                transaction["created_at"] = transaction["created_at"].isoformat()
        
        return {"transactions": transactions}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transactions fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")

@app.post("/api/credits/deduct")
async def deduct_credits(
    deduction: CreditDeduction,
    token_data = Depends(verify_firebase_token)
):
    """Deduct credits for AI service usage"""
    try:
        user = users_collection.find_one({"firebase_uid": token_data["uid"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user["credits"] < deduction.amount:
            raise HTTPException(status_code=400, detail="Insufficient credits")
        
        # Update user credits
        new_credits = user["credits"] - deduction.amount
        users_collection.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {
                    "credits": new_credits,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Create transaction record
        transaction = {
            "transaction_id": str(uuid.uuid4()),
            "user_id": user["user_id"],
            "type": "debit",
            "amount": deduction.amount,
            "description": deduction.description,
            "service": deduction.service,
            "status": "completed",
            "created_at": datetime.now(timezone.utc)
        }
        transactions_collection.insert_one(transaction)
        
        # Sync with Firebase
        if firebase_db:
            firebase_db.collection('users').document(token_data["uid"]).update({
                'credits': new_credits,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
        
        return {
            "message": "Credits deducted successfully",
            "remaining_credits": new_credits,
            "transaction_id": transaction["transaction_id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Credit deduction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to deduct credits")

@app.post("/api/payment/initiate")
async def initiate_payment(
    top_up: CreditTopUp,
    token_data = Depends(verify_firebase_token)
):
    """Initiate payment for credit top-up"""
    try:
        user = users_collection.find_one({"firebase_uid": token_data["uid"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate amount in MMK (1 credit = 100 MMK)
        amount_mmk = top_up.amount * 100
        
        # Generate payment request
        request_id = f"REQ{int(datetime.now().timestamp())}"
        invoice_no = f"INV{int(datetime.now().timestamp())}"
        
        payment_data = {
            'MerchantUserID': PGW_CONFIG['merchant_user_id'],
            'AccessKey': PGW_CONFIG['access_key'],
            'Channel': PGW_CONFIG['channel'],
            'RequestID': request_id,
            'PaymentMethod': 'uabpay,visa_master,mmqr',
            'Amount': float(amount_mmk),
            'Currency': 'MMK',
            'InvoiceNo': invoice_no,
            'BillToAddressLine1': '123 Main St',
            'BillToAddressLine2': 'Downtown',
            'BillToAddressCity': 'Yangon',
            'BillToAddressPostalCode': '11011',
            'BillToAddressState': 'Yangon',
            'BillToAddressCountry': 'MM',
            'BillToForename': user['name'].split()[0] if user['name'] else 'User',
            'BillToSurname': user['name'].split()[-1] if len(user['name'].split()) > 1 else 'Name',
            'BillToPhone': '09123456789',
            'BillToEmail': user['email'],
            'ExpiredInSeconds': 1800,  # 30 minutes
            'Remark': f'Credit top-up: {top_up.amount} credits',
            'SignedDateTime': datetime.now().isoformat().split('.')[0] + '+06:30'
        }
        
        # Create signature
        signing_string = '|'.join(str(value) for value in payment_data.values())
        signature = compute_hmac_sha256(signing_string, PGW_CONFIG['secret_key'])
        payment_data['Signature'] = signature
        
        # Store payment intent
        payment_intent = {
            "payment_id": str(uuid.uuid4()),
            "user_id": user["user_id"],
            "request_id": request_id,
            "invoice_no": invoice_no,
            "amount_credits": top_up.amount,
            "amount_mmk": amount_mmk,
            "status": "pending",
            "payment_method": top_up.payment_method,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=30)
        }
        payments_collection.insert_one(payment_intent)
        
        # Return payment URL and form data
        payment_url = f"{PGW_URLS[PGW_CONFIG['env']]}/payment/request"
        
        return {
            "payment_url": payment_url,
            "form_data": payment_data,
            "payment_id": payment_intent["payment_id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment initiation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate payment")

@app.post("/api/payment/callback")
async def payment_callback(callback_data: PaymentCallback):
    """Handle payment gateway callback"""
    try:
        # Verify signature
        fields_to_sign = [
            callback_data.merchant_user_id,
            callback_data.request_id,
            callback_data.payment_method,
            str(callback_data.amount),
            callback_data.currency,
            callback_data.invoice_no,
            callback_data.transaction_reference_number,
            callback_data.transaction_id,
            callback_data.resp_code,
            callback_data.resp_description
        ]
        
        signing_string = '|'.join(fields_to_sign)
        computed_signature = compute_hmac_sha256(signing_string, PGW_CONFIG['secret_key'])
        
        if computed_signature != callback_data.signature:
            logger.error("Invalid payment callback signature")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Find payment intent
        payment_intent = payments_collection.find_one({"request_id": callback_data.request_id})
        if not payment_intent:
            raise HTTPException(status_code=404, detail="Payment intent not found")
        
        # Update payment status
        payment_update = {
            "status": "completed" if callback_data.resp_code == "000" else "failed",
            "transaction_id": callback_data.transaction_id,
            "transaction_reference": callback_data.transaction_reference_number,
            "resp_code": callback_data.resp_code,
            "resp_description": callback_data.resp_description,
            "updated_at": datetime.now(timezone.utc)
        }
        
        payments_collection.update_one(
            {"payment_id": payment_intent["payment_id"]},
            {"$set": payment_update}
        )
        
        # If payment successful, add credits
        if callback_data.resp_code == "000":
            # Update user credits
            users_collection.update_one(
                {"user_id": payment_intent["user_id"]},
                {
                    "$inc": {"credits": payment_intent["amount_credits"]},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
            
            # Create credit transaction
            credit_transaction = {
                "transaction_id": str(uuid.uuid4()),
                "user_id": payment_intent["user_id"],
                "type": "credit",
                "amount": payment_intent["amount_credits"],
                "description": f"Credit top-up via {callback_data.payment_method}",
                "service": "payment",
                "status": "completed",
                "payment_id": payment_intent["payment_id"],
                "created_at": datetime.now(timezone.utc)
            }
            transactions_collection.insert_one(credit_transaction)
            
            logger.info(f"Payment successful: {callback_data.transaction_id}")
        else:
            logger.warning(f"Payment failed: {callback_data.resp_description}")
        
        return {"status": "ok"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment callback error: {e}")
        raise HTTPException(status_code=500, detail="Payment callback processing failed")

@app.get("/api/payment/status/{payment_id}")
async def get_payment_status(
    payment_id: str,
    token_data = Depends(verify_firebase_token)
):
    """Get payment status"""
    try:
        user = users_collection.find_one({"firebase_uid": token_data["uid"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        payment = payments_collection.find_one({
            "payment_id": payment_id,
            "user_id": user["user_id"]
        })
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Convert ObjectId and datetime
        payment["_id"] = str(payment["_id"])
        if isinstance(payment["created_at"], datetime):
            payment["created_at"] = payment["created_at"].isoformat()
        if payment.get("updated_at") and isinstance(payment["updated_at"], datetime):
            payment["updated_at"] = payment["updated_at"].isoformat()
        if payment.get("expires_at") and isinstance(payment["expires_at"], datetime):
            payment["expires_at"] = payment["expires_at"].isoformat()
        
        return {"payment": payment}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payment status")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)