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

export default function BookingsPage() {
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('all')
  const router = useRouter()

  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, guest: 'Sarah Johnson', room: 'Deluxe Suite', checkin: '2026-03-25', checkout: '2026-03-28', nights: 3, amount: 897, status: 'confirmed', guests: 2 },
    { id: 2, guest: 'Michael Chen', room: 'Executive King', checkin: '2026-03-26', checkout: '2026-03-30', nights: 4, amount: 1240, status: 'pending', guests: 1 },
    { id: 3, guest: 'Emma Williams', room: 'Standard Queen', checkin: '2026-03-27', checkout: '2026-03-29', nights: 2, amount: 458, status: 'checked_in', guests: 2 },
    { id: 4, guest: 'James Brown', room: 'Presidential Suite', checkin: '2026-03-28', checkout: '2026-04-02', nights: 5, amount: 2495, status: 'vip', guests: 3 },
    { id: 5, guest: 'Lisa Anderson', room: 'Ocean View', checkin: '2026-03-20', checkout: '2026-03-25', nights: 5, amount: 1875, status: 'checked_out', guests: 2 },
  ])

  // Load bookings from localStorage on mount
  useEffect(() => {
    console.log('Loading bookings from localStorage...')
    const storedBookings = localStorage.getItem('bookings')
    if (storedBookings) {
      try {
        const parsed: Booking[] = JSON.parse(storedBookings)
        console.log('Loaded', parsed.length, 'bookings from localStorage')
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Start with default bookings
          const defaultBookings: Booking[] = [
            { id: 1, guest: 'Sarah Johnson', room: 'Deluxe Suite', checkin: '2026-03-25', checkout: '2026-03-28', nights: 3, amount: 897, status: 'confirmed', guests: 2 },
            { id: 2, guest: 'Michael Chen', room: 'Executive King', checkin: '2026-03-26', checkout: '2026-03-30', nights: 4, amount: 1240, status: 'pending', guests: 1 },
            { id: 3, guest: 'Emma Williams', room: 'Standard Queen', checkin: '2026-03-27', checkout: '2026-03-29', nights: 2, amount: 458, status: 'checked_in', guests: 2 },
            { id: 4, guest: 'James Brown', room: 'Presidential Suite', checkin: '2026-03-28', checkout: '2026-04-02', nights: 5, amount: 2495, status: 'vip', guests: 3 },
            { id: 5, guest: 'Lisa Anderson', room: 'Ocean View', checkin: '2026-03-20', checkout: '2026-03-25', nights: 5, amount: 1875, status: 'checked_out', guests: 2 },
          ]
          
          // Merge: use stored versions for modified defaults, keep defaults for unmodified, add user-created
          const mergedBookings = defaultBookings.map(defaultBooking => {
            const stored = parsed.find(b => b.id === defaultBooking.id)
            return stored || defaultBooking
          }).concat(parsed.filter(b => b.id > 5))
          
          setBookings(mergedBookings)
          console.log('Total bookings after merge:', mergedBookings.length)
        }
      } catch (e) {
        console.error('Error loading bookings from localStorage:', e)
      }
    } else {
      console.log('No saved bookings found in localStorage, using defaults')
    }
  }, [])

  // Helper function to save user-created bookings to localStorage
  const saveToLocalStorage = (currentBookings: Booking[]) => {
    // Save ALL bookings except the hardcoded defaults (IDs 1-5)
    // This includes:
    // - User-created bookings (ID > 5 or timestamp-based)
    // - Updated versions of default bookings (we need to track these separately)
    const userCreatedBookings = currentBookings.filter(b => b.id > 5)
    
    // Also check if any default bookings have been modified
    const defaultBookingsMap: { [key: number]: Booking } = {
      1: { id: 1, guest: 'Sarah Johnson', room: 'Deluxe Suite', checkin: '2026-03-25', checkout: '2026-03-28', nights: 3, amount: 897, status: 'confirmed', guests: 2 },
      2: { id: 2, guest: 'Michael Chen', room: 'Executive King', checkin: '2026-03-26', checkout: '2026-03-30', nights: 4, amount: 1240, status: 'pending', guests: 1 },
      3: { id: 3, guest: 'Emma Williams', room: 'Standard Queen', checkin: '2026-03-27', checkout: '2026-03-29', nights: 2, amount: 458, status: 'checked_in', guests: 2 },
      4: { id: 4, guest: 'James Brown', room: 'Presidential Suite', checkin: '2026-03-28', checkout: '2026-04-02', nights: 5, amount: 2495, status: 'vip', guests: 3 },
      5: { id: 5, guest: 'Lisa Anderson', room: 'Ocean View', checkin: '2026-03-20', checkout: '2026-03-25', nights: 5, amount: 1875, status: 'checked_out', guests: 2 },
    }
    
    // Find modified default bookings
    const modifiedDefaults = currentBookings.filter(b => {
      if (b.id >= 1 && b.id <= 5) {
        const original = defaultBookingsMap[b.id]
        return original && (
          b.guest !== original.guest ||
          b.room !== original.room ||
          b.checkin !== original.checkin ||
          b.checkout !== original.checkout ||
          b.nights !== original.nights ||
          b.amount !== original.amount ||
          b.status !== original.status ||
          b.guests !== original.guests
        )
      }
      return false
    })
    
    // Combine user-created and modified default bookings
    const allUserBookings = [...userCreatedBookings, ...modifiedDefaults]
    
    console.log('Saving to localStorage:', allUserBookings.length, 'bookings')
    console.log('Modified defaults:', modifiedDefaults.length)
    localStorage.setItem('bookings', JSON.stringify(allUserBookings))
    console.log('Saved bookings JSON:', localStorage.getItem('bookings'))
  }

  const [newBooking, setNewBooking] = useState({
    guest: '',
    email: '',
    phone: '',
    room: '',
    checkin: '',
    checkout: '',
    guests: 1,
    specialRequests: ''
  })

  const totalBookings = bookings.length
  const now = new Date()
  const bookingsThisMonth = bookings.filter((booking) => {
    const checkin = new Date(booking.checkin)
    return (
      checkin.getFullYear() === now.getFullYear() &&
      checkin.getMonth() === now.getMonth()
    )
  }).length
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length
  const checkedInBookings = bookings.filter((booking) => booking.status === 'checked_in').length
  const revenueThisMonth = bookings
    .filter((booking) => {
      const checkin = new Date(booking.checkin)
      return (
        checkin.getFullYear() === now.getFullYear() &&
        checkin.getMonth() === now.getMonth()
      )
    })
    .reduce((sum, booking) => sum + booking.amount, 0)

  const STATUS_CONFIG: any = {
    all: { label: 'All Bookings', color: 'bg-gray-100 text-gray-700' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    checked_in: { label: 'Checked In', color: 'bg-green-100 text-green-700' },
    checked_out: { label: 'Checked Out', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    'vip': { label: 'VIP', color: 'bg-purple-100 text-purple-700' },
  }
  
  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault()
      
    const checkinDate = new Date(newBooking.checkin)
    const checkoutDate = new Date(newBooking.checkout)
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
      
    const booking: Booking = {
      id: Date.now(), // Use timestamp for unique ID
      guest: newBooking.guest,
      room: newBooking.room,
      checkin: newBooking.checkin,
      checkout: newBooking.checkout,
      nights: nights || 1,
      amount: Math.floor(Math.random() * 2000) + 500,
      status: 'pending',
      guests: newBooking.guests
    }
  
    const updatedBookings = [...bookings, booking]
    setBookings(updatedBookings)
      
    // Save only user-created bookings to localStorage
    saveToLocalStorage(updatedBookings)
      
    setNewBooking({
      guest: '',
      email: '',
      phone: '',
      room: '',
      checkin: '',
      checkout: '',
      guests: 1,
      specialRequests: ''
    })
    setShowAddModal(false)
    alert(`Booking for "${booking.guest}" created successfully!`)
  }
  
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowViewModal(true)
  }
  
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowEditModal(true)
  }
  
  const handleUpdateBooking = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return
  
    const updatedBookings = bookings.map(b => 
      b.id === selectedBooking.id ? selectedBooking : b
    )
    setBookings(updatedBookings)
      
    // Save all user-created bookings to localStorage (including updates)
    saveToLocalStorage(updatedBookings)
      
    setShowEditModal(false)
    setSelectedBooking(null)
    alert(`Booking for "${selectedBooking.guest}" updated successfully!`)
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
                <p className="text-sm text-gray-600">Manage all reservations</p>
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
                onClick={() => {
                  const confirmExport = confirm('Export all bookings to CSV?');
                  if (confirmExport) {
                    alert('Bookings exported successfully! Download starting...');
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
            <p className="text-4xl font-bold gradient-text">{totalBookings}</p>
            <p className="text-sm text-gray-600 mt-2">This month: {bookingsThisMonth}</p>
          </div>
          <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-yellow-500">
            <p className="text-gray-600 font-medium mb-2">Pending</p>
            <p className="text-4xl font-bold gradient-text">{pendingBookings}</p>
            <p className="text-sm text-gray-600 mt-2">Awaiting confirmation</p>
          </div>
          <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-green-500">
            <p className="text-gray-600 font-medium mb-2">Checked In</p>
            <p className="text-4xl font-bold gradient-text">{checkedInBookings}</p>
            <p className="text-sm text-gray-600 mt-2">Currently staying</p>
          </div>
          <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-purple-500">
            <p className="text-gray-600 font-medium mb-2">Revenue</p>
            <p className="text-4xl font-bold gradient-text">${(revenueThisMonth / 1000).toFixed(1)}K</p>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field px-4 py-2 rounded-xl w-64 focus:outline-none"
              />
              <select 
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none cursor-pointer"
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
                  {/* Filter bookings based on filter, search, and room selection */}
                  {(() => {
                    const filteredBookings = bookings.filter(booking => {
                      // Status filter
                      if (filter !== 'all' && booking.status !== filter) return false
                      
                      // Search filter
                      if (searchQuery && !booking.guest.toLowerCase().includes(searchQuery.toLowerCase())) return false
                      
                      // Room filter
                      if (selectedRoom !== 'all' && booking.room !== selectedRoom) return false
                      
                      return true
                    })
                    
                    if (filteredBookings.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-gray-500">
                            📭 No bookings found
                          </td>
                        </tr>
                      )
                    }
                    
                    return filteredBookings.map((booking, index) => (
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
                          <button className="glass px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => handleViewBooking(booking)}>
                            👁️ View
                          </button>
                          <button className="glass px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-600" onClick={() => handleEditBooking(booking)}>
                            ✏️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                })()}
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

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto slide-up">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBooking.guest}
                    onChange={(e) => setNewBooking({...newBooking, guest: e.target.value})}
                    placeholder="John Doe"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
                    placeholder="john@example.com"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                    placeholder="+1 555 123 4567"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newBooking.guests}
                    onChange={(e) => setNewBooking({...newBooking, guests: parseInt(e.target.value)})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBooking.checkin}
                    onChange={(e) => setNewBooking({...newBooking, checkin: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBooking.checkout}
                    onChange={(e) => setNewBooking({...newBooking, checkout: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    required
                    value={newBooking.room}
                    onChange={(e) => setNewBooking({...newBooking, room: e.target.value})}
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    rows={3}
                    value={newBooking.specialRequests}
                    onChange={(e) => setNewBooking({...newBooking, specialRequests: e.target.value})}
                    placeholder="Any special requirements..."
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer hover:scale-105 transition-transform"
                >
                  ✓ Create Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto slide-up">
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedBooking.guest}</h3>
                  <p className="text-gray-600">Booking ID: BKG-{String(selectedBooking.id).padStart(5, '0')}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block mt-2 ${
                    selectedBooking.status === 'vip' ? 'bg-purple-100 text-purple-700' :
                    selectedBooking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    selectedBooking.status === 'checked_in' ? 'bg-green-100 text-green-700' :
                    selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedBooking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Room Type</p>
                  <p className="font-bold text-xl text-gray-900">{selectedBooking.room}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Number of Guests</p>
                  <p className="font-bold text-xl text-gray-900">{selectedBooking.guests}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Check-in Date</p>
                  <p className="font-bold text-xl text-gray-900">{selectedBooking.checkin}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Check-out Date</p>
                  <p className="font-bold text-xl text-gray-900">{selectedBooking.checkout}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-bold text-xl text-gray-900">{selectedBooking.nights} nights</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto slide-up">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
