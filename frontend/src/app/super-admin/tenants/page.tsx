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

  const STATUS_CONFIG: any = {
    all: { label: 'All Tenants', color: 'bg-gray-100 text-gray-700' },
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
          <p className="text-gray-600">Manage all hotel tenants on the platform</p>
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
                <p className="text-gray-600 font-medium mb-2">Total Tenants</p>
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
                <p className="text-gray-600 font-medium mb-2">Active Hotels</p>
                <p className="text-4xl font-bold gradient-text">{tenants.filter(t => t.status === 'active').length}</p>
              </div>
              <div className="text-5xl float">✓</div>
            </div>
            <p className="text-sm text-gray-600">Verified properties</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Pending</p>
                <p className="text-4xl font-bold gradient-text">{tenants.filter(t => t.status === 'pending').length}</p>
              </div>
              <div className="text-5xl float">⏳</div>
            </div>
            <p className="text-sm text-yellow-600 font-semibold">Awaiting setup</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Platform Fee</p>
                <p className="text-4xl font-bold gradient-text">12%</p>
              </div>
              <div className="text-5xl float">📊</div>
            </div>
            <p className="text-sm text-gray-600">Standard commission</p>
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
                      : 'glass hover:bg-gray-100 text-gray-700'
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
                className="input-field px-4 py-2 rounded-xl w-64 text-gray-900 focus:outline-none"
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
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Hotel Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Subdomain</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Commission</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                        <p className="text-gray-500 font-medium">Loading platform data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-500 font-medium">
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
                          <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-blue-600">{tenant.slug}.stayos.com</td>
                      <td className="py-4 px-4">
                        <span className="capitalize px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold">
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-700">{(tenant.commission_rate * 100).toFixed(1)}%</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
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
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
                            ⚙️ Details
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

      <OnboardTenantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTenants}
      />
    </div>
  )
}
