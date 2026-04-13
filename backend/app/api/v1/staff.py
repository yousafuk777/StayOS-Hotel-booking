from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db, get_current_tenant
from app.models.user import User, UserRole
from app.models.tenant import Tenant
from app.utils.plan_limits import check_user_limit
from app.schemas.staff import StaffCreate, StaffUpdate, StaffResponse
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password

from app.dependencies.plan_guard import require_feature
from app.dependencies.role_guard import require_module_access

router = APIRouter(dependencies=[Depends(require_feature("staff_management"))])

@router.get("/", response_model=List[StaffResponse], dependencies=[Depends(require_module_access("staff_management"))])
async def read_staff(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve staff members for the current tenant.
    """
    if current_user.role not in [UserRole.hotel_admin, UserRole.hotel_manager, UserRole.super_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if current_user.tenant_id is None:
        return await UserRepository.get_all_staff_global(db)
    
    staff = await UserRepository.get_tenant_staff(db, tenant_id=current_user.tenant_id)
    return staff

@router.post("/", response_model=StaffResponse, dependencies=[Depends(require_module_access("staff_management", require_write=True))])
async def create_staff(
    *,
    db: AsyncSession = Depends(get_db),
    staff_in: StaffCreate,
    current_user: User = Depends(get_current_user),
    current_tenant: Tenant = Depends(get_current_tenant),
) -> Any:
    """
    Create new staff member.
    """
    # Plan limit check
    await check_user_limit(current_tenant, db)

    if current_user.role not in [UserRole.hotel_admin, UserRole.hotel_manager, UserRole.super_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=403,
            detail="Super Admin must select a tenant to create staff members."
        )

    # Check if user already exists
    user = await UserRepository.get_by_email(db, tenant_id=current_user.tenant_id, email=staff_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists in this hotel."
        )
    
    staff_data = staff_in.dict()
    staff_data["hashed_password"] = hash_password(staff_data.pop("password"))
    
    staff = await UserRepository.create(db, tenant_id=current_user.tenant_id, data=staff_data)
    return staff

@router.put("/{id}", response_model=StaffResponse, dependencies=[Depends(require_module_access("staff_management", require_write=True))])
async def update_staff(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    staff_in: StaffUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a staff member.
    """
    if current_user.role not in [UserRole.hotel_admin, UserRole.hotel_manager, UserRole.super_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    staff = await UserRepository.get_by_id(db, user_id=id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
        
    if current_user.tenant_id is not None and staff.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Not enough permissions to update this staff member")
        
    update_data = staff_in.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))
        
    staff = await UserRepository.update_global(db, user_id=id, data=update_data)
    return staff

@router.delete("/{id}", response_model=StaffResponse, dependencies=[Depends(require_module_access("staff_management", require_write=True))])
async def delete_staff(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a staff member.
    """
    if current_user.role not in [UserRole.hotel_admin, UserRole.hotel_manager, UserRole.super_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    staff = await UserRepository.get_by_id(db, user_id=id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
        
    if current_user.tenant_id is not None and staff.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=403, detail="Not enough permissions to delete this staff member")
        
    await UserRepository.delete_global(db, user_id=id)
    return staff
