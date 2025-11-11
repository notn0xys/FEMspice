from pydantic import BaseModel
from model.user import User, UserPublic
from config.db import users_collection
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, status, APIRouter
from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
import os
from dotenv import load_dotenv
from schema.schemas import individual_serialize
from utils.security import hash_password, verify_password

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/login")

class CreateUserRequest(BaseModel):
    username: str
    password: str
    email: str = None
    full_name: str = None

class Token(BaseModel):
    access_token: str
    token_type: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(userReq: CreateUserRequest):
    if users_collection.find_one({"username": userReq.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = hash_password(userReq.password)
    user_dict = {
        "username": userReq.username,
        "hashed_password": hashed_password,
        "email": userReq.email,
        "full_name": userReq.full_name
    }
    users_collection.insert_one(user_dict)
    return {"msg": "User created successfully"}

@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = individual_serialize(users_collection.find_one({"username": form_data.username}))
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user["username"], user["id"], timedelta(minutes=60))
    return {"access_token": token, "token_type": "bearer"}

def create_access_token(username: str, user_id: str, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("id")
        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = individual_serialize(users_collection.find_one({"username": username}))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user.pop("hashed_password", None)
        return user
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
@router.get("/profile", response_model=UserPublic)
async def read_users_me(current_user: Annotated[UserPublic, Depends(get_current_user)]):
    return current_user