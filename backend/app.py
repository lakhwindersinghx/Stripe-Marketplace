# from fastapi import FastAPI, Request, APIRouter , Header, HTTPException
# from pydantic import BaseModel
# from webhook_handler import handle_webhook # Assuming this file exists and is correct
# from fastapi.responses import JSONResponse
# from stripe_service import *
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager
# from firebase_config import db # Assuming firebase_config.py exists and sets up 'db'
# from firebase_admin import firestore
# import os
# from typing import Optional # Import Optional for Pydantic

# # Define lifespan context manager
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup logic
#     print("Starting up...")
#     # Print the DOMAIN environment variable for debugging
#     print(f"DOMAIN environment variable: {os.getenv('DOMAIN')}")
#     for route in app.routes:
#         print("Available routes:")
#         print(f"{route.path} -> {getattr(route, 'name', 'N/A')}")
#     yield # Control passes to the app
#     # Shutdown logic
#     print("Shutting down...")

# # Create FastAPI app with lifespan
# app = FastAPI(lifespan=lifespan)

# # Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"], # Your frontend URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Create router for API endpoints
# router = APIRouter()
# class CustomerRequest(BaseModel):
#     user_id: str
#     email: str
# class PaymentRequest(BaseModel):
   
#     amount: float
#     account_id: str
#     payment_method_id: Optional[str] = None
#     customer_id: str

# @app.get("/")
# async def root():
#     return {"message": "SO-Pay Backend is running"}

# @app.get("/accounts")
# async def list_accounts():
#     return list_connected_accounts()

# @router.post("/get-or-create-stripe-customer")
# async def get_or_create_stripe_customer_endpoint(data: CustomerRequest):
#     try:
#         print(f"[Request] Getting or creating customer for user_id: {data.user_id}, email: {data.email}")
#         customer = get_or_create_customer(data.user_id, data.email)
#         return {"customer_id": customer.id}
#     except stripe.error.StripeError as e:
#         print("[Stripe Error]", e)
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         print("[Unhandled Error]", e)
#         raise HTTPException(status_code=500, detail="Failed to get or create Stripe customer.")

# # Define the connected-accounts endpoint on the router
# @router.get("/connected-accounts")
# def get_connected_accounts():
#     try:
#         accounts = list_connected_accounts()
#         return {"accounts": accounts.data}
#     except Exception as e:
#         print(f"Error fetching connected accounts: {e}")
#         raise HTTPException(status_code=500, detail="Failed to fetch connected accounts")

# @router.get("/temps")
# async def get_temps():
#     temps_ref = db.collection("temps")
#     docs = temps_ref.stream()
#     return {"temps": [doc.to_dict() for doc in docs]}


# @router.post("/create-payment-intent")
# async def create_payment_endpoint(data: PaymentRequest):
#     try:
#         print("[Request] Creating PaymentIntent with:", data)
#         intent = create_payment_intent(
#             amount=int(data.amount * 100), # Convert to cents here, after validation
#             currency="cad",
#             connected_account_id=data.account_id,
#             customer_id=data.customer_id,
#             payment_method_id=data.payment_method_id, # Pass the optional payment_method_id
#         )
#         return {"client_secret": intent.client_secret, "status": intent.status}
#     except stripe.error.StripeError as e:
#         print("[Stripe Error]", e)
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         print("[Unhandled Error]", e)
#         raise HTTPException(status_code=400, detail="Unhandled error occurred.")

# @router.post("/create-setup-intent")
# async def create_setup_intent_endpoint():
#     """
#     Endpoint to create a SetupIntent for saving payment method details.
#     """
#     try:
#         print("[Request] Creating SetupIntent")
#         setup_intent = create_setup_intent()
#         return {"client_secret": setup_intent.client_secret}
#     except stripe.error.StripeError as e:
#         print("[Stripe Error]", e)
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         print("[Unhandled Error]", e)
#         raise HTTPException(status_code=400, detail="Unhandled error occurred.")

