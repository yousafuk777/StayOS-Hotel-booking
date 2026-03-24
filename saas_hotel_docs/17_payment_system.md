# 17 — Payment System

## Overview

StayOS uses Stripe as the payment processor. The platform implements **Stripe Connect** for marketplace-style payouts where:
- Guests pay the platform
- Platform deducts commission
- Hotel receives payout to their Stripe Connected Account

---

## Payment Flow

```
Guest → Creates Booking
     ↓
System → Creates Stripe PaymentIntent
     ↓
Guest → Enters card via Stripe Elements
     ↓
Stripe → Charges guest
     ↓
Stripe Webhook → Notifies StayOS
     ↓
StayOS → Marks booking confirmed
       → Records payment
       → Triggers hotel payout (minus commission)
       → Sends confirmation email
```

---

## Payment Service Implementation

```python
# app/services/payment_service.py

import stripe
from app.core.config import settings
from app.repositories.payment_repo import PaymentRepository
from app.repositories.booking_repo import BookingRepository

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:

    @staticmethod
    async def create_payment_intent(
        db: AsyncSession,
        tenant_id: int,
        booking_id: int
    ) -> dict:
        booking = await BookingRepository.get_by_id(db, tenant_id, booking_id)
        if not booking:
            raise ValueError("Booking not found")

        # Amount in cents
        amount_cents = int(booking.total_amount * 100)

        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=booking.currency or "usd",
            metadata={
                "booking_id": str(booking_id),
                "tenant_id": str(tenant_id),
                "reference": booking.reference_number,
            }
        )

        # Store intent ID
        await PaymentRepository.create(db, tenant_id, {
            "booking_id": booking_id,
            "amount": booking.total_amount,
            "currency": "USD",
            "stripe_payment_intent_id": intent.id,
            "status": "pending",
            "platform_commission": booking.total_amount * settings.STRIPE_PLATFORM_COMMISSION_PERCENT / 100,
            "hotel_payout": booking.total_amount * (1 - settings.STRIPE_PLATFORM_COMMISSION_PERCENT / 100),
        })

        return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}

    @staticmethod
    async def handle_payment_success(db: AsyncSession, payment_intent_id: str):
        """Called from Stripe webhook on payment_intent.succeeded."""
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        booking_id = int(intent.metadata["booking_id"])
        tenant_id = int(intent.metadata["tenant_id"])

        # Update payment record
        await PaymentRepository.mark_completed(db, payment_intent_id, intent.charges.data[0].id)

        # Confirm booking
        await BookingRepository.update_status(db, tenant_id, booking_id, "confirmed")

        # Schedule hotel payout
        payout_task.delay(booking_id, tenant_id)

        # Send confirmation email
        send_booking_confirmation.delay(booking_id)

    @staticmethod
    async def refund_payment(
        db: AsyncSession,
        tenant_id: int,
        booking_id: int,
        amount: Optional[float] = None
    ) -> dict:
        payment = await PaymentRepository.get_by_booking(db, booking_id)
        if not payment:
            raise ValueError("Payment not found")

        refund_amount = int((amount or payment.amount) * 100)

        refund = stripe.Refund.create(
            charge=payment.stripe_charge_id,
            amount=refund_amount,
        )

        await PaymentRepository.mark_refunded(db, payment.id, refund_amount / 100)
        await BookingRepository.update_status(db, tenant_id, booking_id, "cancelled")

        return {"refund_id": refund.id, "amount": refund_amount / 100}
```

---

## Stripe Webhook Handler

```python
# app/api/v1/payments.py

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(400, "Invalid Stripe webhook")

    handler_map = {
        "payment_intent.succeeded": PaymentService.handle_payment_success,
        "payment_intent.payment_failed": PaymentService.handle_payment_failed,
        "refund.created": PaymentService.handle_refund_created,
    }

    handler = handler_map.get(event.type)
    if handler:
        await handler(db, event.data.object.id)

    return {"received": True}
```

---

## Payout Flow (Celery Task)

```python
# app/tasks/payment_tasks.py

from app.worker import celery_app
import stripe

@celery_app.task(bind=True, max_retries=3)
def payout_hotel(self, booking_id: int, tenant_id: int):
    """Transfer hotel payout after booking completion."""
    try:
        with get_db_context() as db:
            payment = PaymentRepository.sync_get_by_booking(db, booking_id)
            tenant = TenantRepository.sync_get_by_id(db, tenant_id)

            if not tenant.stripe_account_id:
                # Log: hotel has no Stripe account, hold payout
                return

            # Transfer hotel's portion to their Stripe connected account
            transfer = stripe.Transfer.create(
                amount=int(payment.hotel_payout * 100),
                currency="usd",
                destination=tenant.stripe_account_id,
                metadata={"booking_id": str(booking_id)},
            )

            PaymentRepository.sync_mark_payout_sent(db, payment.id, transfer.id)

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * 5)  # Retry after 5 min
```
