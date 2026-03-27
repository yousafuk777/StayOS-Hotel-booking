'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  const defaultBookings = [
    { id: 1, guest: 'Sarah Johnson', room: 'Deluxe Suite', checkin: '2026-03-25', checkout: '2026-03-28', nights: 3, amount: 897, status: 'pending', guests: 2 },
    { id: 2, guest: 'Michael Chen', room: 'Executive King', checkin: '2026-03-26', checkout: '2026-03-30', nights: 4, amount: 1240, status: 'pending', guests: 1 },
    { id: 3, guest: 'Emma Williams', room: 'Standard Queen', checkin: '2026-03-27', checkout: '2026-03-29', nights: 2, amount: 458, status: 'pending', guests: 2 },
    { id: 4, guest: 'James Brown', room: 'Presidential Suite', checkin: '2026-03-28', checkout: '2026-04-02', nights: 5, amount: 2495, status: 'vip', guests: 3 },
  ]

  const [bookings, setBookings] = useState<any[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'vip')

  useEffect(() => {
    const storedBookings = localStorage.getItem('bookings')
    if (storedBookings) {
      try {
        const parsed = JSON.parse(storedBookings)
        if (Array.isArray(parsed)) {
          setBookings(parsed)
        } else {
          setBookings(defaultBookings)
        }
      } catch (e) {
        console.error('Error loading bookings from localStorage:', e)
        setBookings(defaultBookings)
      }
    } else {
      setBookings(defaultBookings)
    }
    setIsHydrated(true)
  }, [])

  const now = new Date()
  const bookingsThisMonth = bookings.filter((booking: any) => {
    const checkinDate = new Date(booking.checkin)
    return (
      checkinDate.getFullYear() === now.getFullYear() &&
      checkinDate.getMonth() === now.getMonth()
    )
  }).length
  const pendingCount = pendingBookings.filter((b: any) => b.status === 'pending').length
  const checkedInCount = bookings.filter((b: any) => b.status === 'checked_in').length
  const vipGuestCount = bookings.reduce((sum: number, b: any) => sum + (b.status === 'vip' ? (b.guests || 1) : 0), 0)
  const newBookingsCount = bookingsThisMonth + pendingCount

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    )
  }

  const handleConfirmBooking = (booking: any) => {
    console.log('Confirming booking:', booking)

    const updatedBookings = bookings.map((b) =>
      b.id === booking.id ? { ...b, status: 'confirmed' } : b
    )
    setBookings(updatedBookings)

    // Booking confirmed successfully
  }

  const handleDeclineBooking = (booking: any) => {
    console.log('Declining booking:', booking)
    const confirmDecline = confirm(`⚠️ Decline Booking\n\nAre you sure you want to decline the booking for ${booking.guest}?\n\nThis action cannot be undone and the booking will be permanently removed from pending.`)

    if (confirmDecline) {
      const updatedBookings = bookings.filter((b) => b.id !== booking.id)
      setBookings(updatedBookings)
      // Booking declined and removed
    } else {
      console.log('Decline cancelled')
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="fade-in">
        <h1 className="text-5xl font-extrabold gradient-text mb-3">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back! Here's what's happening at your hotel today.
        </p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Revenue */}
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">Today's Revenue</p>
              <p className="text-4xl font-bold gradient-text">$12,450</p>
            </div>
            <div className="text-5xl float">💵</div>
          </div>
          <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full">
            <span>↑ 18%</span>
            <span className="font-semibold text-sm">vs yesterday</span>
          </div>
        </div>

        {/* Bookings */}
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">New Bookings</p>
              <p className="text-4xl font-bold gradient-text">{newBookingsCount}</p>
            </div>
            <div className="text-5xl float">📋</div>
          </div>
          <div className="flex items-center gap-2 text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-full">
            <span>+{pendingCount}</span>
            <span className="font-semibold text-sm">pending confirmation</span>
          </div>
        </div>

        {/* Check-ins */}
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">Check-ins</p>
              <p className="text-4xl font-bold gradient-text">{checkedInCount}</p>
            </div>
            <div className="text-5xl float">🎉</div>
          </div>
          <div className="flex items-center gap-2 text-purple-600 bg-purple-100/50 px-3 py-1.5 rounded-full">
            <span className="font-semibold text-sm">{vipGuestCount} VIP guests</span>
          </div>
        </div>

        {/* Occupancy */}
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 font-medium mb-2">Occupancy Rate</p>
              <p className="text-4xl font-bold gradient-text">78%</p>
            </div>
            <div className="text-5xl float">📊</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '78%' }} />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: '➕', label: 'New Booking', color: 'from-blue-500 to-blue-600', action: () => router.push('/admin/new-booking') },
            { icon: '🏠', label: 'Check-in', color: 'from-green-500 to-green-600', action: () => router.push('/admin/bookings') },
            { icon: '🚪', label: 'Check-out', color: 'from-purple-500 to-purple-600', action: () => router.push('/admin/checkout') },
            { icon: '🧹', label: 'Room Status', color: 'from-orange-500 to-orange-600', action: () => router.push('/admin/housekeeping') },
            { icon: '👤', label: 'Add Guest', color: 'from-pink-500 to-pink-600', action: () => router.push('/admin/guests') },
            { icon: '📞', label: 'Messages', color: 'from-indigo-500 to-indigo-600', action: () => router.push('/admin/messages') },
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="font-medium text-gray-700 text-sm text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Bookings Table */}
      <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">
            📋 Pending Bookings
          </h2>
          <button 
            onClick={() => router.push('/admin/bookings')}
            className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Guest</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Room Type</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Check-in/out</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Nights</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingBookings.map((booking: any, index: number) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors slide-up" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {booking.guest.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{booking.guest}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{booking.room}</td>
                  <td className="py-4 px-4 text-gray-700">
                    <div className="text-sm">
                      <div>{booking.checkin}</div>
                      <div className="text-gray-500">→ {booking.checkout}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{booking.nights}</td>
                  <td className="py-4 px-4 font-semibold text-gray-900">{booking.amount}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'vip'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleConfirmBooking(booking)}
                        className="glass px-4 py-2 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600 cursor-pointer"
                      >
                        ✓ Confirm
                      </button>
                      <button 
                        onClick={() => handleDeclineBooking(booking)}
                        className="glass px-4 py-2 rounded-lg hover:bg-red-50 transition-all text-sm font-medium text-red-600 cursor-pointer"
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity & Housekeeping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals */}
        <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">
              🎯 Today's Arrivals
            </h2>
            <span className="text-sm text-gray-600 font-medium">18 guests</span>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Robert Taylor', time: '2:00 PM', room: '301', type: 'Deluxe' },
              { name: 'Lisa Anderson', time: '3:30 PM', room: '502', type: 'Executive' },
              { name: 'David Wilson', time: '4:00 PM', room: '205', type: 'Standard' },
              { name: 'Maria Garcia', time: '5:00 PM', room: 'PH1', type: 'Penthouse', vip: true },
            ].map((arrival, index) => (
              <div
                key={index}
                className="flex items-center gap-4 glass p-4 rounded-xl slide-up"
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                <div className="text-3xl">{arrival.vip ? '👑' : '🎫'}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{arrival.name}</p>
                  <p className="text-sm text-gray-600">Room {arrival.room} • {arrival.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{arrival.time}</p>
                  <button 
                    onClick={() => {
                      // Checking in guest
                    }}
                    className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                  >
                    Check-in →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Housekeeping Status */}
        <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.9s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">
              🧹 Room Status Board
            </h2>
            <button 
              onClick={() => router.push('/admin/housekeeping')}
              className="text-sm text-blue-600 font-medium hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { status: 'Clean', count: 45, color: 'from-green-500 to-green-600', icon: '✓' },
              { status: 'Dirty', count: 12, color: 'from-red-500 to-red-600', icon: '✕' },
              { status: 'Inspect', count: 8, color: 'from-orange-500 to-orange-600', icon: '⚠️' },
            ].map((room, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${room.color} rounded-xl p-6 text-white text-center card-hover`}
              >
                <div className="text-4xl mb-2">{room.icon}</div>
                <div className="text-4xl font-bold mb-1">{room.count}</div>
                <div className="text-sm opacity-90">{room.status}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-700 mb-3">Priority Rooms</h3>
            {[
              { room: '301', status: 'Cleaning in progress', eta: '15 mins' },
              { room: '502', status: 'Awaiting inspection', eta: 'Ready soon' },
            ].map((task, index) => (
              <div key={index} className="flex items-center gap-3 glass p-3 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Room {task.room}</p>
                  <p className="text-sm text-gray-600">{task.status}</p>
                </div>
                <span className="text-xs font-medium text-orange-600">{task.eta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
