'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HousekeepingPage() {
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  const rooms = [
    { id: 101, number: '101', type: 'Standard Queen', status: 'clean', priority: 'normal', assignedTo: 'Maria G.', progress: 100 },
    { id: 102, number: '102', type: 'Deluxe Suite', status: 'dirty', priority: 'high', assignedTo: 'John D.', progress: 0 },
    { id: 201, number: '201', type: 'Executive King', status: 'cleaning', priority: 'normal', assignedTo: 'Sarah M.', progress: 65 },
    { id: 202, number: '202', type: 'Ocean View', status: 'inspection', priority: 'vip', assignedTo: null, progress: 100 },
    { id: 301, number: '301', type: 'Presidential Suite', status: 'dirty', priority: 'vip', assignedTo: 'Maria G.', progress: 25 },
    { id: 302, number: '302', type: 'Business Suite', status: 'maintenance', priority: 'normal', assignedTo: null, progress: 0 },
  ]

  const STATUS_CONFIG: any = {
    clean: { label: 'Clean & Ready', color: 'bg-green-500', icon: '✓' },
    dirty: { label: 'Dirty', color: 'bg-red-500', icon: '✕' },
    cleaning: { label: 'Cleaning in Progress', color: 'bg-blue-500', icon: '🧹' },
    inspection: { label: 'Awaiting Inspection', color: 'bg-orange-500', icon: '⚠️' },
    maintenance: { label: 'Maintenance', color: 'bg-purple-500', icon: '🔧' },
  }

  const PRIORITY_CONFIG: any = {
    normal: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
    high: { label: 'High Priority', color: 'bg-yellow-100 text-yellow-700' },
    vip: { label: 'VIP', color: 'bg-purple-100 text-purple-700' },
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
                <h1 className="text-3xl font-bold gradient-text">Housekeeping Board</h1>
                <p className="text-sm text-gray-600">Real-time room status tracking</p>
              </div>
            </div>
            
            <button 
              onClick={() => alert('Assign Tasks feature coming soon!')}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>📋</span>
              <span>Assign Tasks</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 slide-up">
          {[
            { status: 'clean', count: 45, total: 120, color: 'from-green-500 to-green-600', icon: '✓' },
            { status: 'dirty', count: 12, total: 120, color: 'from-red-500 to-red-600', icon: '✕' },
            { status: 'cleaning', count: 8, total: 120, color: 'from-blue-500 to-blue-600', icon: '🧹' },
            { status: 'inspection', count: 5, total: 120, color: 'from-orange-500 to-orange-600', icon: '⚠️' },
            { status: 'maintenance', count: 3, total: 120, color: 'from-purple-500 to-purple-600', icon: '🔧' },
          ].map((room, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br ${room.color} rounded-2xl p-6 text-white card-hover slide-up`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl">{room.icon}</div>
                <div className="text-right">
                  <p className="text-4xl font-bold mb-1">{room.count}</p>
                  <p className="text-sm opacity-90">of {room.total} rooms</p>
                </div>
              </div>
              <p className="font-medium">{STATUS_CONFIG[room.status].label}</p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${(room.count / room.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Rooms', icon: '🏨' },
                { id: 'dirty', label: 'Dirty', icon: '✕' },
                { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
                { id: 'inspection', label: 'Inspection', icon: '⚠️' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none">
                <option>All Staff</option>
                <option>Maria Garcia</option>
                <option>John Doe</option>
                <option>Sarah Miller</option>
              </select>
              <input
                type="search"
                placeholder="Search rooms..."
                className="input-field px-4 py-2 rounded-xl w-48 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Room Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="glass-card rounded-2xl overflow-hidden card-hover slide-up"
              style={{ animationDelay: `${0.7 + index * 0.1}s` }}
            >
              {/* Status Header */}
              <div className={`${STATUS_CONFIG[room.status].color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{STATUS_CONFIG[room.status].icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold">Room {room.number}</h3>
                      <p className="text-sm opacity-90">{room.type}</p>
                    </div>
                  </div>
                  <span className={`${PRIORITY_CONFIG[room.priority].color} px-3 py-1 rounded-full text-xs font-semibold`}>
                    {PRIORITY_CONFIG[room.priority].label}
                  </span>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-6 space-y-4">
                {/* Assigned Staff */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {room.assignedTo ? room.assignedTo.charAt(0) : '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Assigned to</p>
                    <p className="font-semibold text-gray-900">{room.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">Progress</span>
                    <span className="text-sm font-bold gradient-text">{room.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        room.progress === 100 ? 'bg-green-500' :
                        room.progress > 50 ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${room.progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  {room.status === 'cleaning' && (
                    <button className="flex-1 glass px-4 py-2 rounded-xl hover:bg-green-50 transition-all text-sm font-medium text-green-600">
                      ✓ Mark Complete
                    </button>
                  )}
                  {room.status === 'dirty' && (
                    <button className="flex-1 glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600">
                      🧹 Start Cleaning
                    </button>
                  )}
                  {room.status === 'clean' && (
                    <button className="flex-1 glass px-4 py-2 rounded-xl hover:bg-orange-50 transition-all text-sm font-medium text-orange-600">
                      ⚠️ Request Inspection
                    </button>
                  )}
                  <button className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-600">
                    📝 Notes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Staff Performance */}
        <div className="glass-card rounded-2xl p-8 mt-8 slide-up" style={{ animationDelay: '1.5s' }}>
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            👥 Staff Performance Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Maria Garcia', completed: 12, quality: 4.9, efficiency: '98%' },
              { name: 'John Doe', completed: 10, quality: 4.7, efficiency: '95%' },
              { name: 'Sarah Miller', completed: 11, quality: 4.8, efficiency: '96%' },
            ].map((staff, index) => (
              <div key={index} className="glass p-6 rounded-xl slide-up" style={{ animationDelay: `${1.6 + index * 0.1}s` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{staff.name}</h3>
                    <p className="text-sm text-gray-600">Housekeeping Staff</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rooms Completed</span>
                    <span className="font-bold gradient-text">{staff.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quality Rating</span>
                    <span className="font-bold text-yellow-600">⭐ {staff.quality}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <span className="font-bold text-green-600">{staff.efficiency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
