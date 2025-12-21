from fastapi import FastAPI, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware  
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from config.db import users_collection, simulations_collection, client
from typing import Annotated
from routers import auth, simulate
import traceback
import socket

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
    "https://femspice.noxunya.dev",
    "https://www.femspice.noxunya.dev",
    "https://femspice-api.noxunya.dev"
]


app = FastAPI()

# Custom middleware to catch exceptions and ensure CORS headers are added
class CatchAllExceptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            print(f"Unhandled exception: {exc}")
            traceback.print_exc()
            
            # Get origin from request
            origin = request.headers.get("origin", "")
            
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error", "error": str(exc)},
            )
            
            # Add CORS headers if origin is allowed
            if origin in origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
            
            return response

# Add exception middleware BEFORE CORS middleware (middleware order is reversed in FastAPI)
app.add_middleware(CatchAllExceptionMiddleware)

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

@app.get("/health")
def health():
    return {"ok": True}
@app.get("/meow")
def meow():
    return {"meow": "meow!"}    
@app.get("/whoami")
def whoami():
    return {"host": socket.gethostname()}