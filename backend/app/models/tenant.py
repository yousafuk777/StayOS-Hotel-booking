from sqlalchemy import Column, Integer, String, Enum, Boolean, DECIMAL, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class TenantPlan(str, enum.Enum):
    starter = "starter"
    professional = "professional"
    enterprise = "enterprise"


class TenantStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"
    terminated = "terminated"


class Tenant(BaseModel):
    __tablename__ = "tenants"

    name = Column(String(200), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    plan = Column(
        Enum(TenantPlan), 
        nullable=False, 
        default=TenantPlan.starter
    )
    status = Column(
        Enum(TenantStatus), 
        nullable=False, 
        default=TenantStatus.pending,
        index=True
    )
    stripe_customer_id = Column(String(100))
    stripe_subscription_id = Column(String(100))
    commission_rate = Column(DECIMAL(5, 4), nullable=False, default=0.0300)

    # Relationships
    hotels = relationship("Hotel", back_populates="tenant", cascade="all, delete-orphan")
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    settings = relationship("TenantSettings", back_populates="tenant", uselist=False, cascade="all, delete-orphan")
    themes = relationship("Theme", back_populates="tenant", cascade="all, delete-orphan")
