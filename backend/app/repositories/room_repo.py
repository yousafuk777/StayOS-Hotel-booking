from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from app.repositories.base import TenantScopedRepository
from app.models.room import Room, RoomCategory

class RoomCategoryRepository(TenantScopedRepository[RoomCategory]):
    model = RoomCategory

    @classmethod
    async def get_all_global(cls, db: AsyncSession) -> List[RoomCategory]:
        """Fetch all room categories across all tenants."""
        stmt = select(cls.model).where(cls.model.is_deleted == False)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @classmethod
    async def get_by_name(cls, db: AsyncSession, tenant_id: int, hotel_id: int, name: str) -> Optional[RoomCategory]:
        stmt = select(cls.model).where(
            cls.model.tenant_id == tenant_id,
            cls.model.hotel_id == hotel_id,
            cls.model.name == name,
            cls.model.is_deleted == False
        )
        result = await db.execute(stmt)
        return result.scalars().first()

class RoomRepository(TenantScopedRepository[Room]):
    model = Room

    @classmethod
    async def get_multi_by_hotel(
        cls, db: AsyncSession, tenant_id: int, hotel_id: int, skip: int = 0, limit: int = 100
    ) -> List[Room]:
        stmt = (
            select(cls.model)
            .where(
                cls.model.tenant_id == tenant_id, 
                cls.model.hotel_id == hotel_id,
                cls.model.is_deleted == False
            )
            .options(
                selectinload(cls.model.category), 
                selectinload(cls.model.images),
                selectinload(cls.model.assigned_staff)
            )
            .offset(skip)
            .limit(limit)
            .order_by(cls.model.room_number)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @classmethod
    async def get_all_global(
        cls, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Room]:
        """Fetch all rooms across all tenants (Super Admin View)."""
        stmt = (
            select(cls.model)
            .where(cls.model.is_deleted == False)
            .options(
                selectinload(cls.model.category), 
                selectinload(cls.model.images),
                selectinload(cls.model.assigned_staff)
            )
            .offset(skip)
            .limit(limit)
            .order_by(cls.model.room_number)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @classmethod
    async def get_with_relations(cls, db: AsyncSession, tenant_id: int, room_id: int) -> Optional[Room]:
        stmt = (
            select(cls.model)
            .where(
                cls.model.id == room_id, 
                cls.model.tenant_id == tenant_id,
                cls.model.is_deleted == False
            )
            .options(
                selectinload(cls.model.category), 
                selectinload(cls.model.images),
                selectinload(cls.model.assigned_staff)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @classmethod
    async def create_with_relations(cls, db: AsyncSession, tenant_id: int, data: Dict[str, Any]) -> Room:
        # custom create that also fetches relations
        obj = await super().create(db, tenant_id, data)
        return await cls.get_with_relations(db, tenant_id, obj.id)
        
    @classmethod
    async def get_by_id_global(cls, db: AsyncSession, room_id: int) -> Optional[Room]:
        stmt = (
            select(cls.model)
            .where(cls.model.id == room_id, cls.model.is_deleted == False)
            .options(
                selectinload(cls.model.category), 
                selectinload(cls.model.images),
                selectinload(cls.model.assigned_staff)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @classmethod
    async def update_global_with_relations(cls, db: AsyncSession, room_id: int, data: Dict[str, Any]) -> Room:
        """Update room record globally (Super Admin)."""
        # We need the tenant_id to use the base update repo but we can also just do it here
        room = await cls.get_by_id_global(db, room_id)
        if room:
            for key, value in data.items():
                if hasattr(room, key):
                    setattr(room, key, value)
            await db.commit()
            await db.refresh(room)
            # Re-fetch with relations
            return await cls.get_by_id_global(db, room_id)
        return None

    @classmethod
    async def update_with_relations(cls, db: AsyncSession, tenant_id: int, room_id: int, data: Dict[str, Any]) -> Room:
        obj = await super().update(db, tenant_id, room_id, data)
        return await cls.get_with_relations(db, tenant_id, obj.id) if obj else None
