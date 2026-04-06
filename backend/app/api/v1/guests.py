from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db
from app.models.user import User, UserRole
from app.schemas.guest import GuestCreate, GuestUpdate, GuestResponse
from app.repositories.guest_repo import GuestRepository
from app.core.security import hash_password

router = APIRouter()

@router.get("/", response_model=List[GuestResponse])
async def read_guests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve guests with their booking statistics.
    """
    if current_user.tenant_id is None:
        # Super Admin - Fetch all guests globally across all tenants
        # For simplicity, we filter by role but this could be more complex
        guests = await GuestRepository.get_multi_with_stats(
            db, tenant_id=None, skip=skip, limit=limit
        )
        return guests

    # Standard Tenant View
    guests = await GuestRepository.get_multi_with_stats(
        db, tenant_id=current_user.tenant_id, skip=skip, limit=limit
    )
    return guests

@router.post("/", response_model=GuestResponse)
async def create_guest(
    *,
    db: AsyncSession = Depends(get_db),
    guest_in: GuestCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new guest.
    """
    if current_user.tenant_id is None:
        raise HTTPException(status_code=403, detail="Super Admin must select a tenant to create guests.")

    # Check if guest already exists with this email
    from app.repositories.user_repo import UserRepository
    existing_user = await UserRepository.get_by_email(db, tenant_id=current_user.tenant_id, email=guest_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A guest with this email already exists in your hotel."
        )

    # Hash the password
    guest_data = guest_in.dict()
    guest_data['hashed_password'] = hash_password(guest_data.pop('password'))
    guest_data['role'] = UserRole.guest
    guest_data['is_verified'] = True # Guests created by staff are usually verified
    
    guest = await GuestRepository.create(db, tenant_id=current_user.tenant_id, data=guest_data)
    
    # Return with stats (initially 0)
    return await GuestRepository.get_by_id_with_stats(db, tenant_id=current_user.tenant_id, guest_id=guest.id)

@router.get("/{id}", response_model=GuestResponse)
async def read_guest(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific guest by ID with stats.
    """
    tenant_id = current_user.tenant_id
    guest = await GuestRepository.get_by_id_with_stats(db, tenant_id=tenant_id, guest_id=id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest

@router.put("/{id}", response_model=GuestResponse)
async def update_guest(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    guest_in: GuestUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a guest.
    """
    tenant_id = current_user.tenant_id
    guest = await GuestRepository.get_by_id(db, tenant_id=tenant_id, record_id=id)
    if not guest or guest.role != UserRole.guest:
        raise HTTPException(status_code=404, detail="Guest not found")
        
    # Check if we are updating email and if it exists for another user in this tenant
    if guest_in.email is not None and guest_in.email != guest.email:
        from app.repositories.user_repo import UserRepository
        existing_user = await UserRepository.get_by_email(db, tenant_id=tenant_id, email=guest_in.email)
        if existing_user and existing_user.id != id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A guest with this email already exists in your hotel."
            )
        
    update_data = guest_in.dict(exclude_unset=True)
    guest = await GuestRepository.update(db, tenant_id=tenant_id, record_id=id, data=update_data)
    
    return await GuestRepository.get_by_id_with_stats(db, tenant_id=tenant_id, guest_id=guest.id)

@router.delete("/{id}")
async def delete_guest(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Soft delete a guest.
    """
    tenant_id = current_user.tenant_id
    guest = await GuestRepository.get_by_id(db, tenant_id=tenant_id, record_id=id)
    if not guest or guest.role != UserRole.guest:
        raise HTTPException(status_code=404, detail="Guest not found")
        
    await GuestRepository.delete(db, tenant_id=tenant_id, record_id=id)
    return {"status": "success", "message": "Guest deleted successfully"}
