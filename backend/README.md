# Installation

To install the required dependencies, use:

```bash
pip install -r requirements.txt
pyspice-post-installation --install-ngspice-dll
```

## Note
Be in directory without any whitespace, recommended just to put it in your C drive

backend runs on http://127.0.0.1:8000

# Backend End Points 
## Auth
- /auth/login 
  takes string username and string password
  returns { "access_token" : {token here}, "token_type" : "bearer" }
- /auth/register
  takes 
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "full_name": "string"
  }

  returns { "msg": "User created successfully" }
- /auth/me -- for testing token
  takes nothing, just put token in the header
  returns {
    "username": "string",
    "hashed_password": "string",
    "email": "string",
    "full_name": "string"
  }