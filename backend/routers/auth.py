import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from config.db import (
    users_collection,
    email_verifications_collection,
    password_resets_collection,
)
from model.user import UserPublic
from schema.schemas import individual_serialize
from utils.security import hash_password, verify_password
from utils.email import send_verification_email, send_password_reset_email

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://femspice.noxunya.dev")

VERIFICATION_CODE_TTL_MIN = 10
PASSWORD_RESET_TTL_MIN = 30
MAX_VERIFICATION_ATTEMPTS = 5

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/login")


# ---------- Schemas ----------

class Token(BaseModel):
    access_token: str
    token_type: str


class StartRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = ""


class VerifyRegisterRequest(BaseModel):
    email: EmailStr
    code: str


class GoogleLoginRequest(BaseModel):
    credential: str  # Google ID token (JWT) returned by Google Identity Services


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ---------- Helpers ----------

def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(username: str, user_id: str, expires_delta: timedelta) -> str:
    payload = {
        "sub": username,
        "id": user_id,
        "exp": _now() + expires_delta,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _issue_token_for_user(user: dict) -> Token:
    token = create_access_token(
        user["username"], user["id"], timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=token, token_type="bearer")


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _generate_numeric_code(n: int = 6) -> str:
    # 6-digit code, zero-padded.
    return f"{secrets.randbelow(10**n):0{n}d}"


def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user_id = payload.get("id")
        if not username or not user_id:
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


# ---------- Email/password sign-up: 2-step with verification code ----------

@router.post("/register/start", status_code=status.HTTP_202_ACCEPTED)
async def register_start(req: StartRegisterRequest):
    """Step 1: stash a pending registration + email a 6-digit code."""
    email = req.email.lower().strip()
    username = req.username.strip()

    if users_collection.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already in use")

    code = _generate_numeric_code()
    expires_at = _now() + timedelta(minutes=VERIFICATION_CODE_TTL_MIN)

    # Upsert by email — re-requesting overwrites prior pending registration.
    email_verifications_collection.update_one(
        {"email": email},
        {
            "$set": {
                "email": email,
                "username": username,
                "full_name": req.full_name or "",
                "hashed_password": hash_password(req.password),
                "code_hash": _hash_token(code),
                "expires_at": expires_at,
                "attempts": 0,
                "created_at": _now(),
            }
        },
        upsert=True,
    )

    send_verification_email(email, code)
    return {"msg": "Verification code sent", "email": email}


@router.post("/register/verify", response_model=Token)
async def register_verify(req: VerifyRegisterRequest):
    """Step 2: validate the code, create the user, return an access token."""
    email = req.email.lower().strip()
    record = email_verifications_collection.find_one({"email": email})
    if not record:
        raise HTTPException(status_code=400, detail="No pending registration for this email")

    if record.get("expires_at") and record["expires_at"].replace(tzinfo=timezone.utc) < _now():
        email_verifications_collection.delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=400, detail="Verification code expired")

    if record.get("attempts", 0) >= MAX_VERIFICATION_ATTEMPTS:
        email_verifications_collection.delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new code.")

    if _hash_token(req.code.strip()) != record["code_hash"]:
        email_verifications_collection.update_one(
            {"_id": record["_id"]}, {"$inc": {"attempts": 1}}
        )
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Race-check (someone may have grabbed the username/email since step 1).
    if users_collection.find_one({"username": record["username"]}):
        raise HTTPException(status_code=400, detail="Username already exists")
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already in use")

    user_doc = {
        "username": record["username"],
        "hashed_password": record["hashed_password"],
        "email": email,
        "full_name": record.get("full_name", ""),
        "email_verified": True,
        "auth_provider": "local",
    }
    inserted = users_collection.insert_one(user_doc)
    email_verifications_collection.delete_one({"_id": record["_id"]})

    user = individual_serialize(users_collection.find_one({"_id": inserted.inserted_id}))
    return _issue_token_for_user(user)


