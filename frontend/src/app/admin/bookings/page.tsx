'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'
import api from '../../../services/api'
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

export default function BookingsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'vip'>('all')
  const [viewMode, setViewMode] = useState('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('all')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Use global bookings context
  const { bookings: globalBookings, stats: globalStats, refreshBookings, addBookingToLocal } = useBookings()
  const [bookings, setBookings] = useState<Booking[]>(globalBookings)
  const [stats, setStats] = useState(globalStats)

  // Sync local state with global state
  useEffect(() => {
    setBookings(globalBookings)
    setStats(globalStats)
    setLoading(false)
  }, [globalBookings, globalStats])

  // Parse date string in format YYYY-MM-DD as local date
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const [newBooking, setNewBooking] = useState({
    guest: '',
    email: '',
    phone: '',
    room: '',
    checkin: '',
    checkout: '',
    guests: 1,
    specialRequests: '',
    status: 'pending'
  })
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-focus first field when modal opens
  useEffect(() => {
    if (showAddModal) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const firstField = document.querySelector('input[name="guest"]') as HTMLInputElement
        if (firstField) {
          firstField.focus()
        }
      }, 100)
    }
  }, [showAddModal])

  // Handle Enter key navigation between fields
  const handleKeyDown = (e: React.KeyboardEvent, nextFieldName?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (nextFieldName) {
        const nextField = document.querySelector(`input[name="${nextFieldName}"], select[name="${nextFieldName}"]`) as HTMLElement
        if (nextField) {
          nextField.focus()
        }
      }
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filter === 'all' || booking.status === filter
    const normalizedSearch = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !normalizedSearch ||
      booking.guest.toLowerCase().includes(normalizedSearch) ||
      booking.room.toLowerCase().includes(normalizedSearch)
    const matchesRoom =
      selectedRoom === 'all' || booking.room.toLowerCase() === selectedRoom.toLowerCase()

    return matchesStatus && matchesSearch && matchesRoom
  })

  const STATUS_CONFIG: any = {
    all: { label: 'All Bookings', color: 'bg-gray-100 text-[#1A2E2B]' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    checked_in: { label: 'Checked In', color: 'bg-green-100 text-green-700' },
    checked_out: { label: 'Checked Out', color: 'bg-gray-100 text-[#2D4A42]' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    'vip': { label: 'VIP', color: 'bg-purple-100 text-purple-700' },
  }

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    checked_in: bookings.filter((b) => b.status === 'checked_in').length,
    checked_out: bookings.filter((b) => b.status === 'checked_out').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    vip: bookings.filter((b) => b.status === 'vip').length,
  }
  
  
  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    // Validation with focus management
    const errors: { [key: string]: string } = {}
    
    if (!newBooking.guest.trim()) {
      errors.guest = 'Guest name required'
    }
    if (!newBooking.email.trim()) {
      errors.email = 'Email required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newBooking.email)) {
      errors.email = 'Invalid email'
    }
    if (!newBooking.phone.trim()) {
      errors.phone = 'Phone required'
    }
    if (!newBooking.checkin) {
      errors.checkin = 'Check-in date required'
    }
    if (!newBooking.checkout) {
      errors.checkout = 'Check-out date required'
    }
    if (!newBooking.room) {
      errors.room = 'Room type required'
    }
    
    if (newBooking.checkin && newBooking.checkout) {
      const checkinDate = parseLocalDate(newBooking.checkin)
      const checkoutDate = parseLocalDate(newBooking.checkout)
      if (checkoutDate <= checkinDate) {
        errors.checkout = 'Check-out date must be after check-in date'
      }
    }
    
    // Show errors and focus first invalid field
    if (Object.keys(errors).length > 0) {
      console.warn('⚠️ Validation errors:', errors)
      const errorMsg = Object.values(errors)[0]
      setSubmitError(errorMsg)
      
      const firstError = Object.keys(errors)[0]
      const elements = document.querySelectorAll('input[name], select[name], textarea[name]')
      for (const el of Array.from(elements)) {
        const elem = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        if (elem.name === firstError) {
          elem.focus()
          elem.style.borderColor = '#ef4444'
          elem.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)'
          setTimeout(() => {
            elem.style.borderColor = ''
            elem.style.boxShadow = ''
          }, 3000)
          break
        }
      }
      setIsSubmitting(false)
      return
    }
    
    try {
      console.log('📤 Submitting booking...', newBooking)
      const checkinDate = parseLocalDate(newBooking.checkin)
      const checkoutDate = parseLocalDate(newBooking.checkout)
      const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const bookingData: any = {
        hotel_id: 1,
        room_id: 1,
        guest_name: newBooking.guest.trim(),
        email: newBooking.email.trim(),
        phone: newBooking.phone.trim(),
        room_type: newBooking.room,
        check_in_date: newBooking.checkin,
        check_out_date: newBooking.checkout,
        nights: nights,
        num_guests: parseInt(newBooking.guests.toString()),
        room_total: 500,
        addon_total: 0,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: 500 * nights,
        status: newBooking.status,
        special_requests: newBooking.specialRequests
      }

      console.log('📨 API Request:', bookingData)
      const response = await api.post('/api/v1/bookings/', bookingData)
      console.log('✅ API Response:', response.data)
      
      const createdBooking = response.data.booking || response.data
      
      const newBookingItem: Booking = {
        id: createdBooking.id || Date.now(),
        guest: createdBooking.guest_name || newBooking.guest,
        room: createdBooking.room_type || newBooking.room,
        checkin: (createdBooking.check_in_date || newBooking.checkin).split('T')[0],
        checkout: (createdBooking.check_out_date || newBooking.checkout).split('T')[0],
        nights: createdBooking.nights || nights,
        amount: parseFloat(createdBooking.total_amount || (500 * nights).toString()),
        status: createdBooking.status || newBooking.status,
        guests: createdBooking.num_guests || parseInt(newBooking.guests.toString()),
      }

      addBookingToLocal(newBookingItem)
      setShowAddModal(false)
      
      setTimeout(() => refreshBookings(), 500)

      setNewBooking({
        guest: '',
        email: '',
        phone: '',
        room: '',
        checkin: '',
        checkout: '',
        guests: 1,
        specialRequests: '',
        status: 'pending'
      })
      setSubmitError('')
    } catch (err: any) {
      console.error('❌ Booking submission error:', err)
      
      let errorMsg = 'Failed to create booking'
      
      // Try different error formats from backend
      if (err.response?.data?.detail) {
        // FastAPI validation or custom error
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((e: any) => `${e.loc[1] || e.loc[0]}: ${e.msg}`).join(', ')
        } else {
          errorMsg = err.response.data.detail
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network error - Backend server may not be running'
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout - Server took too long to respond'
      } else if (err.code === 'ECONNREFUSED') {
        errorMsg = 'Connection refused - Backend server is not running'
      } else if (err.message) {
        errorMsg = err.message
      }
      
      setSubmitError(errorMsg)
      
      console.error('📋 Full error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        code: err.code
      })
      
      // Handle unauthorized
      const token = localStorage.getItem('access_token')
      if (!token || err.response?.status === 401) {
        setSubmitError('Session expired. Please login again.')
        setTimeout(() => router.push('/login'), 1500)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowViewModal(true)
  }
  
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowEditModal(true)
  }
  
  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
  
    try {
      await api.put(`/api/v1/bookings/${selectedBooking.id}`, {
        status: selectedBooking.status,
        // other fields if needed
      })
      setShowEditModal(false)
      refreshBookings()
    } catch (err: any) {
      console.error('Error updating booking:', err)
      const errorDetail = err.response?.data?.detail
      if (Array.isArray(errorDetail)) {
        const messages = errorDetail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ')
        console.error('Validation Error:', messages)
      } else {
        console.error(errorDetail || 'Failed to update booking')
      }
    }
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
                <h1 className="text-3xl font-bold gradient-text">Bookings Management</h1>
                <p className="text-sm text-[#2D4A42]">Manage all reservations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>➕</span>
                <span>New Booking</span>
              </button>
              <button 
                onClick={() => refreshBookings()}
                className="glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                title="Refresh bookings from server"
              >
                🔄 Refresh
              </button>
              <button 
                onClick={() => {
                  console.log('Export bookings requested')
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
        {/* Filters & View Toggle */}
        <div className="glass-card rounded-2xl p-6 mb-6 slide-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, config]: any) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-3 rounded-2xl font-semibold transition-all ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'glass text-[#1A2E2B] hover:bg-gray-100'
                  }`}
                >
                  <div className="text-sm">{config.label}</div>
                  <div className="text-xl font-bold">{statusCounts[key as keyof typeof statusCounts]}</div>
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
                    : 'text-[#2D4A42] hover:bg-gray-50'
                }`}
              >
                ☰ List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-[#2D4A42] hover:bg-gray-50'
                }`}
              >
                📅 Calendar
              </button>
            </div>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field px-4 py-2 rounded-xl w-64 focus:outline-none"
              />
              <select 
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="glass px-4 py-2 rounded-xl text-[#1A2E2B] focus:outline-none cursor-pointer"
              >
                <option value="all">All Rooms</option>
                <option value="Deluxe Suite">Deluxe Suite</option>
                <option value="Executive King">Executive King</option>
                <option value="Standard Queen">Standard Queen</option>
                <option value="Ocean View">Ocean View</option>
                <option value="Presidential Suite">Presidential Suite</option>
                <option value="Business Suite">Business Suite</option>
              </select>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Guest</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Room</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Dates</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Nights</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Guests</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Amount</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-[#2D4A42] italic animate-pulse">
                        Loading bookings...
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-[#2D4A42]">
                        📭 No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking, idx) => (
                      <tr 
                        key={booking.id} 
                        className="hover:bg-gray-50 transition-colors slide-up"
                        style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                              {booking.guest.charAt(0)}
                            </div>
                            <span className="font-medium text-[#1A2E2B]">{booking.guest}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#1A2E2B]">{booking.room}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div className="font-medium">{booking.checkin}</div>
                            <div className="text-[#2D4A42]">→ {booking.checkout}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#1A2E2B]">{booking.nights}</td>
                        <td className="py-4 px-4 text-[#1A2E2B]">{booking.guests}</td>
                        <td className="py-4 px-4 font-semibold text-[#1A2E2B]">${booking.amount}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'vip' ? 'bg-purple-100 text-purple-700' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-[#2D4A42]'
                          }`}>
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button className="glass px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => handleViewBooking(booking)}>
                              👁️ View
                            </button>
                            <button className="glass px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-[#2D4A42]" onClick={() => handleEditBooking(booking)}>
                              ✏️ Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}

                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold gradient-text mb-2">Calendar View</h3>
              <p className="text-[#2D4A42]">Interactive booking calendar coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="glass-card rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto slide-up" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">Create New Booking</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-6">
              {submitError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 font-semibold">
                  ❌ {submitError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    name="guest"
                    required
                    value={newBooking.guest}
                    onChange={(e) => setNewBooking({...newBooking, guest: e.target.value})}
                    onKeyDown={(e) => handleKeyDown(e, 'email')}
                    placeholder="John Doe"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
                    onKeyDown={(e) => handleKeyDown(e, 'phone')}
                    placeholder="john@example.com"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                    onKeyDown={(e) => handleKeyDown(e, 'guests')}
                    placeholder="+1 555 123 4567"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newBooking.guests}
                    onChange={(e) => setNewBooking({...newBooking, guests: parseInt(e.target.value)})}
                    onKeyDown={(e) => handleKeyDown(e, 'checkin')}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    name="checkin"
                    required
                    value={newBooking.checkin}
                    onChange={(e) => setNewBooking({...newBooking, checkin: e.target.value})}
                    onKeyDown={(e) => handleKeyDown(e, 'checkout')}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    name="checkout"
                    required
                    value={newBooking.checkout}
                    onChange={(e) => setNewBooking({...newBooking, checkout: e.target.value})}
                    onKeyDown={(e) => handleKeyDown(e, 'room')}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Room Type *
                  </label>
                  <select
                    name="room"
                    required
                    value={newBooking.room}
                    onChange={(e) => setNewBooking({...newBooking, room: e.target.value})}
                    onKeyDown={(e) => handleKeyDown(e, 'status')}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a room type</option>
                    <option>Standard Queen</option>
                    <option>Deluxe Suite</option>
                    <option>Executive King</option>
                    <option>Ocean View</option>
                    <option>Presidential Suite</option>
                    <option>Business Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Booking Status *
                  </label>
                  <select
                    required
                    value={newBooking.status}
                    onChange={(e) => setNewBooking({...newBooking, status: e.target.value})}
                    onKeyDown={(e) => handleKeyDown(e, 'specialRequests')}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Special Requests
                  </label>
                  <textarea
                    rows={3}
                    value={newBooking.specialRequests}
                    onChange={(e) => setNewBooking({...newBooking, specialRequests: e.target.value})}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        // Submit the form when Enter is pressed in the last field
                        const form = document.querySelector('form') as HTMLFormElement
                        if (form) form.requestSubmit()
                      }
                    }}
                    placeholder="Any special requirements..."
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer ${
                    isSubmitting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105 transition-transform'
                  }`}
                >
                  {isSubmitting ? '⏳ Creating...' : '✓ Create Booking'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div 
            className="glass-card rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">Booking Details</h2>
              <button 
                onClick={() => setShowViewModal(false)}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
                  {selectedBooking.guest.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1A2E2B] mb-2">{selectedBooking.guest}</h3>
                  <p className="text-[#2D4A42]">Booking ID: BKG-{String(selectedBooking.id).padStart(5, '0')}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block mt-2 ${
                    selectedBooking.status === 'vip' ? 'bg-purple-100 text-purple-700' :
                    selectedBooking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    selectedBooking.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                    selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-[#2D4A42]'
                  }`}>
                    {selectedBooking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-[#2D4A42] mb-1">Room Type</p>
                  <p className="font-bold text-xl text-[#1A2E2B]">{selectedBooking.room}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-[#2D4A42] mb-1">Number of Guests</p>
                  <p className="font-bold text-xl text-[#1A2E2B]">{selectedBooking.guests}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-[#2D4A42] mb-1">Check-in Date</p>
                  <p className="font-bold text-xl text-[#1A2E2B]">{selectedBooking.checkin}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-[#2D4A42] mb-1">Check-out Date</p>
                  <p className="font-bold text-xl text-[#1A2E2B]">{selectedBooking.checkout}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-[#2D4A42] mb-1">Duration</p>
                  <p className="font-bold text-xl text-[#1A2E2B]">{selectedBooking.nights} nights</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-[#2D4A42] mb-1">Total Amount</p>
                  <p className="font-bold text-3xl gradient-text">${selectedBooking.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleEditBooking(selectedBooking)
                    setShowViewModal(false)
                  }}
                  className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
                >
                  ✏️ Edit Booking
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="glass-card rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">Edit Booking</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedBooking(null)
                }}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedBooking.guest}
                    onChange={(e) => setSelectedBooking({...selectedBooking, guest: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Room Type *
                  </label>
                  <select
                    required
                    value={selectedBooking.room}
                    onChange={(e) => setSelectedBooking({...selectedBooking, room: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Standard Queen</option>
                    <option>Deluxe Suite</option>
                    <option>Executive King</option>
                    <option>Ocean View</option>
                    <option>Presidential Suite</option>
                    <option>Business Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedBooking.checkin}
                    onChange={(e) => setSelectedBooking({...selectedBooking, checkin: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedBooking.checkout}
                    onChange={(e) => setSelectedBooking({...selectedBooking, checkout: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={selectedBooking.guests}
                    onChange={(e) => setSelectedBooking({...selectedBooking, guests: parseInt(e.target.value)})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Status *
                  </label>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => setSelectedBooking({...selectedBooking, status: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer hover:scale-105 transition-transform"
                >
                  ✓ Update Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedBooking(null)
                  }}
                  className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
