from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    username: str
    hashed_password: str
    email: str = None
    full_name: str = None

class UserPublic(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None

