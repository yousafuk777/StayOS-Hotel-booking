'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Guest {
  id: number
  name: string
  email: string
  phone: string
  stays: number
  totalSpent: number
  lastVisit: string
  vip: boolean
}

export default function GuestsPage() {
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const router = useRouter()
  
  // Initialize guests from localStorage or use defaults
  const [guests, setGuests] = useState<Guest[]>(() => {
    if (typeof window !== 'undefined') {
      const storedGuests = localStorage.getItem('guests')
      if (storedGuests) {
        try {
          const parsed = JSON.parse(storedGuests)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        } catch (e) {
          console.error('Error loading guests from localStorage:', e)
        }
      }
    }
    return [
      { id: 1, name: 'Robert Taylor', email: 'robert.t@email.com', phone: '+1 555 123 4567', stays: 12, totalSpent: 8450, lastVisit: '2026-03-20', vip: true },
      { id: 2, name: 'Linda Martinez', email: 'linda.m@email.com', phone: '+1 555 234 5678', stays: 8, totalSpent: 5200, lastVisit: '2026-03-18', vip: false },
      { id: 3, name: 'William Anderson', email: 'william.a@email.com', phone: '+1 555 345 6789', stays: 15, totalSpent: 12300, lastVisit: '2026-03-22', vip: true },
      { id: 4, name: 'Patricia White', email: 'patricia.w@email.com', phone: '+1 555 456 7890', stays: 5, totalSpent: 2800, lastVisit: '2026-03-15', vip: false },
      { id: 5, name: 'Charles Harris', email: 'charles.h@email.com', phone: '+1 555 567 8901', stays: 20, totalSpent: 18500, lastVisit: '2026-03-23', vip: true },
    ]
  })
  
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    stays: 0,
    totalSpent: 0,
    vip: false
  })
  
  const [editGuestData, setEditGuestData] = useState({
    name: '',
    email: '',
    phone: '',
    stays: 0,
    totalSpent: 0,
    vip: false
  })
  
  // Save guests to localStorage whenever they change
  useEffect(() => {
    console.log('Saving guests to localStorage:', guests.length, 'guests')
    localStorage.setItem('guests', JSON.stringify(guests))
  }, [guests])

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault()
    
    const guest: Guest = {
      id: guests.length + 1,
      name: newGuest.name,
      email: newGuest.email,
      phone: newGuest.phone,
      stays: newGuest.stays,
      totalSpent: newGuest.totalSpent,
      lastVisit: new Date().toISOString().split('T')[0],
      vip: newGuest.vip
    }

    setGuests([...guests, guest])
    setNewGuest({
      name: '',
      email: '',
      phone: '',
      stays: 0,
      totalSpent: 0,
      vip: false
    })
    setShowAddModal(false)
    
    // Show success notification
    alert(`Guest "${guest.name}" added successfully!`)
  }

  const handleViewProfile = (guest: Guest) => {
    setSelectedGuest(guest)
    setShowProfileModal(true)
  }

  const handleMessageGuest = (guest: Guest) => {
    const message = prompt(`Compose message to ${guest.name}:`);
    if (message) {
      alert(`Message sent to ${guest.email}!\n\nSubject: Message from Hotel\nBody: ${message}`);
    }
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
                <h1 className="text-3xl font-bold gradient-text">Guest Management</h1>
                <p className="text-sm text-gray-600">View and manage all guests</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span>
              <span>Add Guest</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Guests', value: '2,847', icon: '👥', change: '+128 this month' },
            { label: 'VIP Members', value: '342', icon: '⭐', change: '12% of total' },
            { label: 'Active Stays', value: '48', icon: '🏨', change: 'Currently staying' },
            { label: 'Avg. Spend', value: '$425', icon: '💰', change: 'Per stay' },
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
                { id: 'all', label: 'All Guests' },
                { id: 'vip', label: 'VIP Only' },
                { id: 'frequent', label: 'Frequent' },
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
              placeholder="Search guests..."
              className="input-field px-4 py-2 rounded-xl w-64 focus:outline-none"
            />
          </div>
        </div>

        {/* Guests Table */}
        <div className="glass-card rounded-2xl p-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Total Stays</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Total Spent</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Last Visit</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  // Filter guests based on filter and search
                  const filteredGuests = guests.filter(guest => {
                    // Status filter
                    if (filter === 'vip' && !guest.vip) return false
                    if (filter === 'frequent' && guest.stays < 10) return false
                    
                    return true
                  })
                  
                  if (filteredGuests.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-500">
                          👥 No guests found matching your filters
                        </td>
                      </tr>
                    )
                  }
                  
                  return filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{guest.name}</p>
                            {guest.vip && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">VIP</span>}
                          </div>
                          <p className="text-sm text-gray-600">Guest ID: GST-{String(guest.id).padStart(5, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{guest.email}</div>
                        <div className="text-gray-600">{guest.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{guest.stays} stays</td>
                    <td className="py-4 px-4">
                      <p className="font-semibold gradient-text">${guest.totalSpent.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{guest.lastVisit}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => handleViewProfile(guest)}>
                          👁️ Profile
                        </button>
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium text-gray-600" onClick={() => {
                          setSelectedGuest(guest)
                          setEditGuestData({
                            name: guest.name,
                            email: guest.email,
                            phone: guest.phone,
                            stays: guest.stays,
                            totalSpent: guest.totalSpent,
                            vip: guest.vip
                          })
                          setShowEditModal(true)
                        }}>
                          ✏️ Edit
                        </button>
                        <button className="glass px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-600" onClick={() => handleMessageGuest(guest)}>
                          📧 Message
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

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">Add New Guest</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                    placeholder="John Doe"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                    placeholder="john@example.com"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                    placeholder="+1 555 123 4567"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    VIP Status
                  </label>
                  <label className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input 
                      type="checkbox" 
                      checked={newGuest.vip}
                      onChange={(e) => setNewGuest({...newGuest, vip: e.target.checked})}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">Mark as VIP Guest</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer hover:scale-105 transition-transform"
                >
                  ✓ Add Guest
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Profile Modal */}
      {showProfileModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">Guest Profile</h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-4xl">
                  {selectedGuest.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedGuest.name}</h3>
                  <p className="text-gray-600">Guest ID: GST-{String(selectedGuest.id).padStart(5, '0')}</p>
                  {selectedGuest.vip && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full inline-block mt-2">
                      ⭐ VIP Member
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Email Address</p>
                  <p className="font-semibold text-gray-900">{selectedGuest.email}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-900">{selectedGuest.phone}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total Stays</p>
                  <p className="font-bold text-2xl gradient-text">{selectedGuest.stays}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="font-bold text-2xl gradient-text">${selectedGuest.totalSpent.toLocaleString()}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Last Visit</p>
                  <p className="font-semibold text-gray-900">{selectedGuest.lastVisit}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Member Since</p>
                  <p className="font-semibold text-gray-900">2024</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleMessageGuest(selectedGuest)
                    setShowProfileModal(false)
                  }}
                  className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
                >
                  📧 Send Message
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Guest Modal */}
      {showEditModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">✏️ Edit Guest Information</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const updatedGuests = guests.map(g => 
                g.id === selectedGuest.id ? {
                  ...g,
                  name: editGuestData.name,
                  email: editGuestData.email,
                  phone: editGuestData.phone,
                  stays: editGuestData.stays,
                  totalSpent: editGuestData.totalSpent,
                  vip: editGuestData.vip
                } : g
              )
              setGuests(updatedGuests)
              alert(`✅ Guest information updated successfully!\n\nName: ${editGuestData.name}\nEmail: ${editGuestData.email}\nPhone: ${editGuestData.phone}\nStays: ${editGuestData.stays}\nTotal Spent: $${editGuestData.totalSpent.toLocaleString()}\nVIP Status: ${editGuestData.vip ? 'Yes' : 'No'}`)
              setShowEditModal(false)
              setSelectedGuest(null)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={editGuestData.name}
                    onChange={(e) => setEditGuestData({ ...editGuestData, name: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={editGuestData.email}
                      onChange={(e) => setEditGuestData({ ...editGuestData, email: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={editGuestData.phone}
                      onChange={(e) => setEditGuestData({ ...editGuestData, phone: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Stays *</label>
                    <input
                      type="number"
                      value={editGuestData.stays}
                      onChange={(e) => setEditGuestData({ ...editGuestData, stays: parseInt(e.target.value) })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Spent ($) *</label>
                    <input
                      type="number"
                      value={editGuestData.totalSpent}
                      onChange={(e) => setEditGuestData({ ...editGuestData, totalSpent: parseInt(e.target.value) })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="vip-edit"
                    checked={editGuestData.vip}
                    onChange={(e) => setEditGuestData({ ...editGuestData, vip: e.target.checked })}
                    className="w-5 h-5 rounded accent-blue-600"
                  />
                  <label htmlFor="vip-edit" className="text-sm font-semibold text-gray-700">VIP Guest</label>
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
                    ✓ Update Guest
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
