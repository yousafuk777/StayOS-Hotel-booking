'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'

interface ANALYTICS_KPI {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
}

interface REVENUE_BREAKDOWN {
  category: string
  amount: number
  percentage: number
}

interface TOP_PERFORMER {
  rank: number
  hotel: string
  revenue: number
  occupancy: number
  rating: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/v1/super-admin/analytics', {
        params: { days: parseInt(timeRange) }
      })
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="text-gray-500 font-medium animate-pulse">Aggregating platform intelligence...</p>
      </div>
    )
  }

  const kpiData: ANALYTICS_KPI[] = analytics?.kpis || []
  const revenueByCategory: REVENUE_BREAKDOWN[] = analytics?.breakdown || []
  const topPerformers: TOP_PERFORMER[] = analytics?.performers || []
  const chartData = analytics?.revenue_trend || []

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">📈 Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your hotel performance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="glass px-4 py-3 rounded-xl text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
            <button className="glass px-6 py-3 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-all">
              📥 Export Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
        {kpiData.map((kpi: ANALYTICS_KPI, index: number) => (
          <div key={index} className="glass-card rounded-2xl p-6 card-hover border border-gray-200 slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{kpi.icon}</div>
              <span className={`text-lg font-bold flex items-center gap-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                {kpi.change}
                {kpi.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-semibold mb-1">{kpi.label}</p>
            <p className="text-3xl font-bold gradient-text">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 slide-up">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold gradient-text">💰 Revenue Trend</h3>
              <p className="text-sm text-gray-500">Platform revenue accumulation over time</p>
            </div>
            {loading && (
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            )}
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold gradient-text mb-6">📊 Revenue Breakdown</h3>
          <div className="space-y-4">
            {revenueByCategory.map((item: REVENUE_BREAKDOWN, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{item.category}</span>
                  <span className="text-sm font-bold text-gray-700">${item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.percentage}% of total revenue</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 slide-up">
        {/* Occupancy Analytics */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold gradient-text mb-6">🏨 Occupancy Analytics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-700 font-semibold mb-2">Average Occupancy</p>
              <p className="text-4xl font-bold text-green-600">78.5%</p>
              <p className="text-xs text-green-600 mt-2">+5.3% vs last month</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <p className="text-sm text-blue-700 font-semibold mb-2">Peak Occupancy</p>
              <p className="text-4xl font-bold text-blue-600">95.2%</p>
              <p className="text-xs text-blue-600 mt-2">Achieved on Mar 15</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <p className="text-sm text-purple-700 font-semibold mb-2">Lowest Occupancy</p>
              <p className="text-4xl font-bold text-purple-600">45.8%</p>
              <p className="text-xs text-purple-600 mt-2">On Mar 3</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <p className="text-sm text-orange-700 font-semibold mb-2">Available Rooms</p>
              <p className="text-4xl font-bold text-orange-600">342</p>
              <p className="text-xs text-orange-600 mt-2">Out of 850 total</p>
            </div>
          </div>
        </div>

        {/* Top Performing Hotels */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold gradient-text mb-6">🏆 Top Performers</h3>
          <div className="space-y-4">
            {topPerformers.map((hotel: TOP_PERFORMER) => (
              <div key={hotel.rank} className="glass rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${hotel.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      hotel.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        hotel.rank === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
                          'bg-gray-400'
                    }`}>
                    #{hotel.rank}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{hotel.hotel}</p>
                    <p className="text-xs text-gray-500">Revenue: ${hotel.revenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{hotel.occupancy}% Occ.</p>
                  <p className="text-xs text-gray-500">⭐ {hotel.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guest Demographics */}
      <div className="glass-card rounded-2xl p-6 slide-up">
        <h3 className="text-xl font-bold gradient-text mb-6">👥 Guest Demographics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🌍</div>
            <p className="text-2xl font-bold gradient-text">45</p>
            <p className="text-sm text-gray-600">Countries Represented</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
            <p className="text-2xl font-bold gradient-text">2,847</p>
            <p className="text-sm text-gray-600">Unique Guests</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔄</div>
            <p className="text-2xl font-bold gradient-text">38%</p>
            <p className="text-sm text-gray-600">Returning Guests</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-2xl font-bold gradient-text">4.8/5</p>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-8 slide-up">
        <button className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer">
          📊 Generate Full Report
        </button>
        <button className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all cursor-pointer">
          ⚙️ Customize Dashboard
        </button>
      </div>
    </div>
  )
}
