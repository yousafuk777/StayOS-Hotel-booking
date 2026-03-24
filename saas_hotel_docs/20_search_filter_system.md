# 20 — Search & Filter System

## Overview

The search system allows guests to find hotels using destination, dates, guest count, and a rich set of filters. Results are paginated and sortable.

---

## Search Architecture

```
User Input (SearchBar)
       │
       ▼
URL Query Params (?destination=NYC&checkIn=...&filters=...)
       │
       ▼
Next.js Page → useHotelSearch(params)
       │
       ▼
TanStack Query → GET /api/v1/hotels/search
       │
       ▼
FastAPI → HotelService.search()
       │
       ▼
MySQL Query (with availability sub-query + filters)
       │
  [Redis Cache? → Hit → Return cached]
  [Redis Cache? → Miss → Query DB → Cache → Return]
       │
       ▼
Paginated Results JSON
```

---

## Search Bar Component

```typescript
// src/components/search/SearchBar.tsx

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'

interface SearchValues {
  destination: string
  checkIn: Date | null
  checkOut: Date | null
  guests: number
}

export function SearchBar({ initialValues }: { initialValues?: Partial<SearchValues> }) {
  const router = useRouter()
  const [values, setValues] = useState<SearchValues>({
    destination: initialValues?.destination ?? '',
    checkIn: initialValues?.checkIn ? new Date(initialValues.checkIn) : null,
    checkOut: initialValues?.checkOut ? new Date(initialValues.checkOut) : null,
    guests: initialValues?.guests ?? 1,
  })

  const handleSearch = () => {
    if (!values.destination || !values.checkIn || !values.checkOut) return

    const params = new URLSearchParams({
      destination: values.destination,
      checkIn: format(values.checkIn, 'yyyy-MM-dd'),
      checkOut: format(values.checkOut, 'yyyy-MM-dd'),
      guests: String(values.guests),
    })

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 bg-white rounded-2xl shadow-lg p-3">
      {/* Destination */}
      <div className="flex-1 px-3">
        <label className="text-xs font-medium text-text-secondary">Destination</label>
        <input
          type="text"
          placeholder="City, hotel, region..."
          value={values.destination}
          onChange={e => setValues(v => ({ ...v, destination: e.target.value }))}
          className="w-full text-sm outline-none mt-1"
        />
      </div>

      <div className="w-px bg-gray-200 hidden md:block" />

      {/* Check-in */}
      <div className="px-3">
        <label className="text-xs font-medium text-text-secondary">Check-in</label>
        <DatePicker
          selected={values.checkIn}
          onChange={d => setValues(v => ({ ...v, checkIn: d }))}
          minDate={new Date()}
          placeholderText="Select date"
          className="w-full text-sm outline-none mt-1"
        />
      </div>

      <div className="w-px bg-gray-200 hidden md:block" />

      {/* Check-out */}
      <div className="px-3">
        <label className="text-xs font-medium text-text-secondary">Check-out</label>
        <DatePicker
          selected={values.checkOut}
          onChange={d => setValues(v => ({ ...v, checkOut: d }))}
          minDate={values.checkIn ?? new Date()}
          placeholderText="Select date"
          className="w-full text-sm outline-none mt-1"
        />
      </div>

      <div className="w-px bg-gray-200 hidden md:block" />

      {/* Guests */}
      <div className="px-3">
        <label className="text-xs font-medium text-text-secondary">Guests</label>
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => setValues(v => ({ ...v, guests: Math.max(1, v.guests - 1) }))}
            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">-</button>
          <span className="text-sm font-medium w-4 text-center">{values.guests}</span>
          <button onClick={() => setValues(v => ({ ...v, guests: Math.min(20, v.guests + 1) }))}
            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">+</button>
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700"
      >
        Search
      </button>
    </div>
  )
}
```

---

## Filter Panel Component

