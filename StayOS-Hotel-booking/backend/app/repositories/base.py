from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import TypeVar, Generic, Type, List, Dict, Any

T = TypeVar('T')


class TenantScopedRepository(Generic[T]):
    """Base repository that enforces tenant isolation on all queries."""

    model: Type[T] = None  # Override in subclass

    @classmethod
    async def get_all(cls, db: AsyncSession, tenant_id: int, **filters) -> List[T]:
        """Get all records scoped to tenant."""
        stmt = select(cls.model).where(
            cls.model.tenant_id == tenant_id,
            cls.model.is_deleted == False
        )
        for key, value in filters.items():
            if hasattr(cls.model, key):
                stmt = stmt.where(getattr(cls.model, key) == value)
        result = await db.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def get_by_id(cls, db: AsyncSession, tenant_id: int, record_id: int) -> T | None:
        """Get single record by ID scoped to tenant."""
        result = await db.execute(
            select(cls.model).where(
                cls.model.id == record_id,
                cls.model.tenant_id == tenant_id,
                cls.model.is_deleted == False
            )
        )
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db: AsyncSession, tenant_id: int, data: Dict[str, Any]) -> T:
        """Create new record with tenant_id."""
        obj = cls.model(**data, tenant_id=tenant_id)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @classmethod
    async def update(cls, db: AsyncSession, tenant_id: int, record_id: int, data: Dict[str, Any]) -> T | None:
        """Update record scoped to tenant."""
        obj = await cls.get_by_id(db, tenant_id, record_id)
        if obj:
            for key, value in data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)
            await db.commit()
            await db.refresh(obj)
        return obj

    @classmethod
    async def delete(cls, db: AsyncSession, tenant_id: int, record_id: int) -> bool:
        """Soft delete record scoped to tenant."""
        obj = await cls.get_by_id(db, tenant_id, record_id)
        if obj and hasattr(obj, 'is_deleted'):
            obj.is_deleted = True
            await db.commit()
            return True
        return False
