'use client'

import { useRouter } from 'next/navigation'
import NewBookingForm from '../../../components/admin/NewBookingForm'

export default function NewBookingPage() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Create New Booking</h1>
        <p className="text-[#2D4A42]">Add a new reservation for a guest</p>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8">
        <NewBookingForm 
          onSuccess={() => router.push('/admin/bookings')} 
          onCancel={() => router.back()} 
        />
      </div>
    </div>
  )
}
