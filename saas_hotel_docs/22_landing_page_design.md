# 22 — Landing Page Design

## Overview

The landing page is the public-facing home of each hotel's booking portal. It is server-side rendered (Next.js SSR) for SEO, uses the tenant's brand colors/logo, and leads visitors into the booking funnel.

---

## Landing Page Sections

```
┌──────────────────────────────────────────────────────┐
│  NAVBAR                                              │
│  Logo | Home | About | Rooms | Contact | Sign In    │
├──────────────────────────────────────────────────────┤
│  HERO SECTION                                        │
│  Full-screen background image                        │
│  "Find Your Perfect Stay"                            │
│  [Search Bar: Destination | Check-in | Check-out |  │
│               Guests | SEARCH BUTTON]                │
├──────────────────────────────────────────────────────┤
│  WHY STAY WITH US — Icon + Feature cards             │
│  Free WiFi | Pool | Spa | Free Cancellation          │
├──────────────────────────────────────────────────────┤
│  FEATURED ROOMS — Horizontal scroll cards            │
│  [Deluxe Room $199] [Suite $349] [Standard $99]      │
├──────────────────────────────────────────────────────┤
│  HOTEL HIGHLIGHTS — Photo + text split section       │
├──────────────────────────────────────────────────────┤
│  GUEST REVIEWS — Rating summary + testimonials       │
├──────────────────────────────────────────────────────┤
│  MAP LOCATION SECTION                                │
├──────────────────────────────────────────────────────┤
│  CALL TO ACTION — "Book Now" full-width banner       │
├──────────────────────────────────────────────────────┤
│  FOOTER                                              │
│  Links | Contact | Social | Copyright                │
└──────────────────────────────────────────────────────┘
```

---

## Landing Page Implementation

```typescript
// src/app/page.tsx  (Server Component)

import { hotelService } from '@/services/hotel.service'
import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { FeaturedRooms } from '@/components/landing/FeaturedRooms'
import { ReviewsSection } from '@/components/landing/ReviewsSection'
import { MapSection } from '@/components/landing/MapSection'
import { CtaBanner } from '@/components/landing/CtaBanner'
import { Footer } from '@/components/layout/Footer'

export default async function LandingPage() {
  // Fetch hotel data server-side for SEO
  const hotel = await hotelService.getHotelInfo()
  const featuredRooms = await hotelService.getFeaturedRooms()
  const reviews = await hotelService.getTopReviews()

  return (
    <main>
      <Navbar hotel={hotel} />
      <HeroSection hotel={hotel} />
      <FeaturesSection amenities={hotel.amenities} />
      <FeaturedRooms rooms={featuredRooms} />
      <ReviewsSection reviews={reviews} overallRating={hotel.overall_rating} />
      <MapSection hotel={hotel} />
      <CtaBanner hotelName={hotel.name} />
      <Footer hotel={hotel} />
    </main>
  )
}
```

---

## Hero Section Component

```typescript
// src/components/landing/HeroSection.tsx

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import { format, addDays } from 'date-fns'

export function HeroSection({ hotel }: { hotel: Hotel }) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date | null>(addDays(new Date(), 1))
  const [checkOut, setCheckOut] = useState<Date | null>(addDays(new Date(), 3))
  const [guests, setGuests] = useState(2)

  const handleSearch = () => {
    if (!checkIn || !checkOut) return
    const params = new URLSearchParams({
      destination: hotel.city,
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      guests: String(guests),
    })
    router.push(`/search?${params}`)
  }

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={hotel.hero_image ?? '/images/default-hero.jpg'}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 w-full max-w-4xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-white/80 mb-3">
          Welcome to
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {hotel.name}
        </h1>
        <p className="text-lg text-white/90 mb-10 max-w-xl mx-auto">
          {hotel.tagline ?? 'Experience luxury and comfort at its finest'}
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 text-left px-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Check-in
            </label>
            <DatePicker
              selected={checkIn}
              onChange={setCheckIn}
              minDate={new Date()}
              placeholderText="Select date"
              className="w-full text-gray-900 font-medium outline-none mt-1"
            />
          </div>
          <div className="w-px bg-gray-200 hidden md:block" />
          <div className="flex-1 text-left px-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Check-out
            </label>
            <DatePicker
              selected={checkOut}
              onChange={setCheckOut}
              minDate={checkIn ?? new Date()}
              placeholderText="Select date"
              className="w-full text-gray-900 font-medium outline-none mt-1"
            />
          </div>
          <div className="w-px bg-gray-200 hidden md:block" />
          <div className="flex-1 text-left px-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Guests
            </label>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
              >
                −
              </button>
              <span className="font-semibold text-gray-900 w-4 text-center">{guests}</span>
              <button
                onClick={() => setGuests(g => Math.min(10, g + 1))}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3
                       rounded-xl font-semibold transition-colors whitespace-nowrap"
          >
            Check Availability
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/60 flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  )
}
```

