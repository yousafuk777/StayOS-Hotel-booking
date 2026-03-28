'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'

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
  const [guestsFilter, setGuestsFilter] = useState<'all' | 'vip' | 'frequent' | 'avg_spend'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [guestMessage, setGuestMessage] = useState('')
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
    
    // Guest added successfully
  }

  const handleViewProfile = (guest: Guest) => {
    setSelectedGuest(guest)
    setShowProfileModal(true)
  }

  const handleMessageGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setGuestMessage('')
    setShowMessageModal(true)
  }

  const handleSendMessage = () => {
    if (guestMessage.trim() && selectedGuest) {
      console.log(`Message sent to ${selectedGuest.name}: ${guestMessage}`)
      setGuestMessage('')
      setShowMessageModal(false)
      // Message sent successfully
    }
  }

  const calculateGuestStats = () => {
    const totalGuests = guests.length
    const vipGuests = guests.filter((g) => g.vip).length
    const frequentGuests = guests.filter((g) => g.stays >= 10).length
    const averageSpend = guests.length > 0 ? Math.round(guests.reduce((sum, g) => sum + g.totalSpent, 0) / guests.length) : 0

    return {
      totalGuests,
      vipGuests,
      frequentGuests,
      averageSpend,
    }
  }

  const stats = calculateGuestStats()

  const filteredGuests = guests.filter((guest) => {
    // Filter from stat cards
    if (guestsFilter === 'vip' && !guest.vip) return false
    if (guestsFilter === 'frequent' && guest.stays < 10) return false
    if (guestsFilter === 'avg_spend') {
      // For avg spend, show guests above average spend
      const avgSpend = stats.averageSpend
      if (guest.totalSpent < avgSpend) return false
    }

    const query = searchQuery.toLowerCase().trim()
    if (query === '') return true

    return (
      guest.name.toLowerCase().includes(query) ||
      guest.email.toLowerCase().includes(query) ||
      guest.phone.toLowerCase().includes(query)
    )
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-card border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-col md:flex-row gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => router.push('/admin')}
                className="glass p-3 rounded-xl hover:bg-gray-50 transition-all flex-shrink-0"
              >
                <span className="text-xl">←</span>
              </button>
              <div className="flex-1 md:flex-none">
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">Guest Management</h1>
                <p className="text-xs md:text-sm text-gray-600">View and manage all guests</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-4 md:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
            >
              <span>➕</span>
              <span>Add Guest</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            label="Total Guests"
            value={stats.totalGuests}
            icon="👥"
            color="blue"
            subtext={`${stats.totalGuests > 0 ? `+${Math.max(0, stats.totalGuests - 5)} this month` : 'No change'}`}
            onClick={() => setGuestsFilter('all')}
            isActive={guestsFilter === 'all'}
          />
          <StatCard
            label="VIP Members"
            value={stats.vipGuests}
            icon="⭐"
            color="purple"
            subtext={`${stats.totalGuests > 0 ? `${Math.round((stats.vipGuests / stats.totalGuests) * 100)}% of total` : '0% of total'}`}
            onClick={() => setGuestsFilter('vip')}
            isActive={guestsFilter === 'vip'}
          />
          <StatCard
            label="Frequent Guests"
            value={stats.frequentGuests}
            icon="🏨"
            color="green"
            subtext="Stay 10+ nights"
            onClick={() => setGuestsFilter('frequent')}
            isActive={guestsFilter === 'frequent'}
          />
          <StatCard
            label="Avg. Spend"
            value={`$${stats.averageSpend}`}
            icon="💰"
            color="orange"
            subtext="Per guest"
            onClick={() => setGuestsFilter('avg_spend')}
            isActive={guestsFilter === 'avg_spend'}
          />
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 md:p-6 mb-8">
          <div className="flex items-center justify-between flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              {[
                { id: 'all', label: 'All Guests' },
                { id: 'vip', label: 'VIP Only' },
                { id: 'frequent', label: 'Frequent' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-3 md:px-4 py-2 rounded-xl font-medium text-sm transition-all ${
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="search"
              placeholder="Search guests..."
              className="input-field px-4 py-2 rounded-xl w-full md:w-64 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Guests Table */}
        <div className="glass-card rounded-2xl p-4 md:p-8">
          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Contact</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Total Stays</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Total Spent</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Last Visit</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      👥 No guests found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{guest.name}</p>
                            {guest.vip && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">VIP</span>}
                          </div>
                          <p className="text-xs text-gray-600">Guest ID: GST-{String(guest.id).padStart(5, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs md:text-sm">
                        <div className="text-gray-900">{guest.email}</div>
                        <div className="text-gray-600">{guest.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{guest.stays} stays</td>
                    <td className="py-4 px-4">
                      <p className="font-semibold gradient-text text-sm">${guest.totalSpent.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{guest.lastVisit}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <button className="glass px-2 md:px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-xs md:text-sm font-medium text-blue-600" onClick={() => handleViewProfile(guest)}>
                          👁️
                        </button>
                        <button className="glass px-2 md:px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-xs md:text-sm font-medium text-gray-600" onClick={() => {
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
                          ✏️
                        </button>
                        <button className="glass px-2 md:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all text-xs md:text-sm font-medium text-gray-600" onClick={() => handleMessageGuest(guest)}>
                          📧
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Card List */}
          <div className="md:hidden space-y-4">
            {filteredGuests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                👥 No guests found matching your filters
              </div>
            ) : (
              filteredGuests.map((guest) => (
                <div key={guest.id} className="glass p-4 rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{guest.name}</p>
                          {guest.vip && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">VIP</span>}
                        </div>
                        <p className="text-xs text-gray-600">GST-{String(guest.id).padStart(5, '0')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900 font-medium">{guest.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-gray-900 font-medium">{guest.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stays:</span>
                      <span className="text-gray-900 font-medium">{guest.stays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="gradient-text font-semibold">${guest.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Visit:</span>
                      <span className="text-gray-900 font-medium">{guest.lastVisit}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 glass px-3 py-2 rounded-lg hover:bg-blue-50 transition-all text-xs font-medium text-blue-600" onClick={() => handleViewProfile(guest)}>
                      👁️ Profile
                    </button>
                    <button className="flex-1 glass px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-xs font-medium text-gray-600" onClick={() => {
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
                    <button className="flex-1 glass px-3 py-2 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium text-gray-600" onClick={() => handleMessageGuest(guest)}>
                      📧 Msg
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">Add New Guest</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    <span className="font-medium text-gray-700 text-sm">Mark as VIP Guest</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 flex-col md:flex-row">
                <button
                  type="submit"
                  className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg cursor-pointer hover:scale-105 transition-transform w-full md:w-auto"
                >
                  ✓ Add Guest
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="glass px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:bg-gray-50 transition-all cursor-pointer w-full md:w-auto"
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
          <div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">Guest Profile</h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 md:gap-6 pb-6 border-b border-gray-200">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl md:text-4xl flex-shrink-0">
                  {selectedGuest.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{selectedGuest.name}</h3>
                  <p className="text-gray-600 text-sm md:text-base">Guest ID: GST-{String(selectedGuest.id).padStart(5, '0')}</p>
                  {selectedGuest.vip && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full inline-block mt-2">
                      ⭐ VIP Member
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Email Address</p>
                  <p className="font-semibold text-gray-900 text-sm">{selectedGuest.email}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-900 text-sm">{selectedGuest.phone}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Total Stays</p>
                  <p className="font-bold text-xl md:text-2xl gradient-text">{selectedGuest.stays}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="font-bold text-xl md:text-2xl gradient-text">${selectedGuest.totalSpent.toLocaleString()}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Last Visit</p>
                  <p className="font-semibold text-gray-900 text-sm">{selectedGuest.lastVisit}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Member Since</p>
                  <p className="font-semibold text-gray-900 text-sm">2024</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200 flex-col md:flex-row">
                <button
                  onClick={() => {
                    handleMessageGuest(selectedGuest)
                    setShowProfileModal(false)
                  }}
                  className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base cursor-pointer w-full md:w-auto"
                >
                  📧 Send Message
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="glass px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base hover:bg-gray-50 transition-all cursor-pointer w-full md:w-auto"
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
          <div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">✏️ Edit Guest Information</h2>
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
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={editGuestData.email}
                      onChange={(e) => setEditGuestData({ ...editGuestData, email: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={editGuestData.phone}
                      onChange={(e) => setEditGuestData({ ...editGuestData, phone: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Stays *</label>
                    <input
                      type="number"
                      value={editGuestData.stays}
                      onChange={(e) => setEditGuestData({ ...editGuestData, stays: parseInt(e.target.value) })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

                <div className="pt-4 flex gap-3 flex-col md:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all text-sm md:text-base"
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

      {/* Message Guest Modal */}
      {showMessageModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold gradient-text">📧 Send Message</h2>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Recipient Info */}
              <div className="glass p-4 rounded-xl border border-gray-200">
                <p className="text-xs md:text-sm text-gray-600 mb-2">To:</p>
                <p className="font-semibold text-gray-900 text-sm md:text-base">{selectedGuest.name}</p>
                <p className="text-xs md:text-sm text-gray-600">{selectedGuest.email}</p>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  rows={5}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">{guestMessage.length} characters</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 flex-col md:flex-row">
                <button
                  onClick={handleSendMessage}
                  disabled={!guestMessage.trim()}
                  className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base cursor-pointer hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                >
                  ✓ Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="glass px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base hover:bg-gray-50 transition-all cursor-pointer w-full md:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
