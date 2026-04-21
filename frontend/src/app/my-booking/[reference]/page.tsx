'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Navbar from '../../../components/Navbar'
import apiClient from '../../../services/apiClient'

export default function GuestBookingPage() {
  const { reference } = useParams()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!reference || !token) {
        setError('Invalid booking link. Please check your email for the correct URL.')
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.get(`/api/v1/bookings/public/lookup/${reference}`, {
          params: { token }
        })
        setBooking(response.data)
      } catch (err: any) {
        console.error('Error fetching booking:', err)
        setError(err.response?.data?.detail || 'This booking link has expired or is invalid. Please contact the hotel directly.')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [reference, token])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <main className="min-h-screen bg-lightBg pb-12">
      <Navbar />
      
      <div className="pt-32 px-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="glass-card rounded-3xl p-12 text-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-10 text-center shadow-xl border-t-4 border-red-500"
          >
            <span className="text-5xl mb-6 block">🚫</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <a href="/" className="btn-primary inline-block px-8 py-3 rounded-xl font-bold">
              Return Home
            </a>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100"
          >
            {/* Header */}
            <div className="bg-primary-900 p-8 text-white text-center">
              <h1 className="text-2xl font-black mb-1">{booking.hotel_name}</h1>
              <p className="text-white/70 text-sm">Managed via StayOS</p>
            </div>

            <div className="p-8">
              {/* Reference & Status */}
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Booking Reference</p>
                  <h3 className="text-xl font-black text-primary-600">{booking.reference_number}</h3>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Room Category</p>
                    <p className="text-gray-900 font-bold flex items-center gap-2">
                       <span>🛏️</span> {booking.room_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Guest Name</p>
                    <p className="text-gray-900 font-bold flex items-center gap-2">
                       <span>👤</span> {booking.guest_name}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Check-in</p>
                    <p className="text-gray-900 font-bold">{formatDate(booking.check_in_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Check-out</p>
                    <p className="text-gray-900 font-bold">{formatDate(booking.check_out_date)}</p>
                  </div>
                </div>
              </div>

              {/* Footer Summary */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-bold">{booking.nights} Nights</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900">Total Charged</span>
                  <span className="font-black text-primary-600">${booking.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Note */}
              <div className="flex gap-4 p-4 bg-primary-50 rounded-xl text-primary-800 text-sm">
                <span className="text-xl">ℹ️</span>
                <p>
                  Your booking is currently <strong>{booking.status}</strong>. You will receive an email once the hotel admin confirms your stay.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 mb-4">Need to make changes? Please contact the hotel directly.</p>
              <button 
                onClick={() => window.print()}
                className="text-primary-600 font-bold hover:underline text-sm flex items-center justify-center gap-2 mx-auto"
              >
                🖨️ Print Confirmation
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
