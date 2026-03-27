export default function SuperAdminPage() {
  return (
    <div className="w-full">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-5xl font-bold gradient-text mb-2">Platform Overview</h1>
          <p className="text-gray-600 text-lg">Real-time platform analytics and metrics</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Total Tenants */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Active Tenants</p>
                <p className="text-5xl font-bold gradient-text">142</p>
              </div>
              <div className="text-6xl float">🏨</div>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full inline-block">
              <span>↑</span>
              <span className="font-semibold text-sm">+12 this month</span>
            </div>
          </div>

          {/* Total Users */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Total Users</p>
                <p className="text-5xl font-bold gradient-text">8,450</p>
              </div>
              <div className="text-6xl float">👥</div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-full inline-block">
              <span className="font-semibold text-sm">+248 today</span>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">MRR</p>
                <p className="text-5xl font-bold gradient-text">$94.2K</p>
              </div>
              <div className="text-6xl float">💰</div>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full inline-block">
              <span>↑</span>
              <span className="font-semibold text-sm">+18.5% vs last month</span>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Active Bookings</p>
                <p className="text-5xl font-bold gradient-text">2,847</p>
              </div>
              <div className="text-6xl float">📅</div>
            </div>
            <div className="flex items-center gap-2 text-purple-600 bg-purple-100/50 px-3 py-1.5 rounded-full inline-block">
              <span className="font-semibold text-sm">Today: 156</span>
            </div>
          </div>
        </div>

        {/* MRR Chart */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold gradient-text">Monthly Recurring Revenue</h2>
              <p className="text-gray-600 mt-1">Revenue trends over time</p>
            </div>
            <select className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none cursor-pointer">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-80 bg-gradient-to-t from-blue-500/5 to-purple-500/5 rounded-xl flex items-end justify-between p-6 gap-2">
            {[65, 72, 68, 85, 92, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-purple-500 shadow-lg"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500">
                  {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* New Tenant Applications */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold gradient-text flex items-center gap-3">
                📋 Pending Tenant Applications
              </h2>
              <p className="text-gray-600 mt-1">New hotel onboarding requests</p>
            </div>
            <button className="btn-primary px-6 py-3 rounded-xl font-semibold">
              View All →
            </button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Grand Plaza Hotel', location: 'New York, USA', rooms: 120, status: 'pending' },
              { name: 'Seaside Resort', location: 'Miami, USA', rooms: 85, status: 'pending' },
              { name: 'Mountain View Lodge', location: 'Denver, USA', rooms: 65, status: 'review' },
              { name: 'Urban Boutique Hotel', location: 'San Francisco, USA', rooms: 45, status: 'pending' },
            ].map((tenant, index) => (
              <div
                key={index}
                className="glass p-6 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 slide-up"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🏨</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{tenant.name}</h3>
                      <p className="text-gray-600">📍 {tenant.location} • {tenant.rooms} rooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      tenant.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                    </span>
                    <button className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-gray-700">
                      Review →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-8 slide-up border border-gray-200" style={{ animationDelay: '0.8s' }}>
          <h2 className="text-3xl font-bold gradient-text mb-6 flex items-center gap-3">
            🕐 Recent Platform Activity
          </h2>
          
          <div className="space-y-4">
            {[
              { action: 'New tenant onboarded', target: 'Luxury Suites International', time: '5 minutes ago', icon: '🎉' },
              { action: 'Payment processed', target: '$2,450 commission collected', time: '12 minutes ago', icon: '💳' },
              { action: 'User registered', target: 'john.doe@email.com', time: '18 minutes ago', icon: '👤' },
              { action: 'Booking confirmed', target: 'Reservation #BK-2847', time: '25 minutes ago', icon: '✓' },
              { action: 'System backup completed', target: 'Daily automated backup', time: '1 hour ago', icon: '💾' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 glass p-4 rounded-xl slide-up border border-transparent hover:border-gray-200"
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                <div className="text-3xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.target}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
