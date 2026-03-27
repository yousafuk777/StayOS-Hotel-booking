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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar - Fixed with independent scrolling */}
      <aside className="w-72 fixed left-0 top-0 h-screen overflow-y-auto glass-card border-r border-gray-200 z-40">
        <div className="px-4 py-6">
          <Link href="/super-admin" className="flex items-center gap-3 mb-6 px-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">StayOS</h1>
              <p className="text-xs text-gray-600">Super Admin Console</p>
            </div>
          </Link>

          <nav className="space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                Main Menu
              </h3>
              <div className="space-y-1">
                {sidebarItems.slice(0, 3).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {isActive && <span className="ml-auto">→</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                Management
              </h3>
              <div className="space-y-1">
                {sidebarItems.slice(3, 8).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {isActive && <span className="ml-auto">→</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                Configuration
              </h3>
              <div className="space-y-1">
                {sidebarItems.slice(8).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {isActive && <span className="ml-auto">→</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* System Stats */}
          <div className="mt-8 px-4">
            <div className="glass-card p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Metrics</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="text-green-600 font-semibold">99.99%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Latency</span>
                  <span className="text-blue-600 font-semibold">45ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Independent scrolling */}
      <div className="flex-1 flex flex-col ml-72">
        {/* Top Header Bar - Fixed */}
        <header className="glass-card border-b border-gray-200 fixed top-0 right-0 left-72 z-30">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-4">
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="text-sm text-gray-600">Platform Status:</span>
                    <span className="text-green-600 font-semibold ml-2">● Online</span>
                  </div>
                  <div className="glass px-4 py-2 rounded-lg">
                    <span className="text-sm text-gray-600">Tenants:</span>
                    <span className="text-blue-600 font-semibold ml-2">142</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="glass p-3 rounded-xl hover:bg-gray-50 transition-all relative">
                  <span className="text-xl">🔔</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">SA</span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900">System Admin</p>
                    <p className="text-xs text-gray-600">Super Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Independent scrolling */}
        <main className="flex-1 overflow-y-auto pt-32 p-8">
          <div className="max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
