# 19 — Notification System

## Overview

StayOS delivers notifications through two channels:
1. **In-app notifications** — stored in the database, polled by frontend
2. **Email notifications** — sent via SendGrid using templates

---

## Notification Types

| Type | Trigger | Channel |
|------|---------|---------|
| `booking_confirmed` | Booking payment succeeds | Email + In-app |
| `booking_cancelled` | Guest or hotel cancels | Email + In-app |
| `booking_reminder_24h` | 24h before check-in | Email |
| `check_in_ready` | Hotel marks room ready | In-app |
| `new_review` | Guest submits review | In-app (Hotel Admin) |
| `review_response` | Hotel responds to review | In-app (Guest) |
| `payment_received` | Payment processed | Email |
| `refund_processed` | Refund issued | Email + In-app |
| `platform_announcement` | Super Admin broadcast | In-app (All Admins) |
| `subscription_renewal` | 7 days before renewal | Email (Hotel Admin) |

---

## Notification Service

```python
# app/services/notification_service.py

from app.repositories.notification_repo import NotificationRepository
from app.tasks.email_tasks import send_email_async

class NotificationService:

    @staticmethod
    async def create(db: AsyncSession, tenant_id: int, data: dict):
        """Create in-app notification for a user."""
        return await NotificationRepository.create(db, tenant_id, data)

    @staticmethod
    async def notify_booking_confirmed(db: AsyncSession, booking_id: int):
        booking = await BookingRepository.get_with_details(db, booking_id)

        # In-app for guest
        await NotificationService.create(db, booking.tenant_id, {
            "user_id": booking.guest_id,
            "type": "booking_confirmed",
            "title": "Booking Confirmed!",
            "body": f"Your booking at {booking.hotel.name} is confirmed. Ref: {booking.reference_number}",
            "data": {"booking_id": booking_id, "reference": booking.reference_number},
        })

        # In-app for hotel admin
        admin_id = await HotelRepository.get_admin_id(db, booking.hotel_id)
        await NotificationService.create(db, booking.tenant_id, {
            "user_id": admin_id,
            "type": "new_booking",
            "title": "New Booking Received",
            "body": f"Booking {booking.reference_number} confirmed for {booking.check_in_date}",
            "data": {"booking_id": booking_id},
        })

        # Email to guest
        send_booking_confirmation_email.delay(booking_id)

    @staticmethod
    async def get_user_notifications(
        db: AsyncSession,
        tenant_id: int,
        user_id: int,
        unread_only: bool = False,
        page: int = 1
    ):
        return await NotificationRepository.get_paginated(
            db, tenant_id, user_id, unread_only=unread_only, page=page
        )

    @staticmethod
    async def mark_read(db: AsyncSession, user_id: int, notification_ids: list[int]):
        await NotificationRepository.mark_read(db, user_id, notification_ids)

    @staticmethod
    async def mark_all_read(db: AsyncSession, user_id: int, tenant_id: int):
        await NotificationRepository.mark_all_read(db, user_id, tenant_id)
```

---

## Email Task with Templates

```python
# app/tasks/email_tasks.py

from app.worker import celery_app
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings
from jinja2 import Environment, FileSystemLoader

jinja_env = Environment(loader=FileSystemLoader("app/templates/email"))

def render_template(template_name: str, context: dict) -> tuple[str, str]:
    template = jinja_env.get_template(template_name)
    html = template.render(**context)
    subject_template = jinja_env.get_template(f"subjects/{template_name}")
    subject = subject_template.render(**context).strip()
    return subject, html

@celery_app.task(bind=True, max_retries=3)
def send_booking_confirmation_email(self, booking_id: int):
    try:
        with get_db_context() as db:
            booking = BookingRepository.sync_get_with_details(db, booking_id)
            subject, html = render_template("booking_confirmation.html", {
                "guest_name": booking.guest.first_name,
                "hotel_name": booking.hotel.name,
                "reference": booking.reference_number,
                "check_in": booking.check_in_date,
                "check_out": booking.check_out_date,
                "nights": booking.nights,
                "total": booking.total_amount,
            })

        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        message = Mail(
            from_email=(settings.EMAIL_FROM, settings.EMAIL_FROM_NAME),
            to_emails=booking.guest.email,
            subject=subject,
            html_content=html,
        )
        sg.send(message)

    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)


@celery_app.task
def send_check_in_reminder(booking_id: int):
    """Scheduled 24h before check-in via Celery Beat."""
    with get_db_context() as db:
        booking = BookingRepository.sync_get_with_details(db, booking_id)
        subject, html = render_template("check_in_reminder.html", {
            "guest_name": booking.guest.first_name,
            "hotel_name": booking.hotel.name,
            "check_in": booking.check_in_date,
            "hotel_address": booking.hotel.full_address,
        })
        # send email...
```

---

## Celery Beat Schedule (Scheduled Reminders)

```python
# app/tasks/celery_app.py

from celery import Celery
from celery.schedules import crontab

celery = Celery("stayos", broker=settings.CELERY_BROKER_URL)

celery.conf.beat_schedule = {
    "send-check-in-reminders": {
        "task": "app.tasks.notification_tasks.send_upcoming_check_in_reminders",
        "schedule": crontab(hour=10, minute=0),  # Daily at 10 AM UTC
    },
    "process-subscription-renewals": {
        "task": "app.tasks.payment_tasks.check_subscription_renewals",
        "schedule": crontab(hour=0, minute=0),  # Daily at midnight
    },
}
```

---

## Frontend: Notification Bell Component

```typescript
// src/components/layout/NotificationBell.tsx

'use client'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notification.service'
import { Bell } from 'lucide-react'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getAll,
    refetchInterval: 30_000,  // Poll every 30s
  })

  const markRead = useMutation({
    mutationFn: (ids: number[]) => notificationService.markRead(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unreadCount = data?.notifications.filter(n => !n.is_read).length ?? 0

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                           w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-xl rounded-2xl border z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markRead.mutate(
                  data!.notifications.filter(n => !n.is_read).map(n => n.id)
                )}
                className="text-xs text-primary-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {data?.notifications.length === 0 ? (
              <p className="text-center text-text-secondary py-8 text-sm">No notifications</p>
            ) : (
              data?.notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer
                    ${!n.is_read ? 'bg-blue-50' : ''}`}
                  onClick={() => !n.is_read && markRead.mutate([n.id])}
                >
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{n.body}</p>
                  <p className="text-xs text-text-secondary mt-1">{timeAgo(n.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```
