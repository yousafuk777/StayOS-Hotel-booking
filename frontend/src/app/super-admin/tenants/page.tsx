'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/services/api'
import OnboardTenantModal from '@/components/super-admin/OnboardTenantModal'

export default function TenantsPage() {
  const [filter, setFilter] = useState('all')
  const [tenants, setTenants] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const fetchTenants = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/v1/super-admin/tenants', {
        params: { limit: 100 }
      })
      setTenants(data.tenants)
      setTotalCount(data.total)
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const handleDeleteTenant = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action is irreversible.`)) return
    
    setProcessingId(id)
    try {
      await api.delete(`/api/v1/super-admin/tenants/${id}`)
      setTenants(prev => prev.filter(t => t.id !== id))
      setTotalCount(prev => prev - 1)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete tenant. Please try again.')
    } finally {
      setProcessingId(null)
      setActiveDropdown(null)
    }
  }

  const handleToggleStatus = async (tenant: any) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active'
    setProcessingId(tenant.id)
    try {
      await api.patch(`/api/v1/super-admin/tenants/${tenant.id}`, { status: newStatus })
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t))
    } catch (error) {
      console.error('Status update failed:', error)
      alert('Failed to update tenant status.')
    } finally {
      setProcessingId(null)
      setActiveDropdown(null)
    }
  }

  const STATUS_CONFIG: any = {
    all: { label: 'All Tenants', color: 'bg-gray-100 text-[#1A2E2B]' },
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
  }

  const filteredTenants = tenants.filter(t => 
    filter === 'all' || t.status === filter
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Tenant Management</h1>
          <p className="text-[#2D4A42]">Manage all hotel tenants on the platform</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
        >
          <span>➕</span>
          <span>Onboard New Tenant</span>
        </button>
      </div>

      <div>
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#2D4A42] font-medium mb-2">Total Tenants</p>
                <p className="text-4xl font-bold gradient-text">{totalCount}</p>
              </div>
              <div className="text-5xl float">🏨</div>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full inline-block">
              <span>↑</span>
              <span className="font-semibold text-sm">Real-time update</span>
            </div>
          </div>
          {/* ... keeping other stats for aesthetic as requested ... */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#2D4A42] font-medium mb-2">Active Hotels</p>
                <p className="text-4xl font-bold gradient-text">{tenants.filter(t => t.status === 'active').length}</p>
              </div>
              <div className="text-5xl float">✓</div>
            </div>
            <p className="text-sm text-[#2D4A42]">Verified properties</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#2D4A42] font-medium mb-2">Pending</p>
                <p className="text-4xl font-bold gradient-text">{tenants.filter(t => t.status === 'pending').length}</p>
              </div>
              <div className="text-5xl float">⏳</div>
            </div>
            <p className="text-sm text-yellow-600 font-semibold">Awaiting setup</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#2D4A42] font-medium mb-2">Platform Fee</p>
                <p className="text-4xl font-bold gradient-text">12%</p>
              </div>
              <div className="text-5xl float">📊</div>
            </div>
            <p className="text-sm text-[#2D4A42]">Standard commission</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 md:p-6 mb-8 slide-up border border-gray-200" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(STATUS_CONFIG).map(([key, config]: any) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-100 text-[#1A2E2B]'
                    }`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="search"
                placeholder="Search tenants..."
                className="input-field px-4 py-2 rounded-xl w-64 text-[#1A2E2B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="glass-card rounded-2xl p-6 md:p-8 slide-up border border-gray-200" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">
              {STATUS_CONFIG[filter]?.label || 'All Tenants'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Hotel Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Subdomain</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Plan</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Commission</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Joined</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                        <p className="text-[#2D4A42] font-medium">Loading platform data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-[#2D4A42] font-medium">
                      No tenants found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant, index) => (
                    <tr
                      key={tenant.id}
                      className="hover:bg-gray-50 transition-colors animate-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">🏨</div>
                          <h3 className="font-semibold text-[#1A2E2B]">{tenant.name}</h3>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-blue-600">{tenant.slug}.stayos.com</td>
                      <td className="py-4 px-4">
                        <span className="capitalize px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold">
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#1A2E2B]">{(tenant.commission_rate * 100).toFixed(1)}%</div>
                      </td>
                      <td className="py-4 px-4 text-[#2D4A42]">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                          tenant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tenant.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 relative">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === tenant.id ? null : tenant.id);
                            }}
                            className={`glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium flex items-center gap-2 ${
                              activeDropdown === tenant.id ? 'bg-gray-100 ring-2 ring-blue-500/20' : 'text-[#1A2E2B]'
                            }`}
                          >
                            <span>{activeDropdown === tenant.id ? '✕' : '⚙️'}</span>
                            <span>Actions</span>
                          </button>

                          {/* Action Dropdown */}
                          {activeDropdown === tenant.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActiveDropdown(null)}
                              ></div>
                              <div className="absolute right-4 top-full mt-2 w-48 glass-card border border-gray-200 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-1">
                                  <button 
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1A2E2B] hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                                    onClick={() => alert('Editing details coming soon')}
                                  >
                                    <span>📝</span> Edit Details
                                  </button>
                                  
                                  <button 
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg flex items-center gap-3 transition-colors ${
                                      tenant.status === 'active' 
                                        ? 'text-amber-600 hover:bg-amber-50' 
                                        : 'text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                    onClick={() => handleToggleStatus(tenant)}
                                    disabled={processingId === tenant.id}
                                  >
                                    {processingId === tenant.id ? (
                                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                    ) : (
                                      <span>{tenant.status === 'active' ? '⏸' : '▶️'}</span>
                                    )}
                                    {tenant.status === 'active' ? 'Suspend Hotel' : 'Activate Hotel'}
                                  </button>

                                  <div className="h-px bg-gray-100 my-1"></div>

                                  <button 
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors"
                                    onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                                    disabled={processingId === tenant.id}
                                  >
                                    {processingId === tenant.id ? (
                                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                                    ) : (
                                      <span>🗑️</span>
                                    )}
                                    Delete Hotel
                                  </button>
                                </div>
                              </div>
                            </>
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

      <OnboardTenantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTenants}
      />
    </div>
  )
}
