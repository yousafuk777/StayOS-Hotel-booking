'use client'

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-15 float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 fade-in">
          <div className="flex justify-center mb-4">
            <div className="glass-card p-4 rounded-2xl glow float">
              <span className="text-6xl">📊</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold gradient-text">
            My Dashboard
          </h1>
          <p className="text-xl text-white/90 font-light">Manage your bookings and rewards</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upcoming Bookings */}
          <div className="glass-card rounded-2xl p-8 card-hover slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#2D4A42] font-medium mb-2">Upcoming Bookings</p>
                <p className="text-5xl font-bold gradient-text">12</p>
              </div>
              <div className="text-6xl float">📅</div>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-4 py-2 rounded-full inline-block">
              <span>↑</span>
              <span className="font-semibold">2 new this month</span>
            </div>
          </div>

          {/* Total Spent */}
          <div className="glass-card rounded-2xl p-8 card-hover slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#2D4A42] font-medium mb-2">Total Spent</p>
                <p className="text-5xl font-bold gradient-text">$2,450</p>
              </div>
              <div className="text-6xl float">💳</div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 bg-blue-100/50 px-4 py-2 rounded-full inline-block">
              <span className="font-semibold">This month</span>
            </div>
          </div>

          {/* Loyalty Points */}
          <div className="glass-card rounded-2xl p-8 card-hover slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#2D4A42] font-medium mb-2">Loyalty Points</p>
                <p className="text-5xl font-bold gradient-text">8,500</p>
              </div>
              <div className="text-6xl float">⭐</div>
            </div>
            <div className="flex items-center gap-2 text-purple-600 bg-purple-100/50 px-4 py-2 rounded-full inline-block">
              <span className="font-semibold">Gold Member</span>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="glass-card rounded-3xl p-8 slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text flex items-center gap-3">
              📋 Recent Bookings
            </h2>
            <button className="btn-secondary px-6 py-3 rounded-xl font-semibold">
              View All →
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((booking, index) => (
              <div
                key={booking}
                className="border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all card-hover slide-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Hotel Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏨</span>
                      <div>
                        <h3 className="text-2xl font-bold text-[#1A2E2B]">
                          Grand Hotel New York
                        </h3>
                        <p className="text-[#2D4A42]">Deluxe Room • 2 Guests</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-[#2D4A42] mt-3">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Check-in: <strong>March 25, 2026</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Check-out: <strong>March 28, 2026</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>3 nights</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Status */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-4xl font-bold gradient-text">$597</p>
                      <p className="text-[#2D4A42] text-sm">Total</p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold text-sm shadow-lg">
                      ✓ Confirmed
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/20">
                  <button className="btn-primary px-6 py-3 rounded-xl font-semibold">
                    👁️ View Details
                  </button>
                  <button className="btn-secondary px-6 py-3 rounded-xl font-semibold">
                    ✏️ Modify Booking
                  </button>
                  <button className="btn-secondary px-6 py-3 rounded-xl font-semibold">
                    ❌ Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-3xl p-8 slide-up" style={{ animationDelay: '1s' }}>
          <h2 className="text-3xl font-bold gradient-text mb-6 text-center">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/search" className="group glass p-6 rounded-2xl card-hover cursor-pointer text-center">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform inline-block">🔍</div>
              <p className="font-semibold text-[#1A2E2B]">Search Hotels</p>
            </a>
            <a href="#" className="group glass p-6 rounded-2xl card-hover cursor-pointer text-center">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform inline-block">📅</div>
              <p className="font-semibold text-[#1A2E2B]">My Bookings</p>
            </a>
            <a href="#" className="group glass p-6 rounded-2xl card-hover cursor-pointer text-center">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform inline-block">⭐</div>
              <p className="font-semibold text-[#1A2E2B]">Reviews</p>
            </a>
            <a href="#" className="group glass p-6 rounded-2xl card-hover cursor-pointer text-center">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform inline-block">⚙️</div>
              <p className="font-semibold text-[#1A2E2B]">Settings</p>
            </a>
          </div>
        </div>

        {/* Loyalty Progress */}
        <div className="glass-card rounded-3xl p-8 slide-up" style={{ animationDelay: '1.1s' }}>
          <h2 className="text-3xl font-bold gradient-text mb-6 text-center">🎯 Loyalty Progress</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <p className="text-[#2D4A42] mb-2">Points to Platinum Status</p>
              <div className="text-4xl font-bold gradient-text mb-4">1,500 / 10,000</div>
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                  style={{ width: '85%' }}
                />
              </div>
              <p className="text-sm text-[#2D4A42] mt-2">You're 85% there! Keep earning points</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
