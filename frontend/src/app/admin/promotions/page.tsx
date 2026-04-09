'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface Promotion {
  id: string
  title: string
  code: string
  discount: string
  type: 'percentage' | 'fixed'
  status: 'active' | 'scheduled' | 'expired'
  bookings: number
  expiry: string
  description?: string
}

interface PromotionStats {
  activePromos: number
  totalRedemptions: number
  revenueImpact: number
  avgDiscount: number
}

export default function PromotionsPage() {
  const router = useRouter()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [stats, setStats] = useState<PromotionStats | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'expired'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  // Load promotions from localStorage
  useEffect(() => {
    const savedPromotions = localStorage.getItem('hotel-promotions')
    const savedStats = localStorage.getItem('hotel-promotion-stats')

    if (savedPromotions) {
      try {
        setPromotions(JSON.parse(savedPromotions))
      } catch (error) {
        console.error('Error loading promotions:', error)
      }
    }

    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats))
      } catch (error) {
        console.error('Error loading promotion stats:', error)
      }
    }
  }, [])

  // Save promotions to localStorage
  const savePromotions = (newPromotions: Promotion[]) => {
    localStorage.setItem('hotel-promotions', JSON.stringify(newPromotions))
    setPromotions(newPromotions)

    // Update stats
    const activePromos = newPromotions.filter(p => p.status === 'active').length
    const totalRedemptions = newPromotions.reduce((sum, p) => sum + p.bookings, 0)
    const revenueImpact = newPromotions.reduce((sum, p) => {
      const discountValue = p.type === 'percentage'
        ? parseFloat(p.discount.replace('% OFF', '')) / 100 * 1000 // Rough estimate
        : parseFloat(p.discount.replace('$', '').replace(' OFF', ''))
      return sum + (discountValue * p.bookings)
    }, 0)
    const avgDiscount = newPromotions.length > 0
      ? newPromotions.reduce((sum, p) => {
          const discountValue = p.type === 'percentage'
            ? parseFloat(p.discount.replace('% OFF', ''))
            : (parseFloat(p.discount.replace('$', '').replace(' OFF', '')) / 10) // Rough percentage estimate
          return sum + discountValue
        }, 0) / newPromotions.length
      : 0

    const newStats = { activePromos, totalRedemptions, revenueImpact, avgDiscount }
    localStorage.setItem('hotel-promotion-stats', JSON.stringify(newStats))
    setStats(newStats)
  }

  // Generate sample promotions
  const generateSamplePromotions = () => {
    const samplePromotions: Promotion[] = [
      {
        id: '1',
        title: 'Early Bird Discount',
        code: 'EARLY20',
        discount: '20% OFF',
        type: 'percentage',
        status: 'active',
        bookings: 145,
        expiry: '2026-04-30',
        description: 'Book 7+ days in advance'
      },
      {
        id: '2',
        title: 'Weekend Getaway',
        code: 'WEEKEND50',
        discount: '$50 OFF',
        type: 'fixed',
        status: 'active',
        bookings: 89,
        expiry: '2026-05-15',
        description: 'Friday-Sunday stays'
      },
      {
        id: '3',
        title: 'Summer Special',
        code: 'SUMMER30',
        discount: '30% OFF',
        type: 'percentage',
        status: 'scheduled',
        bookings: 0,
        expiry: '2026-06-01',
        description: 'June-August bookings'
      },
      {
        id: '4',
        title: 'Last Minute Deal',
        code: 'LASTMIN15',
        discount: '15% OFF',
        type: 'percentage',
        status: 'active',
        bookings: 67,
        expiry: '2026-12-31',
        description: 'Book within 24 hours'
      },
      {
        id: '5',
        title: 'VIP Member Exclusive',
        code: 'VIP100',
        discount: '$100 OFF',
        type: 'fixed',
        status: 'expired',
        bookings: 234,
        expiry: '2026-02-28',
        description: 'For loyalty program members'
      }
    ]
    savePromotions(samplePromotions)
  }

  // Clear all promotions
  const clearPromotions = () => {
    localStorage.removeItem('hotel-promotions')
    localStorage.removeItem('hotel-promotion-stats')
    setPromotions([])
    setStats(null)
  }

  // Create new promotion
  const createPromotion = (promotionData: Omit<Promotion, 'id'>) => {
    const newPromotion: Promotion = {
      ...promotionData,
      id: Date.now().toString()
    }
    savePromotions([...promotions, newPromotion])
    setIsCreateModalOpen(false)
  }

  // Update promotion
  const updatePromotion = (updatedPromotion: Promotion) => {
    const updatedPromotions = promotions.map(p =>
      p.id === updatedPromotion.id ? updatedPromotion : p
    )
    savePromotions(updatedPromotions)
    setEditingPromotion(null)
  }

  // Delete promotion
  const deletePromotion = (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      savePromotions(promotions.filter(p => p.id !== id))
    }
  }

  // Filter promotions
  const filteredPromotions = promotions.filter(promo => {
    if (filter === 'all') return true
    return promo.status === filter
  })

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
                <h1 className="text-3xl font-bold gradient-text">Promotions Management</h1>
                <p className="text-sm text-[#2D4A42]">Create and manage promotional offers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!promotions.length ? (
                <button
                  onClick={generateSamplePromotions}
                  className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer"
                >
                  📊 Add Sample Data
                </button>
              ) : (
                <button
                  onClick={clearPromotions}
                  className="glass px-4 py-2 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  🗑️ Clear All
                </button>
              )}

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>➕</span>
                <span>Create Promotion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {!promotions.length ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">🏷️</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">No Promotions Yet</h2>
              <p className="text-[#2D4A42] mb-8 text-lg">
                Create your first promotional offer to attract more guests and boost bookings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto cursor-pointer"
                >
                  ➕ Create First Promotion
                </button>
                <button
                  onClick={generateSamplePromotions}
                  className="glass px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto cursor-pointer hover:bg-white/50"
                >
                  📊 Try Sample Promotions
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">🏷️</div>
                <p className="text-4xl font-bold gradient-text mb-2">{stats?.activePromos || 0}</p>
                <p className="text-[#2D4A42] font-medium">Active Promotions</p>
                <p className="text-sm text-green-600 mt-2 font-semibold">Currently running</p>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">✓</div>
                <p className="text-4xl font-bold gradient-text mb-2">{stats?.totalRedemptions || 0}</p>
                <p className="text-[#2D4A42] font-medium">Total Redemptions</p>
                <p className="text-sm text-blue-600 mt-2 font-semibold">All time</p>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">💰</div>
                <p className="text-4xl font-bold gradient-text mb-2">${(stats?.revenueImpact || 0).toLocaleString()}</p>
                <p className="text-[#2D4A42] font-medium">Revenue Impact</p>
                <p className="text-sm text-purple-600 mt-2 font-semibold">From promotions</p>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-4xl font-bold gradient-text mb-2">{Math.round(stats?.avgDiscount || 0)}%</p>
                <p className="text-[#2D4A42] font-medium">Avg. Discount</p>
                <p className="text-sm text-orange-600 mt-2 font-semibold">Per booking</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-8 glass p-2 rounded-xl w-fit">
              {[
                { key: 'all', label: 'All Promotions', count: promotions.length },
                { key: 'active', label: 'Active', count: promotions.filter(p => p.status === 'active').length },
                { key: 'scheduled', label: 'Scheduled', count: promotions.filter(p => p.status === 'scheduled').length },
                { key: 'expired', label: 'Expired', count: promotions.filter(p => p.status === 'expired').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    filter === key
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-[#2D4A42] hover:bg-white/50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Promotions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotions.map((promo, index) => (
                <div key={promo.id} className="glass-card rounded-2xl p-6 card-hover slide-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold gradient-text mb-2">{promo.title}</h3>
                      <p className="text-sm text-[#2D4A42]">Code: <span className="font-mono font-bold text-blue-600">{promo.code}</span></p>
                      {promo.description && (
                        <p className="text-sm text-[#2D4A42] mt-1">{promo.description}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      promo.status === 'active' ? 'bg-green-100 text-green-700' :
                      promo.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-[#2D4A42]'
                    }`}>
                      {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl font-bold gradient-text mb-2">{promo.discount}</div>
                    <p className="text-sm text-[#2D4A42]">Type: {promo.type}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#2D4A42]">Redemptions:</span>
                      <span className="font-semibold text-[#1A2E2B]">{promo.bookings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#2D4A42]">Expires:</span>
                      <span className="font-semibold text-[#1A2E2B]">{promo.expiry}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setEditingPromotion(promo)}
                      className="flex-1 glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deletePromotion(promo.id)}
                      className="glass px-4 py-2 rounded-xl hover:bg-red-50 transition-all text-sm font-medium text-red-600"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingPromotion) && (
        <PromotionModal
          promotion={editingPromotion}
          onSave={editingPromotion ? updatePromotion : createPromotion}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingPromotion(null)
          }}
        />
      )}
    </main>
  )
}

// Promotion Modal Component
function PromotionModal({
  promotion,
  onSave,
  onClose
}: {
  promotion?: Promotion | null
  onSave: (promotion: Promotion) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    code: promotion?.code || '',
    discount: promotion?.discount || '',
    type: promotion?.type || 'percentage' as 'percentage' | 'fixed',
    status: promotion?.status || 'active' as 'active' | 'scheduled' | 'expired',
    expiry: promotion?.expiry || '',
    description: promotion?.description || ''
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (promotion) {
      onSave({ ...promotion, ...formData })
    } else {
      onSave({
        ...formData,
        id: '',
        bookings: 0
      } as Promotion)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            {promotion ? 'Edit Promotion' : 'Create New Promotion'}
          </h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Promo Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input-field w-full font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Discount</label>
              <input
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder={formData.type === 'percentage' ? '20% OFF' : '$50 OFF'}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                className="input-field w-full"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'scheduled' | 'expired' })}
                className="input-field w-full"
              >
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field w-full resize-none"
              rows={3}
              placeholder="Brief description of the promotion..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 btn-primary py-3 rounded-xl font-semibold">
              {promotion ? 'Update Promotion' : 'Create Promotion'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 glass rounded-xl font-semibold hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
