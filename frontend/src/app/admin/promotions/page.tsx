'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PromotionsPage() {
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  const promotions = [
    { id: 1, title: 'Early Bird Discount', code: 'EARLY20', discount: '20% OFF', type: 'percentage', status: 'active', bookings: 145, expiry: '2026-04-30' },
    { id: 2, title: 'Weekend Getaway', code: 'WEEKEND50', discount: '$50 OFF', type: 'fixed', status: 'active', bookings: 89, expiry: '2026-05-15' },
    { id: 3, title: 'Summer Special', code: 'SUMMER30', discount: '30% OFF', type: 'percentage', status: 'scheduled', bookings: 0, expiry: '2026-06-01' },
    { id: 4, title: 'Last Minute Deal', code: 'LASTMIN15', discount: '15% OFF', type: 'percentage', status: 'active', bookings: 67, expiry: '2026-12-31' },
    { id: 5, title: 'VIP Member Exclusive', code: 'VIP100', discount: '$100 OFF', type: 'fixed', status: 'expired', bookings: 234, expiry: '2026-02-28' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-card border-b border-gray-200 sticky top-0 z-50">
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
                <h1 className="text-3xl font-bold gradient-text">Promotions Management</h1>
                <p className="text-sm text-gray-600">Create and manage promotional offers</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const title = prompt('Enter promotion title:');
                if (title) {
                }
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span>
              <span>Create Promotion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Promos', value: '12', icon: '🏷️', change: 'Currently running' },
            { label: 'Total Redemptions', value: '535', icon: '✓', change: 'All time' },
            { label: 'Revenue Impact', value: '$45.2K', icon: '💰', change: 'Generated from promos' },
            { label: 'Avg. Discount', value: '18%', icon: '📊', change: 'Per booking' },
          ].map((stat, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 card-hover slide-up" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 font-medium mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                </div>
                <div className="text-5xl float">{stat.icon}</div>
              </div>
              <p className="text-sm text-gray-600">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo, index) => (
            <div key={promo.id} className="glass-card rounded-2xl p-6 card-hover slide-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold gradient-text mb-2">{promo.title}</h3>
                  <p className="text-sm text-gray-600">Code: <span className="font-mono font-bold text-blue-600">{promo.code}</span></p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  promo.status === 'active' ? 'bg-green-100 text-green-700' :
                  promo.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold gradient-text mb-2">{promo.discount}</div>
                <p className="text-sm text-gray-600">Type: {promo.type}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Redemptions:</span>
                  <span className="font-semibold text-gray-900">{promo.bookings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-semibold text-gray-900">{promo.expiry}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button className="flex-1 glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => {
                  // Edit logic would go here
                }}>
                  ✏️ Edit
                </button>
                <button className="glass px-4 py-2 rounded-xl hover:bg-red-50 transition-all text-sm font-medium text-red-600" onClick={() => {
                  const confirmDelete = confirm(`Delete "${promo.title}" promotion?`);
                  if (confirmDelete) {
                    // Delete logic would go here
                  }
                }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
