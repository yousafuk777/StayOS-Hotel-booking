'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import { 
  Hotel, LayoutDashboard, Calendar, CalendarDays, BedDouble, 
  Sparkles, Users, User, LineChart, Tags, Star, Settings, Palette,
  ClipboardList, LogOut
} from 'lucide-react'
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
  const [hotelName, setHotelName] = useState('StayOS Hotel')

  // Load user data and enforce Auth Guard on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.replace('/login')
        return
      }

      const stored = localStorage.getItem('user') || localStorage.getItem('super_admin_user')
      if (!stored) {
        router.replace('/login')
        return
      }

      const user = JSON.parse(stored)

      // RBAC: Reject guest or unassigned roles
      const ALLOWED_ROLES = ['super_admin', 'admin', 'hotel_admin', 'hotel_manager', 'staff']
      if (!ALLOWED_ROLES.includes(user.role)) {
        console.warn('Access denied: Unauthorized role inside Hotel Admin dashboard')
        // Redirect guests to their own dashboard instead of a loop
        if (user.role === 'guest') {
          router.replace('/dashboard')
        } else {
          router.replace('/login')
        }
        return
      }

      // Populate UI fields
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
      setUserName(fullName)
      setUserEmail(user.email || '')
      setUserId(`USR-${user.id || '000'}`)
      setUserPhone(user.phone || '')
      setHotelName(user.tenant_name || 'StayOS Hotel')
      
      // Load profile picture if exists
      const savedPic = localStorage.getItem('profile_picture')
      if (savedPic) {
        setProfilePic(savedPic)
      }
      
      // Set role display name
      const roleMap: Record<string, string> = {
        'super_admin': 'Super Administrator',
        'admin': 'Hotel Administrator',
        'hotel_admin': 'Hotel Administrator',
        'hotel_manager': 'Hotel Manager',
        'staff': 'Staff Member',
        'guest': 'Guest'
      }
      setUserRole(roleMap[user.role] || 'User')
      
    } catch (error) {
      console.error('Auth error in AdminShell:', error)
      router.replace('/login')
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('super_admin_user')
      localStorage.removeItem('tenant_id')
      localStorage.removeItem('profile_picture')
      router.replace('/login')
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
    <div className="flex min-h-screen bg-lightBg">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed with independent scrolling */}
      <aside className={`w-72 fixed left-0 top-0 h-screen overflow-y-auto bg-[#1A2E2B] border-r border-[rgba(255,255,255,0.06)] shadow-xl z-40 transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="px-4 py-6">
          <Link href="/admin" className="flex items-center gap-3 mb-6">
            <div className="bg-transparent border border-[rgba(255,255,255,0.06)] p-3 rounded-xl shadow-lg">
              <span className="text-white"><Hotel size={24} /></span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{hotelName}</h1>
              <p className="text-xs text-[#4A6B63]">Admin Panel</p>
            </div>
          </Link>

          <nav className="space-y-2">
            {/* Main Menu */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[#C8941A] uppercase tracking-wider mb-3 px-4">
                Main Menu
              </h3>
              <div className="space-y-1">
                {[
                  { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
                  { id: 'bookings', icon: <Calendar size={20} />, label: 'Bookings', path: '/admin/bookings' },
                  { id: 'calendar', icon: <CalendarDays size={20} />, label: 'Calendar', path: '/admin/calendar' },
                  { id: 'rooms', icon: <BedDouble size={20} />, label: 'Rooms & Inventory', path: '/admin/rooms' },
                  { id: 'housekeeping', icon: <Sparkles size={20} />, label: 'Housekeeping', path: '/admin/housekeeping' },
                ].map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative block w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#0F6E56] text-white shadow-lg'
                          : 'hover:bg-[rgba(255,255,255,0.08)] text-[#A8C5BC] hover:text-white'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-r-md shadow-accent/50 shadow-sm"></div>}
                      <span className="flex items-center justify-center">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {isActive && <span className="ml-auto">→</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Management */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[#C8941A] uppercase tracking-wider mb-3 px-4">
                Management
              </h3>
              <div className="space-y-1">
                {[
                  { id: 'staff', icon: <Users size={20} />, label: 'Staff Management', path: '/admin/staff' },
                  { id: 'guests', icon: <User size={20} />, label: 'Guests', path: '/admin/guests' },
                  { id: 'analytics', icon: <LineChart size={20} />, label: 'Analytics & Reports', path: '/admin/analytics' },
                  { id: 'promotions', icon: <Tags size={20} />, label: 'Promotions', path: '/admin/promotions' },
                  { id: 'reviews', icon: <Star size={20} />, label: 'Reviews', path: '/admin/reviews' },
                ].map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative block w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#0F6E56] text-white shadow-lg'
                          : 'hover:bg-[rgba(255,255,255,0.08)] text-[#A8C5BC] hover:text-white'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-r-md shadow-accent/50 shadow-sm"></div>}
                      <span className="flex items-center justify-center">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {isActive && <span className="ml-auto">→</span>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h3 className="text-xs font-semibold text-[#C8941A] uppercase tracking-wider mb-3 px-4">
                Configuration
              </h3>
              <div className="space-y-1">
                {[
                  { id: 'settings', icon: <Settings size={20} />, label: 'Hotel Settings', path: '/admin/settings' },
                  { id: 'theme', icon: <Palette size={20} />, label: 'Theme & Branding', path: '/admin/theme' },
                  { id: 'policies', icon: <ClipboardList size={20} />, label: 'Policies', path: '/admin/policies' },
                ].map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative block w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#0F6E56] text-white shadow-lg'
                          : 'hover:bg-[rgba(255,255,255,0.08)] text-[#A8C5BC] hover:text-white'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-r-md shadow-accent/50 shadow-sm"></div>}
                      <span className="flex items-center justify-center">{item.icon}</span>
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
                  <h1 className="text-xl md:text-2xl font-bold gradient-text">{hotelName}</h1>
                  <p className="text-xs md:text-sm text-[#2D4A42]">Admin Dashboard</p>
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
                      <p className="font-semibold text-[#1A2E2B] text-sm">{userName}</p>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="font-semibold text-[#1A2E2B] text-sm">{userName}</p>
                      <p className="text-xs text-[#2D4A42]">{userRole}</p>
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
                      <div className="fixed md:absolute right-4 left-4 md:right-0 md:left-auto top-1/2 md:top-full -translate-y-1/2 md:translate-y-0 mt-0 md:mt-2 w-auto md:w-64 glass-card rounded-2xl shadow-xl border border-gray-200 z-30 overflow-hidden slide-down" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4">
                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <button 
                              onClick={() => {
                                router.push('/admin/settings')
                                setAccountDropdownOpen(false)
                              }}
                              className="w-full glass px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-lg">⚙️</span>
                              <span>Account Settings</span>
                            </button>
                            <button 
                              onClick={() => {
                                router.push('/admin/profile')
                                setAccountDropdownOpen(false)
                              }}
                              className="w-full glass px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-lg">👤</span>
                              <span>Edit Profile</span>
                            </button>
                            <button 
                              onClick={() => {
                                router.push('/admin/analytics')
                                setAccountDropdownOpen(false)
                              }}
                              className="w-full glass px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-lg">📊</span>
                              <span>Activity Log</span>
                            </button>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                              <button 
                                onClick={handleLogout}
                                className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-red-100 transition-all cursor-pointer flex items-center gap-2"
                              >
                                <span className="text-lg">🚪</span>
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
