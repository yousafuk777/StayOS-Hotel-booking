'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../services/api'

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
  const [error, setError] = useState<string | null>(null)

  const roomTypes = [
    'Standard Queen',
    'Deluxe Suite',
    'Executive King',
    'Ocean View',
    'Presidential Suite',
    'Business Suite'
  ]

  const calculateNights = (checkin: string, checkout: string) => {
    if (!checkin || !checkout) return 1
    const [y1, m1, d1] = checkin.split('-').map(Number)
    const [y2, m2, d2] = checkout.split('-').map(Number)
    const checkinDate = new Date(y1, m1 - 1, d1)
    const checkoutDate = new Date(y2, m2 - 1, d2)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const nights = calculateNights(formData.checkIn, formData.checkOut)
      const amount = calculateAmount(formData.roomType, nights)
      
      const bookingData = {
        guest_id: 1, // Mock guest ID for now
        hotel_id: 1, // Mock hotel ID for now
        room_id: 1,  // Added mock room ID
        check_in_date: formData.checkIn,
        check_out_date: formData.checkOut,
        nights: nights,
        num_guests: formData.guests,
        room_total: amount,
        addon_total: 0,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: amount,
        status: 'pending',
        special_requests: formData.specialRequests
      }

      await api.post('/api/v1/bookings', bookingData)
      
      // Redirect to bookings page on success
      router.push('/admin/bookings')
    } catch (err: any) {
      console.error('Failed to create booking:', err)
      const errorDetail = err.response?.data?.detail
      if (Array.isArray(errorDetail)) {
        const messages = errorDetail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ')
        setError(`Validation Error: ${messages}`)
      } else {
        setError(errorDetail || 'Failed to create booking. Please check your data.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Create New Booking</h1>
        <p className="text-[#2D4A42]">Add a new reservation for a guest</p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 px-6 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Guest Information */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold gradient-text mb-4 flex items-center gap-3">
            👤 Guest Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
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
              <label className="form-label">
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
              <label className="form-label">
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
              <label className="form-label">
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
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold gradient-text mb-4 flex items-center gap-3">
            📅 Booking Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
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
              <label className="form-label">
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
              <label className="form-label">
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
              <label className="form-label">
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
