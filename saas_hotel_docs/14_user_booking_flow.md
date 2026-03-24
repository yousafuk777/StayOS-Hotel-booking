# 14 — User Booking Flow

## Booking Flow Overview

```
[Search Hotels]
      │
      ▼
[View Hotel Details]
      │
      ▼
[Select Room & Dates]
      │
      ▼
[Guest Details Form]
      │
      ▼
[Select Add-ons]
      │
      ▼
[Apply Promo Code]
      │
      ▼
[Review Summary & Pay]
      │
      ├──► [Payment Success] → [Booking Confirmed] → [Email Sent]
      │
      └──► [Payment Failed] → [Retry or Change Method]
```

---

## Step 1: Search

```typescript
// src/app/(public)/search/page.tsx

'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useHotelSearch } from '@/hooks/useHotels'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/search/FilterPanel'
import { HotelCard } from '@/components/search/HotelCard'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({})

  const params = {
    destination: searchParams.get('destination') ?? '',
    checkIn: searchParams.get('checkIn') ?? '',
    checkOut: searchParams.get('checkOut') ?? '',
    guests: Number(searchParams.get('guests') ?? 1),
    ...filters
  }

  const { data, isLoading } = useHotelSearch(params)

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 p-6">
      <FilterPanel onFiltersChange={setFilters} />
      <div>
        <SearchBar initialValues={params} />
        {isLoading ? (
          <div className="grid gap-4 mt-4">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid gap-4 mt-4">
            {data?.hotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} searchParams={params} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Step 2: Room Selection

```typescript
// src/components/hotel/RoomCard.tsx

'use client'
import { useBookingStore } from '@/store/booking.store'
import { formatCurrency } from '@/utils/formatCurrency'

interface RoomCardProps {
  room: Room
  searchParams: SearchParams
}

export function RoomCard({ room, searchParams }: RoomCardProps) {
  const { selectRoom, selectedRooms } = useBookingStore()
  const nights = getDaysBetween(searchParams.checkIn, searchParams.checkOut)
  const isSelected = selectedRooms.some(r => r.id === room.id)

  return (
    <div className="border rounded-xl p-4 flex gap-4">
      <img src={room.primary_image} className="w-40 h-32 object-cover rounded-lg" alt={room.name} />
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{room.name}</h3>
        <p className="text-sm text-text-secondary">{room.description}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {room.amenities.map(a => <Badge key={a}>{a}</Badge>)}
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-primary-600">
          {formatCurrency(room.price_per_night)}
        </p>
        <p className="text-sm text-text-secondary">per night</p>
        <p className="text-sm font-medium mt-1">
          {formatCurrency(room.price_per_night * nights)} total
        </p>
        <button
          onClick={() => selectRoom(room)}
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Select Room'}
        </button>
      </div>
    </div>
  )
}
```

---

## Booking Zustand Store

```typescript
// src/store/booking.store.ts

import { create } from 'zustand'

interface BookingState {
  hotelId: number | null
  selectedRooms: Room[]
  checkIn: string
  checkOut: string
  guests: number
  guestDetails: GuestDetails | null
  selectedAddons: Addon[]
  promoCode: string
  discountAmount: number
  step: number

  setDates: (checkIn: string, checkOut: string) => void
  selectRoom: (room: Room) => void
  removeRoom: (roomId: number) => void
  setGuestDetails: (details: GuestDetails) => void
  addAddon: (addon: Addon) => void
  removeAddon: (addonId: number) => void
  setPromoCode: (code: string, discount: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

const initialState = {
  hotelId: null,
  selectedRooms: [],
  checkIn: '',
  checkOut: '',
  guests: 1,
  guestDetails: null,
  selectedAddons: [],
  promoCode: '',
  discountAmount: 0,
  step: 1,
}

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,

  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  selectRoom: (room) => set(s => ({ selectedRooms: [...s.selectedRooms, room] })),
  removeRoom: (roomId) => set(s => ({
    selectedRooms: s.selectedRooms.filter(r => r.id !== roomId)
  })),
  setGuestDetails: (details) => set({ guestDetails: details }),
  addAddon: (addon) => set(s => ({ selectedAddons: [...s.selectedAddons, addon] })),
  removeAddon: (addonId) => set(s => ({
    selectedAddons: s.selectedAddons.filter(a => a.id !== addonId)
  })),
  setPromoCode: (code, discount) => set({ promoCode: code, discountAmount: discount }),
  nextStep: () => set(s => ({ step: s.step + 1 })),
  prevStep: () => set(s => ({ step: Math.max(1, s.step - 1) })),
  reset: () => set(initialState),
}))
```

---

## Checkout Page

```typescript
// src/app/(public)/checkout/page.tsx

