'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import { 
  Hotel, LayoutDashboard, Calendar, CalendarDays, BedDouble, 
  Sparkles, Users, User, LineChart, Tags, Star, Settings, Palette,
  ClipboardList, LogOut, Lock, CreditCard
} from 'lucide-react'
import api from '../../services/api'
import { PlanProvider, usePlan } from '../../context/PlanContext'
import UpgradeModal from './UpgradeModal'
import { canAccess as hasRoleAccess } from '../../config/permissions'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <PlanProvider>
      <AdminContent children={children} />
    </PlanProvider>
  )
}

function AdminContent({ children }: AdminLayoutProps) {
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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [lockedFeature, setLockedFeature] = useState({ name: '', plan: '' })
  const [rawRole, setRawRole] = useState('')

  const { planKey, displayName, hasFeature } = usePlan()

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

      // Admin Context Guard: Ensure only staff/admins enter
      const role = String(user.role || '').toLowerCase()
      const ALLOWED_ADMIN_ROLES = ['super_admin', 'admin', 'hotel_admin', 'hotel_manager', 'staff', 'front_desk', 'housekeeping']
      
      if (!ALLOWED_ADMIN_ROLES.includes(role)) {
        if (role === 'guest') {
          router.replace('/') // Redirect guests to public portal
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
      
      const savedPic = localStorage.getItem('profile_picture')
      if (savedPic) {
        setProfilePic(savedPic)
      }
      
      const roleMap: Record<string, string> = {
        'super_admin': 'Super Administrator',
        'admin': 'Hotel Administrator',
        'hotel_admin': 'Hotel Administrator',
        'hotel_manager': 'Hotel Manager',
        'staff': 'Staff Member',
        'guest': 'Guest'
      }
      setRawRole(user.role || '')
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

  const handleLockedClick = (name: string, plan: string) => {
    setLockedFeature({ name, plan })
    setUpgradeModalOpen(true)
  }

  const menuItems = [
    { label: "Dashboard",           icon: <LayoutDashboard size={20} />, path: "/admin",              featureKey: null,              moduleKey: null },
    { label: "Bookings",            icon: <Calendar size={20} />,        path: "/admin/bookings",     featureKey: null,              moduleKey: "bookings" },
    { label: "Calendar",            icon: <CalendarDays size={20} />,    path: "/admin/calendar",     featureKey: null,              moduleKey: "calendar" },
    { label: "Rooms & Inventory",   icon: <BedDouble size={20} />,       path: "/admin/rooms",        featureKey: null,              moduleKey: "rooms" },
    { label: "Housekeeping",        icon: <Sparkles size={20} />,        path: "/admin/housekeeping", featureKey: null,              moduleKey: "housekeeping" },
    { label: "Guests",              icon: <User size={20} />,            path: "/admin/guests",       featureKey: null,              moduleKey: "guests" },
    { label: "Staff Management",    icon: <Users size={20} />,           path: "/admin/staff",        featureKey: "staff_management",moduleKey: "staff_management", requiredPlan: "Professional" },
    { label: "Analytics & Reports", icon: <LineChart size={20} />,       path: "/admin/analytics",    featureKey: "analytics",       moduleKey: "analytics", requiredPlan: "Professional" },
    { label: "Promotions",          icon: <Tags size={20} />,            path: "/admin/promotions",   featureKey: "promotions",      moduleKey: "promotions", requiredPlan: "Professional" },
    { label: "Reviews",             icon: <Star size={20} />,            path: "/admin/reviews",      featureKey: "reviews",         moduleKey: "reviews", requiredPlan: "Professional" },
    { label: "Theme & Branding",    icon: <Palette size={20} />,         path: "/admin/theme",        featureKey: "theme_branding",  moduleKey: "theme_branding", requiredPlan: "Enterprise" },
    { label: "Subscription & Billing", icon: <CreditCard size={20} />,   path: "/admin/subscription", featureKey: null,              moduleKey: "subscription" },
    { label: "Hotel Settings",      icon: <Settings size={20} />,        path: "/admin/settings",     featureKey: null,              moduleKey: "hotel_settings" },
    { label: "Policies",            icon: <ClipboardList size={20} />,   path: "/admin/policies",     featureKey: null,              moduleKey: "policies" },
  ]

  const badgeStyle = {
    starter:      "bg-gray-100 text-gray-600 border-gray-200",
    professional: "bg-green-100 text-green-700 border-green-200",
    enterprise:   "bg-amber-100 text-amber-700 border-amber-200",
  }[planKey] || "bg-gray-100 text-gray-600 border-gray-200"

  const renderMenuItem = (item: any) => {
    // Gate 1: Role check (New) - Hide silently
    const roleAllows = item.moduleKey === null || hasRoleAccess(rawRole, item.moduleKey)
    if (!roleAllows) return null

    // Gate 2: Plan check (Existing) - Show lock
    const isUnlocked = item.featureKey === null || hasFeature(item.featureKey)
    const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))

    const content = (
      <div className={`relative block w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? 'bg-[#0F6E56] text-white shadow-lg'
          : isUnlocked 
            ? 'hover:bg-[rgba(255,255,255,0.08)] text-[#A8C5BC] hover:text-white'
            : 'opacity-50 text-[#A8C5BC] cursor-not-allowed'
      }`}>
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-r-md shadow-accent/50 shadow-sm"></div>}
        <span className="flex items-center justify-center">
          {isUnlocked ? item.icon : <Lock size={18} className="text-amber-500" />}
        </span>
        <span className="font-medium flex-1 text-left">{item.label}</span>
        {isActive && <span>→</span>}
        {!isUnlocked && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">Pro</span>}
      </div>
    )

    if (isUnlocked) {
      return (
        <Link key={item.label} href={item.path} onClick={() => setSidebarOpen(false)}>
          {content}
        </Link>
      )
    }

    return (
      <button 
        key={item.label} 
        onClick={() => handleLockedClick(item.label, item.requiredPlan)}
        className="w-full focus:outline-none"
      >
        {content}
      </button>
    )
  }

  return (
    <div className="flex min-h-screen bg-lightBg">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`w-72 fixed left-0 top-0 h-screen overflow-y-auto bg-[#1A2E2B] border-r border-[rgba(255,255,255,0.06)] shadow-xl z-40 transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="px-4 py-6">
          <Link href="/admin" className="flex items-center gap-3 mb-6">
            <div className="bg-transparent border border-[rgba(255,255,255,0.06)] p-3 rounded-xl shadow-lg">
              <span className="text-white"><Hotel size={24} /></span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">{hotelName}</h1>
              <p className="text-xs text-[#4A6B63]">Admin Panel</p>
            </div>
          </Link>

          <nav className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#C8941A] uppercase tracking-wider mb-3 px-4">Main Menu</h3>
              <div className="space-y-1">
                {menuItems.slice(0, 5).map(renderMenuItem)}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#C8941A] uppercase tracking-wider mb-3 px-4">Management</h3>
              <div className="space-y-1">
                {menuItems.slice(5, 10).map(renderMenuItem)}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#C8941A] uppercase tracking-wider mb-3 px-4">Configuration</h3>
              <div className="space-y-1">
                {menuItems.slice(10).map(renderMenuItem)}
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col ml-0 md:ml-72">
        <header className="glass-card border-b border-gray-200 fixed top-0 right-0 left-0 md:left-72 z-30">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden glass p-3 rounded-xl">☰</button>
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-lg md:text-xl font-bold gradient-text">{hotelName}</h1>
                    <p className="text-[10px] md:text-xs text-[#2D4A42]">Admin Dashboard</p>
                  </div>
                  <span className={`${badgeStyle} border text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                    {displayName}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-all focus:outline-none"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs md:text-sm">
                        {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="font-semibold text-[#1A2E2B] text-xs leading-none mb-1">{userName}</p>
                      <p className="text-[10px] text-[#2D4A42] leading-none">{userRole}</p>
                    </div>
                    <span className={`text-[10px] transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {accountDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setAccountDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl shadow-xl border border-gray-200 z-30 overflow-hidden slide-down">
                        <div className="p-2 space-y-1">
                          <Link href="/admin/settings" className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
                            <Settings size={14} /> Account Settings
                          </Link>
                          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-24 md:pt-28 px-4 md:px-8 py-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <UpgradeModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
        featureName={lockedFeature.name} 
        requiredPlan={lockedFeature.plan} 
      />
    </div>
  )
}
