from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DECIMAL, DateTime, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Theme(BaseModel):
    __tablename__ = "themes"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    config = Column(Text, nullable=False)  # JSON string for theme configuration
    is_default = Column(Boolean, nullable=False, default=False)

    # Relationship
    tenant = relationship("Tenant", back_populates="themes")


class UserThemePreference(BaseModel):
    __tablename__ = "user_theme_preferences"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    mode = Column(String(20), nullable=False, default="system")  # light, dark, system
    color_scheme = Column(String(50), default="default")
    font_size = Column(String(20), nullable=False, default="medium")  # small, medium, large

    # Relationship
    user = relationship("User")
