from pydantic import BaseModel

class User(BaseModel):
    username: str
    hashed_password: str
    email: str = None
    full_name: str = None