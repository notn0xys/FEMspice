from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client.FEMspice
users_collection = db["users"]
simulations_collection = db["simulations"]
email_verifications_collection = db["email_verifications"]
password_resets_collection = db["password_resets"]

# TTL indexes auto-delete expired docs. `expires_at` is a UTC datetime.
try:
    email_verifications_collection.create_index(
        [("expires_at", ASCENDING)], expireAfterSeconds=0
    )
    email_verifications_collection.create_index([("email", ASCENDING)])
    password_resets_collection.create_index(
        [("expires_at", ASCENDING)], expireAfterSeconds=0
    )
    password_resets_collection.create_index([("token_hash", ASCENDING)], unique=True)
except Exception as e:
    print(f"[db] index setup warning: {e}")
