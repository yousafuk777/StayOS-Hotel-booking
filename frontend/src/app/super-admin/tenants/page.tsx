'use client'

import { useState } from 'react'

export default function TenantsPage() {
  const [filter, setFilter] = useState('all')

  const tenants = [
    { id: 1, name: 'Grand Plaza Hotel', slug: 'grand-plaza', location: 'New York, USA', rooms: 120, status: 'active', revenue: 45200, joined: '2025-01-15' },
    { id: 2, name: 'Seaside Resort & Spa', slug: 'seaside-resort', location: 'Miami, USA', rooms: 85, status: 'active', revenue: 38900, joined: '2025-02-20' },
    { id: 3, name: 'Mountain View Lodge', slug: 'mountain-view', location: 'Denver, USA', rooms: 65, status: 'pending', revenue: 0, joined: '2026-03-10' },
    { id: 4, name: 'Urban Boutique Hotel', slug: 'urban-boutique', location: 'San Francisco, USA', rooms: 45, status: 'active', revenue: 28700, joined: '2025-06-08' },
    { id: 5, name: 'Lakeside Inn', slug: 'lakeside-inn', location: 'Chicago, USA', rooms: 95, status: 'suspended', revenue: 12400, joined: '2025-03-22' },
    { id: 6, name: 'Desert Oasis Resort', slug: 'desert-oasis', location: 'Las Vegas, USA', rooms: 200, status: 'active', revenue: 67800, joined: '2025-04-12' },
  ]

  const STATUS_CONFIG: any = {
    all: { label: 'All Tenants', color: 'bg-gray-100 text-gray-700' },
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Tenant Management</h1>
          <p className="text-gray-600">Manage all hotel tenants on the platform</p>
        </div>

        <button className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
          <span>➕</span>
          <span>Onboard New Tenant</span>
        </button>
      </div>

      <div>
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Total Tenants</p>
                <p className="text-4xl font-bold gradient-text">142</p>
              </div>
              <div className="text-5xl float">🏨</div>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full inline-block">
              <span>↑</span>
              <span className="font-semibold text-sm">+12 this month</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Active Hotels</p>
                <p className="text-4xl font-bold gradient-text">128</p>
              </div>
              <div className="text-5xl float">✓</div>
            </div>
            <p className="text-sm text-gray-600">90.1% activation rate</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Pending Approval</p>
                <p className="text-4xl font-bold gradient-text">8</p>
              </div>
              <div className="text-5xl float">⏳</div>
            </div>
            <p className="text-sm text-yellow-600 font-semibold">Awaiting review</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Total Rooms</p>
                <p className="text-4xl font-bold gradient-text">12,450</p>
              </div>
              <div className="text-5xl float">🛏️</div>
            </div>
            <p className="text-sm text-gray-600">Across all properties</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up border border-gray-200" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, config]: any) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none">
                <option>All Locations</option>
                <option>USA</option>
                <option>Europe</option>
                <option>Asia</option>
              </select>
              <input
                type="search"
                placeholder="Search tenants..."
                className="input-field px-4 py-2 rounded-xl w-64 text-gray-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              {STATUS_CONFIG[filter]?.label || 'All Tenants'}
            </h2>
            <button className="glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 text-gray-700">
              📥 Export Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Hotel Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Rooms</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Monthly Revenue</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((tenant, index) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-gray-50 transition-colors slide-up"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">🏨</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                          <p className="text-sm text-gray-500">{tenant.slug}.stayos.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">📍 {tenant.location}</td>
                    <td className="py-4 px-4 text-gray-600">{tenant.rooms}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold gradient-text">${tenant.revenue.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{tenant.joined}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                          tenant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
                          👁️ View
                        </button>
                        <button className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
                          ⚙️ Settings
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="glass-card rounded-2xl p-8 mt-8 slide-up border border-gray-200" style={{ animationDelay: '0.8s' }}>
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            💰 Commission Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-xl border border-transparent hover:border-gray-200 transition-all">
              <p className="text-gray-600 font-medium mb-2">Platform Commission Rate</p>
              <p className="text-4xl font-bold gradient-text mb-4">12%</p>
              <p className="text-sm text-gray-500">Standard rate for all tenants</p>
            </div>

            <div className="glass p-6 rounded-xl border border-transparent hover:border-gray-200 transition-all">
              <p className="text-gray-600 font-medium mb-2">This Month's Commission</p>
              <p className="text-4xl font-bold gradient-text mb-4">$28,450</p>
              <p className="text-sm text-green-600 font-semibold">↑ 18.5% vs last month</p>
            </div>

            <div className="glass p-6 rounded-xl border border-transparent hover:border-gray-200 transition-all">
              <p className="text-gray-600 font-medium mb-2">Total Collected (YTD)</p>
              <p className="text-4xl font-bold gradient-text mb-4">$342,800</p>
              <p className="text-sm text-gray-500">Year-to-date total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
