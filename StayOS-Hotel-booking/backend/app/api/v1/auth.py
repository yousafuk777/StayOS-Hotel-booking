from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.schemas.auth import RegisterRequest, LoginResponse, RefreshResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import AuthService
from app.core.config import settings

router = APIRouter()


@router.post("/register", status_code=201)
async def register(
    body: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user."""
    tenant_id = request.state.tenant_id
    user = await AuthService.register(db, tenant_id, body)
    return {
        "message": "Registration successful. Please check your email to verify your account.",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }


@router.post("/login", response_model=LoginResponse)
async def login(
    response: Response,
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login and get access token."""
    tenant_id = request.state.tenant_id
    tokens, user = await AuthService.authenticate(
        db, tenant_id, form_data.username, form_data.password
    )

    # Set refresh token as httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=60 * 60 * 24 * settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )

    return {
        "access_token": tokens["access_token"],
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "tenant_id": user.tenant_id,
        }
    }


@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    tokens = await AuthService.refresh(db, refresh_token)

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="lax",
        max_age=60 * 60 * 24 * settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )

    return {"access_token": tokens["access_token"], "token_type": "bearer"}


@router.post("/logout")
async def logout(response: Response):
    """Logout and clear refresh token."""
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Initiate password reset flow."""
    tenant_id = request.state.tenant_id
    # In production: Generate reset token and send email
    # Always return success to prevent email enumeration
    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Reset password with token."""
    # In production: Validate token and update password
    return {"message": "Password reset successfully"}
