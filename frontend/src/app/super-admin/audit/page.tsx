'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuditLogsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('7')

  const auditLogs = [
    { id: 1, action: 'User Login', user: 'admin@grandplaza.com', entity: 'System', entityId: '-', timestamp: '2024-03-28 14:32:15', ip: '192.168.1.100', status: 'success', details: 'Successful login from web browser' },
    { id: 2, action: 'Booking Created', user: 'reception@hotel.com', entity: 'Booking', entityId: 'BK-2024-001', timestamp: '2024-03-28 14:28:42', ip: '192.168.1.105', status: 'success', details: 'New booking created for Room 305' },
    { id: 3, action: 'Payment Processed', user: 'system', entity: 'Payment', entityId: 'PAY-2024-456', timestamp: '2024-03-28 14:25:18', ip: '10.0.0.50', status: 'success', details: 'Payment of $1,250 processed via Stripe' },
    { id: 4, action: 'User Role Changed', user: 'superadmin@stayos.com', entity: 'User', entityId: 'USR-789', timestamp: '2024-03-28 14:20:33', ip: '192.168.1.10', status: 'success', details: 'Changed role from Staff to Manager' },
    { id: 5, action: 'Failed Login Attempt', user: 'unknown@test.com', entity: 'System', entityId: '-', timestamp: '2024-03-28 14:15:07', ip: '203.0.113.45', status: 'failed', details: 'Invalid password - 3rd attempt' },
    { id: 6, action: 'Room Status Updated', user: 'housekeeping@hotel.com', entity: 'Room', entityId: 'RM-205', timestamp: '2024-03-28 14:10:22', ip: '192.168.1.110', status: 'success', details: 'Changed status from Dirty to Clean' },
  ]

  const filteredLogs = auditLogs.filter(log => {
    if (activeFilter !== 'all' && log.status !== activeFilter) return false
    if (searchQuery && !log.user.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !log.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.entity.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const stats = [
    { label: 'Total Events', value: '15,847', change: '+12%', icon: '📊', color: 'blue' },
    { label: 'Success Rate', value: '98.5%', change: '+0.3%', icon: '✓', color: 'green' },
    { label: 'Failed Attempts', value: '237', change: '-5%', icon: '✕', color: 'red' },
    { label: 'Security Alerts', value: '12', change: '-2', icon: '⚠️', color: 'yellow' }
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">📋 Audit Logs</h1>
            <p className="text-gray-600">Complete system activity trail and compliance tracking</p>
          </div>
          <div className="flex gap-3">
            <button className="glass px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-all">📥 Export Logs</button>
            <button className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer">🔍 Advanced Search</button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card rounded-2xl p-6 card-hover border border-gray-200 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{stat.icon}</div>
              <span className={`text-2xl font-bold ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'red' ? 'text-red-600' : 'text-yellow-600'}`}>{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-1">{stat.label}</p>
            <p className={`text-xs font-semibold ${stat.change.startsWith('+') || stat.change.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>{stat.change} from last week</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 mb-6 slide-up">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Events', icon: '📊' },
              { id: 'success', label: 'Success', icon: '✓' },
              { id: 'failed', label: 'Failed', icon: '✕' }
            ].map((filter) => (
              <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeFilter === filter.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'glass hover:bg-gray-50 text-gray-700'}`}>
                <span>{filter.icon}</span><span>{filter.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <select className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none cursor-pointer">
              <option>All Actions</option>
              <option>User Login</option>
              <option>Booking Created</option>
              <option>Payment Processed</option>
              <option>Settings Modified</option>
            </select>

            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none cursor-pointer">
              <option value="1">Last 24 Hours</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>

            <input type="search" placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none w-64" />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-card rounded-2xl p-6 slide-up">
        <h2 className="text-2xl font-bold gradient-text mb-6">📜 Recent Activity</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Action</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Entity</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Timestamp</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">IP Address</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500 max-w-xs truncate">{log.details}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">{log.user.charAt(0).toUpperCase()}</div>
                      <span className="text-sm text-gray-700 font-mono">{log.user}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div><p className="font-semibold text-gray-900">{log.entity}</p><p className="text-xs text-gray-500 font-mono">{log.entityId}</p></div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{log.timestamp}</td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-mono">{log.ip}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status.toUpperCase()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="glass px-3 py-1 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600 cursor-pointer">👁️ Details</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">Showing <span className="font-semibold">1-6</span> of <span className="font-semibold">15,847</span> results</p>
          <div className="flex gap-2">
            <button className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50" disabled>← Previous</button>
            <button className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">Next →</button>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="glass-card rounded-2xl p-6 mt-8 slide-up">
        <h2 className="text-2xl font-bold gradient-text mb-6">⚠️ Security Alerts</h2>
        
        <div className="space-y-4">
          {[
            { severity: 'high', title: 'Multiple Failed Login Attempts', description: 'IP 203.0.113.45 has 15 failed login attempts in the last hour', time: '15 minutes ago', action: 'Block IP' },
            { severity: 'medium', title: 'Unusual Data Export Activity', description: 'User admin@grandplaza.com exported 5 large reports in 10 minutes', time: '1 hour ago', action: 'Review' },
            { severity: 'low', title: 'Password Change Required', description: '12 users have passwords expiring in 7 days', time: '3 hours ago', action: 'Notify' },
          ].map((alert, index) => (
            <div key={index} className={`glass rounded-xl p-5 border-l-4 ${alert.severity === 'high' ? 'border-l-red-500' : alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`text-2xl ${alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`}>⚠️</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{alert.title}</h3>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-2">🕐 {alert.time}</p>
                  </div>
                </div>
                <button className={`px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer ${alert.severity === 'high' ? 'bg-red-100 text-red-700 hover:bg-red-200' : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>{alert.action}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4 mt-8 slide-up">
        <button className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer">📊 Generate Compliance Report</button>
        <button className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer">🔔 Configure Alerts</button>
        <button className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer text-red-600 border border-red-200">🗑️ Clear Old Logs</button>
      </div>
    </div>
  )
}
