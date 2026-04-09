from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload
from app.models.notification import Notification
from app.repositories.base import TenantScopedRepository


class NotificationRepository(TenantScopedRepository):
    """Repository for Notification model operations."""

    model = Notification

    @classmethod
    async def get_user_notifications(
        cls,
        db: AsyncSession,
        tenant_id: int,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
        unread_only: bool = False
    ):
        """Get notifications for a user."""
        query = select(Notification).where(
            and_(
                Notification.tenant_id == tenant_id,
                Notification.user_id == user_id
            )
        )

        if unread_only:
            query = query.where(Notification.is_read == False)

        query = query.order_by(desc(Notification.created_at)).limit(limit).offset(offset)

        result = await db.execute(query)
        return result.scalars().all()

    @classmethod
    async def mark_as_read(cls, db: AsyncSession, tenant_id: int, notification_id: int):
        """Mark a notification as read."""
        notification = await cls.get_by_id(db, notification_id)
        if notification and notification.tenant_id == tenant_id:
            notification.is_read = True
            await db.commit()
            return notification
        return None

    @classmethod
    async def mark_all_as_read(cls, db: AsyncSession, tenant_id: int, user_id: int):
        """Mark all notifications as read for a user."""
        query = select(Notification).where(
            and_(
                Notification.tenant_id == tenant_id,
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        result = await db.execute(query)
        notifications = result.scalars().all()

        for notification in notifications:
            notification.is_read = True

        await db.commit()
        return len(notifications)

    @classmethod
    async def get_unread_count(cls, db: AsyncSession, tenant_id: int, user_id: int):
        """Get count of unread notifications for a user."""
        query = select(Notification).where(
            and_(
                Notification.tenant_id == tenant_id,
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        result = await db.execute(query)
        return len(result.scalars().all())