import secrets
import hashlib
from datetime import datetime, timedelta

def generate_guest_access_token() -> tuple[str, str, datetime]:
    """
    Generates a secure token for guest booking access.
    Returns: (raw_token, hashed_token, expiry_datetime)
    - raw_token: sent to guest in email URL (never stored)
    - hashed_token: stored in database
    - expiry: 72 hours from now
    """
    raw_token = secrets.token_urlsafe(32)
    hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()
    expiry = datetime.utcnow() + timedelta(hours=72)
    return raw_token, hashed_token, expiry


def generate_pending_expiry() -> datetime:
    """
    Pending bookings auto-expire after 30 minutes if not confirmed.
    """
    return datetime.utcnow() + timedelta(minutes=30)
