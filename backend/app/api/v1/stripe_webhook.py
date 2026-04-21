from fastapi import APIRouter, Request, Header, HTTPException, Depends
import stripe
from app.core.config import settings
from app.services.stripe_service import stripe_service
from app.models.booking import Booking
from app.core.database import async_session_maker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None)
):
    """
    Secure webhook endpoint for Stripe events.
    Verifies signature and updates booking payment status.
    """
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        await handle_payment_success(intent)
    elif event['type'] == 'payment_intent.payment_failed':
        intent = event['data']['object']
        await handle_payment_failure(intent)
    elif event['type'] == 'payment_intent.amount_capturable_updated':
        # This occurs after successful authorization (manual capture mode)
        intent = event['data']['object']
        await handle_payment_authorized(intent)
    
    return {"status": "success"}


async def get_db_context():
    """Helper to get DB session inside webhook since it's called by Stripe, not by our app's DI normally in this context? 
    Actually, we can use Depends(get_db) but we need to call it manually if not in a route.
    Wait, this IS a route, so we can use Depends(get_db).
    """
    async with async_session_maker() as session:
        yield session

async def handle_payment_authorized(intent):
    """Update booking status to 'authorized'."""
    booking_reference = intent.metadata.get("booking_reference")
    if not booking_reference:
        logger.error("No booking_reference found in PaymentIntent metadata")
        return

    async with async_session_maker() as session:
        result = await session.execute(select(Booking).where(Booking.reference_number == booking_reference))
        booking = result.scalar_one_or_none()
        if booking:
            booking.payment_status = "authorized"
            booking.stripe_payment_intent_id = intent.id
            await session.commit()
            logger.info(f"Booking {booking_reference} payment authorized (held).")

async def handle_payment_success(intent):
    """Update booking status to 'paid'."""
    booking_reference = intent.metadata.get("booking_reference")
    if not booking_reference:
        return

    async with async_session_maker() as session:
        result = await session.execute(select(Booking).where(Booking.reference_number == booking_reference))
        booking = result.scalar_one_or_none()
        if booking:
            booking.payment_status = "paid"
            # If we captured, we might get a charge ID
            if intent.latest_charge:
                booking.stripe_charge_id = intent.latest_charge
            await session.commit()
            logger.info(f"Booking {booking_reference} payment captured (paid).")

async def handle_payment_failure(intent):
    """Update booking status to 'failed'."""
    booking_reference = intent.metadata.get("booking_reference")
    if not booking_reference:
        return

    from app.core.database import async_session_maker
    async with async_session_maker() as session:
        result = await session.execute(select(Booking).where(Booking.reference_number == booking_reference))
        booking = result.scalar_one_or_none()
        if booking:
            booking.payment_status = "failed"
            await session.commit()
            logger.error(f"Booking {booking_reference} payment failed.")
