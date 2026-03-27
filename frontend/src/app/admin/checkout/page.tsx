'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckOutPage() {
  const router = useRouter()
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null)

  const todayCheckouts = [
    { 
      guest: 'Robert Taylor', 
      room: '301', 
      type: 'Deluxe Suite',
      nights: 3,
      total: '$897',
      status: 'pending',
      time: '11:00 AM'
    },
    { 
      guest: 'Lisa Anderson', 
      room: '502', 
      type: 'Executive King',
      nights: 4,
      total: '$1,240',
      status: 'processing',
      time: '12:00 PM'
    },
    { 
      guest: 'David Wilson', 
      room: '205', 
      type: 'Standard Queen',
      nights: 2,
      total: '$458',
      status: 'pending',
      time: '1:00 PM'
    },
    { 
      guest: 'Jennifer Martinez', 
      room: 'PH2', 
      type: 'Penthouse',
      nights: 5,
      total: '$2,495',
      status: 'vip',
      time: '2:00 PM'
    }
  ]

  const handleCheckOut = (guest: string) => {
    // Checkout logic would go here
    router.push('/admin/bookings')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Check-out Management</h1>
        <p className="text-gray-600">Process guest departures efficiently</p>
      </div>

      {/* Today's Checkouts Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Today's Checkouts</p>
              <p className="text-4xl font-bold gradient-text">{todayCheckouts.length}</p>
            </div>
            <div className="text-5xl">🚪</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Pending</p>
              <p className="text-4xl font-bold gradient-text">{todayCheckouts.filter(g => g.status === 'pending').length}</p>
            </div>
            <div className="text-5xl">⏳</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Completed</p>
              <p className="text-4xl font-bold gradient-text">{todayCheckouts.filter(g => g.status === 'completed').length}</p>
            </div>
            <div className="text-5xl">✓</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">VIP Departures</p>
              <p className="text-4xl font-bold gradient-text">{todayCheckouts.filter(g => g.status === 'vip').length}</p>
            </div>
            <div className="text-5xl">👑</div>
          </div>
        </div>
      </div>

      {/* Checkout List */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Departing Guests</h2>
          <button 
            onClick={() => {
              const confirmBulk = confirm('Process all pending checkouts?');
              if (confirmBulk) {
                // Bulk checkout processing logic would go here
              }
            }}
            className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
          >
            📋 Process All Checkouts
          </button>
        </div>

        <div className="space-y-4">
          {todayCheckouts.map((checkout, index) => (
            <div
              key={index}
              className={`glass p-6 rounded-xl transition-all ${
                selectedGuest === checkout.guest ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {checkout.guest.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{checkout.guest}</h3>
                      {checkout.status === 'vip' && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                          VIP Guest
                        </span>
                      )}
                      {checkout.status === 'processing' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                          Processing
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Room {checkout.room}</span>
                      <span>•</span>
                      <span>{checkout.type}</span>
                      <span>•</span>
                      <span>{checkout.nights} nights</span>
                      <span>•</span>
                      <span>Check-out: {checkout.time}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-text mb-2">{checkout.total}</p>
                  <button
                    onClick={() => handleCheckOut(checkout.guest)}
                    className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer hover:scale-105 transition-transform"
                  >
                    ✓ Complete Check-out
                  </button>
                </div>
              </div>

              {/* Checkout Checklist */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`bill-${index}`} className="w-4 h-4 rounded" />
                    <label htmlFor={`bill-${index}`} className="text-sm text-gray-700">Bill settled</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`key-${index}`} className="w-4 h-4 rounded" />
                    <label htmlFor={`key-${index}`} className="text-sm text-gray-700">Room key returned</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`feedback-${index}`} className="w-4 h-4 rounded" />
                    <label htmlFor={`feedback-${index}`} className="text-sm text-gray-700">Feedback collected</label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Express Checkout Option */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-4">Express Check-out Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="font-bold text-lg mb-2">Email Invoice</h3>
            <p className="text-gray-600 mb-4">Send bill automatically to guest email</p>
            <button 
              onClick={() => {
                const enable = confirm('Enable automatic email invoice sending?');
                if (enable) {
                  // Auto-send email invoices logic would go here
                }
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold w-full cursor-pointer"
            >
              Enable Auto-Send
            </button>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="font-bold text-lg mb-2">Auto Charge</h3>
            <p className="text-gray-600 mb-4">Charge payment method on file</p>
            <button 
              onClick={() => {
                const enable = confirm('Enable automatic payment charging?');
                if (enable) {
                  // Auto-charge payments logic would go here
                }
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold w-full cursor-pointer"
            >
              Enable Auto-Charge
            </button>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="font-bold text-lg mb-2">Review Request</h3>
            <p className="text-gray-600 mb-4">Send review request after checkout</p>
            <button 
              onClick={() => {
                const enable = confirm('Enable automatic review requests?');
                if (enable) {
                  // Auto-request reviews logic would go here
                }
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold w-full cursor-pointer"
            >
              Enable Auto-Request
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
