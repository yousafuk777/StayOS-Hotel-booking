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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roomTypes = [
    'Standard Queen',
    'Deluxe Suite',
    'Executive King',
    'Ocean View',
    'Presidential Suite',
    'Business Suite'
  ]

  const calculateNights = (checkin: string, checkout: string) => {
    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
    return nights || 1
  }

  const calculateAmount = (roomType: string, nights: number) => {
    const basePrices: { [key: string]: number } = {
      'Standard Queen': 199,
      'Deluxe Suite': 299,
      'Executive King': 349,
      'Ocean View': 399,
      'Presidential Suite': 899,
      'Business Suite': 449
    }
    return (basePrices[roomType] || 250) * nights
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const nights = calculateNights(formData.checkIn, formData.checkOut)
    const amount = calculateAmount(formData.roomType, nights)
    
    const newBooking = {
      id: Date.now(), // Use timestamp for unique ID
      guest: formData.guestName,
      room: formData.roomType,
      checkin: formData.checkIn,
      checkout: formData.checkOut,
      nights: nights,
      amount: amount,
      status: 'pending',
      guests: formData.guests
    }
    
    // Save to localStorage - merge with existing bookings
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]')
    existingBookings.push(newBooking)
    localStorage.setItem('bookings', JSON.stringify(existingBookings))
    
    // Show success message
    alert(`✅ Booking created successfully!\n\nGuest: ${formData.guestName}\nRoom: ${formData.roomType}\nDates: ${formData.checkIn} → ${formData.checkOut}\nNights: ${nights}\nTotal: $${amount.toLocaleString()}\n\nRedirecting to bookings...`)
    
    // Redirect to bookings page
    setTimeout(() => {
      router.push('/admin/bookings')
    }, 1000)
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
              {formData.roomType && formData.checkIn && formData.checkOut && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800 font-semibold">💰 Price Calculation:</p>
                  <p className="text-sm text-green-700 mt-1">
                    {formData.roomType} × {calculateNights(formData.checkIn, formData.checkOut)} nights = 
                    <span className="font-bold text-green-900 ml-2">
                      ${calculateAmount(formData.roomType, calculateNights(formData.checkIn, formData.checkOut)).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}
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
            disabled={isSubmitting}
            className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '⏳ Creating Booking...' : '✓ Create Booking'}
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
