'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const sidebarItems = [
    { id: 'overview', icon: '📊', label: 'Overview', href: '/super-admin' },
    { id: 'tenants', icon: '🏨', label: 'Tenants & Hotels', href: '/super-admin/tenants' },
    { id: 'users', icon: '👥', label: 'User Management', href: '/super-admin/users' },
    { id: 'subscriptions', icon: '💳', label: 'Subscriptions', href: '/super-admin/subscriptions' },
    { id: 'transactions', icon: '💰', label: 'Transactions', href: '/super-admin/transactions' },
    { id: 'analytics', icon: '📈', label: 'Analytics', href: '/super-admin/analytics' },
    { id: 'system', icon: '⚙️', label: 'System Health', href: '/super-admin/system' },
    { id: 'audit', icon: '📋', label: 'Audit Logs', href: '/super-admin/audit' },
    { id: 'cms', icon: '📝', label: 'CMS', href: '/super-admin/cms' },
    { id: 'settings', icon: '🔧', label: 'Settings', href: '/super-admin/settings' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
        <aside className="w-72 glass-dark border-r border-white/10 min-h-[calc(100vh-88px)] sticky top-[88px] flex flex-col items-center">
          <div className="p-6 space-y-2 w-full">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-blue-400">→</span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* System Stats */}
          <div className="p-6 mt-4 w-full">
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
          {children}
        </main>
      </div>
    </div>
  )
}
