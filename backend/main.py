from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()
app.include_router(auth.router)
app.include_router(simulate.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

# @app.get("/items/")
# async def read_items(token: Annotated[str, Depends(oauth2_scheme)]):
#     return {"token": token}