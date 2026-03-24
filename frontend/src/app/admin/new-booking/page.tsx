'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewBookingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  })

  const roomTypes = [
    'Standard Queen',
    'Deluxe Suite',
    'Executive King',
    'Ocean View',
    'Presidential Suite',
    'Business Suite'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Booking created successfully! Redirecting to bookings...')
    router.push('/admin/bookings')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Create New Booking</h1>
        <p className="text-gray-600">Add a new reservation for a guest</p>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Information */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            👤 Guest Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({...formData, guestName: e.target.value})}
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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
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
                value={formData.guests}
                onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            📅 Booking Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkIn}
                onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
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
                value={formData.checkOut}
                onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room Type *
              </label>
              <select
                required
                value={formData.roomType}
                onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a room type</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                rows={4}
                value={formData.specialRequests}
                onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                placeholder="Any special requirements or preferences..."
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer hover:scale-105 transition-transform"
          >
            ✓ Create Booking
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
