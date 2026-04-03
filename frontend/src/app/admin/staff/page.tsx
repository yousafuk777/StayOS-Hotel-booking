'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'

export default function StaffPage() {
  const [filter, setFilter] = useState('all')
  const [staffFilter, setStaffFilter] = useState<'all' | 'active' | 'on_leave' | 'new_hires'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  
  // Initialize staff from localStorage or use defaults
  const [staff, setStaff] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedStaff = localStorage.getItem('staff')
      if (storedStaff) {
        try {
          const parsed = JSON.parse(storedStaff)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        } catch (e) {
          console.error('Error loading staff from localStorage:', e)
        }
      }
    }
    // Default staff
    return [
      { id: 1, name: 'Maria Garcia', role: 'Housekeeping Manager', email: 'maria.g@hotel.com', phone: '+1 234 567 8901', status: 'active', avatar: 'MG' },
      { id: 2, name: 'John Doe', role: 'Front Desk Supervisor', email: 'john.d@hotel.com', phone: '+1 234 567 8902', status: 'active', avatar: 'JD' },
      { id: 3, name: 'Sarah Miller', role: 'Concierge', email: 'sarah.m@hotel.com', phone: '+1 234 567 8903', status: 'active', avatar: 'SM' },
      { id: 4, name: 'Mike Johnson', role: 'Maintenance', email: 'mike.j@hotel.com', phone: '+1 234 567 8904', status: 'on_leave', avatar: 'MJ' },
      { id: 5, name: 'Emily Davis', role: 'Restaurant Manager', email: 'emily.d@hotel.com', phone: '+1 234 567 8905', status: 'active', avatar: 'ED' },
    ]
  })
  
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Front Desk Agent',
    email: '',
    phone: '',
    status: 'active'
  })
  
  const [editStaffData, setEditStaffData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: ''
  })
  
  const router = useRouter()
  
  // Save staff to localStorage whenever they change
  useEffect(() => {
    console.log('Saving staff to localStorage:', staff.length, 'members')
    localStorage.setItem('staff', JSON.stringify(staff))
  }, [staff])

  const STATUS_CONFIG: any = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    on_leave: { label: 'On Leave', color: 'bg-yellow-100 text-yellow-700' },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-[#2D4A42]' },
  }

  // Calculate dynamic stats from actual staff data
  const calculateStaffStats = () => {
    const totalStaff = staff.length
    const activeStaff = staff.filter(member => member.status === 'active').length
    const onLeaveStaff = staff.filter(member => member.status === 'on_leave').length
    const inactiveStaff = staff.filter(member => member.status === 'inactive').length

    // Calculate new hires this quarter (simplified - staff with IDs > 10 are considered new)
    const newHires = staff.filter(member => member.id > 10).length

    return {
      totalStaff,
      activeStaff,
      onLeaveStaff,
      newHires
    }
  }

  const stats = calculateStaffStats()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-card border-b border-gray-200 mb-8">
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
                <p className="text-sm text-[#2D4A42]">Manage hotel employees and roles</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
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
          <StatCard
            label="Total Staff"
            value={stats.totalStaff}
            icon="👥"
            color="blue"
            subtext="Current headcount"
            onClick={() => setStaffFilter('all')}
            isActive={staffFilter === 'all'}
          />
          <StatCard
            label="Active Now"
            value={stats.activeStaff}
            icon="✓"
            color="green"
            subtext="Currently working"
            onClick={() => setStaffFilter('active')}
            isActive={staffFilter === 'active'}
          />
          <StatCard
            label="On Leave"
            value={stats.onLeaveStaff}
            icon="🏖️"
            color="orange"
            subtext="Expected back soon"
            onClick={() => setStaffFilter('on_leave')}
            isActive={staffFilter === 'on_leave'}
          />
          <StatCard
            label="New Hires"
            value={stats.newHires}
            icon="🎉"
            color="purple"
            subtext="Recent additions"
            onClick={() => setStaffFilter('new_hires')}
            isActive={staffFilter === 'new_hires'}
          />
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
                  onClick={() => setStaffFilter(item.id as any)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    staffFilter === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-50 text-[#1A2E2B]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <input
              type="search"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Employee</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Contact</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  // Filter staff based on staffFilter and search
                  const filteredStaff = staff.filter(member => {
                    // Status filter from stat cards
                    if (staffFilter === 'active' && member.status !== 'active') return false
                    if (staffFilter === 'on_leave' && member.status !== 'on_leave') return false
                    if (staffFilter === 'new_hires' && member.id <= 10) return false // New hires have IDs > 10
                    
                    // Search filter
                    if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
                        !member.role.toLowerCase().includes(searchQuery.toLowerCase()) &&
                        !member.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
                    
                    return true
                  })
                  
                  if (filteredStaff.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-[#2D4A42]">
                          👥 No staff members found
                        </td>
                      </tr>
                    )
                  }
                  
                  return filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A2E2B]">{member.name}</p>
                          <p className="text-sm text-[#2D4A42]">ID: EMP-{String(member.id).padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#1A2E2B]">{member.role}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-[#1A2E2B]">{member.email}</div>
                        <div className="text-[#2D4A42]">{member.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[member.status].color}`}>
                        {STATUS_CONFIG[member.status].label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => {
                          setSelectedStaff(member)
                          setEditStaffData({
                            name: member.name,
                            role: member.role,
                            email: member.email,
                            phone: member.phone,
                            status: member.status
                          })
                          setShowEditModal(true)
                        }}>
                          👁️ View
                        </button>
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-[#2D4A42]" onClick={() => {
                          setSelectedStaff(member)
                          setEditStaffData({
                            name: member.name,
                            role: member.role,
                            email: member.email,
                            phone: member.phone,
                            status: member.status
                          })
                          setShowEditModal(true)
                        }}>
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Add Staff Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">➕ Add Staff Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const staffMember = {
                id: staff.length + 1,
                name: newStaff.name,
                role: newStaff.role,
                email: newStaff.email,
                phone: newStaff.phone,
                status: newStaff.status,
                avatar: newStaff.name.split(' ').map(n => n[0]).join('').toUpperCase()
              }
              setStaff([...staff, staffMember])
              // Staff member added successfully
              setShowAddModal(false)
              setNewStaff({ name: '', role: 'Front Desk Agent', email: '', phone: '', status: 'active' })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="e.g., John Smith"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Role / Position *</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Front Desk Agent">Front Desk Agent</option>
                    <option value="Front Desk Supervisor">Front Desk Supervisor</option>
                    <option value="Housekeeping Staff">Housekeeping Staff</option>
                    <option value="Housekeeping Manager">Housekeeping Manager</option>
                    <option value="Concierge">Concierge</option>
                    <option value="Restaurant Manager">Restaurant Manager</option>
                    <option value="Restaurant Staff">Restaurant Staff</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      placeholder="john@hotel.com"
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Employment Status *</label>
                  <select
                    value={newStaff.status}
                    onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold"
                  >
                    ✓ Add Staff Member
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Staff Member Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">✏️ Edit Staff Member</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const updatedStaff = staff.map(member => 
                member.id === selectedStaff.id ? {
                  ...member,
                  name: editStaffData.name,
                  role: editStaffData.role,
                  email: editStaffData.email,
                  phone: editStaffData.phone,
                  status: editStaffData.status,
                  avatar: editStaffData.name.split(' ').map(n => n[0]).join('').toUpperCase()
                } : member
              )
              setStaff(updatedStaff)
              // Staff member updated successfully
              setShowEditModal(false)
              setSelectedStaff(null)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={editStaffData.name}
                    onChange={(e) => setEditStaffData({ ...editStaffData, name: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Role / Position *</label>
                  <select
                    value={editStaffData.role}
                    onChange={(e) => setEditStaffData({ ...editStaffData, role: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Front Desk Agent">Front Desk Agent</option>
                    <option value="Front Desk Supervisor">Front Desk Supervisor</option>
                    <option value="Housekeeping Staff">Housekeeping Staff</option>
                    <option value="Housekeeping Manager">Housekeeping Manager</option>
                    <option value="Concierge">Concierge</option>
                    <option value="Restaurant Manager">Restaurant Manager</option>
                    <option value="Restaurant Staff">Restaurant Staff</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={editStaffData.email}
                      onChange={(e) => setEditStaffData({ ...editStaffData, email: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={editStaffData.phone}
                      onChange={(e) => setEditStaffData({ ...editStaffData, phone: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Employment Status *</label>
                  <select
                    value={editStaffData.status}
                    onChange={(e) => setEditStaffData({ ...editStaffData, status: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold"
                  >
                    ✓ Update Staff Member
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
