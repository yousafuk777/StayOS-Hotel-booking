'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'
import UserFormModal from '../../../components/super-admin/UserFormModal'
import { Trash2, Edit, UserPlus, Search, Filter, ChevronRight, ChevronDown, Building2, Users, ShieldCheck, ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: number
  full_name?: string
  first_name?: string | null
  last_name?: string | null
  email: string
  role: string
  tenant_id?: number | null
  tenant_name?: string | null
  is_active: boolean
  is_verified?: boolean
  created_at: string
}

interface HotelOverview {
  tenant_id: number
  tenant_name: string
  plan: string
  status: string
  total_users: number
  joined_at: string
}

interface Stats {
  total_tenants: number
  total_users: number
  role_counts: Record<string, number>
  tenant_status: Record<string, number>
}

type ViewMode = "hotels_directory" | "hotel_users"

export default function UsersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("hotels_directory")
  const [selectedHotel, setSelectedHotel] = useState<HotelOverview | null>(null)
  
  const [hotelsOverview, setHotelsOverview] = useState<HotelOverview[]>([])
  const [hotelUsers, setHotelUsers] = useState<User[]>([])
  const [platformUsers, setPlatformUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPlatformUsersOpen, setIsPlatformUsersOpen] = useState(false)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)

  const fetchHotelsOverview = useCallback(async () => {
    setLoading(true)
    try {
      const [hotelsRes, statsRes, platformRes] = await Promise.all([
        api.get('/api/v1/super-admin/users/hotels-overview'),
        api.get('/api/v1/super-admin/stats'),
        api.get('/api/v1/super-admin/users/platform-level')
      ])
      setHotelsOverview(hotelsRes.data)
      setStats(statsRes.data)
      setPlatformUsers(platformRes.data)
    } catch (error) {
      console.error('Failed to fetch hotels overview or stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHotelUsers = useCallback(async (tenantId: number) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/v1/super-admin/users/by-hotel/${tenantId}`)
      setHotelUsers(res.data)
    } catch (error) {
      console.error('Failed to fetch hotel users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (viewMode === "hotels_directory") {
      fetchHotelsOverview()
    } else if (selectedHotel) {
      fetchHotelUsers(selectedHotel.tenant_id)
    }
  }, [viewMode, selectedHotel, fetchHotelsOverview, fetchHotelUsers])

  const handleManageUsers = (hotel: HotelOverview) => {
    setSelectedHotel(hotel)
    setViewMode("hotel_users")
    setFilter('all')
    setSearchQuery('')
  }

  const handleBackToDirectory = () => {
    setViewMode("hotels_directory")
    setSelectedHotel(null)
    setFilter('all')
    setSearchQuery('')
  }

  const handleToggleStatus = async (user: User) => {
    try {
      await api.post(`/api/v1/super-admin/users/${user.id}/toggle-status`)
      if (viewMode === "hotel_users" && selectedHotel) {
        fetchHotelUsers(selectedHotel.tenant_id)
      } else {
        fetchHotelsOverview()
      }
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleDelete = async (user: User) => {
    try {
      setLoading(true)
      await api.delete(`/api/v1/super-admin/users/${user.id}`)
      if (viewMode === "hotel_users" && selectedHotel) {
        await fetchHotelUsers(selectedHotel.tenant_id)
      } else {
        await fetchHotelsOverview()
      }
      setDeletingUserId(null)
    } catch (err: any) {
      console.error('Delete failed:', err)
      alert("Error deleting user: " + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const ROLE_CONFIG: any = {
    all: { label: 'All', icon: <Users size={16} /> },
    hotel_admin: { label: 'Admins', icon: <ShieldCheck size={16} /> },
    hotel_manager: { label: 'Managers', icon: <Edit size={16} /> },
    front_desk: { label: 'Front Desk', icon: <Users size={16} /> },
    housekeeping: { label: 'Housekeeping', icon: <Users size={16} /> },
    guest: { label: 'Guests', icon: <Users size={16} /> },
  }

  const filteredHotels = hotelsOverview.filter(h => 
    h.tenant_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = hotelUsers.filter(user => 
    (filter === 'all' || user.role.includes(filter)) &&
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getPlanLimit = (plan: string) => {
    const p = plan.toLowerCase()
    if (p === 'starter') return 2
    if (p === 'professional') return 25
    return null // Unlimited
  }

  const PLAN_COLORS: any = {
    enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
    professional: 'bg-blue-100 text-blue-700 border-blue-200',
    starter: 'bg-green-100 text-green-700 border-green-200',
  }

  const superAdminCount = stats ? (stats.role_counts?.['super_admin'] || stats.role_counts?.['UserRole.super_admin'] || 0) : 0

  return (
    <div className="space-y-8 pb-20">
      {/* Header View 1 */}
      {viewMode === "hotels_directory" && (
        <div className="flex items-center justify-between fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text">User Management</h1>
            <p className="text-[#2D4A42]">Directory of hotels and platform-level staff</p>
          </div>
        </div>
      )}

      {/* Header View 2 */}
      {viewMode === "hotel_users" && selectedHotel && (
        <div className="space-y-4 fade-in">
          <div className="flex items-center gap-2 text-sm text-[#4A6B63] font-medium">
            <button onClick={handleBackToDirectory} className="hover:text-blue-600 transition-colors">User Management</button>
            <ChevronRight size={14} />
            <span className="text-[#1A2E2B]">{selectedHotel.tenant_name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBackToDirectory}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#2D4A42]"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-[#1A2E2B]">{selectedHotel.tenant_name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${PLAN_COLORS[selectedHotel.plan.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                    {selectedHotel.plan}
                  </span>
                </div>
                <p className="text-[#4A6B63] flex items-center gap-2 mt-1">
                  <Users size={14} />
                  {hotelUsers.length} staff / guests managed here
                </p>
              </div>
            </div>

            <button 
              onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
            >
              <UserPlus size={18} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Row (Always visible or adapted) */}
      {viewMode === "hotels_directory" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 slide-up">
          {[
            { label: 'Total Hotels', value: loading ? '...' : stats?.total_tenants || 0, icon: <Building2 />, color: 'from-blue-500 to-emerald-600' },
            { label: 'Total Users', value: loading ? '...' : stats?.total_users || 0, icon: <Users />, color: 'from-indigo-500 to-blue-600' },
            { label: 'Active Hotels', value: loading ? '...' : stats?.tenant_status?.active || 0, icon: <Building2 />, color: 'from-emerald-500 to-teal-600' },
            { label: 'Super Admins', value: loading ? '...' : superAdminCount, icon: <ShieldCheck />, color: 'from-orange-500 to-red-600' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg card-hover`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">{stat.label}</p>
                  <p className="text-3xl font-extrabold mt-1">{stat.value}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 1: Hotels Directory Table */}
      {viewMode === "hotels_directory" && (
        <div className="glass-card rounded-2xl p-8 border border-gray-100 shadow-sm slide-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1A2E2B]">Hotels Directory</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Filter by hotel name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 pr-4 py-2 rounded-xl w-72 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase">Hotel Name</th>
                  <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase">Plan</th>
                  <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase">Status</th>
                  <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase text-center">User Count</th>
                  <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase">Joined</th>
                  <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-6 px-4 bg-gray-50/50 rounded-lg mb-2"></td>
                    </tr>
                  ))
                ) : filteredHotels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-[#4A6B63] font-medium">
                      No hotels found.
                    </td>
                  </tr>
                ) : filteredHotels.map((hotel) => (
                  <tr key={hotel.tenant_id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {hotel.tenant_name.charAt(0)}
                        </div>
                        <span className="font-bold text-[#1A2E2B]">{hotel.tenant_name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${PLAN_COLORS[hotel.plan.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                        {hotel.plan}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${hotel.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {hotel.status}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-[#1A2E2B]">{hotel.total_users}</span>
                        <span className="text-[10px] text-[#4A6B63]">Active Users</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-sm text-[#4A6B63]">
                      {hotel.joined_at ? new Date(hotel.joined_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="py-5 px-4 text-right">
                      <button 
                        onClick={() => handleManageUsers(hotel)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md active:scale-95"
                      >
                        Manage Users
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Platform Level Users Section */}
          <div className="mt-12 border-t border-gray-100 pt-8">
            <button 
              onClick={() => setIsPlatformUsersOpen(!isPlatformUsersOpen)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-orange-600" />
                <div className="text-left">
                  <h3 className="font-bold text-[#1A2E2B]">Platform Level Users (Super Admins)</h3>
                  <p className="text-xs text-[#4A6B63]">{platformUsers.length} system administrators</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="group relative">
                  <button 
                    disabled
                    className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl font-bold text-xs cursor-help"
                  >
                    + Add Super Admin
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Super Admin accounts must be created directly at the database level for security.
                  </div>
                </div>
                {isPlatformUsersOpen ? <ChevronDown /> : <ChevronRight />}
              </div>
            </button>

            {isPlatformUsersOpen && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                {platformUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A2E2B] text-sm">{user.full_name}</p>
                        <p className="text-[10px] text-[#4A6B63] uppercase font-black tracking-widest">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#4A6B63] italic">{user.email}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">ACTIVE</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14}/></button>
                        
                        {deletingUserId === user.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(user)} className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded">CONFIRM</button>
                            <button onClick={() => setDeletingUserId(null)} className="px-2 py-1 bg-gray-200 text-gray-700 text-[10px] font-bold rounded">X</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingUserId(user.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View 2: Hotel Users View */}
      {viewMode === "hotel_users" && selectedHotel && (
        <div className="space-y-6 slide-up">
          {/* Plan Limit Banner */}
          {(() => {
            const limit = getPlanLimit(selectedHotel.plan)
            if (limit === null) return null
            const usage = hotelUsers.length
            const percentage = (usage / limit) * 100
            
            if (percentage >= 80) {
              return (
                <div className={`p-4 rounded-2xl border-2 flex items-center justify-between animate-pulse ${percentage >= 100 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <p className="font-bold text-sm">
                      {percentage >= 100 
                        ? `CRITICAL: This hotel has reached their ${selectedHotel.plan} plan limit (${usage}/${limit} users).`
                        : `WARNING: This hotel is near their ${selectedHotel.plan} plan limit (${usage}/${limit} users used).`}
                      <span className="block text-xs font-medium opacity-90 mt-0.5">Upgrade their plan to allow adding more staff members.</span>
                    </p>
                  </div>
                  <Link 
                    href={`/super-admin/subscriptions?hotel=${selectedHotel.tenant_id}`} 
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${percentage >= 100 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
                  >
                    Upgrade Plan <ExternalLink size={12} />
                  </Link>
                </div>
              )
            }
            return null
          })()}

          {/* Toolbar */}
          <div className="glass-card rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {Object.entries(ROLE_CONFIG).map(([key, config]: any) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                      filter === key
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-[#4A6B63] border border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search staff or guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 pr-4 py-2 rounded-xl w-64 text-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="glass-card rounded-2xl p-8 border border-gray-100 shadow-sm min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase">User Details</th>
                    <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase">Role</th>
                    <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase">Status</th>
                    <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase">Joined</th>
                    <th className="py-4 px-4 font-bold text-[#4A6B63] text-sm uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="py-6 px-4 bg-gray-50/50 rounded-lg mb-2"></td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <p className="text-[#4A6B63] font-medium">No users found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#1A2E2B]">{user.full_name}</p>
                              <p className="text-xs text-[#4A6B63]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <span className="capitalize px-3 py-1 rounded-lg bg-gray-100 text-[#1A2E2B] text-[10px] font-black tracking-widest uppercase">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                              user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        </td>
                        <td className="py-5 px-4 text-xs text-[#4A6B63] font-medium">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={16}/></button>
                            
                            {deletingUserId === user.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(user)} className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg">CONFIRM</button>
                                <button onClick={() => setDeletingUserId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-lg">X</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeletingUserId(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16}/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onSuccess={() => {
          if (viewMode === "hotel_users" && selectedHotel) {
            fetchHotelUsers(selectedHotel.tenant_id)
          } else {
            fetchHotelsOverview()
          }
        }}
        user={editingUser}
        fixedTenantId={viewMode === "hotel_users" ? selectedHotel?.tenant_id : null}
        fixedTenantName={viewMode === "hotel_users" ? selectedHotel?.tenant_name : undefined}
      />
    </div>
  )
}
