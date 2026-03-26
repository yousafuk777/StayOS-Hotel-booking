'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GuestsPage() {
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  const guests = [
    { id: 1, name: 'Robert Taylor', email: 'robert.t@email.com', phone: '+1 555 123 4567', stays: 12, totalSpent: 8450, lastVisit: '2026-03-20', vip: true },
    { id: 2, name: 'Linda Martinez', email: 'linda.m@email.com', phone: '+1 555 234 5678', stays: 8, totalSpent: 5200, lastVisit: '2026-03-18', vip: false },
    { id: 3, name: 'William Anderson', email: 'william.a@email.com', phone: '+1 555 345 6789', stays: 15, totalSpent: 12300, lastVisit: '2026-03-22', vip: true },
    { id: 4, name: 'Patricia White', email: 'patricia.w@email.com', phone: '+1 555 456 7890', stays: 5, totalSpent: 2800, lastVisit: '2026-03-15', vip: false },
    { id: 5, name: 'Charles Harris', email: 'charles.h@email.com', phone: '+1 555 567 8901', stays: 20, totalSpent: 18500, lastVisit: '2026-03-23', vip: true },
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
                <h1 className="text-3xl font-bold gradient-text">Guest Management</h1>
                <p className="text-sm text-gray-600">View and manage all guests</p>
              </div>
            </div>
            
            <button 
              onClick={() => alert('Add Guest form coming soon!')}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span>
              <span>Add Guest</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Guests', value: '2,847', icon: '👥', change: '+128 this month' },
            { label: 'VIP Members', value: '342', icon: '⭐', change: '12% of total' },
            { label: 'Active Stays', value: '48', icon: '🏨', change: 'Currently staying' },
            { label: 'Avg. Spend', value: '$425', icon: '💰', change: 'Per stay' },
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

        {/* Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All Guests' },
                { id: 'vip', label: 'VIP Only' },
                { id: 'frequent', label: 'Frequent' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <input
              type="search"
              placeholder="Search guests..."
              className="input-field px-4 py-2 rounded-xl w-64 focus:outline-none"
            />
          </div>
        </div>

        {/* Guests Table */}
        <div className="glass-card rounded-2xl p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Total Stays</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Total Spent</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Last Visit</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{guest.name}</p>
                            {guest.vip && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">VIP</span>}
                          </div>
                          <p className="text-sm text-gray-600">Guest ID: GST-{String(guest.id).padStart(5, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{guest.email}</div>
                        <div className="text-gray-600">{guest.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{guest.stays} stays</td>
                    <td className="py-4 px-4">
                      <p className="font-semibold gradient-text">${guest.totalSpent.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{guest.lastVisit}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600">
                          👁️ Profile
                        </button>
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-600">
                          📧 Message
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
