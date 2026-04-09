from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.repositories.notification_repo import NotificationRepository
from app.schemas.notification import NotificationResponse, NotificationStats
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False)
):
    """Get user notifications."""
    notifications = await NotificationRepository.get_user_notifications(
        db, current_user.tenant_id, current_user.id, limit, offset, unread_only
    )
    return notifications


@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notification statistics."""
    total = len(await NotificationRepository.get_user_notifications(
        db, current_user.tenant_id, current_user.id, 1000, 0, False
    ))
    unread = await NotificationRepository.get_unread_count(
        db, current_user.tenant_id, current_user.id
    )
    return {"total": total, "unread": unread, "read": total - unread}


@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read."""
    notification = await NotificationRepository.mark_as_read(
        db, current_user.tenant_id, notification_id
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}


@router.put("/mark-all-read")
async def mark_all_notifications_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read."""
    count = await NotificationRepository.mark_all_as_read(
        db, current_user.tenant_id, current_user.id
    )
    return {"message": f"Marked {count} notifications as read"}