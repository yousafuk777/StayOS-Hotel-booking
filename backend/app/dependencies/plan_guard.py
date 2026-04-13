from fastapi import Depends, HTTPException
from app.api.deps import get_current_tenant
from app.models.tenant import Tenant
from app.config.plans import PLAN_CONFIG

def require_feature(feature_key: str):
    """
    Dependency factory to enforce feature availability based on the tenant's plan.
    """
    def guard(current_tenant: Tenant = Depends(get_current_tenant)):
        config = PLAN_CONFIG.get(current_tenant.plan, PLAN_CONFIG["starter"])
        if not config["features"].get(feature_key, False):
            raise HTTPException(
                status_code=403,
                detail=f"'{feature_key}' is not available on your current plan. Please upgrade to unlock it."
            )
        return True
    return guard
