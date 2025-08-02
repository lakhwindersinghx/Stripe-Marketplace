# backend/firebase_config.py

import firebase_admin
from firebase_admin import credentials, firestore
import os   

cred = credentials.Certificate(r"C:\Users\singh\OneDrive\Desktop\ontaro dental\stripe-6509d-firebase-adminsdk-fbsvc-fca74bfce4.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
