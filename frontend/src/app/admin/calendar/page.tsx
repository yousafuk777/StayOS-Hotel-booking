'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 15)) // March 2026
  const [viewMode, setViewMode] = useState('month')
  const [bookings, setBookings] = useState<Booking[]>([])
  const router = useRouter()

  // Load bookings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('bookings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBookings(parsed)
        } else {
          // Use sample bookings if localStorage is empty
          setBookings(getSampleBookings())
        }
      } catch (e) {
        console.error('Error loading bookings:', e)
        setBookings(getSampleBookings())
      }
    } else {
      // Use sample bookings if no data in localStorage
      setBookings(getSampleBookings())
    }
  }, [])

  const getSampleBookings = () => {
    return [
      {
        id: 1,
        guest: 'John Smith',
        room: 'Deluxe Suite',
        checkin: '2026-03-25',
        checkout: '2026-03-29',
        nights: 4,
        amount: 1196,
        status: 'checked_in',
        guests: 2
      },
      {
        id: 2,
        guest: 'Sarah Johnson',
        room: 'Ocean View',
        checkin: '2026-03-27',
        checkout: '2026-03-31',
        nights: 4,
        amount: 1596,
        status: 'confirmed',
        guests: 3
      },
      {
        id: 3,
        guest: 'Michael Chen',
        room: 'Executive King',
        checkin: '2026-03-26',
        checkout: '2026-03-28',
        nights: 2,
        amount: 698,
        status: 'checked_in',
        guests: 1
      },
      {
        id: 4,
        guest: 'Emma Wilson',
        room: 'Standard Queen',
        checkin: '2026-03-27',
        checkout: '2026-03-30',
        nights: 3,
        amount: 597,
        status: 'confirmed',
        guests: 2
      },
      {
        id: 5,
        guest: 'David Brown',
        room: 'Presidential Suite',
        checkin: '2026-03-24',
        checkout: '2026-03-27',
        nights: 3,
        amount: 2697,
        status: 'checked_in',
        guests: 4
      },
      {
        id: 6,
        guest: 'Lisa Anderson',
        room: 'Business Suite',
        checkin: '2026-03-28',
        checkout: '2026-04-01',
        nights: 4,
        amount: 1796,
        status: 'pending',
        guests: 2
      },
      {
        id: 7,
        guest: 'James Wilson',
        room: 'Ocean View',
        checkin: '2026-03-26',
        checkout: '2026-03-27',
        nights: 1,
        amount: 399,
        status: 'checked_in',
        guests: 1
      }
    ]
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

  // Process bookings for calendar display
  const getBookingsForDay = (day: number) => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const targetDate = new Date(currentYear, currentMonth, day)
    const targetDateStr = formatDate(targetDate)

    const dayBookings: any[] = []

    bookings.forEach(booking => {
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
                <p className="text-sm text-gray-600">Visual overview of reservations</p>
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
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                ← Previous
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
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
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'day'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-bold gradient-text mb-4">Legend</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-700 font-medium">Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-gray-700 font-medium">In-house</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-gray-700 font-medium">Check-out</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold gradient-text">{stats.occupancyRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Available Rooms</p>
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
              <div key={day} className="text-center font-bold text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
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
                    <span className={`font-bold ${day === 15 ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day}
                    </span>
                    {hasBookings && (
                      <span className="text-xs text-gray-500">
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
                  <p className="text-gray-600 font-medium mb-2">{stat.label}</p>
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
