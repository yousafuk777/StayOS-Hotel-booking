import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification
from app.models.user import User
from app.core.database import async_session_maker
from datetime import datetime, timedelta
import random


async def seed_notifications(db: AsyncSession):
    """Seed test notifications for users."""

    # Get all users
    result = await db.execute(select(User))
    users = result.scalars().all()

    if not users:
        print("No users found. Please seed users first.")
        return

    # Sample notification data
    notification_templates = [
        {
            "type": "booking",
            "title": "New Booking Received",
            "body": "A new booking has been confirmed for your hotel.",
            "icon": "📅"
        },
        {
            "type": "alert",
            "title": "Low Occupancy Alert",
            "body": "Occupancy rate for next week is below 50%.",
            "icon": "⚠️"
        },
        {
            "type": "maintenance",
            "title": "Maintenance Request",
            "body": "A maintenance issue has been reported.",
            "icon": "🔧"
        },
        {
            "type": "payment",
            "title": "Payment Failed",
            "body": "A payment attempt has failed.",
            "icon": "💳"
        },
        {
            "type": "review",
            "title": "New Review Received",
            "body": "A guest has left a review for your hotel.",
            "icon": "⭐"
        },
        {
            "type": "housekeeping",
            "title": "Room Ready",
            "body": "A room has been cleaned and is ready for check-in.",
            "icon": "✨"
        }
    ]

    notifications_created = 0

    for user in users:
        # Create 3-8 random notifications per user
        num_notifications = random.randint(3, 8)

        for i in range(num_notifications):
            template = random.choice(notification_templates)

            # Create notification with random read status and time
            is_read = random.choice([True, False, False])  # 33% chance unread
            created_at = datetime.utcnow() - timedelta(
                minutes=random.randint(0, 1440)  # Random time within last 24 hours
            )

            notification = Notification(
                tenant_id=user.tenant_id or 1,
                user_id=user.id,
                type=template["type"],
                title=template["title"],
                body=template["body"],
                data=f'{{"icon": "{template["icon"]}"}}',
                is_read=is_read,
                created_at=created_at,
                updated_at=created_at
            )

            db.add(notification)
            notifications_created += 1

    await db.commit()
    print(f"Created {notifications_created} test notifications for {len(users)} users")


async def main():
    async with async_session_maker() as session:
        await seed_notifications(session)


if __name__ == "__main__":
    asyncio.run(main())