from pydantic import BaseModel
from typing import Dict, Optional
from app.schemas.tenant import TenantPlan

class PlanFeatures(BaseModel):
    bookings: bool
    calendar: bool
    rooms: bool
    housekeeping: bool
    guests: bool
    analytics: bool
    staff_management: bool
    promotions: bool
    reviews: bool
    theme_branding: bool
    policies: bool
    hotel_settings: bool

class PlanInfoResponse(BaseModel):
    plan_key: TenantPlan
    display_name: str
    price: float
    max_rooms: Optional[int]
    max_users: Optional[int]
    features: Dict[str, bool]

class PlanUpgradeRequest(BaseModel):
    plan: TenantPlan

class UsageLimit(BaseModel):
    current: int
    limit: Optional[int]
    is_unlimited: bool

class UsageStats(BaseModel):
    rooms: UsageLimit
    users: UsageLimit

class BillingInfo(BaseModel):
    stripe_customer_id: Optional[str]
    stripe_subscription_id: Optional[str]
    next_billing_date: Optional[str] = None
    payment_method_last4: Optional[str] = None

class SubscriptionResponse(BaseModel):
    plan_key: TenantPlan
    display_name: str
    price: float
    features: Dict[str, bool]
    usage: UsageStats
    billing: BillingInfo
    all_plans: Dict[str, Dict]
