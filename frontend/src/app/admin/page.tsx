'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../services/api'
import StatCard from '../../components/StatCard'
import { useBookings } from '../../context/BookingsContext'

export default function AdminPage() {
  const router = useRouter()
  const { bookings, stats, loading, refreshBookings } = useBookings()

  const [arrivals, setArrivals] = useState<any[]>([])
  const [roomStatus, setRoomStatus] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [dashboardFilter, setDashboardFilter] = useState<'all' | 'revenue' | 'bookings' | 'checkins'>('all')

  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'vip')

  const fetchArrivals = async () => {
    try {
      const arrivalsRes = await api.get('/api/v1/bookings/arrivals').catch(() => ({ data: { bookings: [] } }))
      const roomStatusRes = await api.get('/api/v1/rooms/dashboard-summary').catch(() => ({ data: null }))

      // Safely extract arrivals - ensure it's an array
      const arrivalsData = Array.isArray(arrivalsRes.data?.bookings) ? arrivalsRes.data.bookings : []
      setArrivals(arrivalsData)

      // Safely extract room status - ensure it's an object with expected structure
      const roomStatusData = roomStatusRes.data && typeof roomStatusRes.data === 'object' && 'status_counts' in roomStatusRes.data
        ? roomStatusRes.data
        : null
      setRoomStatus(roomStatusData)
    } catch (error) {
      console.error('Error fetching arrivals:', error)
      setArrivals([])
      setRoomStatus(null)
    } finally {
      setIsHydrated(true)
    }
  }

  useEffect(() => {
    fetchArrivals()
  }, [])

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
      await refreshBookings()
      console.log('Booking confirmed successfully', booking.id)
    } catch (error) {
      console.error('Error confirming booking:', error)
    }
  }

  const handleDeclineBooking = async (booking: any) => {
    try {
      await api.delete(`/api/v1/bookings/${booking.id}`)
      await refreshBookings()
      console.log('Booking declined', booking.id)
    } catch (error) {
      console.error('Error declining booking:', error)
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

      {/* Quick Actions */}
      <div className="glass-card rounded-3xl p-8 slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">⚡ Quick Actions</h2>
          <p className="text-sm text-[#2D4A42]">Get things done faster</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* New Booking */}
          <button 
            onClick={() => router.push('/admin/new-booking')}
            className="group relative glass p-5 rounded-2xl card-hover cursor-pointer text-center overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform inline-block">📝</div>
              <p className="font-semibold text-[#1A2E2B] text-sm">New Booking</p>
            </div>
          </button>

          {/* Check In */}
          <button 
            onClick={() => router.push('/admin/bookings')}
            className="group relative glass p-5 rounded-2xl card-hover cursor-pointer text-center overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform inline-block">✓</div>
              <p className="font-semibold text-[#1A2E2B] text-sm">Check In</p>
            </div>
          </button>

          {/* Rooms */}
          <button 
            onClick={() => router.push('/admin/rooms')}
            className="group relative glass p-5 rounded-2xl card-hover cursor-pointer text-center overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform inline-block">🛏️</div>
              <p className="font-semibold text-[#1A2E2B] text-sm">Rooms</p>
            </div>
          </button>

          {/* Housekeeping */}
          <button 
            onClick={() => router.push('/admin/housekeeping')}
            className="group relative glass p-5 rounded-2xl card-hover cursor-pointer text-center overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform inline-block">🧹</div>
              <p className="font-semibold text-[#1A2E2B] text-sm">Housekeeping</p>
            </div>
          </button>

          {/* Staff */}
          <button 
            onClick={() => router.push('/admin/staff')}
            className="group relative glass p-5 rounded-2xl card-hover cursor-pointer text-center overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform inline-block">👥</div>
              <p className="font-semibold text-[#1A2E2B] text-sm">Staff</p>
            </div>
          </button>

          {/* Settings */}
          <button 
            onClick={() => router.push('/admin/settings')}
            className="group relative glass p-5 rounded-2xl card-hover cursor-pointer text-center overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform inline-block">⚙️</div>
              <p className="font-semibold text-[#1A2E2B] text-sm">Settings</p>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="Total Bookings"
          value={loading ? '...' : bookings.length}
          icon="📋"
          color="blue"
          subtext="All bookings"
          onClick={() => setDashboardFilter('bookings')}
          isActive={dashboardFilter === 'bookings'}
        />
        <StatCard
          label="Pending Confirmation"
          value={loading ? '...' : bookings.filter(b => b.status === 'pending').length}
          icon="⏳"
          color="orange"
          subtext="Awaiting your action"
          onClick={() => setDashboardFilter('bookings')}
          isActive={dashboardFilter === 'bookings'}
        />
        <StatCard
          label="Checked In"
          value={loading ? '...' : bookings.filter(b => b.status === 'checked_in').length}
          icon="🎉"
          color="purple"
          subtext="Currently staying"
          onClick={() => setDashboardFilter('checkins')}
          isActive={dashboardFilter === 'checkins'}
        />
        <StatCard
          label="Occupancy Rate"
          value={loading ? '...' : `${Number(stats?.occupancy_rate || 0).toFixed(1)}%`}
          icon="📊"
          color="orange"
          subtext="All rooms"
          onClick={() => setDashboardFilter('all')}
          isActive={dashboardFilter === 'all'}
        />
      </div>

      {/* Pending Bookings Table */}
      <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-3">
            📋 Pending Bookings ({pendingBookings.length})
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
              {pendingBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#2D4A42]">
                    📭 No pending bookings
                  </td>
                </tr>
              ) : (
                pendingBookings.map((booking: any, index: number) => (
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
                    <td className="py-4 px-4 font-semibold text-[#1A2E2B]">${booking.amount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'vip'
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
                ))
              )}
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
            <span className="text-sm text-[#2D4A42] font-medium">{arrivals.length} guests</span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {arrivals.length === 0 ? (
              <div className="text-center py-12 glass rounded-xl text-[#2D4A42]">
                <p className="text-4xl mb-2">🎈</p>
                <p className="font-medium">No more arrivals today!</p>
              </div>
            ) : (
              arrivals.map((arrival, index) => (
                <div
                  key={arrival.id}
                  className="flex items-center gap-4 glass p-4 rounded-xl slide-up"
                  style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                >
                  <div className="text-3xl">{arrival.status === 'vip' ? '👑' : '🎫'}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A2E2B]">{arrival.guest_name}</p>
                    <p className="text-sm text-[#2D4A42]">Room {arrival.room_number || 'TBD'} • {arrival.room_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1A2E2B]">
                      {new Date(arrival.check_in_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <button
                      onClick={() => router.push(`/admin/bookings?id=${arrival.id}`)}
                      className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                      Check-in →
                    </button>
                  </div>
                </div>
              ))
            )}
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
              { status: 'Clean', count: roomStatus?.status_counts?.Clean || 0, color: 'from-green-500 to-green-600', icon: '✓' },
              { status: 'Dirty', count: roomStatus?.status_counts?.Dirty || 0, color: 'from-red-500 to-red-600', icon: '✕' },
              { status: 'Inspect', count: roomStatus?.status_counts?.Inspect || 0, color: 'from-orange-500 to-orange-600', icon: '⚠️' },
            ].map((statusData, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${statusData.color} rounded-xl p-6 text-white text-center card-hover shadow-lg`}
              >
                <div className="text-4xl mb-2">{statusData.icon}</div>
                <div className="text-4xl font-bold mb-1">{statusData.count}</div>
                <div className="text-sm opacity-90">{statusData.status}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <h3 className="font-semibold text-[#1A2E2B] mb-3 flex items-center gap-2">
              🔥 Priority Housekeeping
            </h3>
            {!roomStatus?.priority_rooms || roomStatus.priority_rooms.length === 0 ? (
              <p className="text-sm text-[#2D4A42] italic">No immediate priority tasks.</p>
            ) : (
              roomStatus.priority_rooms.map((task: any, index: number) => (
                <div key={index} className="flex items-center gap-3 glass p-4 rounded-xl border-l-4 border-orange-500">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A2E2B]">Room {task.room_number}</p>
                    <p className="text-sm text-[#2D4A42]">{task.status}</p>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 rounded px-2 py-1 uppercase">{task.eta}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
