'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../services/api'
import { 
  CreditCard, Check, X, ArrowUpRight, Loader2, 
  Users, BedDouble, ShieldCheck, Calendar, Mail, Info
} from 'lucide-react'

export default function SubscriptionPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/v1/tenants/me/subscription')
      setData(res.data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const handleUpgradeClick = () => {
    // STRIPE-READY: When Stripe is integrated, replace this block with:
    // const { url } = await createStripeCheckoutSession(targetPlan);
    // window.location.href = url;
    
    setUpgradeModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#2D4A42]">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-medium">Loading subscription details...</p>
      </div>
    )
  }

  if (!data) return null

  const { usage, plan_key, display_name, price, all_plans } = data

  const getProgressBarColor = (current: number, limit: number | null) => {
    if (limit === null) return 'bg-green-500'
    const pct = (current / limit) * 100
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 70) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const renderUsageBar = (title: string, current: number, limit: number | null, icon: any) => {
    const isUnlimited = limit === null
    const pct = isUnlimited ? 100 : Math.min((current / limit) * 100, 100)
    const colorClass = getProgressBarColor(current, limit)
    const showUpgrade = !isUnlimited && (current / limit) >= 0.8

    return (
      <div className="glass p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass.replace('bg-', 'text-')}`}>
              {icon}
            </div>
            <h3 className="font-bold text-[#1A2E2B]">{title}</h3>
          </div>
          <span className="text-sm font-bold text-[#2D4A42]">
            {current} of {isUnlimited ? 'Unlimited' : limit}
          </span>
        </div>
        
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
          <div 
            className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {showUpgrade && (
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 animate-pulse">
            <Info size={14} />
            <span>Usage high. Upgrade to add more {title.toLowerCase()} →</span>
          </div>
        )}
        
        {!isUnlimited && current >= limit && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100">
            ⚠️ You've reached your {title.toLowerCase()} limit. Upgrade your plan to add more.
          </div>
        )}
      </div>
    )
  }

  const featureLabels: Record<string, string> = {
    bookings: "Bookings & Calendar",
    calendar: "Calendar Views",
    rooms: "Rooms Management",
    housekeeping: "Housekeeping Status",
    guests: "Guest Directory",
    analytics: "Analytics & Reports",
    staff_management: "Staff Management",
    promotions: "Promotions & Marketing",
    reviews: "Reviews Dashboard",
    theme_branding: "Custom Theme & Branding",
    policies: "Policy Management",
    hotel_settings: "Advanced Settings"
  }

  const featureKeys = Object.keys(featureLabels)

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold gradient-text mb-2 flex items-center gap-3">
          <CreditCard className="text-blue-600" /> Subscription & Billing
        </h1>
        <p className="text-[#2D4A42]">Manage your plan, track usage, and view billing history.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Current Plan Card */}
          <div className="glass-card rounded-[2rem] p-8 border border-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500 opacity-[0.03] rounded-full group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Your Current Plan</p>
                  <h2 className="text-4xl font-black text-[#1A2E2B] flex items-center gap-3">
                    🏷️ {display_name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black gradient-text">${price}</p>
                  <p className="text-xs font-bold text-[#2D4A42]">per month</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-medium text-[#2D4A42]">
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
                  <ShieldCheck size={16} />
                  Plan renews automatically
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  Next billing date: — <span className="text-[10px] uppercase font-bold text-gray-300 ml-1">(Coming soon)</span>
                </div>
              </div>

              {plan_key !== 'enterprise' ? (
                <button 
                  onClick={handleUpgradeClick}
                  className="bg-[#1A2E2B] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#2D4541] transition-all shadow-xl hover:shadow-2xl active:scale-95 group"
                >
                  <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Upgrade Plan
                </button>
              ) : (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl font-bold border border-amber-100 flex items-center justify-center gap-3">
                  <span className="text-2xl">🎉</span> You are on our highest tier. Thank you!
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Usage Statistics */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1A2E2B] px-2 flex items-center gap-2">
              📊 Usage Limits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderUsageBar("Rooms Used", usage.rooms.current, usage.rooms.limit, <BedDouble size={20} />)}
              {renderUsageBar("Staff Accounts", usage.users.current, usage.users.limit, <Users size={20} />)}
            </div>
          </div>

          {/* Section 3: Feature Comparison Table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-[#1A2E2B]">Plan Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D4A42] bg-white">
                    <th className="py-5 px-6 border-b border-gray-100">Feature</th>
                    {['starter', 'professional', 'enterprise'].map(pk => (
                      <th key={pk} className={`py-5 px-6 border-b border-gray-100 transition-colors ${plan_key === pk ? 'bg-blue-50/50 text-blue-600' : ''}`}>
                        {all_plans[pk].display_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {featureKeys.map((fKey) => (
                    <tr key={fKey} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#1A2E2B]">{featureLabels[fKey]}</td>
                      {['starter', 'professional', 'enterprise'].map(pk => (
                        <td key={pk} className={`py-4 px-6 ${plan_key === pk ? 'bg-blue-50/30' : ''}`}>
                          {all_plans[pk].features[fKey] ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <X size={18} className="text-red-500" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Limits Rows */}
                  <tr className="bg-gray-50/30">
                    <td className="py-5 px-6 font-bold text-[#1A2E2B]">Max Rooms</td>
                    {['starter', 'professional', 'enterprise'].map(pk => (
                      <td key={pk} className={`py-5 px-6 font-black text-[#1A2E2B] ${plan_key === pk ? 'bg-blue-50/30' : ''}`}>
                        {all_plans[pk].max_rooms || 'Unlimited'}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50/30">
                    <td className="py-5 px-6 font-bold text-[#1A2E2B]">Max Staff Accounts</td>
                    {['starter', 'professional', 'enterprise'].map(pk => (
                      <td key={pk} className={`py-5 px-6 font-black text-[#1A2E2B] ${plan_key === pk ? 'bg-blue-50/30' : ''}`}>
                        {all_plans[pk].max_users || 'Unlimited'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Section 4: Billing Information */}
          <div className="glass-card rounded-[2rem] p-8 border border-gray-100 shadow-sm sticky top-28">
            <h2 className="text-xl font-bold text-[#1A2E2B] mb-8 flex items-center gap-2">
              💳 Billing INFO
            </h2>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Method</p>
                <div className="flex items-center gap-3 text-sm font-bold text-[#1A2E2B]">
                  <div className="w-12 h-8 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-[8px] font-black text-gray-400 tracking-tighter">CARD</div>
                  Not configured
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Invoice</p>
                <p className="text-sm font-bold text-[#1A2E2B]">—</p>
              </div>

              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
                <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                  Stripe billing integration is coming soon.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Invoices</h3>
              <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-400">
                <p className="text-xs font-bold">No history yet.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUpgradeModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-12 text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600">
              <Mail size={48} />
            </div>
            
            <h2 className="text-3xl font-black text-[#1A2E2B] mb-4">Ready to upgrade?</h2>
            
            <p className="text-[#2D4A42] mb-10 leading-relaxed font-medium">
              To upgrade your subscription, please contact your platform administrator.
            </p>
            
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 font-black text-blue-700 mb-10 text-lg tracking-tight select-all cursor-copy">
              admin@stayos.com
            </div>
            
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-10">
              Direct billing coming soon
            </p>
            
            <button
              onClick={() => setUpgradeModalOpen(false)}
              className="w-full bg-[#1A2E2B] text-white py-5 rounded-[1.5rem] font-bold hover:bg-[#2D4541] transition-all shadow-xl active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
