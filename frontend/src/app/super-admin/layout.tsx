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
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {http://localhost:3000/super-admin
    // Skip guard on the login page itself
    if (pathname === '/super-admin/login') {
      setAuthChecked(true)
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      router.replace('/login')
      return
    }

    // Role-Based Access Control (RBAC)
    try {
      const stored = localStorage.getItem('user')
      if (!stored) {
        router.replace('/login')
        return
      }

      const user = JSON.parse(stored)
      
      // RESTRICTION: Only super_admin can enter this layout
      if (user.role !== 'super_admin') {
        console.warn('Access denied: Unauthorized role inside Super Admin portal')
        // Redirect regular admins to their hotel dashboard
        if (['admin', 'hotel_admin', 'hotel_manager'].includes(user.role)) {
          router.replace('/admin')
        } else {
          router.replace('/login')
        }
        return
      }

      // Populate admin name and other fields
      if (user.first_name) {
        setAdminName(`${user.first_name} ${user.last_name || ''}`.trim())
      }
      if (user.role) {
        setUserRole(user.role)
      }
      if (user.email) {
        setUserEmail(user.email)
      }
      if (user.id) {
        setUserId(`USR-${user.id}`)
      } else {
        setUserId('USR-000')
      }
      
      // Load profile picture if exists
      const savedPic = localStorage.getItem('profile_picture')
      if (savedPic) {
        setProfilePic(savedPic)
      }
    } catch (err) {
      console.error('Auth error:', err)
      router.replace('/login')
      return
    }

    setAuthChecked(true)
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    localStorage.removeItem('super_admin_user')
    localStorage.removeItem('tenant_id')
    localStorage.removeItem('profile_picture')
    router.replace('/login')
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
                
                {/* User Profile - Clickable */}
                <div className="relative">
                  <button 
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 md:gap-3 ml-2 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-2 hover:bg-gray-50 transition-all"
                  >
                    {profilePic ? (
                      <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-lg ring-2 ring-white flex-shrink-0">
                        <img
                          src={profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                        {uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-xs md:text-sm">
                          {adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-xs md:text-sm font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">{adminName}</p>
                      <p className="text-[10px] md:text-xs text-gray-600 hidden md:block">
                        {userRole === 'super_admin' ? 'Super Administrator' : 
                         userRole === 'admin' ? 'Hotel Administrator' : 
                         userRole === 'staff' ? 'Staff Member' : 'User'}
                      </p>
                    </div>
                    <span className={`ml-1 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {/* Account Dropdown */}
                  {accountDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-20"
                        onClick={() => setAccountDropdownOpen(false)}
                      />
                      
                      {/* Dropdown Menu */}
                      <div className="fixed md:absolute right-4 left-4 md:right-0 md:left-auto top-1/2 md:top-full -translate-y-1/2 md:translate-y-0 mt-0 md:mt-2 w-auto md:w-64 glass-card rounded-2xl shadow-xl border border-gray-200 z-30 overflow-hidden slide-down" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4">
                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <button 
                              onClick={() => {
                                router.push('/super-admin/settings')
                                setAccountDropdownOpen(false)
                              }}
                              className="w-full glass px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-lg">⚙️</span>
                              <span>Account Settings</span>
                            </button>
                            <button 
                              onClick={() => {
                                router.push('/super-admin/profile')
                                setAccountDropdownOpen(false)
                              }}
                              className="w-full glass px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-lg">👤</span>
                              <span>Edit Profile</span>
                            </button>
                            <button 
                              onClick={() => {
                                router.push('/super-admin/analytics')
                                setAccountDropdownOpen(false)
                              }}
                              className="w-full glass px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-lg">📊</span>
                              <span>Activity Log</span>
                            </button>
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
