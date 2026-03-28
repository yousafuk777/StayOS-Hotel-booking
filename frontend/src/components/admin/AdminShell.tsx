'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed with independent scrolling */}
      <aside className={`w-72 fixed left-0 top-0 h-screen overflow-y-auto glass-card border-r border-gray-200 z-40 transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="px-4 py-6">
          <Link href="/admin" className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <span className="text-2xl">🏨</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Grand Plaza</h1>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          </Link>

          <nav className="space-y-2">
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
                      onClick={() => setSidebarOpen(false)}
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
                      onClick={() => setSidebarOpen(false)}
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
                      onClick={() => setSidebarOpen(false)}
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
        </div>
      </aside>

      {/* Main Content Area - Independent scrolling */}
      <div className="flex-1 flex flex-col ml-0 md:ml-72">
        {/* Top Header Bar - Fixed */}
        <header className="glass-card border-b border-gray-200 fixed top-0 right-0 left-0 md:left-72 z-30">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Hamburger Menu - Mobile Only */}
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden glass p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <span className="text-xl">☰</span>
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold gradient-text">Grand Plaza Hotel</h1>
                  <p className="text-xs md:text-sm text-gray-600">Admin Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => router.push('/admin/notifications')}
                    className="glass p-3 rounded-xl hover:bg-gray-50 transition-all relative cursor-pointer"
                  >
                    <span className="text-xl">🔔</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                  <button 
                    onClick={() => router.push('/admin/messages')}
                    className="glass p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <span className="text-xl">💬</span>
                  </button>
                  <button 
                    onClick={() => router.push('/admin/help')}
                    className="glass p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <span className="text-xl">❓</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm md:text-lg">HA</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="font-semibold text-gray-900 text-sm">John Smith</p>
                    <p className="text-xs text-gray-600">Hotel Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Independent scrolling */}
        <main className="flex-1 overflow-y-auto pt-24 md:pt-28 px-4 md:px-8 py-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
