'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HotelPolicies {
  cancellation: {
    freePeriod: string
    fee: string
  }
  checkInOut: {
    checkInTime: string
    checkOutTime: string
    earlyLatePolicy: string
  }
  pets: {
    allowed: boolean
    fee: string
    rules: string
  }
  children: {
    freeStay: string
    extraBedPolicy: string
  }
  payment: {
    methods: string[]
    deposit: string
  }
}

const defaultPolicies: HotelPolicies = {
  cancellation: {
    freePeriod: '',
    fee: ''
  },
  checkInOut: {
    checkInTime: '15:00',
    checkOutTime: '11:00',
    earlyLatePolicy: ''
  },
  pets: {
    allowed: false,
    fee: '',
    rules: ''
  },
  children: {
    freeStay: '',
    extraBedPolicy: ''
  },
  payment: {
    methods: [],
    deposit: ''
  }
}

export default function PoliciesPage() {
  const router = useRouter()
  const [policies, setPolicies] = useState<HotelPolicies>(defaultPolicies)
  const [hasChanges, setHasChanges] = useState(false)

  // Load policies from localStorage
  useEffect(() => {
    const savedPolicies = localStorage.getItem('hotel-policies')
    if (savedPolicies) {
      try {
        setPolicies(JSON.parse(savedPolicies))
      } catch (error) {
        console.error('Error loading policies:', error)
      }
    }
  }, [])

  // Save policies to localStorage
  const savePolicies = () => {
    localStorage.setItem('hotel-policies', JSON.stringify(policies))
    setHasChanges(false)
    alert('Policies saved successfully!')
  }

  // Update policies
  const updatePolicies = (section: keyof HotelPolicies, data: any) => {
    setPolicies(prev => ({ ...prev, [section]: data }))
    setHasChanges(true)
  }

  // Generate sample policies
  const generateSamplePolicies = () => {
    const samplePolicies: HotelPolicies = {
      cancellation: {
        freePeriod: 'Up to 24 hours before check-in',
        fee: 'Guests who cancel within 24 hours of check-in will be charged one night\'s stay. No-shows will be charged the full reservation amount.'
      },
      checkInOut: {
        checkInTime: '15:00',
        checkOutTime: '11:00',
        earlyLatePolicy: 'Early check-in and late check-out are subject to availability. Additional charges may apply: $50 for early check-in before 12 PM, $75 for late check-out after 2 PM.'
      },
      pets: {
        allowed: true,
        fee: '$75 per pet per night',
        rules: 'Maximum 2 pets per room. Pets must not be left unattended in rooms. Weight limit: 50 lbs per pet.'
      },
      children: {
        freeStay: 'Children under 12 years stay free when using existing beds',
        extraBedPolicy: 'One extra bed allowed per room at $50 per night. Cribs available free of charge upon request.'
      },
      payment: {
        methods: ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'],
        deposit: 'A refundable security deposit of $200 is required upon check-in for incidental charges.'
      }
    }
    setPolicies(samplePolicies)
    savePolicies()
  }

  // Clear all policies
  const clearPolicies = () => {
    if (confirm('Are you sure you want to clear all policies? This action cannot be undone.')) {
      setPolicies(defaultPolicies)
      localStorage.removeItem('hotel-policies')
      setHasChanges(false)
    }
  }

  const isEmpty = !policies.cancellation.freePeriod && !policies.pets.allowed && policies.payment.methods.length === 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-card border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="glass p-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <span className="text-xl">←</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Hotel Policies</h1>
                <p className="text-sm text-[#2D4A42]">Manage rules and regulations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEmpty ? (
                <button
                  onClick={generateSamplePolicies}
                  className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer"
                >
                  📋 Add Sample Policies
                </button>
              ) : (
                <button
                  onClick={clearPolicies}
                  className="glass px-4 py-2 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  🗑️ Clear All
                </button>
              )}

              <button
                onClick={savePolicies}
                disabled={!hasChanges}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  hasChanges
                    ? 'btn-primary'
                    : 'glass text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>💾</span>
                <span>Save Policies</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {isEmpty ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">📋</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">No Policies Configured</h2>
              <p className="text-[#2D4A42] mb-8 text-lg">
                Set up clear rules and regulations for your hotel including cancellation, check-in/out, and payment policies.
              </p>
              <button
                onClick={generateSamplePolicies}
                className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto cursor-pointer"
              >
                📊 Try Sample Policies
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cancellation Policy */}
            <div className="glass-card rounded-2xl p-8 slide-up">
              <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                📋 Cancellation Policy
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Free Cancellation Period</label>
                  <select
                    value={policies.cancellation.freePeriod}
                    onChange={(e) => updatePolicies('cancellation', { ...policies.cancellation, freePeriod: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                  >
                    <option value="">Select period...</option>
                    <option>Up to 24 hours before check-in</option>
                    <option>Up to 48 hours before check-in</option>
                    <option>Up to 7 days before check-in</option>
                    <option>No free cancellation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Cancellation Fee</label>
                  <textarea
                    rows={3}
                    value={policies.cancellation.fee}
                    onChange={(e) => updatePolicies('cancellation', { ...policies.cancellation, fee: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    placeholder="Describe cancellation fees..."
                  />
                </div>
              </div>
            </div>

            {/* Check-in/Check-out Policy */}
            <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                ⏰ Check-in & Check-out
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-in Time</label>
                  <input
                    type="time"
                    value={policies.checkInOut.checkInTime}
                    onChange={(e) => updatePolicies('checkInOut', { ...policies.checkInOut, checkInTime: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-out Time</label>
                  <input
                    type="time"
                    value={policies.checkInOut.checkOutTime}
                    onChange={(e) => updatePolicies('checkInOut', { ...policies.checkInOut, checkOutTime: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Early Check-in / Late Check-out</label>
                  <textarea
                    rows={3}
                    value={policies.checkInOut.earlyLatePolicy}
                    onChange={(e) => updatePolicies('checkInOut', { ...policies.checkInOut, earlyLatePolicy: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    placeholder="Describe early check-in and late check-out policies..."
                  />
                </div>
              </div>
            </div>

            {/* Pet Policy */}
            <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                🐾 Pet Policy
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                  <input
                    type="checkbox"
                    checked={policies.pets.allowed}
                    onChange={(e) => updatePolicies('pets', { ...policies.pets, allowed: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A2E2B]">Pets Allowed</p>
                    <p className="text-sm text-[#2D4A42]">Allow guests to bring pets</p>
                  </div>
                </label>
                {policies.pets.allowed && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Pet Fee</label>
                      <input
                        type="text"
                        value={policies.pets.fee}
                        onChange={(e) => updatePolicies('pets', { ...policies.pets, fee: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                        placeholder="e.g., $75 per pet per night"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Pet Rules</label>
                      <textarea
                        rows={3}
                        value={policies.pets.rules}
                        onChange={(e) => updatePolicies('pets', { ...policies.pets, rules: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                        placeholder="Describe pet rules and restrictions..."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Children Policy */}
            <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                👶 Children & Extra Beds
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Children Stay Free</label>
                  <input
                    type="text"
                    value={policies.children.freeStay}
                    onChange={(e) => updatePolicies('children', { ...policies.children, freeStay: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                    placeholder="e.g., Children under 12 years stay free..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Extra Bed Policy</label>
                  <textarea
                    rows={3}
                    value={policies.children.extraBedPolicy}
                    onChange={(e) => updatePolicies('children', { ...policies.children, extraBedPolicy: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    placeholder="Describe extra bed policies..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Policy */}
            <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.8s' }}>
              <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                💳 Payment Policy
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Accepted Payment Methods</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'].map((method) => (
                      <label key={method} className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                        <input
                          type="checkbox"
                          checked={policies.payment.methods.includes(method)}
                          onChange={(e) => {
                            const newMethods = e.target.checked
                              ? [...policies.payment.methods, method]
                              : policies.payment.methods.filter(m => m !== method)
                            updatePolicies('payment', { ...policies.payment, methods: newMethods })
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-[#1A2E2B]">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Deposit Required</label>
                  <textarea
                    rows={3}
                    value={policies.payment.deposit}
                    onChange={(e) => updatePolicies('payment', { ...policies.payment, deposit: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    placeholder="Describe deposit requirements..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
