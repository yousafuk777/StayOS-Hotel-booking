'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar - Always Visible */}
      <aside className="w-72 min-h-screen sticky top-0 py-6 pr-4 glass-card border-r border-gray-200">
        <div className="px-4 mb-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <span className="text-2xl">🏨</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Grand Plaza</h1>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="space-y-2 px-2">
          {/* Main Menu */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Main Menu
            </h3>
            <div className="space-y-1">
              {[
                { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/admin' },
                { id: 'bookings', icon: '📅', label: 'Bookings', path: '/admin/bookings' },
                { id: 'calendar', icon: '🗓️', label: 'Calendar', path: '/admin/calendar' },
                { id: 'rooms', icon: '🛏️', label: 'Rooms & Inventory', path: '/admin/rooms' },
                { id: 'housekeeping', icon: '🧹', label: 'Housekeeping', path: '/admin/housekeeping' },
              ].map((item) => {
                const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
                return (
                  <Link
                    key={item.id}
                    href={item.path}
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

          {/* Management */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Management
            </h3>
            <div className="space-y-1">
              {[
                { id: 'staff', icon: '👥', label: 'Staff Management', path: '/admin/staff' },
                { id: 'guests', icon: '👤', label: 'Guests', path: '/admin/guests' },
                { id: 'analytics', icon: '📈', label: 'Analytics & Reports', path: '/admin/analytics' },
                { id: 'promotions', icon: '🏷️', label: 'Promotions', path: '/admin/promotions' },
                { id: 'reviews', icon: '⭐', label: 'Reviews', path: '/admin/reviews' },
              ].map((item) => {
                const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
                return (
                  <Link
                    key={item.id}
                    href={item.path}
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

          {/* Configuration */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Configuration
            </h3>
            <div className="space-y-1">
              {[
                { id: 'settings', icon: '⚙️', label: 'Hotel Settings', path: '/admin/settings' },
                { id: 'theme', icon: '🎨', label: 'Theme & Branding', path: '/admin/theme' },
                { id: 'policies', icon: '📋', label: 'Policies', path: '/admin/policies' },
              ].map((item) => {
                const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
                return (
                  <Link
                    key={item.id}
                    href={item.path}
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="glass-card border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Grand Plaza Hotel</h1>
                  <p className="text-sm text-gray-600">Admin Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => alert('Notifications panel coming soon!')}
                    className="glass p-3 rounded-xl hover:bg-gray-50 transition-all relative cursor-pointer"
                  >
                    <span className="text-xl">🔔</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                  <button 
                    onClick={() => alert('Messages feature coming soon!')}
                    className="glass p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <span className="text-xl">💬</span>
                  </button>
                  <button 
                    onClick={() => alert('Help & Support coming soon!')}
                    className="glass p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <span className="text-xl">❓</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">HA</span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="font-semibold text-gray-900">John Smith</p>
                    <p className="text-xs text-gray-600">Hotel Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
