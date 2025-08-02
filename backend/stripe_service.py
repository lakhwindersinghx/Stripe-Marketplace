
# # from dotenv import load_dotenv
# # import stripe
# # import os

# # load_dotenv()
# # stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# # def create_express_account(email: str):
# #     return stripe.Account.create(
# #         type="express",
# #         country="CA",
# #         email=email,
# #         capabilities={"transfers": {"requested": True}},
# #     )

# # # --- START CHANGE ---
# # def create_account_link(account_id: str, refresh_url: str, return_url: str):
# #     """
# #     Creates a Stripe Account Link for onboarding.
# #     Appends account_id to the return_url as a query parameter.
# #     """
# #     return stripe.AccountLink.create(
# #         account=account_id,
# #         refresh_url=refresh_url, # Now correctly accepted
# #         return_url=f"{return_url}?accountId={account_id}", # Appends accountId to the return URL
# #         type="account_onboarding"
# #     )
# # # --- END CHANGE ---

# # def create_payment_intent(amount: int, currency: str, connected_account_id: str, payment_method_id: str = None):
# #     """
# #     Creates a PaymentIntent. Can optionally confirm with a provided payment_method_id.
# #     """
# #     params = {
# #         "amount": amount,
# #         "currency": currency,
# #         "application_fee_amount": int(amount * 0.1),  # 10% platform fee
# #         "transfer_data": {"destination": connected_account_id},
# #     }
# #     if payment_method_id:
# #         params["payment_method"] = payment_method_id
# #         params["confirm"] = True  # Confirm immediately with the provided payment method
# #         params["off_session"] = True # For payments initiated without user present (e.g., using a saved card)
# #     return stripe.PaymentIntent.create(**params)

# # def create_setup_intent():
# #     """
# #     Creates a SetupIntent to collect and save payment method details for future use.
# #     """
# #     return stripe.SetupIntent.create(
# #         usage="off_session", # Allows saving card for future use without immediate charge
# #     )

# # def create_express_login_link(account_id: str):
# #     return stripe.Account.create_login_link(account_id)

# # def list_connected_accounts():
# #     return stripe.Account.list(limit=10)

# from dotenv import load_dotenv
# import stripe
# import os

# load_dotenv()
# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# def create_express_account(email: str):
#     return stripe.Account.create(
#         type="express",
#         country="CA",
#         email=email,
#         capabilities={"transfers": {"requested": True}},
#     )

# def create_account_link(account_id: str, refresh_url: str, return_url: str):
#     return stripe.AccountLink.create(
#         account=account_id,
#         refresh_url=refresh_url,
#         return_url=f"{return_url}?accountId={account_id}",
#         type="account_onboarding"
#     )

# def get_or_create_customer(user_id: str, email: str):
#     """
#     Retrieves a Stripe Customer by metadata (user_id) or creates a new one.
#     """
#     customers = stripe.Customer.list(limit=1, email=email) # Try to find by email first
#     if customers.data:
#         # If customer found by email, check if it has our user_id metadata
#         for customer in customers.data:
#             if customer.metadata.get("user_id") == user_id:
#                 print(f"Found existing customer: {customer.id}")
#                 return customer
    
#     # If not found by email or metadata, create a new one
#     print(f"Creating new customer for user_id: {user_id}")
#     customer = stripe.Customer.create(
#         email=email,
#         metadata={"user_id": user_id}
#     )
#     return customer

# def attach_payment_method_to_customer(payment_method_id: str, customer_id: str):
#     """
#     Attaches a PaymentMethod to a Customer.
#     """
#     print(f"Attaching PaymentMethod {payment_method_id} to Customer {customer_id}")
#     return stripe.PaymentMethod.attach(
#         payment_method_id,
#         customer=customer_id,
#     )


# def create_payment_intent(amount: int, currency: str, connected_account_id: str, customer_id: str, payment_method_id: str = None):
    
#     params = {
#         "amount": amount,
#         "currency": currency,
#         "application_fee_amount": int(amount * 0.1),  # 10% platform fee
#         "transfer_data": {"destination": connected_account_id},
#         "customer": customer_id, # Associate with the customer
#         "off_session": True # Required for payments initiated without user present (e.g., using a saved card)
#     }
#     if payment_method_id:
#         params["payment_method"] = payment_method_id
#         params["confirm"] = True  # Confirm immediately with the provided payment method
#     return stripe.PaymentIntent.create(**params)

# def create_setup_intent():
#     """
#     Creates a SetupIntent to collect and save payment method details for future use.
#     """
#     return stripe.SetupIntent.create(
#         usage="off_session", # Allows saving card for future use without immediate charge
#     )

# def create_express_login_link(account_id: str):
#     return stripe.Account.create_login_link(account_id)

# def list_connected_accounts():
#     return stripe.Account.list(limit=10)
from dotenv import load_dotenv
import stripe
import os

load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def create_express_account(email: str):
    return stripe.Account.create(
        type="express",
        country="CA",
        email=email,
        capabilities={"transfers": {"requested": True}},
    )

def create_account_link(account_id: str, refresh_url: str, return_url: str):
    return stripe.AccountLink.create(
        account=account_id,
        refresh_url=refresh_url,
        return_url=f"{return_url}?accountId={account_id}",
        type="account_onboarding"
    )

def get_or_create_customer(user_id: str, email: str):
    """
    Retrieves a Stripe Customer by metadata (user_id) or creates a new one.
    """
    customers = stripe.Customer.list(limit=1, email=email) # Try to find by email first
    if customers.data:
        # If customer found by email, check if it has our user_id metadata
        for customer in customers.data:
            if customer.metadata.get("user_id") == user_id:
                print(f"Found existing customer: {customer.id}")
                return customer
        # If not found by email or metadata, create a new one
    print(f"Creating new customer for user_id: {user_id}")
    customer = stripe.Customer.create(
        email=email,
        metadata={"user_id": user_id}
    )
    return customer

def attach_payment_method_to_customer(payment_method_id: str, customer_id: str):
    """
    Attaches a PaymentMethod to a Customer.
    """
    print(f"Attaching PaymentMethod {payment_method_id} to Customer {customer_id}")
    return stripe.PaymentMethod.attach(
        payment_method_id,
        customer=customer_id,
    )

def create_payment_intent(amount: int, currency: str, connected_account_id: str, customer_id: str, payment_method_id: str = None):
    """
    Creates a PaymentIntent. Requires customer_id for off_session payments.
    Can optionally confirm with a provided payment_method_id.
    """
    params = {
        "amount": amount,
        "currency": currency,
        "application_fee_amount": int(amount * 0.1),  # 10% platform fee
        "transfer_data": {"destination": connected_account_id},
        "customer": customer_id, # Associate with the customer
        "off_session": True # Required for payments initiated without user present (e.g., using a saved card)
    }
    if payment_method_id:
        params["payment_method"] = payment_method_id
        params["confirm"] = True  # Confirm immediately with the provided payment method
    return stripe.PaymentIntent.create(**params)

def create_setup_intent(customer_id: str = None): # Add customer_id parameter
    """
    Creates a SetupIntent to collect and save payment method details for future use.
    Optionally associates it with a customer.
    """
    params = {"usage": "off_session"}
    if customer_id:
        params["customer"] = customer_id
    return stripe.SetupIntent.create(**params)

def create_express_login_link(account_id: str):
    return stripe.Account.create_login_link(account_id)

def list_connected_accounts():
    return stripe.Account.list(limit=10)
