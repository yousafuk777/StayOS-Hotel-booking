'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffPage() {
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  const staff = [
    { id: 1, name: 'Maria Garcia', role: 'Housekeeping Manager', email: 'maria.g@hotel.com', phone: '+1 234 567 8901', status: 'active', avatar: 'MG' },
    { id: 2, name: 'John Doe', role: 'Front Desk Supervisor', email: 'john.d@hotel.com', phone: '+1 234 567 8902', status: 'active', avatar: 'JD' },
    { id: 3, name: 'Sarah Miller', role: 'Concierge', email: 'sarah.m@hotel.com', phone: '+1 234 567 8903', status: 'active', avatar: 'SM' },
    { id: 4, name: 'Mike Johnson', role: 'Maintenance', email: 'mike.j@hotel.com', phone: '+1 234 567 8904', status: 'on_leave', avatar: 'MJ' },
    { id: 5, name: 'Emily Davis', role: 'Restaurant Manager', email: 'emily.d@hotel.com', phone: '+1 234 567 8905', status: 'active', avatar: 'ED' },
  ]

  const STATUS_CONFIG: any = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    on_leave: { label: 'On Leave', color: 'bg-yellow-100 text-yellow-700' },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600' },
  }

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
                <h1 className="text-3xl font-bold gradient-text">Staff Management</h1>
                <p className="text-sm text-gray-600">Manage hotel employees and roles</p>
              </div>
            </div>
            
            <button 
              onClick={() => alert('Add Staff Member form coming soon!')}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span>
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Staff', value: '48', icon: '👥', change: '+3 this month' },
            { label: 'Active Now', value: '42', icon: '✓', change: 'Currently working' },
            { label: 'On Leave', value: '4', icon: '🏖️', change: 'Expected back soon' },
            { label: 'New Hires', value: '6', icon: '🎉', change: 'This quarter' },
          ].map((stat, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 card-hover slide-up" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 font-medium mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                </div>
                <div className="text-5xl float">{stat.icon}</div>
              </div>
              <p className="text-sm text-gray-600">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All Staff' },
                { id: 'active', label: 'Active' },
                { id: 'on_leave', label: 'On Leave' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <input
              type="search"
              placeholder="Search staff..."
              className="input-field px-4 py-2 rounded-xl w-64 focus:outline-none"
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="glass-card rounded-2xl p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">ID: EMP-{String(member.id).padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{member.role}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{member.email}</div>
                        <div className="text-gray-600">{member.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[member.status].color}`}>
                        {STATUS_CONFIG[member.status].label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600">
                          👁️ View
                        </button>
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-600">
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
