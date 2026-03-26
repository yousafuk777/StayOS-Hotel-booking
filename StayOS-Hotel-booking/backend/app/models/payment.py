from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DECIMAL, DateTime, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Payment(BaseModel):
    __tablename__ = "payments"

    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(
        String(20), 
        nullable=False, 
        default="pending",  # pending, completed, failed, refunded, partial_refund
        index=True
    )
    payment_method = Column(String(20), nullable=False, default="card")  # card, bank_transfer, wallet
    stripe_payment_intent_id = Column(String(100), index=True)
    stripe_charge_id = Column(String(100))
    platform_commission = Column(DECIMAL(10, 2), nullable=False, default=0)
    hotel_payout = Column(DECIMAL(10, 2), nullable=False, default=0)
    payout_status = Column(String(20), default="pending")  # pending, paid, failed
    paid_at = Column(DateTime)
    refunded_at = Column(DateTime)
    refund_amount = Column(DECIMAL(10, 2))

    # Relationships
    tenant = relationship("Tenant")
    booking = relationship("Booking", back_populates="payments")
