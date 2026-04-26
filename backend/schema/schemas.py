def individual_serialize(user) -> dict:
    if user is None:
        return None
    return {
        "id": str(user["_id"]),
        "username": user.get("username"),
        "hashed_password": user.get("hashed_password"),
        "email": user.get("email"),
        "full_name": user.get("full_name"),
        "email_verified": user.get("email_verified", False),
        "auth_provider": user.get("auth_provider", "local"),
        "google_sub": user.get("google_sub"),
        "picture": user.get("picture"),
    }


def users_serialize(users) -> list:
    return [individual_serialize(user) for user in users]
