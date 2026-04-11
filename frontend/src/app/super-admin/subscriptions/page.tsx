'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../services/api'
import { Check, ArrowUpRight, ArrowDownRight, Loader2, Info } from 'lucide-react'

export default function SubscriptionsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('all')
  const [tenants, setTenants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; plan: string; price: number } | null>(null)

  const fetchTenants = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/v1/super-admin/tenants')
      setTenants(response.data.tenants)
      // Auto-select first tenant if none selected
      if (response.data.tenants.length > 0 && !selectedTenant) {
        setSelectedTenant(response.data.tenants[0])
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const filteredTenants = activeFilter === 'all' 
    ? tenants 
    : tenants.filter(t => t.status === activeFilter)

  const handlePlanChange = async (planKey: string) => {
    if (!selectedTenant) return
    
    setIsProcessing(true)
    try {
      // 1.5s simulated delay as per plan
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      await api.patch(`/api/v1/super-admin/tenants/${selectedTenant.id}/plan`, {
        plan: planKey
      })
      
      // Update local state
      await fetchTenants()
      // Refresh selected tenant info
      const updated = tenants.find(t => t.id === selectedTenant.id)
      setSelectedTenant({ ...selectedTenant, plan: planKey })
      
      setConfirmModal(null)
      alert(`Successfully switched ${selectedTenant.name} to ${planKey} plan!`)
    } catch (error) {
      console.error('Error upgrading plan:', error)
      alert('Failed to update plan. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const plans = [
    { key: 'starter', name: 'Starter', price: 99, features: ['Up to 5 Rooms', 'Basic Reporting', '2 Staff Members'], color: 'gray' },
    { key: 'professional', name: 'Professional', price: 299, features: ['Up to 100 Rooms', 'Advanced Analytics', '25 Staff Members', 'Staff Management'], color: 'green' },
    { key: 'enterprise', name: 'Enterprise', price: 499, features: ['Unlimited Rooms', 'Custom Colors', 'Unlimited Staff', 'Theme & Branding'], color: 'amber' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">💳 Subscription Management</h1>
            <p className="text-[#2D4A42]">Manage hotel subscription plans and billing limits</p>
          </div>
        </div>
      </div>

      {/* Tenant Selection Table */}
      <div className="glass-card rounded-2xl p-6 mb-8 slide-up">
        <h2 className="text-2xl font-bold text-[#1A2E2B] mb-6 flex items-center gap-2">
          <Info size={24} className="text-blue-500" /> Select a Hotel to Manage
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Hotel Name</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Current Plan</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr 
                  key={tenant.id} 
                  className={`border-b border-gray-100 cursor-pointer transition-all ${
                    selectedTenant?.id === tenant.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTenant(tenant)}
                >
                  <td className="py-4 px-4 font-semibold text-[#1A2E2B]">{tenant.name}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                      tenant.plan === 'enterprise' ? 'bg-amber-100 text-amber-700' :
                      tenant.plan === 'professional' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium capitalize">{tenant.status}</td>
                  <td className="py-4 px-4">
                    <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedTenant?.id === tenant.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {selectedTenant?.id === tenant.id ? 'Managing' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Management Section */}
      {selectedTenant && (
        <div className="slide-up">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold gradient-text">
              Plan Options for: <span className="text-[#1A2E2B]">{selectedTenant.name}</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-100">
              Current: <span className="font-bold uppercase text-blue-600 tracking-wider ml-1">{selectedTenant.plan}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = selectedTenant.plan === plan.key
              const isUpgrade = plan.price > (plans.find(p => p.key === selectedTenant.plan)?.price || 0)
              
              return (
                <div key={plan.key} className={`glass-card rounded-3xl p-8 border-2 transition-all duration-500 relative overflow-hidden flex flex-col ${
                  isCurrent ? 'border-blue-500 shadow-xl' : 'border-gray-100 hover:border-gray-200 shadow-sm'
                }`}>
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                      Active Plan
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-black text-[#1A2E2B] mb-1">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-black gradient-text">${plan.price}</span>
                    <span className="text-gray-400 font-medium ml-1">/mo</span>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-600">
                        <div className="mt-0.5 bg-green-500/10 p-0.5 rounded-full">
                          <Check size={14} className="text-green-600" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button 
                    disabled={isCurrent || isProcessing}
                    onClick={() => setConfirmModal({ isOpen: true, plan: plan.key, price: plan.price })}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      isCurrent 
                        ? 'bg-blue-50 text-blue-400 cursor-default shadow-none border border-blue-100' 
                        : isUpgrade
                          ? 'bg-[#1A2E2B] text-white hover:bg-[#2D4541] shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {isCurrent ? (
                      <><Check size={18} /> Current Plan</>
                    ) : (
                      <>
                        {isUpgrade ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        {isUpgrade ? 'Upgrade Plan' : 'Downgrade Plan'}
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setConfirmModal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Plan Change</h3>
            <p className="text-gray-600 mb-8">
              Switch <span className="font-bold text-[#1A2E2B]">{selectedTenant?.name}</span> to the 
              <span className="font-bold text-blue-600"> {confirmModal.plan.toUpperCase()}</span> plan for 
              <span className="font-bold text-[#1A2E2B]"> ${confirmModal.price}/month</span>?
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModal(null)}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={() => handlePlanChange(confirmModal.plan)}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="animate-spin" size={18} /> Processing...</>
                ) : (
                  'Confirm Change'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
