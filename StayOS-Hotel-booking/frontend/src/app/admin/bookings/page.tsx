'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BookingsPage() {
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const router = useRouter()

  const bookings = [
    { id: 1, guest: 'Sarah Johnson', room: 'Deluxe Suite', checkin: '2026-03-25', checkout: '2026-03-28', nights: 3, amount: 897, status: 'confirmed', guests: 2 },
    { id: 2, guest: 'Michael Chen', room: 'Executive King', checkin: '2026-03-26', checkout: '2026-03-30', nights: 4, amount: 1240, status: 'pending', guests: 1 },
    { id: 3, guest: 'Emma Williams', room: 'Standard Queen', checkin: '2026-03-27', checkout: '2026-03-29', nights: 2, amount: 458, status: 'checked_in', guests: 2 },
    { id: 4, guest: 'James Brown', room: 'Presidential Suite', checkin: '2026-03-28', checkout: '2026-04-02', nights: 5, amount: 2495, status: 'vip', guests: 3 },
    { id: 5, guest: 'Lisa Anderson', room: 'Ocean View', checkin: '2026-03-20', checkout: '2026-03-25', nights: 5, amount: 1875, status: 'checked_out', guests: 2 },
  ]

  const STATUS_CONFIG: any = {
    all: { label: 'All Bookings', color: 'bg-gray-100 text-gray-700' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    checked_in: { label: 'Checked In', color: 'bg-green-100 text-green-700' },
    checked_out: { label: 'Checked Out', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    vip: { label: 'VIP', color: 'bg-purple-100 text-purple-700' },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-card border-b border-gray-200 sticky top-0 z-50">
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
                <h1 className="text-3xl font-bold gradient-text">Bookings Management</h1>
                <p className="text-sm text-gray-600">Manage all reservations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/admin/new-booking')}
                className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>➕</span>
                <span>New Booking</span>
              </button>
              <button 
                onClick={() => alert('Export bookings feature coming soon!')}
                className="glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer"
              >
                📥 Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Filters & View Toggle */}
        <div className="glass-card rounded-2xl p-6 mb-6 slide-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, config]: any) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 glass p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                ☰ List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                📅 Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-blue-500">
            <p className="text-gray-600 font-medium mb-2">Total Bookings</p>
            <p className="text-4xl font-bold gradient-text">156</p>
            <p className="text-sm text-gray-600 mt-2">This month</p>
          </div>
          <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-yellow-500">
            <p className="text-gray-600 font-medium mb-2">Pending</p>
            <p className="text-4xl font-bold gradient-text">12</p>
            <p className="text-sm text-gray-600 mt-2">Awaiting confirmation</p>
          </div>
          <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-green-500">
            <p className="text-gray-600 font-medium mb-2">Checked In</p>
            <p className="text-4xl font-bold gradient-text">48</p>
            <p className="text-sm text-gray-600 mt-2">Currently staying</p>
          </div>
          <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-purple-500">
            <p className="text-gray-600 font-medium mb-2">Revenue</p>
            <p className="text-4xl font-bold gradient-text">$42.8K</p>
            <p className="text-sm text-gray-600 mt-2">Monthly total</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              {STATUS_CONFIG[filter]?.label || 'All Bookings'}
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="search"
                placeholder="Search bookings..."
                className="input-field px-4 py-2 rounded-xl w-64 focus:outline-none"
              />
              <select className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none">
                <option>All Rooms</option>
                <option>Deluxe Suite</option>
                <option>Executive King</option>
                <option>Standard Queen</option>
              </select>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Guest</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Room</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Dates</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Nights</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Guests</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking, index) => (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-gray-50 transition-colors slide-up"
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {booking.guest.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{booking.guest}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{booking.room}</td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium">{booking.checkin}</div>
                          <div className="text-gray-500">→ {booking.checkout}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{booking.nights}</td>
                      <td className="py-4 px-4 text-gray-700">{booking.guests}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900">${booking.amount}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'vip' ? 'bg-purple-100 text-purple-700' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="glass px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600">
                            👁️ View
                          </button>
                          <button className="glass px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-600">
                            ✏️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold gradient-text mb-2">Calendar View</h3>
              <p className="text-gray-600">Interactive booking calendar coming soon</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
