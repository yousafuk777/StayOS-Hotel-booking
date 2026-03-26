from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from fastapi import HTTPException


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    async def register(db: AsyncSession, tenant_id: int, data) -> dict:
        """Register a new user."""
        # Check uniqueness
        existing = await UserRepository.get_by_email(db, tenant_id, data.email)
        if existing:
            raise ValueError("Email already registered")

        user = await UserRepository.create(db, tenant_id, {
            "email": data.email,
            "hashed_password": hash_password(data.password),
            "first_name": data.first_name,
            "last_name": data.last_name,
            "role": "guest",
            "is_verified": False,
        })

        # In production: Create email verification token and send email
        # For now, auto-verify
        user.is_verified = True
        await db.commit()

        return user

    @staticmethod
    async def authenticate(db, tenant_id, email, password):
        """Authenticate user and return tokens."""
        user = await UserRepository.get_by_email(db, tenant_id, email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is deactivated")
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="Please verify your email first")

        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "tenant_id": user.tenant_id,
        }

        return {
            "access_token": create_access_token(payload),
            "refresh_token": create_refresh_token(payload),
        }, user

    @staticmethod
    async def refresh(db, refresh_token: str):
        """Refresh access token using refresh token."""
        try:
            from app.core.security import decode_token
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError("Wrong token type")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user_id = int(payload["sub"])
        user = await UserRepository.get_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found")

        new_payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "tenant_id": user.tenant_id,
        }
        return {
            "access_token": create_access_token(new_payload),
            "refresh_token": create_refresh_token(new_payload),
        }
