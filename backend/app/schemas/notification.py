from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    type: str
    title: str
    body: Optional[str] = None
    data: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    id: int
    tenant_id: int
    user_id: int
    is_read: bool
    created_at: datetime
    updated_at: datetime


class NotificationStats(BaseModel):
    total: int
    unread: int
    read: int