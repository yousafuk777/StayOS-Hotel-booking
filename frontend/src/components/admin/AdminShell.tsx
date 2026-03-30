'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import api from '../../services/api'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [userName, setUserName] = useState('Hotel Administrator')
  const [userEmail, setUserEmail] = useState('admin@grandplaza.com')
  const [userId, setUserId] = useState('ADM-001')
  const [userRole, setUserRole] = useState('Hotel Administrator')
  const [userPhone, setUserPhone] = useState('')
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('super_admin_user')
      if (stored) {
        const user = JSON.parse(stored)
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
        setUserName(fullName)
        setUserEmail(user.email || '')
        setUserId(`USR-${user.id || '000'}`)
        setUserPhone(user.phone || '')
        
        // Load profile picture if exists
        const savedPic = localStorage.getItem('profile_picture')
        if (savedPic) {
          setProfilePic(savedPic)
        }
        
        // Set role display name
        const roleMap: Record<string, string> = {
          'super_admin': 'Super Administrator',
          'admin': 'Hotel Administrator',
          'staff': 'Staff Member',
          'guest': 'Guest'
        }
        setUserRole(roleMap[user.role] || 'User')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('super_admin_user')
      // Redirect to login
      router.push('/login')
    }
  }

  const handleProfilePicClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB')
          return
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          return
        }
        
        setUploading(true)
        
        // Convert to base64 and store
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          setProfilePic(base64)
          localStorage.setItem('profile_picture', base64)
          setUploading(false)
          alert('Profile picture updated successfully!')
        }
        reader.onerror = () => {
          alert('Error reading file')
          setUploading(false)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const removeProfilePic = () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      setProfilePic(null)
      localStorage.removeItem('profile_picture')
    }
  }

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
                
                {/* User Profile - Clickable */}
                <div className="relative">
                  <button 
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 md:gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {profilePic ? (
                      <div className="relative w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-white">
                        <img
                          src={profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        {uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xs md:text-sm lg:text-lg">
                          {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="hidden sm:block md:hidden">
                      <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                      <p className="text-xs text-gray-600">{userRole}</p>
                    </div>
                    <span className={`ml-1 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {/* Account Dropdown */}
                  {accountDropdownOpen && (
                    <>
                      {/* Backdrop for all screens */}
                      <div 
                        className="fixed inset-0 z-20"
                        onClick={() => setAccountDropdownOpen(false)}
                      />
                      
                      {/* Dropdown Menu */}
                      <div className="fixed md:absolute right-4 left-4 md:right-0 md:left-auto top-1/2 md:top-full -translate-y-1/2 md:translate-y-0 mt-0 md:mt-2 w-auto md:w-80 glass-card rounded-2xl shadow-xl border border-gray-200 z-30 max-h-[80vh] overflow-y-auto slide-down" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 sm:p-4 md:p-6">
                          {/* Profile Header */}
                          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6 pb-3 sm:pb-4 md:pb-4 border-b border-gray-200">
                            <div className="relative group cursor-pointer" onClick={handleProfilePicClick}>
                              {profilePic ? (
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full overflow-hidden shadow-lg ring-2 ring-white">
                                  <img
                                    src={profilePic}
                                    alt="Profile"
                                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs sm:text-sm font-semibold drop-shadow-lg">📷 Change</span>
                                  </div>
                                  {uploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform cursor-pointer">
                                  <span className="text-white font-bold text-sm sm:text-lg md:text-xl">
                                    {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </span>
                                </div>
                              )}
                              {!profilePic && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                                  <span className="text-xs">📷</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 truncate">{userName}</h3>
                              <p className="text-xs sm:text-xs md:text-sm text-gray-600 truncate">{userRole}</p>
                              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">ID: {userId}</p>
                            </div>
                            {profilePic && (
                              <button
                                onClick={removeProfilePic}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Remove photo"
                              >
                                <span className="text-sm">✕</span>
                              </button>
                            )}
                          </div>

                          {/* Account Details */}
                          <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-4 md:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 md:p-3 glass rounded-lg sm:rounded-xl">
                              <span className="text-sm sm:text-lg md:text-xl">📧</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-xs md:text-sm font-medium text-gray-900">Email</p>
                                <p className="text-xs text-gray-600 truncate">{userEmail}</p>
                              </div>
                            </div>
                            {userPhone && (
                              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 md:p-3 glass rounded-lg sm:rounded-xl">
                                <span className="text-sm sm:text-lg md:text-xl">📱</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-xs md:text-sm font-medium text-gray-900">Phone</p>
                                  <p className="text-xs text-gray-600 truncate">{userPhone}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 md:p-3 glass rounded-lg sm:rounded-xl">
                              <span className="text-sm sm:text-lg md:text-xl">🏨</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-xs md:text-sm font-medium text-gray-900">Hotel</p>
                                <p className="text-xs text-gray-600 truncate">Grand Plaza Hotel</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2 md:p-3 glass rounded-lg sm:rounded-xl">
                              <span className="text-sm sm:text-lg md:text-xl">📅</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-xs md:text-sm font-medium text-gray-900">Member Since</p>
                                <p className="text-xs text-gray-600">March 2026</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                            <button 
                              onClick={() => router.push('/admin/settings')}
                              className="w-full glass px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 md:gap-3"
                            >
                              <span className="text-sm sm:text-lg md:text-xl">⚙️</span>
                              <span>Account Settings</span>
                            </button>
                            <button 
                              onClick={() => router.push('/admin/profile')}
                              className="w-full glass px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 md:gap-3"
                            >
                              <span className="text-sm sm:text-lg md:text-xl">👤</span>
                              <span>Edit Profile</span>
                            </button>
                            <button 
                              onClick={() => router.push('/admin/analytics')}
                              className="w-full glass px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 md:gap-3"
                            >
                              <span className="text-sm sm:text-lg md:text-xl">📊</span>
                              <span>Activity Log</span>
                            </button>
                            <div className="border-t border-gray-200 pt-1.5 sm:pt-2 md:pt-3 mt-2">
                              <button 
                                onClick={handleLogout}
                                className="w-full bg-red-50 text-red-600 px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base hover:bg-red-100 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 md:gap-3"
                              >
                                <span className="text-sm sm:text-lg md:text-xl">🚪</span>
                                <span>Sign Out</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
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
