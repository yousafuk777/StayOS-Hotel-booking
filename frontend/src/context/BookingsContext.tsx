'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import api from '../services/api'

interface Booking {
  id: number
  guest: string
  room: string
  checkin: string
  checkout: string
  nights: number
  amount: number
  status: string
  guests: number
}

interface BookingStats {
  revenue_this_month: number
  bookings_this_month: number
  pending_count: number
  checked_in_count: number
  occupancy_rate: number
}

interface BookingsContextType {
  bookings: Booking[]
  stats: BookingStats | null
  loading: boolean
  refreshBookings: () => Promise<void>
  addBookingToLocal: (booking: Booking) => void
  removeBookingFromLocal: (bookingId: number) => void
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined)

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshBookings = useCallback(async () => {
    setLoading(true)
    try {
      console.log('🔄 Refreshing bookings from API...')
      
      // Fetch bookings with better error handling
      let bookingData: Booking[] = []
      try {
        const bookingsRes = await api.get('/api/v1/bookings')
        console.log('📨 Raw API Response:', bookingsRes.data)
        
        // Parse response - handle multiple formats
        let rawBookings: any[] = []
        
        if (bookingsRes.data?.bookings && Array.isArray(bookingsRes.data.bookings)) {
          rawBookings = bookingsRes.data.bookings
          console.log('✅ Found bookings in response.bookings')
        } else if (Array.isArray(bookingsRes.data)) {
          rawBookings = bookingsRes.data
          console.log('✅ Response is array directly')
        } else {
          console.warn('⚠️ Unexpected response format:', bookingsRes.data)
          rawBookings = []
        }

        console.log(`📊 Processing ${rawBookings.length} bookings...`)

        bookingData = rawBookings
          .filter((b: any) => b && typeof b === 'object')
          .map((b: any, idx: number) => {
            const booking: Booking = {
              id: b.id ?? b.booking_id ?? idx,
              guest: b.guest_name ?? b.guest ?? 'Unknown Guest',
              room: b.room_type ?? b.room ?? 'Unknown Room',
              checkin: b.check_in_date ? b.check_in_date.split('T')[0] : 'N/A',
              checkout: b.check_out_date ? b.check_out_date.split('T')[0] : 'N/A',
              nights: b.nights ?? 0,
              amount: parseFloat(b.total_amount ?? '0') || 0,
              status: b.status ?? 'pending',
              guests: b.num_guests ?? 1
            }
            return booking
          })

        console.log(`✅ Parsed ${bookingData.length} bookings successfully`)
        if (bookingData.length > 0) {
          console.log('📋 Sample booking:', bookingData[0])
        }
      } catch (bookingsErr: any) {
        console.error('❌ Bookings API error:', {
          status: bookingsErr.response?.status,
          statusText: bookingsErr.response?.statusText,
          message: bookingsErr.message,
          data: bookingsErr.response?.data
        })
        bookingData = []
      }

      // Fetch stats
      try {
        const statsRes = await api.get('/api/v1/bookings/stats')
        console.log('✅ Stats loaded:', statsRes.data)
        setStats(statsRes.data || null)
      } catch (statsErr: any) {
        console.error('❌ Stats API error:', statsErr.message)
      }

      setBookings(bookingData)
    } catch (error) {
      console.error('💥 Fatal error in refreshBookings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const addBookingToLocal = useCallback((booking: Booking) => {
    setBookings((prev) => [booking, ...prev])
    // Update stats manually until server refresh
    setStats((prev) => {
      if (!prev) return null
      return {
        ...prev,
        bookings_this_month: prev.bookings_this_month + 1,
        pending_count: booking.status === 'pending' ? prev.pending_count + 1 : prev.pending_count
      }
    })
  }, [])

  const removeBookingFromLocal = useCallback((bookingId: number) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId))
  }, [])

  // Initial load
  useEffect(() => {
    console.log('📱 BookingsProvider mounted - initializing data load')
    refreshBookings()
  }, [refreshBookings])

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔍 Window focused - refreshing bookings')
      refreshBookings()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshBookings])

  // Add a manual reload button debug log
  useEffect(() => {
    console.log(
      `[Context State] bookings: ${bookings.length}, stats: ${stats?.bookings_this_month || 0}, loading: ${loading}`
    )
  }, [bookings, stats, loading])

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        stats,
        loading,
        refreshBookings,
        addBookingToLocal,
        removeBookingFromLocal
      }}
    >
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookings() {
  const context = useContext(BookingsContext)
  if (context === undefined) {
    throw new Error('useBookings must be used within BookingsProvider')
  }
  return context
}
