from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.config.plans import PLAN_CONFIG
from app.models.tenant import Tenant
from app.models.room import Room
from app.models.user import User

async def check_room_limit(tenant: Tenant, db: AsyncSession):
    """
    Check if the tenant has reached their plan's room limit.
    """
    config = PLAN_CONFIG.get(tenant.plan, PLAN_CONFIG["starter"])
    max_rooms = config["max_rooms"]
    if max_rooms is None:
        return  # unlimited
    
    result = await db.execute(select(func.count(Room.id)).where(Room.tenant_id == tenant.id))
    current_count = result.scalar() or 0
    
    if current_count >= max_rooms:
        raise HTTPException(
            status_code=403,
            detail=f"Room limit reached for your {config['display_name']} plan. Upgrade to add more rooms."
        )

async def check_user_limit(tenant: Tenant, db: AsyncSession):
    """
    Check if the tenant has reached their plan's user (staff) limit.
    """
    config = PLAN_CONFIG.get(tenant.plan, PLAN_CONFIG["starter"])
    max_users = config["max_users"]
    if max_users is None:
        return  # unlimited
    
    result = await db.execute(
        select(func.count(User.id))
        .where(
            User.tenant_id == tenant.id,
            User.is_deleted == False
        )
    )
    current_count = result.scalar() or 0
    
    if current_count >= max_users:
        raise HTTPException(
            status_code=403,
            detail=f"User limit reached for your {config['display_name']} plan. Upgrade to add more staff."
        )
