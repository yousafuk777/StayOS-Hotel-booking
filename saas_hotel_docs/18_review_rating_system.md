# 18 — Review & Rating System

## Overview

Reviews are submitted by guests who have completed a stay. The system supports multi-criteria ratings, hotel responses, and flagging/moderation.

---

## Review Data Model

```python
# app/models/review.py

class Review(BaseModel):
    __tablename__ = "reviews"

    tenant_id        = Column(Integer, ForeignKey("tenants.id"))
    hotel_id         = Column(Integer, ForeignKey("hotels.id"))
    booking_id       = Column(Integer, ForeignKey("bookings.id"), unique=True)
    guest_id         = Column(Integer, ForeignKey("users.id"))
    overall_score    = Column(Integer, nullable=False)  # 1–10
    cleanliness_score = Column(Integer)
    service_score    = Column(Integer)
    location_score   = Column(Integer)
    value_score      = Column(Integer)
    title            = Column(String(255))
    body             = Column(Text)
    hotel_response   = Column(Text)
    responded_at     = Column(DateTime)
    is_flagged       = Column(Boolean, default=False)
    is_published     = Column(Boolean, default=True)
```

---

## Review Service

```python
# app/services/review_service.py

class ReviewService:

    @staticmethod
    async def submit_review(db: AsyncSession, tenant_id: int, guest_id: int, data: ReviewCreate):
        # Verify booking exists and belongs to guest
        booking = await BookingRepository.get_by_id(db, tenant_id, data.booking_id)
        if not booking or booking.guest_id != guest_id:
            raise ValueError("Booking not found")

        if booking.status != "completed":
            raise ValueError("Can only review completed stays")

        # Check no existing review
        existing = await ReviewRepository.get_by_booking(db, data.booking_id)
        if existing:
            raise ValueError("Review already submitted for this booking")

        # Check within 30-day window
        days_since_checkout = (date.today() - booking.check_out_date).days
        if days_since_checkout > 30:
            raise ValueError("Review period has expired (30 days)")

        review = await ReviewRepository.create(db, tenant_id, {
            "hotel_id": booking.hotel_id,
            "booking_id": data.booking_id,
            "guest_id": guest_id,
            "overall_score": data.overall_score,
            "cleanliness_score": data.cleanliness_score,
            "service_score": data.service_score,
            "location_score": data.location_score,
            "value_score": data.value_score,
            "title": data.title,
            "body": data.body,
        })

        # Update hotel aggregate ratings
        await ReviewService.recalculate_hotel_ratings(db, booking.hotel_id)

        # Notify hotel admin
        await NotificationService.create(db, tenant_id, {
            "user_id": await HotelRepository.get_admin_id(db, booking.hotel_id),
            "type": "new_review",
            "title": "New guest review",
            "body": f"A guest rated their stay {data.overall_score}/10",
            "data": {"review_id": review.id, "hotel_id": booking.hotel_id}
        })

        return review

    @staticmethod
    async def recalculate_hotel_ratings(db: AsyncSession, hotel_id: int):
        """Recalculate and cache aggregate hotel ratings."""
        from sqlalchemy import func

        result = await db.execute(
            select(
                func.avg(Review.overall_score).label("overall"),
                func.avg(Review.cleanliness_score).label("cleanliness"),
                func.avg(Review.service_score).label("service"),
                func.avg(Review.location_score).label("location"),
                func.avg(Review.value_score).label("value"),
                func.count(Review.id).label("review_count"),
            ).where(
                Review.hotel_id == hotel_id,
                Review.is_published == True,
            )
        )
        ratings = result.one()

        await HotelRepository.update(db, hotel_id, {
            "overall_rating": round(float(ratings.overall or 0), 1),
            "cleanliness_rating": round(float(ratings.cleanliness or 0), 1),
            "service_rating": round(float(ratings.service or 0), 1),
            "location_rating": round(float(ratings.location or 0), 1),
            "value_rating": round(float(ratings.value or 0), 1),
            "review_count": ratings.review_count,
        })
```

---

## Review API Endpoints

```python
# app/api/v1/reviews.py

@router.post("/", status_code=201)
async def submit_review(
    body: ReviewCreate,
    request: Request,
    db=Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    review = await ReviewService.submit_review(
        db, request.state.tenant_id, current_user.id, body
    )
    return review


@router.get("/hotel/{hotel_id}")
async def hotel_reviews(
    hotel_id: int,
    request: Request,
    db=Depends(get_db),
    page: int = Query(default=1),
    sort_by: str = Query(default="recent"),  # recent | highest | lowest
):
    reviews = await ReviewRepository.get_paginated(
        db, request.state.tenant_id, hotel_id,
        page=page, sort_by=sort_by
    )
    return reviews


@router.put("/{review_id}/respond")
async def respond_to_review(
    review_id: int,
    body: ReviewResponse,
    request: Request,
    db=Depends(get_db),
    current_user=Depends(RequireHotelAdmin)
):
    review = await ReviewRepository.get_by_id(db, request.state.tenant_id, review_id)
    if review.hotel_response:
        raise HTTPException(400, "Already responded to this review")

    await ReviewRepository.update(db, review_id, {
        "hotel_response": body.response,
        "responded_at": datetime.utcnow(),
    })
    return {"message": "Response published"}
```

---

## Review Component (Frontend)

```typescript
// src/components/hotel/ReviewsList.tsx

'use client'
import { StarRating } from '@/components/ui/StarRating'

interface ReviewProps {
  review: Review
}

function ReviewItem({ review }: ReviewProps) {
  return (
    <div className="border-b pb-6 mb-6 last:border-0">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold">{review.guest_name}</p>
          <p className="text-sm text-text-secondary">{formatDate(review.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full font-bold text-sm">
            {review.overall_score}/10
          </span>
        </div>
      </div>

      {/* Criteria scores */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ['Cleanliness', review.cleanliness_score],
          ['Service', review.service_score],
          ['Location', review.location_score],
          ['Value', review.value_score],
        ].map(([label, score]) => (
          <div key={label as string} className="text-center">
            <div className="text-xs text-text-secondary mb-1">{label}</div>
            <div className="font-semibold text-sm">{score}/10</div>
            <div className="h-1.5 bg-gray-200 rounded-full mt-1">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(Number(score) / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {review.title && <p className="font-semibold mb-1">{review.title}</p>}
      <p className="text-text-secondary">{review.body}</p>

      {/* Hotel response */}
      {review.hotel_response && (
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">Response from the hotel</p>
          <p className="text-sm text-blue-700">{review.hotel_response}</p>
        </div>
      )}
    </div>
  )
}

export function ReviewsList({ hotelId }: { hotelId: number }) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['reviews', hotelId],
    queryFn: ({ pageParam = 1 }) => hotelService.getReviews(hotelId, pageParam),
    getNextPageParam: (last) => last.meta.has_next ? last.meta.page + 1 : undefined,
  })

  const reviews = data?.pages.flatMap(p => p.reviews) ?? []

  return (
    <div>
      {reviews.map(review => <ReviewItem key={review.id} review={review} />)}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} className="text-primary-600 font-medium">
          Load more reviews
        </button>
      )}
    </div>
  )
}
```
