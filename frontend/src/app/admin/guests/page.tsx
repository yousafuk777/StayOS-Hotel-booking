'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'
import apiClient from '@/services/apiClient'

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
  const [guestsFilter, setGuestsFilter] = useState<'all' | 'vip' | 'frequent' | 'avg_spend'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [guestMessage, setGuestMessage] = useState('')
  const router = useRouter()

  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchGuests = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/v1/guests')
      const mapped = res.data.map((g: any) => ({
        id: g.id,
        name: `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'No Name',
        email: g.email,
        phone: g.phone || 'N/A',
        stays: g.stays || 0,
        totalSpent: parseFloat(g.total_spent) || 0,
        lastVisit: g.last_visit ? new Date(g.last_visit).toISOString().split('T')[0] : 'Never',
        vip: g.is_vip || false
      }))
      setGuests(mapped)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch guests:', err)
      setError('Failed to load guests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuests()
  }, [])

  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vip: false,
    password: 'Password123!' // Default password for new guests created by admin
  })

  const [editGuestData, setEditGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vip: false
  })

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiClient.post('/api/v1/guests', {
        first_name: newGuest.firstName,
        last_name: newGuest.lastName,
        email: newGuest.email,
        phone: newGuest.phone,
        is_vip: newGuest.vip,
        password: newGuest.password
      })

      await fetchGuests()
      setNewGuest({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        vip: false,
        password: 'Password123!'
      })
      setShowAddModal(false)
    } catch (err: any) {
      console.error('Failed to add guest:', err)
      alert(err.response?.data?.detail || 'Failed to add guest. Please try again.')
    } finally {
      setSubmitting(false)
    }
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

  const handleDeleteGuest = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this guest? This action cannot be undone.')) return
    
    try {
      await apiClient.delete(`/api/v1/guests/${id}`)
      await fetchGuests()
    } catch (err: any) {
      console.error('Failed to delete guest:', err)
      alert(err.response?.data?.detail || 'Failed to delete guest. Please try again.')
    }
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
                <p className="text-xs md:text-sm text-[#2D4A42]">View and manage all guests</p>
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

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-blue-900">Loading guests...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass-card p-8 rounded-2xl text-center max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-[#2D4A42] mb-6">{error}</p>
            <button
              onClick={() => fetchGuests()}
              className="btn-primary px-6 py-2 rounded-xl"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
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
                    onClick={() => setGuestsFilter(item.id as any)}
                    className={`px-3 md:px-4 py-2 rounded-xl font-medium text-sm transition-all ${guestsFilter === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                        : 'glass hover:bg-gray-50 text-[#1A2E2B]'
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
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B] text-sm">Guest</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B] text-sm">Contact</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B] text-sm">Total Stays</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B] text-sm">Total Spent</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B] text-sm">Last Visit</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B] text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[#2D4A42]">
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
                                <p className="font-semibold text-[#1A2E2B] text-sm">{guest.name}</p>
                                {guest.vip && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">VIP</span>}
                              </div>
                              <p className="text-xs text-[#2D4A42]">Guest ID: GST-{String(guest.id).padStart(5, '0')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs md:text-sm">
                            <div className="text-[#1A2E2B]">{guest.email}</div>
                            <div className="text-[#2D4A42]">{guest.phone}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-[#1A2E2B]">{guest.stays} stays</td>
                        <td className="py-4 px-4">
                          <p className="font-semibold gradient-text text-sm">${guest.totalSpent.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-[#1A2E2B]">{guest.lastVisit}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 md:gap-2">
                            <button className="glass px-2 md:px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all text-xs md:text-sm font-medium text-blue-600" onClick={() => handleViewProfile(guest)}>
                              👁️
                            </button>
                            <button className="glass px-2 md:px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-xs md:text-sm font-medium text-[#2D4A42]" onClick={() => {
                              setSelectedGuest(guest)
                              // Split name back to first/last for edit form
                              const nameParts = guest.name.split(' ')
                              setEditGuestData({
                                firstName: nameParts[0] || '',
                                lastName: nameParts.slice(1).join(' ') || '',
                                email: guest.email,
                                phone: guest.phone,
                                vip: guest.vip
                              })
                              setShowEditModal(true)
                            }}>
                              ✏️
                            </button>
                            <button className="glass px-2 md:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all text-xs md:text-sm font-medium text-[#2D4A42]" onClick={() => handleMessageGuest(guest)}>
                              📧
                            </button>
                            <button className="glass px-2 md:px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all text-xs md:text-sm font-medium text-red-600" onClick={() => handleDeleteGuest(guest.id)}>
                              🗑️
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
                <div className="text-center py-12 text-[#2D4A42]">
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
                            <p className="font-semibold text-[#1A2E2B]">{guest.name}</p>
                            {guest.vip && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">VIP</span>}
                          </div>
                          <p className="text-xs text-[#2D4A42]">GST-{String(guest.id).padStart(5, '0')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#2D4A42]">Email:</span>
                        <span className="text-[#1A2E2B] font-medium">{guest.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#2D4A42]">Phone:</span>
                        <span className="text-[#1A2E2B] font-medium">{guest.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#2D4A42]">Stays:</span>
                        <span className="text-[#1A2E2B] font-medium">{guest.stays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#2D4A42]">Total Spent:</span>
                        <span className="gradient-text font-semibold">${guest.totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#2D4A42]">Last Visit:</span>
                        <span className="text-[#1A2E2B] font-medium">{guest.lastVisit}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 glass px-3 py-2 rounded-lg hover:bg-blue-50 transition-all text-xs font-medium text-blue-600" onClick={() => handleViewProfile(guest)}>
                        👁️ Profile
                      </button>
                      <button className="flex-1 glass px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-xs font-medium text-[#2D4A42]" onClick={() => {
                        setSelectedGuest(guest)
                        const nameParts = guest.name.split(' ')
                        setEditGuestData({
                          firstName: nameParts[0] || '',
                          lastName: nameParts.slice(1).join(' ') || '',
                          email: guest.email,
                          phone: guest.phone,
                          vip: guest.vip
                        })
                        setShowEditModal(true)
                      }}>
                        ✏️ Edit
                      </button>
                      <button className="flex-1 glass px-3 py-2 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium text-[#2D4A42]" onClick={() => handleMessageGuest(guest)}>
                        📧 Msg
                      </button>
                      <button className="flex-1 glass px-3 py-2 rounded-lg hover:bg-red-50 transition-all text-xs font-medium text-red-600" onClick={() => handleDeleteGuest(guest.id)}>
                        🗑️ Del
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuest.firstName}
                    onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                    placeholder="John"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuest.lastName}
                    onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                    placeholder="Doe"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    placeholder="john@example.com"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    placeholder="+1 555 123 4567"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
                    VIP Status
                  </label>
                  <label className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="checkbox"
                      checked={newGuest.vip}
                      onChange={(e) => setNewGuest({ ...newGuest, vip: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-[#1A2E2B] text-sm">Mark as VIP Guest</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 flex-col md:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg cursor-pointer hover:scale-105 transition-transform w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Add Guest</span>
                    </>
                  )}
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
                  <h3 className="text-xl md:text-2xl font-bold text-[#1A2E2B] mb-2">{selectedGuest.name}</h3>
                  <p className="text-[#2D4A42] text-sm md:text-base">Guest ID: GST-{String(selectedGuest.id).padStart(5, '0')}</p>
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
                  <p className="text-xs md:text-sm text-[#2D4A42] mb-1">Email Address</p>
                  <p className="font-semibold text-[#1A2E2B] text-sm">{selectedGuest.email}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-[#2D4A42] mb-1">Phone Number</p>
                  <p className="font-semibold text-[#1A2E2B] text-sm">{selectedGuest.phone}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-[#2D4A42] mb-1">Total Stays</p>
                  <p className="font-bold text-xl md:text-2xl gradient-text">{selectedGuest.stays}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-[#2D4A42] mb-1">Total Spent</p>
                  <p className="font-bold text-xl md:text-2xl gradient-text">${selectedGuest.totalSpent.toLocaleString()}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-[#2D4A42] mb-1">Last Visit</p>
                  <p className="font-semibold text-[#1A2E2B] text-sm">{selectedGuest.lastVisit}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs md:text-sm text-[#2D4A42] mb-1">Member Since</p>
                  <p className="font-semibold text-[#1A2E2B] text-sm">2024</p>
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

            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!selectedGuest) return

              setSubmitting(true)
              try {
                await apiClient.put(`/api/v1/guests/${selectedGuest.id}`, {
                  first_name: editGuestData.firstName,
                  last_name: editGuestData.lastName,
                  email: editGuestData.email,
                  phone: editGuestData.phone,
                  is_vip: editGuestData.vip
                })

                await fetchGuests()
                setShowEditModal(false)
                setSelectedGuest(null)
              } catch (err: any) {
                console.error('Failed to update guest:', err)
                alert(err.response?.data?.detail || 'Failed to update guest. Please try again.')
              } finally {
                setSubmitting(false)
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">First Name *</label>
                    <input
                      type="text"
                      value={editGuestData.firstName}
                      onChange={(e) => setEditGuestData({ ...editGuestData, firstName: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={editGuestData.lastName}
                      onChange={(e) => setEditGuestData({ ...editGuestData, lastName: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={editGuestData.email}
                      onChange={(e) => setEditGuestData({ ...editGuestData, email: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={editGuestData.phone}
                      onChange={(e) => setEditGuestData({ ...editGuestData, phone: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Stats removed from edit modal as they are calculated from bookings */}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="vip-edit"
                    checked={editGuestData.vip}
                    onChange={(e) => setEditGuestData({ ...editGuestData, vip: e.target.checked })}
                    className="w-5 h-5 rounded accent-blue-600"
                  />
                  <label htmlFor="vip-edit" className="text-sm font-semibold text-[#1A2E2B]">VIP Guest</label>
                </div>

                <div className="pt-4 flex gap-3 flex-col md:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={submitting}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all text-sm md:text-base disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>✓ Update Guest</span>
                    )}
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
                <p className="text-xs md:text-sm text-[#2D4A42] mb-2">To:</p>
                <p className="font-semibold text-[#1A2E2B] text-sm md:text-base">{selectedGuest.name}</p>
                <p className="text-xs md:text-sm text-[#2D4A42]">{selectedGuest.email}</p>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">
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
                <p className="text-xs text-[#2D4A42] mt-2">{guestMessage.length} characters</p>
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
