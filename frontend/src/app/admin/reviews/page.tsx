'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'

export default function ReviewsPage() {
  const [filter, setFilter] = useState('all')
  const [reviewsFilter, setReviewsFilter] = useState<'all' | 'rating' | 'total' | 'pending' | 'month'>('all')
  const router = useRouter()

  const reviews = [
    { id: 1, guest: 'Jennifer Thompson', rating: 5, date: '2026-03-22', comment: 'Absolutely amazing experience! The staff was incredibly helpful and the rooms were spotless. Will definitely come back!', response: 'Thank you for your wonderful review!', status: 'replied' },
    { id: 2, guest: 'Mark Stevens', rating: 4, date: '2026-03-20', comment: 'Great location and beautiful property. Only minor issue was the WiFi speed in the room.', response: null, status: 'pending' },
    { id: 3, guest: 'Amanda Rodriguez', rating: 5, date: '2026-03-18', comment: 'Best hotel experience ever! The breakfast was outstanding and the amenities were top-notch.', response: 'We\'re thrilled you enjoyed your stay!', status: 'replied' },
    { id: 4, guest: 'Richard Parker', rating: 3, date: '2026-03-15', comment: 'Decent hotel but check-in took longer than expected. Room was comfortable though.', response: null, status: 'pending' },
    { id: 5, guest: 'Susan Mitchell', rating: 5, date: '2026-03-12', comment: 'Perfect for our anniversary! The staff went above and beyond to make our stay special.', response: 'Happy Anniversary! We loved hosting you!', status: 'replied' },
  ]

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
                <p className="text-sm text-gray-600">Manage guest reviews and ratings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Average Rating"
            value="4.6/5"
            icon="⭐"
            color="orange"
            subtext="Based on 1,247 reviews"
            onClick={() => setReviewsFilter('rating')}
            isActive={reviewsFilter === 'rating'}
          />
          <StatCard
            label="Total Reviews"
            value="1,247"
            icon="📝"
            color="blue"
            subtext="All time"
            onClick={() => setReviewsFilter('total')}
            isActive={reviewsFilter === 'total'}
          />
          <StatCard
            label="Pending Response"
            value="23"
            icon="⏳"
            color="red"
            subtext="Need attention"
            onClick={() => setReviewsFilter('pending')}
            isActive={reviewsFilter === 'pending'}
          />
          <StatCard
            label="This Month"
            value="89"
            icon="📊"
            color="green"
            subtext="+12 from last month"
            onClick={() => setReviewsFilter('month')}
            isActive={reviewsFilter === 'month'}
          />
        </div>

        {/* Rating Breakdown */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold gradient-text mb-6">Rating Breakdown</h2>
          <div className="space-y-4">
            {[
              { stars: 5, count: 892, percentage: 71 },
              { stars: 4, count: 245, percentage: 20 },
              { stars: 3, count: 75, percentage: 6 },
              { stars: 2, count: 25, percentage: 2 },
              { stars: 1, count: 10, percentage: 1 },
            ].map((rating) => (
              <div key={rating.stars} className="flex items-center gap-4">
                <div className="w-16 text-right">
                  <div className="flex gap-1 justify-end">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < rating.stars ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                      style={{ width: `${rating.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className="font-semibold text-gray-900">{rating.count}</span>
                  <span className="text-sm text-gray-600 ml-2">({rating.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={review.id} className="glass-card rounded-2xl p-6 slide-up" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {review.guest.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{review.guest}</h3>
                    <p className="text-sm text-gray-600">{review.date}</p>
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

              <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

              {review.response && (
                <div className="bg-blue-50 rounded-xl p-4 ml-16">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Hotel Response:</p>
                  <p className="text-gray-700">{review.response}</p>
                </div>
              )}

              {!review.response && (
                <div className="ml-16 mt-4">
                  <button className="glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => {
                    const response = prompt('Write your response:');
                    if (response) {
                      // Response posted successfully
                    }
                  }}>
                    ✍️ Write Response
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