'use client'
import { useBookingStore } from '@/store/booking.store'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { GuestDetailsForm } from '@/components/booking/GuestDetailsForm'
import { AddonSelector } from '@/components/booking/AddonSelector'
import { PaymentForm } from '@/components/booking/PaymentForm'

const STEPS = ['Room', 'Guest Details', 'Add-ons', 'Payment']

export default function CheckoutPage() {
  const { step } = useBookingStore()

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Step indicators */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-primary-600 text-white' :
                'bg-gray-200 text-gray-500'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className="ml-2 text-sm font-medium hidden md:block">{label}</span>
            {i < STEPS.length - 1 && <div className="mx-4 h-px w-16 bg-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          {step === 1 && <GuestDetailsForm />}
          {step === 2 && <AddonSelector />}
          {step === 3 && <PaymentForm />}
        </div>
        <BookingSummary />
      </div>
    </div>
  )
}
```

---

## Payment Integration (Stripe)

```typescript
// src/components/booking/PaymentForm.tsx

'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { bookingService } from '@/services/booking.service'
import { useBookingStore } from '@/store/booking.store'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ bookingId }: { bookingId: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation?booking_id=${bookingId}`,
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed')
      setIsProcessing(false)
    }
    // On success, Stripe redirects to return_url
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-4 bg-primary-600 text-white py-3 rounded-xl font-semibold"
      >
        {isProcessing ? 'Processing...' : 'Confirm & Pay'}
      </button>
    </form>
  )
}

export function PaymentForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const bookingState = useBookingStore()

  // Create booking and get payment intent on mount
  useEffect(() => {
    const initPayment = async () => {
      const result = await bookingService.create(bookingState)
      setClientSecret(result.payment_intent_client_secret)
      setBookingId(result.id)
    }
    initPayment()
  }, [])

  if (!clientSecret) return <Spinner />

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm bookingId={bookingId!} />
    </Elements>
  )
}
```

---

## Booking Confirmation Page

```typescript
// src/app/(public)/checkout/confirmation/page.tsx

import { bookingService } from '@/services/booking.service'

export default async function ConfirmationPage({
  searchParams
}: {
  searchParams: { booking_id: string }
}) {
  const booking = await bookingService.getById(Number(searchParams.booking_id))

  return (
    <div className="max-w-xl mx-auto py-12 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-text-secondary mb-6">
        Your reference number is{' '}
        <span className="font-mono font-bold text-primary-600">
          {booking.reference_number}
        </span>
      </p>
      <div className="bg-surface-secondary rounded-xl p-6 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-text-secondary">Hotel</span>
          <span className="font-medium">{booking.hotel.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Check-in</span>
          <span className="font-medium">{booking.check_in_date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Check-out</span>
          <span className="font-medium">{booking.check_out_date}</span>
        </div>
        <div className="flex justify-between border-t pt-3">
          <span className="font-semibold">Total Paid</span>
          <span className="font-bold text-primary-600">${booking.total_amount}</span>
        </div>
      </div>
      <a href="/dashboard/bookings" className="inline-block mt-6 bg-primary-600 text-white px-6 py-3 rounded-xl">
        View My Bookings
      </a>
    </div>
  )
}
```