# # --- START CHANGE (MOVED from @app.post to @router.post) ---
# @router.post("/onboard") # Changed from @app.post to @router.post
# async def onboard_user(data: dict):
#     email = data["email"]
#     account = create_express_account(email)
#     # --- START CHANGE (passing refresh_url to create_account_link) ---
#     link = create_account_link(
#         account.id,
#         refresh_url=f"{os.getenv('DOMAIN')}/api/onboard", # Use /api/onboard for refresh
#         return_url=f"{os.getenv('DOMAIN')}/dashboard"
#     )
#     # --- END CHANGE ---
#     return {"url": link.url, "account_id": account.id}
# # --- END CHANGE ---

# @app.post("/pay")
# async def create_payment(data: dict):
#     # This endpoint seems redundant with /create-payment-intent,
#     # consider consolidating or clarifying its purpose.
#     amount = int(float(data["amount"]) * 100)
#     account_id = data["account_id"]
#     # This endpoint does not support payment_method_id, unlike create_payment_endpoint
#     intent = create_payment_intent(amount, "cad", account_id)
#     return {"client_secret": intent.client_secret}

# @app.get("/dashboard-login/{account_id}")
# async def get_dashboard_login(account_id: str):
#     try:
#         login_link = create_express_login_link(account_id)
#         return {"url": login_link.url}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# #simple webhook to listen to backend events
# @app.post("/webhook")
# async def stripe_webhook(
#     request: Request,
#     stripe_signature: str = Header(None, alias="stripe-signature")):
#     payload = await request.body()
#     try:
#         return handle_webhook(request, payload, stripe_signature)
#     except HTTPException as e:
#         return JSONResponse(status_code=400, content={"error": str(e.detail)})

# class TempProfile(BaseModel):
#     account_id: str
#     name: str
#     city: str
#     profession: str
#     available: bool = True

# @router.post("/register-temp")
# def register_temp(temp: TempProfile):
#     doc_ref = db.collection("temps").document(temp.account_id)
#     doc_ref.set(temp.dict())
#     return {"status": "success", "message": "Temp registered successfully"}

# # Include the router with /api prefix
# app.include_router(router, prefix="/api")

# # Add a test endpoint to verify CORS
# @app.get("/api/test-cors")
# async def test_cors():
#     return {"message": "CORS is working!", "timestamp": "2025-01-25"}
from fastapi import FastAPI, Request, APIRouter, Header, HTTPException
from pydantic import BaseModel
from webhook_handler import handle_webhook
from fastapi.responses import JSONResponse
from stripe_service import (
    create_express_account,
    create_account_link,
    get_or_create_customer,
    attach_payment_method_to_customer, # Ensure this is imported
    create_payment_intent,
    create_setup_intent,
    create_express_login_link,
    list_connected_accounts,
)
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from firebase_config import db
from firebase_admin import firestore
import os
from typing import Optional

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    print(f"DOMAIN environment variable: {os.getenv('DOMAIN')}")
    for route in app.routes:
        print("Available routes:")
        print(f"{route.path} -> {getattr(route, 'name', 'N/A')}")
    yield
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

class PaymentRequest(BaseModel):
    amount: float
    account_id: str
    payment_method_id: Optional[str] = None
    customer_id: str

class CustomerRequest(BaseModel):
    user_id: str
    email: str

# New Pydantic model for attaching payment method
class AttachPaymentMethodRequest(BaseModel):
    payment_method_id: str
    customer_id: str

@app.get("/")
async def root():
    return {"message": "SO-Pay Backend is running"}

@app.get("/accounts")
async def list_accounts():
    return list_connected_accounts()

@router.get("/connected-accounts")
def get_connected_accounts():
    try:
        accounts = list_connected_accounts()
        return {"accounts": accounts.data}
    except Exception as e:
        print(f"Error fetching connected accounts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch connected accounts")

@router.get("/temps")
async def get_temps():
    temps_ref = db.collection("temps")
    docs = temps_ref.stream()
    return {"temps": [doc.to_dict() for doc in docs]}

