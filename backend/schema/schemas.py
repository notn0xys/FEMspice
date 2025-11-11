def individual_serialize(user) -> dict:
    # print(f"username: {user['username']} id: {user['_id']}")
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "hashed_password": user["hashed_password"],
        "email": user["email"] if "email" in user else None,
        "full_name": user["full_name"] if "full_name" in user else None
    }
def users_serialize(users) -> list:
    return [individual_serialize(user) for user in users]