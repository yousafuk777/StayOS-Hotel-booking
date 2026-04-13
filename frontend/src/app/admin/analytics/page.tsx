'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { canAccess } from '@/config/permissions'

interface AnalyticsData {
  totalRevenue: number
  occupancyRate: number
  adr: number
  revpar: number
  revenueTrend: number[]
  roomPerformance: Array<{
    type: string
    revenue: number
    occupancy: number
    bookings: number
  }>
  bookingSources: Array<{
    source: string
    percentage: number
    color: string
  }>
  highlights: {
    totalBookings: number
    avgRating: number
    totalReviews: number
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('month')
  const [analyticsFilter, setAnalyticsFilter] = useState<'all' | 'revenue' | 'occupancy' | 'adr' | 'revpar'>('all')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  // RBAC Fallback Check
  useEffect(() => {
    const stored = localStorage.getItem('user') || localStorage.getItem('super_admin_user')
    if (stored) {
      const user = JSON.parse(stored)
      if (!canAccess(user.role, 'analytics')) {
        router.replace('/admin/access-denied')
      } else {
        setIsAuthorized(true)
      }
    } else {
      router.replace('/login')
    }
  }, [router])

  // Load analytics data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('hotel-analytics-data')
    if (savedData) {
      try {
        setAnalyticsData(JSON.parse(savedData))
      } catch (error) {
        console.error('Error loading analytics data:', error)
      }
    }
  }, [])

  // Save analytics data to localStorage
  const saveAnalyticsData = (data: AnalyticsData) => {
    localStorage.setItem('hotel-analytics-data', JSON.stringify(data))
    setAnalyticsData(data)
  }

  // Generate sample data for demo
  const generateSampleData = () => {
    setIsLoading(true)
    setTimeout(() => {
      const sampleData: AnalyticsData = {
        totalRevenue: 42850,
        occupancyRate: 78,
        adr: 289,
        revpar: 225,
        revenueTrend: [65, 72, 58, 85, 92, 78, 88, 95, 82, 76, 89, 94],
        roomPerformance: [
          { type: 'Standard Queen', revenue: 12450, occupancy: 85, bookings: 42 },
          { type: 'Deluxe Suite', revenue: 18900, occupancy: 92, bookings: 38 },
          { type: 'Executive King', revenue: 15600, occupancy: 78, bookings: 28 },
          { type: 'Presidential Suite', revenue: 8900, occupancy: 45, bookings: 8 },
        ],
        bookingSources: [
          { source: 'Direct Website', percentage: 45, color: 'from-blue-500 to-blue-600' },
          { source: 'Booking.com', percentage: 28, color: 'from-purple-500 to-purple-600' },
          { source: 'Expedia', percentage: 15, color: 'from-orange-500 to-orange-600' },
          { source: 'Walk-in', percentage: 8, color: 'from-green-500 to-green-600' },
          { source: 'Phone', percentage: 4, color: 'from-pink-500 to-pink-600' },
        ],
        highlights: {
          totalBookings: 156,
          avgRating: 4.6,
          totalReviews: 1247
        }
      }
      saveAnalyticsData(sampleData)
      setIsLoading(false)
    }, 1000)
  }

  // Clear all analytics data
  const clearAnalyticsData = () => {
    localStorage.removeItem('hotel-analytics-data')
    setAnalyticsData(null)
  }

  if (isAuthorized === null) return null

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
                <h1 className="text-3xl font-bold gradient-text">Analytics & Reports</h1>
                <p className="text-sm text-[#2D4A42]">Revenue insights and performance metrics</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="glass px-4 py-2 rounded-xl font-medium focus:outline-none text-sm"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              {!analyticsData ? (
                <button
                  onClick={generateSampleData}
                  disabled={isLoading}
                  className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? '⏳' : '📊'} {isLoading ? 'Generating...' : 'Add Sample Data'}
                </button>
              ) : (
                <button
                  onClick={clearAnalyticsData}
                  className="glass px-4 py-2 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  🗑️ Clear Data
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {!analyticsData ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">📊</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">No Analytics Data Yet</h2>
              <p className="text-[#2D4A42] mb-8 text-lg">
                Start tracking your hotel's performance by adding sample data or connecting your booking system.
              </p>
              <button
                onClick={generateSampleData}
                disabled={isLoading}
                className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto cursor-pointer disabled:opacity-50"
              >
                {isLoading ? '⏳' : '📈'} {isLoading ? 'Generating Data...' : 'Generate Sample Analytics'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
              <div
                onClick={() => setAnalyticsFilter('revenue')}
                className={`glass-card rounded-2xl p-6 card-hover cursor-pointer transition-all ${
                  analyticsFilter === 'revenue' ? 'ring-2 ring-green-300 bg-green-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[#2D4A42] font-medium mb-2">Total Revenue</p>
                    <p className="text-4xl font-bold gradient-text">${analyticsData.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="text-5xl">💰</div>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                  <span>↑</span>
                  <span>+18.5% vs last period</span>
                </div>
              </div>

              <div
                onClick={() => setAnalyticsFilter('occupancy')}
                className={`glass-card rounded-2xl p-6 card-hover cursor-pointer transition-all ${
                  analyticsFilter === 'occupancy' ? 'ring-2 ring-blue-300 bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[#2D4A42] font-medium mb-2">Occupancy Rate</p>
                    <p className="text-4xl font-bold gradient-text">{analyticsData.occupancyRate}%</p>
                  </div>
                  <div className="text-5xl">📊</div>
                </div>
                <div className="flex items-center gap-2 text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                  <span>↑</span>
                  <span>+5.2% vs last period</span>
                </div>
              </div>

              <div
                onClick={() => setAnalyticsFilter('adr')}
                className={`glass-card rounded-2xl p-6 card-hover cursor-pointer transition-all ${
                  analyticsFilter === 'adr' ? 'ring-2 ring-purple-300 bg-purple-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[#2D4A42] font-medium mb-2">ADR (Avg Daily Rate)</p>
                    <p className="text-4xl font-bold gradient-text">${analyticsData.adr}</p>
                  </div>
                  <div className="text-5xl">💵</div>
                </div>
                <div className="flex items-center gap-2 text-purple-600 bg-purple-100/50 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                  <span>↑</span>
                  <span>+12.3% vs last period</span>
                </div>
              </div>

              <div
                onClick={() => setAnalyticsFilter('revpar')}
                className={`glass-card rounded-2xl p-6 card-hover cursor-pointer transition-all ${
                  analyticsFilter === 'revpar' ? 'ring-2 ring-orange-300 bg-orange-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[#2D4A42] font-medium mb-2">RevPAR</p>
                    <p className="text-4xl font-bold gradient-text">${analyticsData.revpar}</p>
                  </div>
                  <div className="text-5xl">📈</div>
                </div>
                <div className="flex items-center gap-2 text-red-600 bg-red-100/50 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                  <span>↓</span>
                  <span>-2.1% vs last period</span>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="glass-card rounded-2xl p-8 mb-8 slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold gradient-text">Revenue Trend</h2>
                  <p className="text-[#2D4A42] mt-1">Daily revenue over the selected period</p>
                </div>
                <div className="flex items-center gap-2 glass p-1 rounded-xl">
                  <button className="px-4 py-2 rounded-lg bg-white text-blue-600 shadow font-medium">
                    Revenue
                  </button>
                  <button className="px-4 py-2 rounded-lg text-[#2D4A42] hover:bg-gray-50 font-medium">
                    Occupancy
                  </button>
                  <button className="px-4 py-2 rounded-lg text-[#2D4A42] hover:bg-gray-50 font-medium">
                    ADR
                  </button>
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="h-80 flex items-end justify-between gap-2 p-6 bg-gradient-to-t from-blue-50/50 to-transparent rounded-xl">
                {analyticsData.revenueTrend.map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-600 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-indigo-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-[#2D4A42] font-medium">
                      {period === 'month' ? ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28', '31', '34'][i] :
                       period === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7] :
                       ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i % 6]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Room Type Performance */}
              <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.6s' }}>
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  🏨 Room Type Performance
                </h2>
                <div className="space-y-4">
                  {analyticsData.roomPerformance.map((room, index) => (
                    <div key={index} className="glass p-4 rounded-xl slide-up" style={{ animationDelay: `${0.7 + index * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-[#1A2E2B]">{room.type}</h3>
                          <p className="text-sm text-[#2D4A42]">{room.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold gradient-text">${room.revenue.toLocaleString()}</p>
                          <p className="text-sm text-[#2D4A42]">{room.occupancy}% occupied</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${room.occupancy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Sources */}
              <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.7s' }}>
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  📱 Booking Sources
                </h2>
                <div className="space-y-4">
                  {analyticsData.bookingSources.map((item, index) => (
                    <div key={index} className="slide-up" style={{ animationDelay: `${0.8 + index * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[#1A2E2B]">{item.source}</span>
                        <span className="text-sm text-[#2D4A42]">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-gradient-to-r ${item.color} h-3 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.9s' }}>
              <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                🏆 This Month's Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-xl text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-4xl font-bold gradient-text mb-2">{analyticsData.highlights.totalBookings}</p>
                  <p className="text-[#2D4A42] font-medium">Total Bookings</p>
                  <p className="text-sm text-green-600 mt-2 font-semibold">↑ 12 more than last month</p>
                </div>
                <div className="glass p-6 rounded-xl text-center">
                  <div className="text-6xl mb-4">⭐</div>
                  <p className="text-4xl font-bold gradient-text mb-2">{analyticsData.highlights.avgRating}/5</p>
                  <p className="text-[#2D4A42] font-medium">Average Rating</p>
                  <p className="text-sm text-green-600 mt-2 font-semibold">↑ 0.2 from last month</p>
                </div>
                <div className="glass p-6 rounded-xl text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-4xl font-bold gradient-text mb-2">{analyticsData.highlights.totalReviews}</p>
                  <p className="text-[#2D4A42] font-medium">Total Reviews</p>
                  <p className="text-sm text-blue-600 mt-2 font-semibold">+23 this month</p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="glass-card rounded-2xl p-8 mt-8 slide-up" style={{ animationDelay: '1.2s' }}>
              <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                📥 Export Reports
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="glass p-6 rounded-xl card-hover text-center group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                  <p className="font-semibold text-[#1A2E2B] mb-1">Revenue Report</p>
                  <p className="text-sm text-[#2D4A42]">PDF / Excel</p>
                </button>
                <button className="glass p-6 rounded-xl card-hover text-center group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📈</div>
                  <p className="font-semibold text-[#1A2E2B] mb-1">Occupancy Stats</p>
                  <p className="text-sm text-[#2D4A42]">Detailed breakdown</p>
                </button>
                <button className="glass p-6 rounded-xl card-hover text-center group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👤</div>
                  <p className="font-semibold text-[#1A2E2B] mb-1">Guest Analytics</p>
                  <p className="text-sm text-[#2D4A42]">Demographics</p>
                </button>
                <button className="glass p-6 rounded-xl card-hover text-center group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
                  <p className="font-semibold text-[#1A2E2B] mb-1">Custom Report</p>
                  <p className="text-sm text-[#2D4A42]">Build your own</p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
