'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/services/api'
import UserFormModal from '@/components/super-admin/UserFormModal'

interface User {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  tenant_id: number | null
  is_active: boolean
  is_verified: boolean
  created_at: string
}

interface Stats {
  total_tenants: number
  total_users: number
  role_counts: Record<string, number>
  tenant_status: Record<string, number>
}

export default function UsersPage() {
  const [filter, setFilter] = useState('all')
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/api/v1/super-admin/users', { params: { limit: 100 } }),
        api.get('/api/v1/super-admin/stats')
      ])
      setUsers(usersRes.data.users)
      setTotalCount(usersRes.data.total)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch users or stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleStatus = async (user: User) => {
    try {
      await api.post(`/api/v1/super-admin/users/${user.id}/toggle-status`)
      fetchData() // Refresh list
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be easily undone.`)) return
    try {
      await api.delete(`/api/v1/super-admin/users/${user.id}`)
      fetchData() // Refresh list
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const ROLE_CONFIG: any = {
    all: { label: 'All Users', icon: '👥' },
    guest: { label: 'Guests', icon: '👤' },
    hotel_admin: { label: 'Hotel Admins', icon: '🏨' },
    hotel_manager: { label: 'Managers', icon: '📋' },
    front_desk: { label: 'Front Desk', icon: '🛎️' },
    housekeeping: { label: 'Housekeeping', icon: '🧹' },
  }

  const filteredUsers = users.filter(user => 
    filter === 'all' || user.role.includes(filter)
  )

  const guestCount = Object.entries(stats?.role_counts ?? {})
    .filter(([role]) => role.includes('guest'))
    .reduce((sum, [, count]) => sum + count, 0)

  const staffCount = Object.entries(stats?.role_counts ?? {})
    .filter(([role]) => !role.includes('guest') && !role.includes('super_admin'))
    .reduce((sum, [, count]) => sum + count, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text">User Management</h1>
          <p className="text-gray-600">Manage all platform users across all hotels</p>
        </div>
        
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          <span>➕</span>
          <span>Add User</span>
        </button>
      </div>

      <div>
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          {[
            { 
              label: 'Total Users', 
              value: loading ? '...' : totalCount.toLocaleString(), 
              change: 'Platform Total', 
              icon: '👥', 
              color: 'from-blue-500 to-blue-600' 
            },
            { 
              label: 'Guests', 
              value: loading ? '...' : guestCount.toLocaleString(), 
              change: stats ? `${((guestCount / (stats.total_users || 1)) * 100).toFixed(1)}% of total` : '', 
              icon: '✓', 
              color: 'from-green-500 to-green-600' 
            },
            { 
              label: 'Hotel Staff', 
              value: loading ? '...' : staffCount.toLocaleString(), 
              change: stats ? `${((staffCount / (stats.total_users || 1)) * 100).toFixed(1)}% of total` : '', 
              icon: '🏨', 
              color: 'from-purple-500 to-purple-600' 
            },
            { 
              label: 'Super Admins', 
              value: loading ? '...' : (stats?.role_counts?.['super_admin'] || stats?.role_counts?.['UserRole.super_admin'] || 0).toLocaleString(), 
              change: 'System Management', 
              icon: '🏛️', 
              color: 'from-yellow-500 to-orange-600' 
            },
          ].map((stat, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white card-hover shadow-lg slide-up`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">{stat.icon}</div>
                <div className="text-right">
                  <p className="text-4xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.change}</p>
                </div>
              </div>
              <p className="font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Role Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up border border-gray-200" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(ROLE_CONFIG).map(([key, config]: any) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="search"
                placeholder="Search users..."
                className="input-field px-4 py-2 rounded-xl w-64 text-gray-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              {ROLE_CONFIG[filter]?.label || 'All Users'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Tenant ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-gray-500 font-medium italic animate-pulse">
                      Loading user data...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-gray-500 font-medium">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50 transition-colors slide-up"
                      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {(user.first_name || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'StayOS User'}
                            </h3>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">
                          {user.role.split('.').pop()?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 font-medium">
                          {user.tenant_id ? `#${user.tenant_id}` : 'Platform Level'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                            user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Edit User"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(user)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Delete User"
                          >
                            🗑️
                          </button>
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

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onSuccess={fetchData}
        user={editingUser}
      />
    </div>
  )
}