@router.post("/register/resend", status_code=status.HTTP_202_ACCEPTED)
async def register_resend(req: ForgotPasswordRequest):
    """Resend the verification code for an existing pending registration."""
    email = req.email.lower().strip()
    record = email_verifications_collection.find_one({"email": email})
    if not record:
        raise HTTPException(status_code=400, detail="No pending registration for this email")

    code = _generate_numeric_code()
    email_verifications_collection.update_one(
        {"_id": record["_id"]},
        {
            "$set": {
                "code_hash": _hash_token(code),
                "expires_at": _now() + timedelta(minutes=VERIFICATION_CODE_TTL_MIN),
                "attempts": 0,
            }
        },
    )
    send_verification_email(email, code)
    return {"msg": "Verification code resent"}


# ---------- Login (username + password) ----------

@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = individual_serialize(
        users_collection.find_one({"username": form_data.username})
    )
    if not user or not user.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _issue_token_for_user(user)


# ---------- Google OAuth (Sign in with Google) ----------

@router.post("/google", response_model=Token)
async def google_login(req: GoogleLoginRequest):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured")

    try:
        idinfo = google_id_token.verify_oauth2_token(
            req.credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_sub = idinfo.get("sub")
    email = (idinfo.get("email") or "").lower().strip()
    email_verified = bool(idinfo.get("email_verified"))
    full_name = idinfo.get("name", "")
    picture = idinfo.get("picture")

    if not google_sub or not email or not email_verified:
        raise HTTPException(status_code=401, detail="Google account is not verified")

    existing = users_collection.find_one(
        {"$or": [{"google_sub": google_sub}, {"email": email}]}
    )

    if existing:
        update = {"google_sub": google_sub, "email_verified": True}
        if not existing.get("auth_provider"):
            update["auth_provider"] = "google"
        if picture and not existing.get("picture"):
            update["picture"] = picture
        users_collection.update_one({"_id": existing["_id"]}, {"$set": update})
        user = individual_serialize(users_collection.find_one({"_id": existing["_id"]}))
    else:
        # Build a unique username from the email local-part.
        base_username = email.split("@")[0]
        username = base_username
        suffix = 0
        while users_collection.find_one({"username": username}):
            suffix += 1
            username = f"{base_username}{suffix}"

        user_doc = {
            "username": username,
            "email": email,
            "full_name": full_name,
            "email_verified": True,
            "auth_provider": "google",
            "google_sub": google_sub,
            "picture": picture,
            "hashed_password": None,
        }
        inserted = users_collection.insert_one(user_doc)
        user = individual_serialize(users_collection.find_one({"_id": inserted.inserted_id}))

    return _issue_token_for_user(user)


# ---------- Password reset ----------

@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(req: ForgotPasswordRequest):
    """Always returns 202 to avoid leaking which emails are registered."""
    email = req.email.lower().strip()
    user = users_collection.find_one({"email": email})

    if user and user.get("auth_provider", "local") == "local":
        raw_token = secrets.token_urlsafe(48)
        token_hash = _hash_token(raw_token)
        password_resets_collection.insert_one(
            {
                "user_id": user["_id"],
                "email": email,
                "token_hash": token_hash,
                "expires_at": _now() + timedelta(minutes=PASSWORD_RESET_TTL_MIN),
                "used": False,
                "created_at": _now(),
            }
        )
        reset_link = f"{FRONTEND_URL.rstrip('/')}/reset-password?token={raw_token}"
        send_password_reset_email(email, reset_link)

    return {"msg": "If an account exists for that email, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    record = password_resets_collection.find_one({"token_hash": _hash_token(req.token)})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if record.get("used"):
        raise HTTPException(status_code=400, detail="Reset token has already been used")
    if record["expires_at"].replace(tzinfo=timezone.utc) < _now():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    users_collection.update_one(
        {"_id": record["user_id"]},
        {"$set": {"hashed_password": hash_password(req.new_password)}},
    )
    password_resets_collection.update_one(
        {"_id": record["_id"]}, {"$set": {"used": True, "used_at": _now()}}
    )
    return {"msg": "Password updated successfully"}


# ---------- Profile ----------

@router.get("/profile", response_model=UserPublic)
async def read_users_me(current_user: Annotated[UserPublic, Depends(get_current_user)]):
    return current_user
