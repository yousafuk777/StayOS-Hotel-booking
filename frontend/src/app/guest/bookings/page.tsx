'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGuestAuth } from '../../../context/GuestAuthContext'
import guestApi from '../../../services/guestApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function GuestBookingsPage() {
  const { guestUser, guestToken, isLoading: authLoading } = useGuestAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !guestToken) {
      router.push('/guest/login')
      return
    }

    if (guestToken) {
      const fetchBookings = async () => {
        try {
          const response = await guestApi.get('/api/v1/guest/bookings')
          setBookings(response.data)
        } catch (err: any) {
          console.error('Failed to fetch bookings:', err)
          setError('Could not load your bookings. Please try again later.')
        } finally {
          setLoading(false)
        }
      }

      fetchBookings()
    }
  }, [guestToken, authLoading, router])

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-100'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  if (authLoading || (loading && !error)) {
    return (
      <div className="p-8 md:p-12 max-w-6xl mx-auto w-full">
         <div className="h-12 bg-gray-100 rounded-2xl w-64 mb-12 animate-pulse"></div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-gray-50 rounded-[2.5rem] animate-pulse border border-gray-100"></div>
            ))}
         </div>
      </div>
    )
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto w-full">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">My Bookings</h2>
          <p className="text-gray-400 font-bold text-lg">Hello, <span className="text-primary-600">{guestUser?.first_name || 'Guest'}</span> 👋</p>
        </div>
        <div className="bg-white px-8 py-5 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary-600/20">
            {bookings.length}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Active stays</p>
            <p className="text-sm font-black text-gray-900">Total Bookings</p>
          </div>
        </div>
      </header>

      {error ? (
        <div className="bg-red-50 text-red-600 p-12 rounded-[3rem] border border-red-100 text-center">
          <p className="font-black text-xl mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-600/20 active:scale-95 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[4rem] p-20 text-center shadow-2xl shadow-gray-200/20 border border-gray-100"
        >
          <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner">
            🏜️
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No adventures yet</h3>
          <p className="text-gray-400 mb-10 max-w-sm mx-auto font-bold leading-relaxed">
            Your booking history is empty. Time to change that and explore our beautiful destinations!
          </p>
          <Link 
            href="/" 
            className="bg-gray-900 hover:bg-black text-white px-12 py-5 rounded-2xl font-black inline-block shadow-2xl shadow-gray-900/20 active:scale-95 transition-all"
          >
            Explore Hotels 🏨
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {bookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={`/guest/bookings/${booking.reference_number}`}>
                <div className="group bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/20 overflow-hidden hover:shadow-primary-600/10 hover:-translate-y-3 transition-all duration-500 h-full flex flex-col">
                  {/* Card Header */}
                  <div className="p-8 pb-4 flex justify-between items-center bg-gray-50/50 group-hover:bg-white transition-colors">
                    <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-[10px] font-black text-gray-300 group-hover:text-primary-600 transition-colors uppercase tracking-[0.2em]">
                      REF: {booking.reference_number}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-10 pt-4 flex-grow">
                    <h3 className="text-3xl font-black text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-[1.1] tracking-tighter">
                      {booking.hotel_name}
                    </h3>
                    <p className="text-gray-400 text-sm font-black mb-8 flex items-center gap-2">
                       <span className="opacity-50">🛏️</span> {booking.room_name}
                    </p>

                    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-50 group-hover:bg-primary-50/20 group-hover:border-primary-50 transition-all">
                      <div className="text-center">
                         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">Check-in</p>
                         <p className="text-sm font-black text-gray-900">{new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="w-8 h-px bg-gray-100 group-hover:bg-primary-200 transition-colors relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-200 group-hover:bg-primary-400 group-hover:scale-110 transition-all"></div>
                      </div>
                      <div className="text-center">
                         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">Check-out</p>
                         <p className="text-sm font-black text-gray-900">{new Date(booking.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-10 py-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between group-hover:bg-white transition-all">
                    <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Duration</p>
                      <span className="text-sm font-black text-gray-900">{booking.nights} Nights</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary-600/50 uppercase tracking-widest leading-none mb-1">Price</p>
                      <span className="text-2xl font-black text-gray-900 tracking-tighter">
                         <span className="text-sm align-top mt-1 mr-0.5">$</span>
                         {booking.total_amount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
