
from pymongo import MongoClient

client = MongoClient("mongodb+srv://admin:Bbx931fxrBFGhhI8@cluster0.ud2bknp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

db = client.FEMspice
users_collection = db["users"]
simulations_collection = db["simulations"]



