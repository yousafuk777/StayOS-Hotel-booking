from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.core.config import settings

# Guest-specific JWT settings
GUEST_JWT_SECRET = settings.JWT_SECRET_KEY
GUEST_JWT_ALGORITHM = settings.JWT_ALGORITHM
GUEST_JWT_EXPIRE_HOURS = 24 * 7  # 7 days

def create_guest_token(user_id: int, email: str) -> str:
    """
    Create a guest-specific JWT token.
    This token is used for the guest portal and is distinct from admin tokens.
    """
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": "guest",
        "type": "guest_portal",  # distinguishes from admin tokens
        "exp": datetime.utcnow() + timedelta(hours=GUEST_JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, GUEST_JWT_SECRET, algorithm=GUEST_JWT_ALGORITHM)


def decode_guest_token(token: str) -> dict:
    """
    Decode and verify a guest-specific JWT token.
    Returns the payload if valid and type is 'guest_portal', otherwise None.
    """
    try:
        payload = jwt.decode(token, GUEST_JWT_SECRET, algorithms=[GUEST_JWT_ALGORITHM])
        if payload.get("type") != "guest_portal":
            return None
        return payload
    except JWTError:
        return None
