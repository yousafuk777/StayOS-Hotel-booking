import secrets
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole
from app.models.guest_magic_link import GuestMagicLink
from app.core.config import settings

class MagicLinkService:
    def _hash_token(self, raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode()).hexdigest()

    async def create_magic_link(
        self,
        email: str,
        tenant_id: int,
        db: AsyncSession
    ) -> tuple[str or None, bool]:
        """
        Creates a magic link token for the given email if the user exists as a guest in the specific tenant.
        Returns (magic_link_url, user_exists).
        """
        # Find guest user by email AND tenant
        result = await db.execute(
            select(User).where(
                User.email == email,
                User.tenant_id == tenant_id,
                User.role == UserRole.guest,
                User.is_active == True
            )
        )
        user = result.scalar_one_or_none()

        if not user:
            return None, False

        # Invalidate any existing unused tokens for this user
        existing_result = await db.execute(
            select(GuestMagicLink).where(
                GuestMagicLink.user_id == user.id,
                GuestMagicLink.used_at.is_(None),
                GuestMagicLink.expires_at > datetime.utcnow()
            )
        )
        for old_link in existing_result.scalars().all():
            old_link.expires_at = datetime.utcnow()  # expire immediately

        # Generate new token
        raw_token = secrets.token_urlsafe(32)
        token_hash = self._hash_token(raw_token)
        expires_at = datetime.utcnow() + timedelta(minutes=15)  # 15 min expiry

        magic_link = GuestMagicLink(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(magic_link)
        await db.commit()

        # Build frontend URL
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        magic_link_url = f"{frontend_url}/guest/verify?token={raw_token}"

        return magic_link_url, True

    async def verify_magic_link(
        self,
        raw_token: str,
        db: AsyncSession
    ) -> User or None:
        """
        Verifies a magic link token.
        Returns the User if valid, None if invalid or expired.
        Marks token as used on success.
        """
        token_hash = self._hash_token(raw_token)

        result = await db.execute(
            select(GuestMagicLink).where(
                GuestMagicLink.token_hash == token_hash,
                GuestMagicLink.expires_at > datetime.utcnow(),
                GuestMagicLink.used_at.is_(None)
            )
        )
        magic_link = result.scalar_one_or_none()

        if not magic_link:
            return None

        # Mark as used — one time use only
        magic_link.used_at = datetime.utcnow()
        
        # Get the user
        user_result = await db.execute(
            select(User).where(User.id == magic_link.user_id)
        )
        user = user_result.scalar_one_or_none()
        
        await db.commit()
        return user

magic_link_service = MagicLinkService()
