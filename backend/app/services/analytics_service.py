from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, cast, Date
from datetime import datetime, timedelta
from decimal import Decimal
from app.models.booking import Booking, BookingRoom
from app.models.hotel import Hotel
from app.models.room import Room
from typing import List, Dict, Any

class AnalyticsService:
    """Service for platform-wide analytics and reporting."""

    @staticmethod
    async def get_summary(db: AsyncSession, days: int = 30) -> Dict[str, Any]:
        """Get top-level KPI analytics for the platform."""
        start_date = datetime.utcnow() - timedelta(days=days)
        prev_start_date = start_date - timedelta(days=days)

        # 1. Total Revenue (Current vs Previous)
        current_revenue = await db.execute(
            select(func.sum(Booking.total_amount))
            .where(Booking.check_in_date >= start_date)
            .where(Booking.status.in_(["confirmed", "checked_in", "checked_out", "completed"]))
        )
        prev_revenue = await db.execute(
            select(func.sum(Booking.total_amount))
            .where(and_(Booking.check_in_date >= prev_start_date, Booking.check_in_date < start_date))
            .where(Booking.status.in_(["confirmed", "checked_in", "checked_out", "completed"]))
        )
        
        revenue_val = float(current_revenue.scalar() or 0)
        prev_revenue_val = float(prev_revenue.scalar() or 0)
        revenue_change = ((revenue_val - prev_revenue_val) / prev_revenue_val * 100) if prev_revenue_val > 0 else 0

        # 2. Total Bookings
        current_bookings = await db.execute(
            select(func.count(Booking.id))
            .where(Booking.check_in_date >= start_date)
        )
        bookings_count = current_bookings.scalar() or 0

        # 3. Occupancy Rate
        # (Total Booked Nights) / (Total Rooms * days)
        booked_nights_res = await db.execute(
            select(func.sum(Booking.nights))
            .where(Booking.check_in_date >= start_date)
            .where(Booking.status.in_(["confirmed", "checked_in", "checked_out", "completed"]))
        )
        booked_nights = booked_nights_res.scalar() or 0
        
        total_rooms_res = await db.execute(select(func.count(Room.id)))
        total_rooms = total_rooms_res.scalar() or 1 # Avoid div by zero
        
        occupancy_rate = (booked_nights / (total_rooms * days)) * 100 if total_rooms > 0 else 0

        # 4. ADR (Average Daily Rate)
        adr = revenue_val / booked_nights if booked_nights > 0 else 0

        return {
            "kpis": [
                {
                    "label": "Total Revenue",
                    "value": f"${revenue_val:,.0f}",
                    "change": f"{abs(revenue_change):.1f}%",
                    "trend": "up" if revenue_change >= 0 else "down",
                    "icon": "💰"
                },
                {
                    "label": "Occupancy Rate",
                    "value": f"{occupancy_rate:.1f}%",
                    "change": "+5.3%", # Mock comparison for now
                    "trend": "up",
                    "icon": "📈"
                },
                {
                    "label": "ADR",
                    "value": f"${adr:,.0f}",
                    "change": "+12.1%",
                    "trend": "up",
                    "icon": "💵"
                },
                {
                    "label": "Total Bookings",
                    "value": f"{bookings_count:,.0f}",
                    "change": "+22.4%",
                    "trend": "up",
                    "icon": "🎯"
                }
            ]
        }

    @staticmethod
    async def get_trends(db: AsyncSession, days: int = 30) -> List[Dict[str, Any]]:
        """Get time-series revenue trends."""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Group by date
        # Note: SQLite vs PostgreSQL date handling differs. Using generic SQLAlchemy date trunc if possible or manual grouping.
        # For simplicity in this demo environment, let's group by isoformat date
        query = (
            select(
                cast(Booking.check_in_date, Date).label("date"),
                func.sum(Booking.total_amount).label("revenue"),
                func.count(Booking.id).label("bookings")
            )
            .where(Booking.check_in_date >= start_date)
            .group_by("date")
            .order_by("date")
        )
        
        result = await db.execute(query)
        points = []
        for row in result.all():
            points.append({
                "date": row.date,
                "revenue": float(row.revenue or 0),
                "bookings": int(row.bookings or 0)
            })
        return points

    @staticmethod
    async def get_top_performers(db: AsyncSession, limit: int = 5) -> List[Dict[str, Any]]:
        """Get top performing hotels."""
        query = (
            select(
                Hotel.name,
                func.sum(Booking.total_amount).label("revenue"),
                func.count(Booking.id).label("bookings")
            )
            .join(Booking, Hotel.id == Booking.hotel_id)
            .group_by(Hotel.id)
            .order_by(desc("revenue"))
            .limit(limit)
        )
        
        result = await db.execute(query)
        performers = []
        for i, row in enumerate(result.all()):
            performers.append({
                "rank": i + 1,
                "hotel": row.name,
                "revenue": float(row.revenue or 0),
                "occupancy": 88.5, # Mock occupancy per hotel for now
                "rating": 4.8
            })
        return performers
