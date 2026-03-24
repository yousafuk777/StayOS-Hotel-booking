# 13 — Authentication & Authorization

## Overview

StayOS uses JWT-based authentication with two tokens:
- **Access Token**: Short-lived (15 min), sent in `Authorization: Bearer` header
- **Refresh Token**: Long-lived (7 days), stored in `httpOnly` cookie

---

## Auth Flow Diagram

```
┌─────────┐         ┌──────────┐         ┌──────────┐
│ Browser │         │ FastAPI  │         │ Database │
└────┬────┘         └────┬─────┘         └─────┬────┘
     │                   │                     │
     │  POST /auth/login │                     │
     │──────────────────►│                     │
     │                   │  SELECT user by     │
     │                   │  email + tenant_id  │
     │                   │────────────────────►│
     │                   │◄────────────────────│
     │                   │  verify bcrypt hash │
     │                   │                     │
     │  200 access_token │                     │
     │◄──────────────────│                     │
     │  Set-Cookie:      │                     │
     │  refresh_token    │                     │
     │                   │                     │
     │  GET /protected   │                     │
     │  Authorization:   │                     │
     │  Bearer <token>   │                     │
     │──────────────────►│                     │
     │                   │  decode JWT         │
     │                   │  verify expiry      │
     │                   │  extract user_id    │
     │  200 data         │                     │
     │◄──────────────────│                     │
     │                   │                     │
     │  (token expired)  │                     │
     │  POST /auth/refresh│                    │
     │  Cookie: refresh  │                     │
     │──────────────────►│                     │
     │                   │  verify refresh JWT │
     │  new access_token │                     │
     │◄──────────────────│                     │
```

---

## Full Authentication Implementation

```python
# app/api/v1/auth.py

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.schemas.auth import (
    RegisterRequest, LoginResponse, RefreshResponse,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.auth_service import AuthService
from app.core.config import settings

router = APIRouter()

@router.post("/register", status_code=201)
async def register(
    body: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    tenant_id = request.state.tenant_id
    user = await AuthService.register(db, tenant_id, body)
    return {"message": "Registration successful. Please check your email to verify your account."}


@router.post("/login", response_model=LoginResponse)
async def login(
    response: Response,
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
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
        "user": user
    }


@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
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
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    tenant_id = request.state.tenant_id
    await AuthService.initiate_password_reset(db, tenant_id, body.email)
    # Always return success to prevent email enumeration
    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    await AuthService.reset_password(db, body.token, body.new_password)
    return {"message": "Password reset successfully"}
```

---

## Auth Service

```python
# app/services/auth_service.py

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from app.tasks.email_tasks import send_verification_email, send_password_reset_email
import uuid, secrets

class AuthService:

    @staticmethod
    async def register(db: AsyncSession, tenant_id: int, data) -> dict:
        # Check uniqueness
        existing = await UserRepository.get_by_email(db, tenant_id, data.email)
        if existing:
            raise ValueError("Email already registered")

        user = await UserRepository.create(db, tenant_id, {
            "email": data.email,
            "hashed_password": hash_password(data.password),
            "first_name": data.first_name,
            "last_name": data.last_name,
            "role": "guest",
            "is_verified": False,
        })

        # Create email verification token
        token = secrets.token_urlsafe(32)
        await UserRepository.set_verification_token(db, user.id, token)

        # Send verification email
        send_verification_email.delay(user.id, token)
        return user

    @staticmethod
    async def authenticate(db, tenant_id, email, password):
        user = await UserRepository.get_by_email(db, tenant_id, email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is deactivated")
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="Please verify your email first")

        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "tenant_id": user.tenant_id,
        }

        return {
            "access_token": create_access_token(payload),
            "refresh_token": create_refresh_token(payload),
        }, user

    @staticmethod
    async def refresh(db, refresh_token: str):
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError("Wrong token type")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user_id = int(payload["sub"])
        user = await UserRepository.get_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found")

        new_payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "tenant_id": user.tenant_id,
        }
        return {
            "access_token": create_access_token(new_payload),
            "refresh_token": create_refresh_token(new_payload),
        }
```

---

## RBAC Dependency Examples

```python
# app/core/permissions.py

from fastapi import HTTPException, Depends
from app.api.deps import get_current_active_user

class Role:
    SUPER_ADMIN = "super_admin"
    HOTEL_ADMIN = "hotel_admin"
    HOTEL_MANAGER = "hotel_manager"
    FRONT_DESK = "front_desk"
    HOUSEKEEPING = "housekeeping"
    GUEST = "guest"

def require_roles(*roles):
    async def check(user=Depends(get_current_active_user)):
        if user.role not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return check

# Named permission checks for clarity
RequireGuest = require_roles(Role.GUEST, Role.HOTEL_ADMIN, Role.SUPER_ADMIN)
RequireHotelAdmin = require_roles(Role.HOTEL_ADMIN, Role.SUPER_ADMIN)
RequireStaff = require_roles(Role.HOTEL_ADMIN, Role.HOTEL_MANAGER, Role.FRONT_DESK)
RequireSuperAdmin = require_roles(Role.SUPER_ADMIN)
```

---

## Frontend Auth Implementation

```typescript
// src/services/auth.service.ts

import api from './api'
import { useAuthStore } from '@/store/auth.store'

export const authService = {
  login: async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const { data } = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    useAuthStore.getState().setAccessToken(data.access_token)
    useAuthStore.getState().setUser(data.user)
    return data
  },

  logout: async () => {
    await api.post('/auth/logout')
    useAuthStore.getState().logout()
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post('/auth/register', payload)
    return data
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', {
      token,
      new_password: newPassword
    })
    return data
  },
}
```

### Protected Route Component (Next.js)

```typescript
// src/components/auth/ProtectedRoute.tsx

'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  children: React.ReactNode
  requiredRole?: string | string[]
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!roles.includes(user?.role ?? '')) {
        router.push('/unauthorized')
      }
    }
  }, [isAuthenticated, user, requiredRole])

  if (!isAuthenticated) return null
  return <>{children}</>
}

// Usage:
// <ProtectedRoute requiredRole="hotel_admin">
//   <AdminDashboard />
// </ProtectedRoute>
```
