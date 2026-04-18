'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import api from '@/services/api'
import OnboardTenantModal from '@/components/super-admin/OnboardTenantModal'
import EditTenantModal from '@/components/super-admin/EditTenantModal'

export default function TenantsPage() {
  const [filter, setFilter] = useState('all')
  const [tenants, setTenants] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showActionsModal, setShowActionsModal] = useState(false)
  const [selectedTenantForActions, setSelectedTenantForActions] = useState<any>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingHotelId, setUploadingHotelId] = useState<number | null>(null)
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<any>(null)

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

  const handleImageUpload = async (hotelId: number, file: File) => {
    setUploadingHotelId(hotelId)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post(`/api/v1/hotels/${hotelId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setToastMessage('✅ Image uploaded successfully!')
      setTimeout(() => setToastMessage(null), 3000)
      fetchTenants()
    } catch (error: any) {
      console.error('Upload failed:', error)
      setToastMessage(`❌ Failed to upload image: ${error.response?.data?.detail || 'Unknown error'}`)
      setTimeout(() => setToastMessage(null), 5000)
    } finally {
      setUploadingHotelId(null)
    }
  }

  const handleToggleStatus = async (tenant: any) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active'
    const action = tenant.status === 'active' ? 'suspend' : 'activate'
    
    setProcessingId(tenant.id)
    try {
      console.log(`🔄 ${action} tenant:`, tenant.id)
      await api.patch(`/api/v1/super-admin/tenants/${tenant.id}`, { status: newStatus })
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t))
      setToastMessage(`✅ Tenant ${action}ed successfully!`)
      setTimeout(() => setToastMessage(null), 3000)
      setShowActionsModal(false)
    } catch (error: any) {
      console.error(`❌ Status update failed:`, error)
      setToastMessage(`❌ Failed to ${action} tenant: ${error.response?.data?.detail || 'Unknown error'}`)
      setTimeout(() => setToastMessage(null), 5000)
    } finally {
      setProcessingId(null)
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-[100] flex items-center gap-3 slide-up ${
          toastMessage.startsWith('✅') 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <span className="text-xl">{toastMessage.startsWith('✅') ? '✅' : '❌'}</span>
          <span className="font-semibold">{toastMessage.replace(/^[✅❌]\\s*/, '')}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between fade-in p-2">
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

      <div className="p-2">
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
        <div className="glass-card rounded-2xl p-4 md:p-6 mb-8 slide-up border border-gray-200">
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
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B] text-right pr-12">Actions</th>
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
                      className="hover:bg-gray-50/50 transition-colors animate-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">🏨</div>
                          <h3 className="font-semibold text-[#1A2E2B]">
                            {tenant.hotels?.[0]?.name || tenant.name}
                          </h3>
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
                          {tenant.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="py-4 px-4 relative" style={{ minWidth: '180px' }}>
                        <div className="flex items-center justify-end">
                          <button 
                            onClick={() => {
                              setSelectedTenantForActions(tenant)
                              setShowActionsModal(true)
                            }}
                            className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-sm font-bold flex items-center gap-2 text-[#1A2E2B]"
                          >
                            <span>⚙️</span>
                            <span>Actions</span>
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

      <EditTenantModal 
        isOpen={!!selectedTenantForEdit}
        onClose={() => setSelectedTenantForEdit(null)}
        onSuccess={fetchTenants}
        tenant={selectedTenantForEdit}
      />

      {/* Actions Modal */}
      {showActionsModal && selectedTenantForActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Actions</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedTenantForActions.hotels?.[0]?.name || selectedTenantForActions.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowActionsModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Edit Button */}
              <button 
                onClick={() => {
                  setSelectedTenantForEdit(selectedTenantForActions)
                  setShowActionsModal(false)
                }}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-4 transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Edit Details</div>
                  <div className="text-xs text-gray-600">Update tenant information</div>
                </div>
              </button>
              
              {/* Upload Image Button */}
              <button 
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (evt: any) => {
                    const file = evt.target.files[0]
                    if (file && selectedTenantForActions.hotels?.[0]?.id) {
                      handleImageUpload(selectedTenantForActions.hotels[0].id, file)
                    }
                  }
                  input.click()
                }}
                disabled={uploadingHotelId !== null}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-4 transition-all group disabled:opacity-50"
              >
                {uploadingHotelId === (selectedTenantForActions.hotels?.[0]?.id) ? (
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-2xl group-hover:scale-110 transition-transform">🖼️</span>
                )}
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Upload Image</div>
                  <div className="text-xs text-gray-600">Change hotel logo</div>
                </div>
              </button>

              {/* Suspend/Activate Button */}
              <button 
                onClick={() => handleToggleStatus(selectedTenantForActions)}
                disabled={processingId === selectedTenantForActions.id}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-4 transition-all group disabled:opacity-50 ${
                  selectedTenantForActions.status === 'active'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                    : 'bg-green-50 hover:bg-green-100 text-green-700'
                }`}
              >
                {processingId === selectedTenantForActions.id ? (
                  <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {selectedTenantForActions.status === 'active' ? '⏸️' : '▶️'}
                  </span>
                )}
                <div className="text-left">
                  <div className="font-semibold">
                    {selectedTenantForActions.status === 'active' ? 'Suspend' : 'Activate'}
                  </div>
                  <div className="text-xs opacity-75">
                    {selectedTenantForActions.status === 'active' ? 'Temporarily disable' : 'Re-enable access'}
                  </div>
                </div>
              </button>

              {/* Delete Button - DISABLED */}
              <div className="px-4 py-3 bg-gray-100 rounded-xl flex items-center gap-4 opacity-50 cursor-not-allowed">
                <span className="text-2xl">🗑️</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-500">Delete Tenant</div>
                  <div className="text-xs text-gray-500">🔒 Disabled for safety</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowActionsModal(false)}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
