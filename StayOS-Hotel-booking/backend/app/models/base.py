from sqlalchemy import Column, Integer, DateTime, Boolean
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime


class Base(DeclarativeBase):
    pass


class BaseModel(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow,
        onupdate=datetime.utcnow, 
        nullable=False
    )
    is_deleted = Column(Boolean, default=False, nullable=False)
