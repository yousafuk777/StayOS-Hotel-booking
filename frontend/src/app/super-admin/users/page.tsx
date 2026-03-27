'use client'

import { useState } from 'react'

export default function UsersPage() {
  const [filter, setFilter] = useState('all')

  const users = [
    { id: 1, name: 'John Smith', email: 'john@email.com', role: 'guest', bookings: 5, spent: 2450, joined: '2025-06-15', status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@grandplaza.com', role: 'hotel_admin', hotel: 'Grand Plaza Hotel', joined: '2025-01-20', status: 'active' },
    { id: 3, name: 'Michael Chen', email: 'mike@email.com', role: 'guest', bookings: 12, spent: 8900, joined: '2025-03-10', status: 'vip' },
    { id: 4, name: 'Emma Williams', email: 'emma@seaside.com', role: 'hotel_manager', hotel: 'Seaside Resort', joined: '2025-02-14', status: 'active' },
    { id: 5, name: 'James Brown', email: 'james@email.com', role: 'guest', bookings: 2, spent: 890, joined: '2026-01-05', status: 'active' },
    { id: 6, name: 'Lisa Anderson', email: 'lisa@urban.com', role: 'front_desk', hotel: 'Urban Boutique', joined: '2025-08-22', status: 'active' },
  ]

  const ROLE_CONFIG: any = {
    all: { label: 'All Users', icon: '👥' },
    guest: { label: 'Guests', icon: '👤' },
    hotel_admin: { label: 'Hotel Admins', icon: '🏨' },
    hotel_manager: { label: 'Managers', icon: '📋' },
    front_desk: { label: 'Front Desk', icon: '🛎️' },
    housekeeping: { label: 'Housekeeping', icon: '🧹' },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text">User Management</h1>
          <p className="text-gray-600">Manage all platform users</p>
        </div>
        
        <button className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
          <span>➕</span>
          <span>Add User</span>
        </button>
      </div>

      <div>
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          {[
            { label: 'Total Users', value: '8,450', change: '+248 today', icon: '👥', color: 'from-blue-500 to-blue-600' },
            { label: 'Active Guests', value: '7,892', change: '93.4% of total', icon: '✓', color: 'from-green-500 to-green-600' },
            { label: 'Hotel Staff', value: '558', change: '6.6% of total', icon: '🏨', color: 'from-purple-500 to-purple-600' },
            { label: 'VIP Members', value: '342', change: 'Gold & Platinum', icon: '⭐', color: 'from-yellow-500 to-orange-600' },
          ].map((stat, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white card-hover shadow-lg slide-up`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">{stat.icon}</div>
                <div className="text-right">
                  <p className="text-4xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.change}</p>
                </div>
              </div>
              <p className="font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Role Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up border border-gray-200" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(ROLE_CONFIG).map(([key, config]: any) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Suspended</option>
                <option>Pending</option>
              </select>
              <input
                type="search"
                placeholder="Search users..."
                className="input-field px-4 py-2 rounded-xl w-64 text-gray-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              {ROLE_CONFIG[filter]?.label || 'All Users'}
            </h2>
            <button className="glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 text-gray-700">
              📥 Export Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Activity</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 transition-colors slide-up"
                    style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{user.role.replace('_', ' ')}</p>
                        {'hotel' in user && (
                          <p className="text-sm text-gray-500">{user.hotel}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {user.role === 'guest' ? (
                        <div>
                          <p className="text-gray-900 font-medium">{user.bookings} bookings</p>
                          <p className="text-sm text-gray-500">${(user as any).spent?.toLocaleString() ?? 0} spent</p>
                        </div>
                      ) : (
                        <p className="text-gray-600">Staff member</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.joined}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'vip' ? 'bg-yellow-100 text-yellow-700' :
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
                          👁️ View
                        </button>
                        <button className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
                          ⚙️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="glass-card rounded-2xl p-8 mt-8 slide-up border border-gray-200" style={{ animationDelay: '1.5s' }}>
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            📈 User Growth Trend
          </h2>
          <div className="h-64 flex items-end justify-between gap-2 p-6 bg-gradient-to-t from-blue-500/5 to-purple-500/5 rounded-xl">
            {[45, 52, 58, 68, 75, 82, 89, 95, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-purple-500 shadow-lg"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500">
                  {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