```typescript
// src/components/search/FilterPanel.tsx

'use client'
import { useState } from 'react'

const AMENITIES = ['WiFi', 'Pool', 'Gym', 'Spa', 'Parking', 'Restaurant', 'Bar', 'Pet Friendly']
const MEAL_PLANS = ['Room Only', 'Breakfast', 'Half Board', 'Full Board', 'All Inclusive']

interface Filters {
  minPrice?: number
  maxPrice?: number
  starRating?: number[]
  minRating?: number
  amenities?: string[]
  mealPlan?: string
  freeCancel?: boolean
}

export function FilterPanel({ onFiltersChange }: { onFiltersChange: (f: Filters) => void }) {
  const [filters, setFilters] = useState<Filters>({})

  const updateFilters = (update: Partial<Filters>) => {
    const next = { ...filters, ...update }
    setFilters(next)
    onFiltersChange(next)
  }

  const toggleStar = (star: number) => {
    const current = filters.starRating ?? []
    const next = current.includes(star)
      ? current.filter(s => s !== star)
      : [...current, star]
    updateFilters({ starRating: next })
  }

  return (
    <aside className="space-y-6 sticky top-4">
      {/* Price Range */}
      <FilterSection title="Price per Night">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-1/2 border rounded-lg p-2 text-sm"
            onChange={e => updateFilters({ minPrice: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-1/2 border rounded-lg p-2 text-sm"
            onChange={e => updateFilters({ maxPrice: Number(e.target.value) })}
          />
        </div>
      </FilterSection>

      {/* Star Rating */}
      <FilterSection title="Star Rating">
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => toggleStar(star)}
              className={`px-3 py-1 rounded-full border text-sm font-medium
                ${filters.starRating?.includes(star)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 hover:border-primary-400'}`}
            >
              {'★'.repeat(star)}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Guest Rating */}
      <FilterSection title="Guest Rating">
        {[9, 8, 7].map(score => (
          <label key={score} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              onChange={() => updateFilters({ minRating: score })}
            />
            <span className="text-sm">{score}+ · {score === 9 ? 'Superb' : score === 8 ? 'Very Good' : 'Good'}</span>
          </label>
        ))}
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Amenities">
        {AMENITIES.map(a => (
          <label key={a} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              onChange={e => {
                const curr = filters.amenities ?? []
                updateFilters({
                  amenities: e.target.checked
                    ? [...curr, a]
                    : curr.filter(x => x !== a)
                })
              }}
            />
            <span className="text-sm">{a}</span>
          </label>
        ))}
      </FilterSection>

      {/* Free Cancellation */}
      <FilterSection title="Policies">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            onChange={e => updateFilters({ freeCancel: e.target.checked })}
          />
          <span className="text-sm">Free cancellation</span>
        </label>
      </FilterSection>
    </aside>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
```

---

## Backend Search Query

```python
# app/services/hotel_service.py

class HotelService:

    @staticmethod
    async def search(
        db: AsyncSession,
        tenant_id: int,
        destination: str,
        check_in: date,
        check_out: date,
        guests: int = 1,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        star_rating: Optional[list[int]] = None,
        min_rating: Optional[float] = None,
        amenity_ids: Optional[list[int]] = None,
        free_cancel: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        # Cache key
        cache_key = f"search:{tenant_id}:{destination}:{check_in}:{check_out}:{guests}:{page}"
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)

        # Subquery: booked room IDs for given dates
        booked_rooms = (
            select(BookingRoom.room_id)
            .join(Booking, BookingRoom.booking_id == Booking.id)
            .where(
                Booking.tenant_id == tenant_id,
                Booking.status.in_(["confirmed", "checked_in"]),
                Booking.check_in_date < check_out,
                Booking.check_out_date > check_in,
            )
            .scalar_subquery()
        )

        # Available rooms subquery
        available_rooms = (
            select(Room.hotel_id, func.count(Room.id).label("available_count"),
                   func.min(
                       func.coalesce(Room.custom_price, RoomCategory.base_price)
                   ).label("lowest_price"))
            .join(RoomCategory, Room.category_id == RoomCategory.id)
            .where(
                Room.tenant_id == tenant_id,
                Room.status == "available",
                Room.is_deleted == False,
                Room.id.notin_(booked_rooms),
                RoomCategory.capacity >= guests,
            )
            .group_by(Room.hotel_id)
            .subquery()
        )

        # Main hotel query
        stmt = (
            select(Hotel, available_rooms.c.lowest_price, available_rooms.c.available_count)
            .join(available_rooms, Hotel.id == available_rooms.c.hotel_id)
            .where(
                Hotel.tenant_id == tenant_id,
                Hotel.is_active == True,
                Hotel.is_deleted == False,
                or_(
                    Hotel.city.ilike(f"%{destination}%"),
                    Hotel.name.ilike(f"%{destination}%"),
                )
            )
        )

        # Apply filters
        if min_price: stmt = stmt.where(available_rooms.c.lowest_price >= min_price)
        if max_price: stmt = stmt.where(available_rooms.c.lowest_price <= max_price)
        if star_rating: stmt = stmt.where(Hotel.star_rating.in_(star_rating))
        if min_rating: stmt = stmt.where(Hotel.overall_rating >= min_rating)

        # Pagination
        total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
        results = await db.execute(stmt.offset((page - 1) * page_size).limit(page_size))

        hotels = [
            {**row.Hotel.__dict__, "lowest_price": row.lowest_price, "available_rooms": row.available_count}
            for row in results.all()
        ]

        response = {
            "hotels": hotels,
            "meta": {"page": page, "page_size": page_size, "total": total}
        }

        # Cache results for 5 minutes
        await redis_client.setex(cache_key, 300, json.dumps(response, default=str))
        return response
```
