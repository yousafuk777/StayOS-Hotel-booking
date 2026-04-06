from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from app.repositories.base import TenantScopedRepository
from app.models.user import User, UserRole
from app.models.booking import Booking

class GuestRepository(TenantScopedRepository[User]):
    model = User

    @classmethod
    async def get_multi_with_stats(
        cls, db: AsyncSession, tenant_id: int, skip: int = 0, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get guests with booking stats (stays, total_spent, last_visit)."""
        # Note: We return dictionaries here and map them to schemas
        stmt = (
            select(
                User,
                func.count(Booking.id).label("stays"),
                func.coalesce(func.sum(Booking.total_amount), 0).label("total_spent"),
                func.max(Booking.check_out_date).label("last_visit")
            )
            .outerjoin(Booking, User.id == Booking.guest_id)
            .where(
                User.tenant_id == tenant_id,
                User.role == UserRole.guest,
                User.is_deleted == False
            )
            .group_by(User.id)
            .offset(skip)
            .limit(limit)
        )
        
        result = await db.execute(stmt)
        guests_with_stats = []
        for row in result.all():
            user, stays, total_spent, last_visit = row
            # Create a shallow copy of the user attributes and add stats
            # This is easily handled by Pydantic if we define the schema correctly
            user_data = {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "role": user.role,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "is_vip": user.is_vip,
                "tenant_id": user.tenant_id,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "stays": stays,
                "total_spent": total_spent,
                "last_visit": last_visit
            }
            guests_with_stats.append(user_data)
        
        return guests_with_stats

    @classmethod
    async def get_by_id_with_stats(
        cls, db: AsyncSession, tenant_id: int, guest_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get a single guest with stats."""
        stmt = (
            select(
                User,
                func.count(Booking.id).label("stays"),
                func.coalesce(func.sum(Booking.total_amount), 0).label("total_spent"),
                func.max(Booking.check_out_date).label("last_visit")
            )
            .outerjoin(Booking, User.id == Booking.guest_id)
            .where(
                User.id == guest_id,
                User.tenant_id == tenant_id,
                User.role == UserRole.guest,
                User.is_deleted == False
            )
            .group_by(User.id)
        )
        
        result = await db.execute(stmt)
        row = result.first()
        if not row:
            return None
        
        user, stays, total_spent, last_visit = row
        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "is_vip": user.is_vip,
            "tenant_id": user.tenant_id,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "stays": stays,
            "total_spent": total_spent,
            "last_visit": last_visit
        }
