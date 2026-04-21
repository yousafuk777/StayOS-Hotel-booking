from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.services.magic_link_service import magic_link_service
from app.services.email_service import email_service
from app.services.email_templates import magic_link_email
from app.utils.jwt import create_guest_token
from app.api.deps import get_db, get_current_tenant
from app.models.tenant import Tenant
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

router = APIRouter(prefix="/guest/auth", tags=["Guest Auth"])


class MagicLinkRequestSchema(BaseModel):
    email: EmailStr


class MagicLinkVerifySchema(BaseModel):
    token: str


@router.post("/request-link")
async def request_magic_link(
    payload: MagicLinkRequestSchema,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant)
):
    """
    Sends a magic link to the guest's email.
    Always returns success — never reveal if email exists or not.
    """
    magic_url, user_exists = await magic_link_service.create_magic_link(
        email=payload.email,
        tenant_id=tenant.id,
        db=db
    )

    if not user_exists:
        print(f"⚠️ [GUEST AUTH] Magic link requested for {payload.email} but no active guest found in Tenant ID {tenant.id} ({tenant.name}).")

    if user_exists and magic_url:
        subject, html = magic_link_email(magic_url)
        # Using asyncio.create_task for fire-and-forget email sending
        asyncio.create_task(
            email_service.send_email(payload.email, subject, html)
        )

    return {
        "message": "If an account exists for this email, you will receive a login link shortly."
    }


@router.post("/verify-link")
async def verify_magic_link(
    payload: MagicLinkVerifySchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Verifies the magic link token and returns a guest JWT.
    """
    user = await magic_link_service.verify_magic_link(
        raw_token=payload.token,
        db=db
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="This login link is invalid or has expired. Please request a new one."
        )

    # Create guest-specific JWT
    guest_token = create_guest_token(user_id=user.id, email=user.email)

    return {
        "access_token": guest_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }
