import stripe
from app.core.config import settings
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    @staticmethod
    async def create_payment_intent(
        amount: int, 
        currency: str = "usd", 
        metadata: Optional[Dict[str, Any]] = None,
        description: Optional[str] = None
    ) -> Any:
        """
        Create a PaymentIntent with manual capture method.
        Amount should be in cents.
        Returns a mock intent if STRIPE_SECRET_KEY is not configured.
        """
        if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY.startswith("sk_test_..."):
            logger.warning("STRIPE_SECRET_KEY not set. Using MOCK mode.")
            return type('MockIntent', (), {
                'id': f"mock_pi_{amount}",
                'client_secret': 'mock_secret',
                'status': 'requires_capture',
                'latest_charge': 'mock_ch',
                'metadata': metadata or {}
            })()

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                capture_method="manual",
                metadata=metadata or {},
                description=description
            )
            return intent
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating PaymentIntent: {str(e)}")
            raise Exception(f"Failed to create payment intent: {str(e)}")

    @staticmethod
    async def capture_payment(payment_intent_id: str) -> Any:
        """
        Capture an authorized PaymentIntent.
        """
        if payment_intent_id.startswith("mock_"):
            logger.info(f"MOCK mode: Successfully 'captured' payment: {payment_intent_id}")
            return type('MockIntent', (), {'id': payment_intent_id, 'status': 'succeeded'})()

        try:
            intent = stripe.PaymentIntent.capture(payment_intent_id)
            logger.info(f"Successfully captured payment: {payment_intent_id}")
            return intent
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error capturing payment {payment_intent_id}: {str(e)}")
            raise Exception(f"Failed to capture payment: {str(e)}")

    @staticmethod
    async def refund_payment(payment_intent_id: str) -> Any:
        """
        Refund or cancel an authorized PaymentIntent.
        If not yet captured, it cancels the intent.
        """
        if payment_intent_id.startswith("mock_"):
            logger.info(f"MOCK mode: Successfully 'refunded' payment: {payment_intent_id}")
            return type('MockRefund', (), {'id': f"mock_re_{payment_intent_id}", 'status': 'succeeded'})()

        try:
            # First, check the status of the PaymentIntent
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == "requires_capture":
                # If it's only authorized, cancel it
                canceled_intent = stripe.PaymentIntent.cancel(payment_intent_id)
                logger.info(f"Successfully canceled payment intent: {payment_intent_id}")
                return canceled_intent
            else:
                # If already captured, refund it
                refund = stripe.Refund.create(payment_intent=payment_intent_id)
                logger.info(f"Successfully refunded payment: {payment_intent_id}")
                return refund
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error refunding/canceling payment {payment_intent_id}: {str(e)}")
            raise Exception(f"Failed to refund payment: {str(e)}")

stripe_service = StripeService()
