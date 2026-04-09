'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Review {
  id: string
  guest: string
  rating: number
  date: string
  comment: string
  response?: string
  status: 'pending' | 'replied'
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  pendingResponses: number
  thisMonth: number
  ratingBreakdown: { [key: number]: number }
}

export default function ReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all')
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('hotel-reviews')
    const savedStats = localStorage.getItem('hotel-review-stats')

    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews))
      } catch (error) {
        console.error('Error loading reviews:', error)
      }
    }

    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats))
      } catch (error) {
        console.error('Error loading review stats:', error)
      }
    }
  }, [])

  // Save reviews to localStorage
  const saveReviews = (newReviews: Review[]) => {
    localStorage.setItem('hotel-reviews', JSON.stringify(newReviews))
    setReviews(newReviews)

    // Calculate stats
    const totalReviews = newReviews.length
    const averageRating = totalReviews > 0 ? newReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0
    const pendingResponses = newReviews.filter(r => r.status === 'pending').length
    const thisMonth = newReviews.filter(r => {
      const reviewDate = new Date(r.date)
      const now = new Date()
      return reviewDate.getMonth() === now.getMonth() && reviewDate.getFullYear() === now.getFullYear()
    }).length

    const ratingBreakdown: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    newReviews.forEach(review => {
      ratingBreakdown[review.rating] = (ratingBreakdown[review.rating] || 0) + 1
    })

    const newStats: ReviewStats = {
      averageRating,
      totalReviews,
      pendingResponses,
      thisMonth,
      ratingBreakdown
    }

    localStorage.setItem('hotel-review-stats', JSON.stringify(newStats))
    setStats(newStats)
  }

  // Generate sample reviews
  const generateSampleReviews = () => {
    const sampleReviews: Review[] = [
      {
        id: '1',
        guest: 'Jennifer Thompson',
        rating: 5,
        date: '2026-03-22',
        comment: 'Absolutely amazing experience! The staff was incredibly helpful and the rooms were spotless. Will definitely come back!',
        response: 'Thank you for your wonderful review! We\'re delighted to hear you enjoyed your stay.',
        status: 'replied'
      },
      {
        id: '2',
        guest: 'Mark Stevens',
        rating: 4,
        date: '2026-03-20',
        comment: 'Great location and beautiful property. Only minor issue was the WiFi speed in the room.',
        status: 'pending'
      },
      {
        id: '3',
        guest: 'Amanda Rodriguez',
        rating: 5,
        date: '2026-03-18',
        comment: 'Best hotel experience ever! The breakfast was outstanding and the amenities were top-notch.',
        response: 'We\'re thrilled you enjoyed your stay! Thank you for choosing us.',
        status: 'replied'
      },
      {
        id: '4',
        guest: 'Richard Parker',
        rating: 3,
        date: '2026-03-15',
        comment: 'Decent hotel but check-in took longer than expected. Room was comfortable though.',
        status: 'pending'
      },
      {
        id: '5',
        guest: 'Susan Mitchell',
        rating: 5,
        date: '2026-03-12',
        comment: 'Perfect for our anniversary! The staff went above and beyond to make our stay special.',
        response: 'Happy Anniversary! We loved hosting you and making your special day memorable.',
        status: 'replied'
      }
    ]
    saveReviews(sampleReviews)
  }

  // Clear all reviews
  const clearReviews = () => {
    localStorage.removeItem('hotel-reviews')
    localStorage.removeItem('hotel-review-stats')
    setReviews([])
    setStats(null)
  }

  // Submit response to review
  const submitResponse = (reviewId: string) => {
    if (!responseText.trim()) return

    const updatedReviews = reviews.map(review =>
      review.id === reviewId
        ? { ...review, response: responseText, status: 'replied' as const }
        : review
    )
    saveReviews(updatedReviews)
    setRespondingTo(null)
    setResponseText('')
  }

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true
    return review.status === filter
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
                <h1 className="text-3xl font-bold gradient-text">Reviews Management</h1>
                <p className="text-sm text-[#2D4A42]">Manage guest reviews and ratings</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!reviews.length ? (
                <button
                  onClick={generateSampleReviews}
                  className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer"
                >
                  📝 Add Sample Reviews
                </button>
              ) : (
                <button
                  onClick={clearReviews}
                  className="glass px-4 py-2 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {!reviews.length ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">⭐</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">No Reviews Yet</h2>
              <p className="text-[#2D4A42] mb-8 text-lg">
                Guest reviews will appear here once customers start leaving feedback about their stay.
              </p>
              <button
                onClick={generateSampleReviews}
                className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto cursor-pointer"
              >
                📊 Try Sample Reviews
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">⭐</div>
                <p className="text-4xl font-bold gradient-text mb-2">{stats?.averageRating.toFixed(1)}/5</p>
                <p className="text-[#2D4A42] font-medium">Average Rating</p>
                <p className="text-sm text-orange-600 mt-2 font-semibold">Based on {stats?.totalReviews} reviews</p>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-4xl font-bold gradient-text mb-2">{stats?.totalReviews}</p>
                <p className="text-[#2D4A42] font-medium">Total Reviews</p>
                <p className="text-sm text-blue-600 mt-2 font-semibold">All time</p>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">⏳</div>
                <p className="text-4xl font-bold gradient-text mb-2">{stats?.pendingResponses}</p>
                <p className="text-[#2D4A42] font-medium">Pending Response</p>
                <p className="text-sm text-red-600 mt-2 font-semibold">Need attention</p>
              </div>

              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-4xl font-bold gradient-text mb-2">{stats?.thisMonth}</p>
                <p className="text-[#2D4A42] font-medium">This Month</p>
                <p className="text-sm text-green-600 mt-2 font-semibold">New reviews</p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="glass-card rounded-2xl p-8 mb-8 slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold gradient-text mb-6">Rating Breakdown</h2>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = stats?.ratingBreakdown[stars] || 0
                  const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0
                  return (
                    <div key={stars} className="flex items-center gap-4">
                      <div className="w-16 text-right">
                        <div className="flex gap-1 justify-end">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < stars ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <span className="font-semibold text-[#1A2E2B]">{count}</span>
                        <span className="text-sm text-[#2D4A42] ml-2">({Math.round(percentage)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-8 glass p-2 rounded-xl w-fit">
              {[
                { key: 'all', label: 'All Reviews', count: reviews.length },
                { key: 'pending', label: 'Pending Response', count: reviews.filter(r => r.status === 'pending').length },
                { key: 'replied', label: 'Replied', count: reviews.filter(r => r.status === 'replied').length }
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

            {/* Reviews List */}
            <div className="space-y-6">
              {filteredReviews.map((review, index) => (
                <div key={review.id} className="glass-card rounded-2xl p-6 slide-up" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {review.guest.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A2E2B]">{review.guest}</h3>
                        <p className="text-sm text-[#2D4A42]">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        review.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.status === 'replied' ? 'Replied' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[#1A2E2B] mb-4 leading-relaxed">{review.comment}</p>

                  {review.response && (
                    <div className="bg-blue-50 rounded-xl p-4 ml-16">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Hotel Response:</p>
                      <p className="text-[#1A2E2B]">{review.response}</p>
                    </div>
                  )}

                  {review.status === 'pending' && (
                    <div className="ml-16 mt-4">
                      {respondingTo === review.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response to this review..."
                            className="input-field w-full resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => submitResponse(review.id)}
                              className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm"
                            >
                              Submit Response
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null)
                                setResponseText('')
                              }}
                              className="glass px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(review.id)}
                          className="glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600"
                        >
                          ✍️ Write Response
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
