from fastapi import APIRouter, Depends
from app.api.deps import get_current_tenant, get_db
from app.dependencies.role_guard import require_module_access
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.tenant import Tenant
from app.models.room import Room
from app.models.user import User, UserRole
from app.config.plans import PLAN_CONFIG
from app.schemas.plan import PlanInfoResponse, SubscriptionResponse

router = APIRouter()

@router.get("/me/plan", response_model=PlanInfoResponse, dependencies=[Depends(require_module_access("subscription"))])
async def get_my_plan(current_tenant: Tenant = Depends(get_current_tenant)):
    """
    Fetch the full plan configuration for the current tenant.
    """
    plan_key = current_tenant.plan
    # Fallback to starter if for some reason the plan is invalid
    config = PLAN_CONFIG.get(plan_key, PLAN_CONFIG["starter"])
    
    return {
        "plan_key": plan_key,
        "display_name": config["display_name"],
        "price": config["price"],
        "max_rooms": config["max_rooms"],
        "max_users": config["max_users"],
        "features": config["features"]
    }

@router.get("/me/subscription", response_model=SubscriptionResponse, dependencies=[Depends(require_module_access("subscription"))])
async def get_my_subscription(
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch the current tenant's plan details alongside their live usage numbers.
    """
    plan_key = current_tenant.plan
    config = PLAN_CONFIG.get(plan_key, PLAN_CONFIG["starter"])

    # Count current rooms
    room_result = await db.execute(
        select(func.count(Room.id)).where(
            Room.tenant_id == current_tenant.id,
            Room.is_deleted == False
        )
    )
    current_rooms = room_result.scalar() or 0

    # Count current active users (exclude guests)
    user_result = await db.execute(
        select(func.count(User.id)).where(
            User.tenant_id == current_tenant.id,
            User.is_active == True,
            User.role != UserRole.guest,
            User.is_deleted == False
        )
    )
    current_users = user_result.scalar() or 0

    return {
        "plan_key": plan_key,
        "display_name": config["display_name"],
        "price": config["price"],
        "features": config["features"],
        "usage": {
            "rooms": {
                "current": current_rooms,
                "limit": config["max_rooms"],
                "is_unlimited": config["max_rooms"] is None
            },
            "users": {
                "current": current_users,
                "limit": config["max_users"],
                "is_unlimited": config["max_users"] is None
            }
        },
        "billing": {
            "stripe_customer_id": current_tenant.stripe_customer_id,
            "stripe_subscription_id": current_tenant.stripe_subscription_id,
            "next_billing_date": None,
            "payment_method_last4": None
        },
        "all_plans": PLAN_CONFIG
    }
