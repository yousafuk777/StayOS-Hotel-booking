'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'
import StatCard from '../../components/StatCard'

export default function AdminPage() {
  const router = useRouter()

  const defaultBookings = [
    { id: 1, guest: 'Sarah Johnson', room: 'Deluxe Suite', checkin: '2026-03-25', checkout: '2026-03-28', nights: 3, amount: 897, status: 'pending', guests: 2 },
    { id: 2, guest: 'Michael Chen', room: 'Executive King', checkin: '2026-03-26', checkout: '2026-03-30', nights: 4, amount: 1240, status: 'pending', guests: 1 },
    { id: 3, guest: 'Emma Williams', room: 'Standard Queen', checkin: '2026-03-27', checkout: '2026-03-29', nights: 2, amount: 458, status: 'pending', guests: 2 },
    { id: 4, guest: 'James Brown', room: 'Presidential Suite', checkin: '2026-03-28', checkout: '2026-04-02', nights: 5, amount: 2495, status: 'vip', guests: 3 },
  ]

  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [dashboardFilter, setDashboardFilter] = useState<'all' | 'revenue' | 'bookings' | 'checkins'>('all')

  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'vip')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, statsRes] = await Promise.all([
          api.get('/api/v1/bookings/pending'),
          api.get('/api/v1/bookings/stats')
        ])

        const bookingData = bookingsRes.data.bookings.map((b: any) => ({
          id: b.id,
          guest: b.guest_name,
          room: b.room_type,
          checkin: b.check_in_date.split('T')[0],
          checkout: b.check_out_date.split('T')[0],
          nights: b.nights,
          amount: parseFloat(b.total_amount),
          status: b.status,
          guests: b.num_guests
        }))
        
        setBookings(bookingData)
        setStats(statsRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setBookings(defaultBookings)
      } finally {
        setLoading(false)
        setStatsLoading(false)
        setIsHydrated(true)
      }
    }

    fetchData()
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

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#2D4A42]">
        Loading dashboard...
      </div>
    )
  }

  const handleConfirmBooking = async (booking: any) => {
    try {
      await api.put(`/api/v1/bookings/${booking.id}/confirm`)
      // Remove from local state
      setBookings(bookings.filter((b) => b.id !== booking.id))
      alert('Booking confirmed successfully!')
    } catch (error) {
      console.error('Error confirming booking:', error)
      alert('Failed to confirm booking. Please try again.')
    }
  }

  const handleDeclineBooking = async (booking: any) => {
    const confirmDecline = confirm(`⚠️ Decline Booking\n\nAre you sure you want to decline the booking for ${booking.guest}?\n\nThis action cannot be undone and the booking will be permanently removed.`)

    if (confirmDecline) {
      try {
        await api.delete(`/api/v1/bookings/${booking.id}`)
        // Remove from local state
        setBookings(bookings.filter((b) => b.id !== booking.id))
        alert('Booking declined and removed successfully!')
      } catch (error) {
        console.error('Error declining booking:', error)
        alert('Failed to decline booking. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="fade-in">
        <h1 className="text-5xl font-extrabold gradient-text mb-3">
          Dashboard Overview
        </h1>
        <p className="text-[#2D4A42] text-lg">
          Welcome back! Here's what's happening at your hotel today.
        </p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="Today's Revenue"
          value={statsLoading ? '...' : `$${stats?.revenue_this_month?.toLocaleString() || '0'}`}
          icon="💵"
          color="green"
          subtext="This month total"
          onClick={() => setDashboardFilter('revenue')}
          isActive={dashboardFilter === 'revenue'}
        />
        <StatCard
          label="New Bookings"
          value={statsLoading ? '...' : (stats?.bookings_this_month || 0)}
          icon="📋"
          color="blue"
          subtext={`${stats?.pending_count || 0} pending confirmation`}
          onClick={() => setDashboardFilter('bookings')}
          isActive={dashboardFilter === 'bookings'}
        />
        <StatCard
          label="Check-ins"
          value={statsLoading ? '...' : (stats?.checked_in_count || 0)}
          icon="🎉"
          color="purple"
          subtext="Currently staying"
          onClick={() => setDashboardFilter('checkins')}
          isActive={dashboardFilter === 'checkins'}
        />
        <StatCard
          label="Occupancy Rate"
          value={statsLoading ? '...' : `${stats?.occupancy_rate || 0}%`}
          icon="📊"
          color="orange"
          subtext="All rooms"
          onClick={() => setDashboardFilter('all')}
          isActive={dashboardFilter === 'all'}
        />
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
              <span className="font-medium text-[#1A2E2B] text-sm text-center">{action.label}</span>
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
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Guest</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Room Type</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Check-in/out</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Nights</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Amount</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Actions</th>
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
                      <span className="font-medium text-[#1A2E2B]">{booking.guest}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#1A2E2B]">{booking.room}</td>
                  <td className="py-4 px-4 text-[#1A2E2B]">
                    <div className="text-sm">
                      <div>{booking.checkin}</div>
                      <div className="text-[#2D4A42]">→ {booking.checkout}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#1A2E2B]">{booking.nights}</td>
                  <td className="py-4 px-4 font-semibold text-[#1A2E2B]">{booking.amount}</td>
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
            <span className="text-sm text-[#2D4A42] font-medium">18 guests</span>
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
                  <p className="font-semibold text-[#1A2E2B]">{arrival.name}</p>
                  <p className="text-sm text-[#2D4A42]">Room {arrival.room} • {arrival.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1A2E2B]">{arrival.time}</p>
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
            <h3 className="font-semibold text-[#1A2E2B] mb-3">Priority Rooms</h3>
            {[
              { room: '301', status: 'Cleaning in progress', eta: '15 mins' },
              { room: '502', status: 'Awaiting inspection', eta: 'Ready soon' },
            ].map((task, index) => (
              <div key={index} className="flex items-center gap-3 glass p-3 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1A2E2B]">Room {task.room}</p>
                  <p className="text-sm text-[#2D4A42]">{task.status}</p>
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
