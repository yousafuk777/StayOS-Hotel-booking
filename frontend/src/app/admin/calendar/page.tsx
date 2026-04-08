'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBookings } from '../../../context/BookingsContext'

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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date()) // Current date
  const [viewMode, setViewMode] = useState('month')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'vip'>('all')
  const router = useRouter()

  // Use global bookings context
  const { bookings: globalBookings, refreshBookings, loading } = useBookings()
  const [bookings, setBookings] = useState<Booking[]>(globalBookings)

  // Sync local state with global state
  useEffect(() => {
    setBookings(globalBookings)
  }, [globalBookings])

  // Initial load
  useEffect(() => {
    refreshBookings()
  }, [refreshBookings])

  const getSampleBookings = () => {
    return [] // No more mock data - only show real bookings from API
  }

  const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // Parse date string in format YYYY-MM-DD as local date
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const filteredBookings = bookings.filter((booking) => {
    return statusFilter === 'all' || booking.status === statusFilter
  })

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    checked_in: bookings.filter((b) => b.status === 'checked_in').length,
    checked_out: bookings.filter((b) => b.status === 'checked_out').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    vip: bookings.filter((b) => b.status === 'vip').length,
  }

  const getBookingsForDay = (day: number) => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const targetDate = new Date(currentYear, currentMonth, day)
    const targetDateStr = formatDate(targetDate)

    const dayBookings: any[] = []

    filteredBookings.forEach(booking => {
      const checkinDate = parseLocalDate(booking.checkin)
      const checkoutDate = parseLocalDate(booking.checkout)
      const checkinStr = formatDate(checkinDate)
      const checkoutStr = formatDate(checkoutDate)

      // Check if this day is check-in
      if (checkinStr === targetDateStr) {
        dayBookings.push({
          ...booking,
          type: 'check-in'
        })
      }
      // Check if this day is during stay (between check-in and check-out, not check-in or check-out day)
      else if (targetDate > checkinDate && targetDate < checkoutDate) {
        dayBookings.push({
          ...booking,
          type: 'stay'
        })
      }
      // Check if this day is check-out
      else if (checkoutStr === targetDateStr) {
        dayBookings.push({
          ...booking,
          type: 'check-out'
        })
      }
    })

    return dayBookings
  }

  // Calculate stats for current month
  const calculateStats = () => {
    const today = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    let checkinsToday = 0
    let checkoutsToday = 0
    let occupiedRooms = 0
    const totalRooms = 120

    // Count today's check-ins and check-outs
    const todayStr = formatDate(today)

    bookings.forEach(booking => {
      const checkinDate = parseLocalDate(booking.checkin)
      const checkoutDate = parseLocalDate(booking.checkout)
      const checkinStr = formatDate(checkinDate)
      const checkoutStr = formatDate(checkoutDate)

      if (checkinStr === todayStr) {
        checkinsToday++
      }
      if (checkoutStr === todayStr) {
        checkoutsToday++
      }

      // Count occupied rooms for today
      if (today >= checkinDate && today < checkoutDate) {
        occupiedRooms++
      }
    })

    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100)
    const availableRooms = totalRooms - occupiedRooms

    return {
      checkinsToday,
      checkoutsToday,
      occupancyRate,
      availableRooms
    }
  }

  const stats = calculateStats()

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const TYPE_COLORS: any = {
    'check-in': 'bg-green-500',
    'check-out': 'bg-red-500',
    'stay': 'bg-blue-500',
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-card border-b border-gray-200 mb-8">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/admin')}
                className="glass p-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <span className="text-xl">←</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Booking Calendar</h1>
                <p className="text-sm text-[#2D4A42]">Visual overview of reservations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/admin/new-booking')}
                className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
              >
                ➕ New Booking
              </button>
              <button 
                onClick={() => {
                  const confirmExport = confirm('Export calendar to PDF?');
                  if (confirmExport) {
                    // Export logic would go here
                  }
                }}
                className="glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer"
              >
                📥 Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Controls */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                ← Previous
              </button>
              <button 
                onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                Next →
              </button>
              <h2 className="text-2xl font-bold gradient-text ml-4">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>

            <div className="flex items-center gap-2 glass p-1 rounded-xl">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'month'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-[#2D4A42] hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-[#2D4A42] hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'day'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-[#2D4A42] hover:bg-gray-50'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'pending', label: 'Pending' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'checked_in', label: 'Checked In' },
              { key: 'checked_out', label: 'Checked Out' },
              { key: 'cancelled', label: 'Cancelled' },
              { key: 'vip', label: 'VIP' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key as any)}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all ${
                  statusFilter === item.key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'glass text-[#1A2E2B] hover:bg-gray-100'
                }`}
              >
                <div className="text-sm">{item.label}</div>
                <div className="text-xl font-bold">{statusCounts[item.key as keyof typeof statusCounts]}</div>
              </button>
            ))}
          </div>
        </div>


        {/* Legend */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-bold gradient-text mb-4">Legend</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-[#1A2E2B] font-medium">Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-[#1A2E2B] font-medium">In-house</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-[#1A2E2B] font-medium">Check-out</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-[#2D4A42]">Occupancy Rate</p>
                <p className="text-2xl font-bold gradient-text">{stats.occupancyRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#2D4A42]">Available Rooms</p>
                <p className="text-2xl font-bold gradient-text">{stats.availableRooms}/120</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass-card rounded-2xl p-6 slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-bold text-[#1A2E2B] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {loading ? (
              <div className="col-span-7 text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                <p className="text-[#2D4A42] mt-4">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="col-span-7 text-center py-20">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold gradient-text mb-2">No Bookings Yet</h3>
                <p className="text-[#2D4A42] mb-6">The calendar is empty. Create your first booking!</p>
                <button
                  onClick={() => router.push('/admin/bookings')}
                  className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer inline-flex items-center gap-2"
                >
                  <span>➕</span>
                  <span>Create Booking</span>
                </button>
              </div>
            ) : (
              <>
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayBookings = getBookingsForDay(day)
                  const hasBookings = dayBookings.length > 0
                  
                  return (
                    <div
                      key={day}
                      className={`aspect-square border-2 rounded-xl p-2 transition-all hover:shadow-lg card-hover cursor-pointer ${
                        day === 15 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold ${day === 15 ? 'text-blue-600' : 'text-[#1A2E2B]'}`}>
                          {day}
                        </span>
                        {hasBookings && (
                          <span className="text-xs text-[#2D4A42]">
                            {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Booking Indicators */}
                      {hasBookings && (
                        <div className="space-y-1 overflow-y-auto max-h-24">
                          {dayBookings.map((booking: any, idx: number) => (
                            <div
                              key={idx}
                              className={`${TYPE_COLORS[booking.type]} text-white text-xs px-2 py-1 rounded truncate`}
                              title={`${booking.guest} - ${booking.room}`}
                            >
                              {booking.type === 'check-in' && '✓ '}
                              {booking.type === 'check-out' && '✕ '}
                              {booking.guest}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {[
            { label: 'Check-ins Today', value: stats.checkinsToday.toString(), icon: '🎉', color: 'border-green-500' },
            { label: 'Check-outs Today', value: stats.checkoutsToday.toString(), icon: '👋', color: 'border-red-500' },
            { label: 'Current Occupancy', value: `${stats.occupancyRate}%`, icon: '📊', color: 'border-blue-500' },
            { label: 'Available Rooms', value: `${stats.availableRooms}`, icon: '🏨', color: 'border-purple-500' },
          ].map((stat, index) => (
            <div 
              key={index}
              className={`glass-card rounded-2xl p-6 card-hover border-l-4 ${stat.color} slide-up`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#2D4A42] font-medium mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                </div>
                <div className="text-5xl float">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
