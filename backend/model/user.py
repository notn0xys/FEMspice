from pydantic import BaseModel
from typing import Optional


class User(BaseModel):
    username: str
    hashed_password: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    email_verified: bool = False
    auth_provider: str = "local"  # "local" or "google"
    google_sub: Optional[str] = None
    picture: Optional[str] = None


class UserPublic(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    email_verified: bool = False
    auth_provider: str = "local"
    picture: Optional[str] = None
