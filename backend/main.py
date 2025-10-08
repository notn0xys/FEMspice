from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware  
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from config.db import users_collection, simulations_collection, client
from typing import Annotated
from routers import auth, simulate

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


## CORS Settings
origins = [
    "http://localhost",
    "http://localhost:5173",
    "https://femspice.noxunya.dev"
]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app.include_router(auth.router)
app.include_router(simulate.router)