@router.post("/create-payment-intent")
async def create_payment_endpoint(data: PaymentRequest):
    try:
        print("[Request] Creating PaymentIntent with:", data)
        intent = create_payment_intent(
            amount=int(data.amount * 100),
            currency="cad",
            connected_account_id=data.account_id,
            customer_id=data.customer_id,
            payment_method_id=data.payment_method_id,
        )
        return {"client_secret": intent.client_secret, "status": intent.status}
    except stripe.error.StripeError as e:
        print("[Stripe Error]", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("[Unhandled Error]", e)
        raise HTTPException(status_code=400, detail="Unhandled error occurred.")

@router.post("/create-setup-intent")
async def create_setup_intent_endpoint(data: Optional[dict] = None): # Make data optional for now, or expect customer_id
    """
    Endpoint to create a SetupIntent for saving payment method details.
    Can optionally receive customer_id to associate the SetupIntent.
    """
    try:
        print("[Request] Creating SetupIntent")
        customer_id = data.get("customer_id") if data else None
        setup_intent = create_setup_intent(customer_id=customer_id) # Pass customer_id to service function
        return {"client_secret": setup_intent.client_secret}
    except stripe.error.StripeError as e:
        print("[Stripe Error]", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("[Unhandled Error]", e)
        raise HTTPException(status_code=400, detail="Unhandled error occurred.")

@router.post("/get-or-create-stripe-customer")
async def get_or_create_stripe_customer_endpoint(data: CustomerRequest):
    try:
        print(f"[Request] Getting or creating customer for user_id: {data.user_id}, email: {data.email}")
        customer = get_or_create_customer(data.user_id, data.email)
        return {"customer_id": customer.id}
    except stripe.error.StripeError as e:
        print("[Stripe Error]", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("[Unhandled Error]", e)
        raise HTTPException(status_code=500, detail="Failed to get or create Stripe customer.")

# NEW ENDPOINT: Attach Payment Method to Customer
@router.post("/attach-payment-method")
async def attach_payment_method_endpoint(data: AttachPaymentMethodRequest):
    try:
        print(f"[Request] Attaching PaymentMethod {data.payment_method_id} to Customer {data.customer_id}")
        attached_pm = attach_payment_method_to_customer(data.payment_method_id, data.customer_id)
        return {"status": "success", "payment_method_id": attached_pm.id}
    except stripe.error.StripeError as e:
        print("[Stripe Error]", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("[Unhandled Error]", e)
        raise HTTPException(status_code=500, detail="Failed to attach payment method.")

@router.post("/onboard")
async def onboard_user(data: dict):
    email = data["email"]
    account = create_express_account(email)
    link = create_account_link(
        account.id,
        refresh_url=f"{os.getenv('DOMAIN')}/api/onboard",
        return_url=f"{os.getenv('DOMAIN')}/dashboard"
    )
    return {"url": link.url, "account_id": account.id}

@app.post("/pay")
async def create_payment(data: dict):
    amount = int(float(data["amount"]) * 100)
    account_id = data["account_id"]
    # This endpoint does not support payment_method_id, unlike create_payment_endpoint
    # It also doesn't support customer_id, which create_payment_intent now requires.
    # Consider consolidating this with /api/create-payment-intent or updating it.
    # This call will now fail if customer_id is not provided.
    # You need to decide how to get customer_id here or remove this endpoint.
    intent = create_payment_intent(amount, "cad", account_id)
    return {"client_secret": intent.client_secret}

@app.get("/dashboard-login/{account_id}")
async def get_dashboard_login(account_id: str):
    try:
        login_link = create_express_login_link(account_id)
        return {"url": login_link.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature")):
    payload = await request.body()
    try:
        return handle_webhook(request, payload, stripe_signature)
    except HTTPException as e:
        return JSONResponse(status_code=400, content={"error": str(e.detail)})

class TempProfile(BaseModel):
    account_id: str
    name: str
    city: str
    profession: str
    available: bool = True

@router.post("/register-temp")
def register_temp(temp: TempProfile):
    doc_ref = db.collection("temps").document(temp.account_id)
    doc_ref.set(temp.dict())
    return {"status": "success", "message": "Temp registered successfully"}

app.include_router(router, prefix="/api")

@app.get("/api/test-cors")
async def test_cors():
    return {"message": "CORS is working!", "timestamp": "2025-01-25"}
