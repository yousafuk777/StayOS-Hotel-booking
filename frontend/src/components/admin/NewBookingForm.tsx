import { useState } from 'react'
import api from '../../services/api'

interface NewBookingFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function NewBookingForm({ onSuccess, onCancel }: NewBookingFormProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    status: 'pending',
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
        guest_id: null, // Allow backend to create or map dynamically
        hotel_id: 1, // Mock hotel ID
        room_id: 1,  // Mock room ID
        guest_name: formData.guestName,
        email: formData.email,
        phone: formData.phone,
        room_type: formData.roomType,
        check_in_date: formData.checkIn,
        check_out_date: formData.checkOut,
        nights: nights,
        num_guests: formData.guests,
        room_total: amount,
        addon_total: 0,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: amount,
        status: formData.status,
        special_requests: formData.specialRequests
      }

      await api.post('/api/v1/bookings', bookingData)
      alert('✅ Booking created successfully!')
      onSuccess()
    } catch (err: any) {
      console.error('Failed to create booking:', err)
      
      const errorDetail = err.response?.data?.detail
      if (Array.isArray(errorDetail)) {
        const messages = errorDetail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ')
        setError(`Validation Error: ${messages}`)
      } else {
        const errorMsg = errorDetail || err.message || 'Unknown error'
        if (errorMsg.includes('Network Error') || err.code === 'ERR_NETWORK') {
          setError('Network Error - Please check backend connection.')
        } else if (errorMsg.includes('Tenant')) {
          setError('Configuration Error: Your account has no associated tenant.')
        } else {
          setError(`Failed to create booking: ${errorMsg}`)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-6 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 text-[#1A2E2B]">
            <h3 className="font-bold text-lg border-b border-gray-200 pb-2 mb-2">Guest Details</h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Guest Name *</label>
            <input
              type="text" required value={formData.guestName}
              onChange={(e) => setFormData({...formData, guestName: e.target.value})}
              placeholder="John Doe"
              className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Email Address *</label>
            <input
              type="email" required value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
              className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Phone Number *</label>
            <input
              type="tel" required value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
              className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Number of Guests *</label>
            <input
              type="number" min="1" max="10" required value={formData.guests}
              onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
              className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2 text-[#1A2E2B] mt-4">
            <h3 className="font-bold text-lg border-b border-gray-200 pb-2 mb-2">Stay Details</h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-in Date *</label>
            <input
              type="date" required value={formData.checkIn}
              onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
              className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-out Date *</label>
            <input
              type="date" required value={formData.checkOut}
              onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
              className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room Type *</label>
            <select
              required value={formData.roomType}
              onChange={(e) => setFormData({...formData, roomType: e.target.value})}
              className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a room type</option>
              {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Booking Status *</label>
            <select
              required value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
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
            {formData.roomType && formData.checkIn && formData.checkOut && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800 font-semibold">💰 Price Calculation:</p>
                <p className="text-sm text-green-700 mt-1">
                  {formData.roomType} × {calculateNights(formData.checkIn, formData.checkOut)} nights = 
                  <span className="font-bold text-green-900 ml-2">
                    ${calculateAmount(formData.roomType, calculateNights(formData.checkIn, formData.checkOut)).toLocaleString()}
                  </span>
                </p>
              </div>
            )}
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Special Requests</label>
            <textarea
              rows={3} value={formData.specialRequests}
              onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
              placeholder="Any special requirements..."
              className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '⏳ Creating...' : '✓ Create Booking'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
