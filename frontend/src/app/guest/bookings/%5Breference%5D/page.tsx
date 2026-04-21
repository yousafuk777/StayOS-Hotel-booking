'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGuestAuth } from '../../../../context/GuestAuthContext'
import guestApi from '../../../../services/guestApi'
import Link from 'next/link'

export default function GuestBookingDetailPage() {
  const { reference } = useParams()
  const { guestToken, isLoading: authLoading } = useGuestAuth()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !guestToken) {
      router.push('/guest/login')
      return
    }

    if (guestToken && reference) {
      const fetchBookingDetail = async () => {
        try {
          const response = await guestApi.get(`/api/v1/guest/bookings/${reference}`)
          setBooking(response.data)
        } catch (err: any) {
          console.error('Failed to fetch booking detail:', err)
          setError(err.response?.data?.detail || 'Could not load booking details.')
        } finally {
          setLoading(false)
        }
      }

      fetchBookingDetail()
    }
  }, [guestToken, reference, authLoading, router])

  const handleCancelBooking = async () => {
    setIsCancelling(true)
    try {
      await guestApi.post(`/api/v1/guest/bookings/${reference}/cancel`)
      // Refresh data
      const response = await guestApi.get(`/api/v1/guest/bookings/${reference}`)
      setBooking(response.data)
      setShowCancelModal(false)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel booking. Please contact the hotel.')
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-500 text-white border-green-400'
      case 'pending': return 'bg-yellow-500 text-white border-yellow-400'
      case 'cancelled': return 'bg-red-500 text-white border-red-400'
      default: return 'bg-gray-500 text-white border-gray-400'
    }
  }

  if (authLoading || (loading && !error)) {
    return (
      <div className="p-8 md:p-12 max-w-4xl mx-auto w-full">
         <div className="h-20 bg-gray-100 rounded-3xl w-1/3 mb-10 animate-pulse"></div>
         <div className="h-[500px] bg-gray-50 rounded-[4rem] animate-pulse border border-gray-100"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 md:p-12 max-w-2xl mx-auto w-full text-center">
         <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-16 shadow-2xl border border-gray-100"
         >
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tighter">{error}</h2>
            <Link 
              href="/guest/bookings" 
              className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black transition-all hover:bg-black shadow-xl shadow-gray-900/10"
            >
              Back to My Bookings
            </Link>
         </motion.div>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto w-full">
      <Link href="/guest/bookings" className="inline-flex items-center gap-3 text-gray-400 hover:text-gray-900 font-black text-xs mb-12 transition-all group uppercase tracking-widest">
         <span className="text-2xl group-hover:-translate-x-2 transition-transform">←</span> Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[4rem] shadow-3xl shadow-gray-200/50 border border-gray-50 overflow-hidden"
      >
        {/* Hero Header */}
        <div className="bg-gray-900 p-12 md:p-16 text-white relative overflow-hidden">
          <div className="relative z-10">
             <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`inline-block px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 mb-8 ${getStatusColor(booking.status)}`}
             >
               {booking.status}
             </motion.span>
             <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4">{booking.hotel_name}</h2>
             <p className="text-gray-400 font-black flex items-center gap-3 text-lg">
                <span className="text-2xl opacity-50">📍</span> {booking.hotel_address || 'Hotel Address'}
             </p>
          </div>
          {/* Abstract pattern */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-primary-600/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </div>

        {/* Info Grid */}
        <div className="p-12 md:p-16">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
              <div className="space-y-12">
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3">Booking Reference</h3>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{booking.reference_number}</p>
                 </div>
                 
                 <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <div className="flex-1">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">Check-in</h3>
                       <p className="text-2xl font-black text-gray-900 tracking-tight">{new Date(booking.check_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                       <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 
                          After 14:00
                       </p>
                    </div>
                    <div className="w-px h-16 bg-gray-200 mx-4"></div>
                    <div className="flex-1 text-right">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">Check-out</h3>
                       <p className="text-2xl font-black text-gray-900 tracking-tight">{new Date(booking.check_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                       <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-2 justify-end">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> 
                          Before 11:00
                       </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-12">
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4">Accommodation Information</h3>
                    <div className="bg-primary-50 px-8 py-10 rounded-[2.5rem] border-2 border-primary-100/50 shadow-inner">
                       <p className="text-[10px] font-black text-primary-600/50 uppercase tracking-[0.2em] mb-2 font-black">Room Category</p>
                       <p className="text-2xl font-black text-primary-900 leading-tight mb-2">{booking.room_name}</p>
                       <div className="flex items-center gap-3 mt-4">
                          <span className="px-3 py-1 bg-white/50 rounded-full text-[10px] font-black text-primary-600 uppercase tracking-widest">{booking.nights} nights</span>
                          <span className="px-3 py-1 bg-white/50 rounded-full text-[10px] font-black text-primary-600 uppercase tracking-widest">Confirmed Stay</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">Total Amount</h3>
                       <p className="text-4xl font-black text-gray-900 tracking-tighter">
                          <span className="text-xl align-top mt-1 mr-1 text-primary-600">$</span>
                          {booking.total_amount}
                       </p>
                    </div>
                    <div className="text-right">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3">Payment Profile</h3>
                       <p className={`inline-block px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${booking.payment_status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {booking.payment_status}
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           {booking.special_requests && (
              <div className="mb-16 p-10 bg-gray-50 rounded-[3rem] border border-gray-100 relative group">
                 <div className="absolute -top-4 left-10 bg-white border border-gray-100 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Guest Requests</div>
                 <p className="text-lg text-gray-600 font-bold italic leading-relaxed group-hover:text-gray-900 transition-colors">"{booking.special_requests}"</p>
              </div>
           )}

           {/* Cancellation Action */}
           {booking.status !== 'cancelled' && (
              <div className="p-10 md:p-12 bg-red-50/30 rounded-[3rem] border-2 border-red-50/50 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-red-600/5">🛡️</div>
                    <div>
                       <h4 className="text-gray-900 font-black text-2xl tracking-tight mb-1">Modify or Cancel?</h4>
                       <p className="text-gray-400 text-sm font-bold">Cancellation is subject to the hotel's 24h notice policy.</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setShowCancelModal(true)}
                  disabled={!booking.can_cancel}
                  className="bg-red-600 hover:bg-black text-white px-12 py-5 rounded-2xl font-black text-base shadow-2xl shadow-red-600/30 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:pointer-events-none"
                 >
                    Cancel Booking
                 </button>
              </div>
           )}

           {/* Already Cancelled Alert */}
           {booking.status === 'cancelled' && (
              <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="mt-8 p-10 bg-gray-900 text-white rounded-[3rem] flex items-center gap-6 shadow-3xl shadow-gray-900/40 border-4 border-gray-800"
              >
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                 <div>
                    <h4 className="text-xl font-black tracking-tight mb-1">Booking Cancelled</h4>
                    <p className="text-gray-400 font-bold text-sm">Your reservation has been cancelled and a processing receipt has been sent to your email.</p>
                 </div>
              </motion.div>
           )}
        </div>
      </motion.div>

      {/* Cancellation Modal */}
      <AnimatePresence>
         {showCancelModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCancelModal(false)}
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl"
               ></motion.div>
               <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-white rounded-[4rem] p-12 md:p-16 w-full max-w-xl relative z-10 shadow-3xl text-center border border-gray-100"
               >
                  <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-4xl shadow-inner -rotate-6">
                     ⚠️
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">Are you absolutely sure?</h3>
                  <p className="text-gray-500 font-bold text-lg leading-relaxed mb-12 max-w-sm mx-auto">
                     You are about to cancel your reservation for <span className="text-gray-900 font-black">{booking.hotel_name}</span>. This action is permanent.
                  </p>
                  <div className="flex flex-col gap-5">
                     <button 
                        onClick={handleCancelBooking}
                        disabled={isCancelling}
                        className="w-full bg-red-600 hover:bg-black text-white py-6 rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-red-600/30 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                     >
                        {isCancelling ? (
                           <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Yes, Confirm Cancellation'}
                     </button>
                     <button 
                        onClick={() => setShowCancelModal(false)}
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-400 py-6 rounded-[2rem] font-black text-sm tracking-widest uppercase transition-all"
                     >
                        Go Back
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  )
}
