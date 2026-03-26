'use client'

import { useState } from 'react'

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation Bar */}
      <nav className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="glass p-3 rounded-xl glow">
                <span className="text-3xl">🏛️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">StayOS</h1>
                <p className="text-xs text-white/60">Super Admin Console</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <div className="glass px-4 py-2 rounded-lg">
                  <span className="text-sm text-white/80">Platform Status:</span>
                  <span className="text-green-400 font-semibold ml-2">● Online</span>
                </div>
                <div className="glass px-4 py-2 rounded-lg">
                  <span className="text-sm text-white/80">Tenants:</span>
                  <span className="text-blue-400 font-semibold ml-2">142</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="glass p-3 rounded-xl hover:bg-white/10 transition-all relative">
                  <span className="text-xl">🔔</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                <div className="glass p-2 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold">SA</span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-white">System Admin</p>
                    <p className="text-xs text-white/60">Super Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-72 glass-dark border-r border-white/10 min-h-[calc(100vh-88px)] sticky top-[88px]">
          <div className="p-6 space-y-2">
            {[
              { id: 'overview', icon: '📊', label: 'Overview' },
              { id: 'tenants', icon: '🏨', label: 'Tenants & Hotels' },
              { id: 'users', icon: '👥', label: 'User Management' },
              { id: 'subscriptions', icon: '💳', label: 'Subscriptions' },
              { id: 'transactions', icon: '💰', label: 'Transactions' },
              { id: 'analytics', icon: '📈', label: 'Analytics' },
              { id: 'system', icon: '⚙️', label: 'System Health' },
              { id: 'audit', icon: '📋', label: 'Audit Logs' },
              { id: 'cms', icon: '📝', label: 'CMS' },
              { id: 'settings', icon: '🔧', label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className={`font-medium ${activeTab === item.id ? 'text-white' : 'text-white/70'}`}>
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <span className="ml-auto text-blue-400">→</span>
                )}
              </button>
            ))}
          </div>

          {/* System Stats */}
          <div className="p-6 mt-4">
            <div className="glass p-4 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-white/80 mb-2">System Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Uptime</span>
                  <span className="text-green-400 font-semibold">99.99%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">API Latency</span>
                  <span className="text-blue-400 font-semibold">45ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Error Rate</span>
                  <span className="text-green-400 font-semibold">0.01%</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="fade-in">
              <h1 className="text-5xl font-bold gradient-text mb-2">Platform Overview</h1>
              <p className="text-white/60 text-lg">Real-time platform analytics and metrics</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up" style={{ animationDelay: '0.1s' }}>
              {/* Total Tenants */}
              <div className="glass-card rounded-2xl p-6 card-hover border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/60 font-medium mb-2">Active Tenants</p>
                    <p className="text-5xl font-bold gradient-text">142</p>
                  </div>
                  <div className="text-6xl float">🏨</div>
                </div>
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full inline-block">
                  <span>↑</span>
                  <span className="font-semibold text-sm">+12 this month</span>
                </div>
              </div>

              {/* Total Users */}
              <div className="glass-card rounded-2xl p-6 card-hover border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/60 font-medium mb-2">Total Users</p>
                    <p className="text-5xl font-bold gradient-text">8,450</p>
                  </div>
                  <div className="text-6xl float">👥</div>
                </div>
                <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full inline-block">
                  <span className="font-semibold text-sm">+248 today</span>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="glass-card rounded-2xl p-6 card-hover border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/60 font-medium mb-2">MRR</p>
                    <p className="text-5xl font-bold gradient-text">$94.2K</p>
                  </div>
                  <div className="text-6xl float">💰</div>
                </div>
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full inline-block">
                  <span>↑</span>
                  <span className="font-semibold text-sm">+18.5% vs last month</span>
                </div>
              </div>

              {/* Active Bookings */}
              <div className="glass-card rounded-2xl p-6 card-hover border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/60 font-medium mb-2">Active Bookings</p>
                    <p className="text-5xl font-bold gradient-text">2,847</p>
                  </div>
                  <div className="text-6xl float">📅</div>
                </div>
                <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full inline-block">
                  <span className="font-semibold text-sm">Today: 156</span>
                </div>
              </div>
            </div>

            {/* MRR Chart */}
            <div className="glass-card rounded-2xl p-8 slide-up border border-white/10" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold gradient-text">Monthly Recurring Revenue</h2>
                  <p className="text-white/60 mt-1">Revenue trends over time</p>
                </div>
                <select className="glass px-4 py-2 rounded-xl text-white focus:outline-none">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                  <option>All time</option>
                </select>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-80 bg-gradient-to-t from-blue-500/10 to-purple-500/10 rounded-xl flex items-end justify-between p-6 gap-2">
                {[65, 72, 68, 85, 92, 100].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-purple-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-white/60">
                      {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* New Tenant Applications */}
            <div className="glass-card rounded-2xl p-8 slide-up border border-white/10" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold gradient-text flex items-center gap-3">
                    📋 Pending Tenant Applications
                  </h2>
                  <p className="text-white/60 mt-1">New hotel onboarding requests</p>
                </div>
                <button className="btn-primary px-6 py-3 rounded-xl font-semibold">
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Grand Plaza Hotel', location: 'New York, USA', rooms: 120, status: 'pending' },
                  { name: 'Seaside Resort', location: 'Miami, USA', rooms: 85, status: 'pending' },
                  { name: 'Mountain View Lodge', location: 'Denver, USA', rooms: 65, status: 'review' },
                  { name: 'Urban Boutique Hotel', location: 'San Francisco, USA', rooms: 45, status: 'pending' },
                ].map((tenant, index) => (
                  <div
                    key={index}
                    className="glass p-6 rounded-xl hover:bg-white/5 transition-all slide-up"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">🏨</div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
                          <p className="text-white/60">📍 {tenant.location} • {tenant.rooms} rooms</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                          tenant.status === 'pending' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </span>
                        <button className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                          Review →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card rounded-2xl p-8 slide-up border border-white/10" style={{ animationDelay: '0.8s' }}>
              <h2 className="text-3xl font-bold gradient-text mb-6 flex items-center gap-3">
                🕐 Recent Platform Activity
              </h2>
              
              <div className="space-y-4">
                {[
                  { action: 'New tenant onboarded', target: 'Luxury Suites International', time: '5 minutes ago', icon: '🎉' },
                  { action: 'Payment processed', target: '$2,450 commission collected', time: '12 minutes ago', icon: '💳' },
                  { action: 'User registered', target: 'john.doe@email.com', time: '18 minutes ago', icon: '👤' },
                  { action: 'Booking confirmed', target: 'Reservation #BK-2847', time: '25 minutes ago', icon: '✓' },
                  { action: 'System backup completed', target: 'Daily automated backup', time: '1 hour ago', icon: '💾' },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 glass p-4 rounded-xl slide-up"
                    style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                  >
                    <div className="text-3xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{activity.action}</p>
                      <p className="text-sm text-white/60">{activity.target}</p>
                    </div>
                    <div className="text-sm text-white/40">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </main>
  )
}
