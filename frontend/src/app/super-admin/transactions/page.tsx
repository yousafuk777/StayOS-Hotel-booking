'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TransactionsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('30')

  const transactions = [
    { id: 'TXN001', tenant: 'Grand Plaza Hotel', type: 'Payment', amount: 2450.00, status: 'completed', date: '2024-03-28', method: 'Credit Card', reference: 'INV-2024-001' },
    { id: 'TXN002', tenant: 'Seaside Resort', type: 'Refund', amount: -350.00, status: 'pending', date: '2024-03-27', method: 'Bank Transfer', reference: 'REF-2024-045' },
    { id: 'TXN003', tenant: 'City Inn', type: 'Payment', amount: 899.00, status: 'completed', date: '2024-03-26', method: 'PayPal', reference: 'INV-2024-002' },
    { id: 'TXN004', tenant: 'Mountain View Lodge', type: 'Payment', amount: 1599.00, status: 'completed', date: '2024-03-25', method: 'Credit Card', reference: 'INV-2024-003' },
    { id: 'TXN005', tenant: 'Downtown Suites', type: 'Chargeback', amount: -499.00, status: 'failed', date: '2024-03-24', method: 'Credit Card', reference: 'CHB-2024-012' },
    { id: 'TXN006', tenant: 'Airport Hotel', type: 'Payment', amount: 3200.00, status: 'completed', date: '2024-03-23', method: 'Bank Transfer', reference: 'INV-2024-004' },
  ]

  const filteredTransactions = transactions.filter(txn => {
    if (activeFilter !== 'all' && txn.status !== activeFilter) return false
    if (searchQuery && !txn.tenant.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !txn.reference.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const stats = [
    { label: 'Total Revenue', value: '$45,280', change: '+12.5%', icon: '💰', color: 'green' },
    { label: 'Pending', value: '$1,250', change: '-3.2%', icon: '⏳', color: 'yellow' },
    { label: 'Refunds', value: '$2,890', change: '+5.1%', icon: '↩️', color: 'red' },
    { label: 'Transactions', value: '156', change: '+8.3%', icon: '📊', color: 'blue' }
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">💰 Transaction History</h1>
            <p className="text-[#2D4A42]">Monitor all financial transactions and payments</p>
          </div>
          <button className="glass px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-all">
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card rounded-2xl p-6 card-hover border border-gray-200 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{stat.icon}</div>
              <span className={`text-2xl font-bold ${
                stat.color === 'green' ? 'text-green-600' :
                stat.color === 'yellow' ? 'text-yellow-600' :
                stat.color === 'red' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-[#2D4A42] font-semibold mb-1">{stat.label}</p>
            <p className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 mb-6 slide-up">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All', icon: '📊' },
              { id: 'completed', label: 'Completed', icon: '✓' },
              { id: 'pending', label: 'Pending', icon: '⏳' },
              { id: 'failed', label: 'Failed', icon: '✕' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
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

          <div className="flex gap-3 flex-wrap">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="glass px-4 py-2 rounded-xl text-[#1A2E2B] focus:outline-none cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>

            <input
              type="search"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass px-4 py-2 rounded-xl text-[#1A2E2B] focus:outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-2xl p-6 slide-up">
        <h2 className="text-2xl font-bold gradient-text mb-6">📋 Recent Transactions</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Transaction ID</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Tenant</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Type</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Amount</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Method</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Date</th>
                <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm font-semibold text-blue-600">{txn.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-[#1A2E2B]">{txn.tenant}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      txn.type === 'Payment'
                        ? 'bg-green-100 text-green-700'
                        : txn.type === 'Refund'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#2D4A42]">{txn.method}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      txn.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : txn.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#2D4A42]">{txn.date}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="glass px-3 py-1 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600 cursor-pointer">
                        👁️ Details
                      </button>
                      <button className="glass px-3 py-1 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-[#2D4A42] cursor-pointer">
                        📄 Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-8 mt-8 slide-up">
        <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="glass p-6 rounded-xl card-hover text-left group">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl group-hover:scale-110 transition-transform">💳</div>
              <span className="font-semibold text-[#1A2E2B]">Process Payment</span>
            </div>
            <p className="text-sm text-[#2D4A42]">Manual payment entry</p>
          </button>

          <button className="glass p-6 rounded-xl card-hover text-left group">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl group-hover:scale-110 transition-transform">↩️</div>
              <span className="font-semibold text-[#1A2E2B]">Issue Refund</span>
            </div>
            <p className="text-sm text-[#2D4A42]">Process refund request</p>
          </button>

          <button className="glass p-6 rounded-xl card-hover text-left group">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl group-hover:scale-110 transition-transform">📊</div>
              <span className="font-semibold text-[#1A2E2B]">Generate Report</span>
            </div>
            <p className="text-sm text-[#2D4A42]">Financial analytics</p>
          </button>

          <button className="glass p-6 rounded-xl card-hover text-left group">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl group-hover:scale-110 transition-transform">🔍</div>
              <span className="font-semibold text-[#1A2E2B]">Dispute Mgmt</span>
            </div>
            <p className="text-sm text-[#2D4A42]">Handle chargebacks</p>
          </button>
        </div>
      </div>
    </div>
  )
}
