'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [adminName, setAdminName] = useState('Super Admin')
  const [userRole, setUserRole] = useState('Super Administrator')
  const [authChecked, setAuthChecked] = useState(false)

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip guard on the login page itself
    if (pathname === '/super-admin/login') {
      setAuthChecked(true)
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      router.replace('/super-admin/login')
      return
    }

    // Populate admin name from stored user object if present
    try {
      const stored = localStorage.getItem('super_admin_user') || localStorage.getItem('user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.first_name) {
          setAdminName(`${user.first_name} ${user.last_name || ''}`.trim())
        }
        // Also store role for display
        if (user.role) {
          setUserRole(user.role)
        }
      }
    } catch {
      // ignore parse errors
    }

    setAuthChecked(true)
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('super_admin_user')
    router.replace('/super-admin/login')
  }

  // ── Don't render the shell on the login page ────────────────────────────
  if (pathname === '/super-admin/login') {
    return <>{children}</>
  }

  // Show nothing while checking auth (avoids flash of protected content)
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
      </div>
    )
  }

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
      {/* Sidebar */}
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

          {/* Logout */}
          <div className="mt-6 px-4">
            <button
              id="sa-logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-72">
        {/* Top Header Bar */}
        <header className="glass-card border-b border-gray-200 fixed top-0 right-0 left-72 z-30">
          <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-6">
                <div className="hidden lg:flex items-center gap-4">
                  <div className="glass px-3 md:px-4 py-2 rounded-lg">
                    <span className="text-xs md:text-sm text-gray-600">Platform Status:</span>
                    <span className="text-green-600 font-semibold ml-2 text-xs md:text-sm">● Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <button className="glass p-2 md:p-3 rounded-xl hover:bg-gray-50 transition-all relative">
                  <span className="text-lg md:text-xl">🔔</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                <div className="flex items-center gap-2 md:gap-3 ml-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-xs md:text-sm">
                      {adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">{adminName}</p>
                    <p className="text-[10px] md:text-xs text-gray-600 hidden md:block">
                      {userRole === 'super_admin' ? 'Super Administrator' : 
                       userRole === 'admin' ? 'Hotel Administrator' : 
                       userRole === 'staff' ? 'Staff Member' : 'User'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-32 p-8">
          <div className="max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