---

## Features Section

```typescript
// src/components/landing/FeaturesSection.tsx

const FEATURE_ICONS: Record<string, string> = {
  wifi: '📶', pool: '🏊', gym: '💪', spa: '🧖',
  parking: '🅿️', restaurant: '🍽️', bar: '🍸', pet_friendly: '🐾',
}

export function FeaturesSection({ amenities }: { amenities: Amenity[] }) {
  return (
    <section className="py-20 bg-surface-secondary">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary">Why Stay With Us</h2>
          <p className="text-text-secondary mt-3 max-w-xl mx-auto">
            Everything you need for a perfect stay, all in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {amenities.slice(0, 8).map(a => (
            <div
              key={a.id}
              className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3">
                {FEATURE_ICONS[a.icon] ?? '✨'}
              </div>
              <h3 className="font-semibold text-text-primary">{a.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## Featured Rooms Section

```typescript
// src/components/landing/FeaturedRooms.tsx

import Link from 'next/link'
import { formatCurrency } from '@/utils/formatCurrency'

export function FeaturedRooms({ rooms }: { rooms: RoomCategory[] }) {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold">Our Rooms</h2>
            <p className="text-text-secondary mt-2">Choose from our range of premium accommodations</p>
          </div>
          <Link href="/search" className="text-primary-600 font-medium hover:underline">
            View all rooms →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div
              key={room.id}
              className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="relative overflow-hidden h-56">
                <img
                  src={room.primary_image ?? '/images/room-placeholder.jpg'}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-bold text-primary-600 shadow">
                  From {formatCurrency(room.base_price)}/night
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg">{room.name}</h3>
                <p className="text-text-secondary text-sm mt-1 line-clamp-2">{room.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
                  <span>👥 Up to {room.capacity} guests</span>
                  <span>🛏️ {room.bed_type}</span>
                  {room.size_sqm && <span>📐 {room.size_sqm}m²</span>}
                </div>
                <Link
                  href={`/rooms/${room.id}`}
                  className="block mt-4 text-center bg-primary-600 text-white py-2.5 rounded-xl
                             font-semibold hover:bg-primary-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## Reviews Section

```typescript
// src/components/landing/ReviewsSection.tsx

export function ReviewsSection({
  reviews,
  overallRating,
}: {
  reviews: Review[]
  overallRating: number
}) {
  return (
    <section className="py-20 bg-surface-secondary">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">What Our Guests Say</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-5xl font-bold text-primary-600">{overallRating}</span>
            <div className="text-left">
              <p className="font-semibold text-lg">
                {overallRating >= 9 ? 'Exceptional' : overallRating >= 8 ? 'Excellent' : 'Very Good'}
              </p>
              <p className="text-sm text-text-secondary">Guest rating out of 10</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(Math.round(review.overall_score / 2))].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-text-secondary text-sm italic line-clamp-4">
                "{review.body}"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center
                                text-primary-600 font-bold text-sm">
                  {review.guest_name?.[0] ?? 'G'}
                </div>
                <div>
                  <p className="font-semibold text-sm">{review.guest_name}</p>
                  <p className="text-xs text-text-secondary">{formatDate(review.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## CTA Banner & Footer

```typescript
// src/components/landing/CtaBanner.tsx

export function CtaBanner({ hotelName }: { hotelName: string }) {
  return (
    <section className="py-20 bg-primary-600 text-white text-center">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Experience {hotelName}?
        </h2>
        <p className="text-white/80 mb-8 text-lg">
          Book directly for the best rates and exclusive perks.
        </p>
        <a
          href="/search"
          className="inline-block bg-white text-primary-700 font-bold px-10 py-4
                     rounded-2xl text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Book Your Stay
        </a>
      </div>
    </section>
  )
}
```

---

## SEO Metadata (Next.js)

```typescript
// src/app/page.tsx — generateMetadata

export async function generateMetadata(): Promise<Metadata> {
  const hotel = await hotelService.getHotelInfo()

  return {
    title: `${hotel.name} — Official Booking`,
    description: hotel.description?.slice(0, 160),
    openGraph: {
      title: hotel.name,
      description: hotel.description?.slice(0, 160),
      images: [hotel.hero_image ?? '/og-default.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: hotel.name,
      images: [hotel.hero_image ?? '/og-default.jpg'],
    },
  }
}
```
