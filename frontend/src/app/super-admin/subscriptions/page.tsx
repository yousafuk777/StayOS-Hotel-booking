'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubscriptionsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('all')
  const [isProcessing, setIsProcessing] = useState(false)

  const subscriptions = [
    { id: 1, plan: 'Enterprise', tenant: 'Grand Plaza Hotel', users: 50, price: 499, status: 'active', renewal: '2024-12-31', features: ['Unlimited Rooms', 'Advanced Analytics', 'Priority Support', 'Custom Integrations'] },
    { id: 2, plan: 'Professional', tenant: 'Seaside Resort', users: 25, price: 299, status: 'active', renewal: '2024-11-15', features: ['Up to 100 Rooms', 'Basic Analytics', 'Email Support', 'API Access'] },
    { id: 3, plan: 'Starter', tenant: 'City Inn', users: 10, price: 99, status: 'active', renewal: '2024-10-20', features: ['Up to 30 Rooms', 'Basic Reporting', 'Standard Support'] },
    { id: 4, plan: 'Enterprise', tenant: 'Mountain View Lodge', users: 45, price: 499, status: 'trial', renewal: '2024-09-30', features: ['Unlimited Rooms', 'Advanced Analytics', 'Priority Support', 'Custom Integrations'] },
    { id: 5, plan: 'Professional', tenant: 'Downtown Suites', users: 20, price: 299, status: 'expired', renewal: '2024-08-15', features: ['Up to 100 Rooms', 'Basic Analytics', 'Email Support', 'API Access'] },
  ]

  const filteredSubs = activeFilter === 'all' 
    ? subscriptions 
    : subscriptions.filter(sub => sub.status === activeFilter)

  const handleRenew = async (id: number) => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Subscription renewed successfully!')
    setIsProcessing(false)
  }

  const stats = [
    { label: 'Active Subscriptions', value: subscriptions.filter(s => s.status === 'active').length, icon: '💳', color: 'blue' },
    { label: 'Trial Accounts', value: subscriptions.filter(s => s.status === 'trial').length, icon: '🎯', color: 'purple' },
    { label: 'Expired', value: subscriptions.filter(s => s.status === 'expired').length, icon: '⚠️', color: 'red' },
    { label: 'Monthly Revenue', value: '$12,450', icon: '💰', color: 'green' }
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">💳 Subscription Management</h1>
            <p className="text-[#2D4A42]">Manage hotel subscription plans and billing</p>
          </div>
          <button className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer">
            ➕ Create New Subscription
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card rounded-2xl p-6 card-hover border border-gray-200 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{stat.icon}</div>
              <span className={`text-3xl font-bold ${
                stat.color === 'blue' ? 'text-blue-600' :
                stat.color === 'purple' ? 'text-purple-600' :
                stat.color === 'red' ? 'text-red-600' :
                'text-green-600'
              }`}>
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-[#2D4A42] font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="glass-card rounded-2xl p-2 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All', icon: '📊' },
            { id: 'active', label: 'Active', icon: '✓' },
            { id: 'trial', label: 'Trial', icon: '🎯' },
            { id: 'expired', label: 'Expired', icon: '⚠️' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'glass hover:bg-gray-50 text-[#1A2E2B]'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="glass-card rounded-2xl p-6 slide-up">
        <h2 className="text-2xl font-bold gradient-text mb-6">📋 Active Subscriptions</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Tenant</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Plan</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Users</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Price/Month</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Renewal Date</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="font-semibold text-[#1A2E2B]">{sub.tenant}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-blue-600">{sub.plan}</span>
                  </td>
                  <td className="py-4 px-4 text-[#2D4A42]">{sub.users}</td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-[#1A2E2B]">${sub.price}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : sub.status === 'trial'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#2D4A42]">{sub.renewal}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="glass px-3 py-1 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600 cursor-pointer">
                        👁️ View
                      </button>
                      {sub.status === 'expired' && (
                        <button 
                          onClick={() => handleRenew(sub.id)}
                          disabled={isProcessing}
                          className="btn-primary px-3 py-1 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
                        >
                          🔄 Renew
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 slide-up" style={{ animationDelay: '0.3s' }}>
        {[
          { name: 'Starter', price: 99, features: ['Up to 30 Rooms', 'Basic Reporting', 'Standard Support', '5 Users'], popular: false },
          { name: 'Professional', price: 299, features: ['Up to 100 Rooms', 'Advanced Analytics', 'Priority Support', '25 Users', 'API Access'], popular: true },
          { name: 'Enterprise', price: 499, features: ['Unlimited Rooms', 'Custom Integrations', '24/7 Support', 'Unlimited Users', 'White Label'], popular: false }
        ].map((plan, index) => (
          <div key={index} className={`glass-card rounded-2xl p-6 card-hover border-2 ${
            plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
          }`}>
            {plan.popular && (
              <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                MOST POPULAR
              </div>
            )}
            <h3 className="text-2xl font-bold text-[#1A2E2B] mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold gradient-text">${plan.price}</span>
              <span className="text-[#2D4A42]">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[#1A2E2B]">
                  <span className="text-green-500">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl font-semibold cursor-pointer ${
              plan.popular 
                ? 'btn-primary text-white' 
                : 'glass hover:bg-gray-50 text-[#1A2E2B]'
            }`}>
              {plan.popular ? '✓ Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
