'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()

  const rooms = [
    { id: 101, number: '101', type: 'Standard Queen', floor: 1, status: 'clean', price: 199, capacity: 2 },
    { id: 102, number: '102', type: 'Deluxe Suite', floor: 1, status: 'dirty', price: 299, capacity: 3 },
    { id: 201, number: '201', type: 'Executive King', floor: 2, status: 'clean', price: 349, capacity: 2 },
    { id: 202, number: '202', type: 'Ocean View', floor: 2, status: 'inspection', price: 399, capacity: 2 },
    { id: 301, number: '301', type: 'Presidential Suite', floor: 3, status: 'clean', price: 899, capacity: 4 },
    { id: 302, number: '302', type: 'Business Suite', floor: 3, status: 'maintenance', price: 449, capacity: 2 },
  ]

  const STATUS_CONFIG: any = {
    clean: { label: 'Clean', color: 'bg-green-500', icon: '✓' },
    dirty: { label: 'Dirty', color: 'bg-red-500', icon: '✕' },
    inspection: { label: 'Inspection', color: 'bg-orange-500', icon: '⚠️' },
    maintenance: { label: 'Maintenance', color: 'bg-purple-500', icon: '🔧' },
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
                <h1 className="text-3xl font-bold gradient-text">Rooms & Inventory</h1>
                <p className="text-sm text-gray-600">Manage room availability and pricing</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const roomNumber = prompt('Enter room number:');
                if (roomNumber) {
                  alert(`Room ${roomNumber} added successfully!`);
                  router.refresh();
                }
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span>
              <span>Add New Room</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Total Rooms</p>
                <p className="text-4xl font-bold gradient-text">120</p>
              </div>
              <div className="text-5xl float">🏨</div>
            </div>
            <p className="text-sm text-gray-600">Across 5 floors</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Available</p>
                <p className="text-4xl font-bold gradient-text">78</p>
              </div>
              <div className="text-5xl float">✓</div>
            </div>
            <p className="text-sm text-green-600 font-semibold">65% occupancy</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Occupied</p>
                <p className="text-4xl font-bold gradient-text">42</p>
              </div>
              <div className="text-5xl float">👥</div>
            </div>
            <p className="text-sm text-blue-600 font-semibold">Currently staying</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Out of Service</p>
                <p className="text-4xl font-bold gradient-text">8</p>
              </div>
              <div className="text-5xl float">🔧</div>
            </div>
            <p className="text-sm text-orange-600 font-semibold">Maintenance/Cleaning</p>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="glass-card rounded-2xl p-6 mb-8 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Rooms', icon: '🏨' },
                { id: 'available', label: 'Available', icon: '✓' },
                { id: 'occupied', label: 'Occupied', icon: '👥' },
                { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'glass hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none">
                <option>All Types</option>
                <option>Standard Queen</option>
                <option>Deluxe Suite</option>
                <option>Executive King</option>
                <option>Ocean View</option>
                <option>Presidential Suite</option>
              </select>
              <select className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none">
                <option>All Floors</option>
                <option>Floor 1</option>
                <option>Floor 2</option>
                <option>Floor 3</option>
              </select>
              <input
                type="search"
                placeholder="Search rooms..."
                className="input-field px-4 py-2 rounded-xl w-48 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.2s' }}>
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="glass-card rounded-2xl overflow-hidden card-hover slide-up"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              {/* Room Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl opacity-30">🛏️</span>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`${STATUS_CONFIG[room.status].color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                    {STATUS_CONFIG[room.status].icon} {STATUS_CONFIG[room.status].label}
                  </span>
                </div>

                {/* Room Number */}
                <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-xl">
                  <span className="text-white font-bold text-xl">Room {room.number}</span>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{room.type}</h3>
                  <p className="text-sm text-gray-600">Floor {room.floor} • Sleeps {room.capacity}</p>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  <span className="glass px-2 py-1 rounded-lg text-xs text-gray-700">📶 WiFi</span>
                  <span className="glass px-2 py-1 rounded-lg text-xs text-gray-700">📺 TV</span>
                  <span className="glass px-2 py-1 rounded-lg text-xs text-gray-700">❄️ AC</span>
                  <span className="glass px-2 py-1 rounded-lg text-xs text-gray-700">☕ Coffee</span>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">Nightly Rate</p>
                    <p className="text-2xl font-bold gradient-text">${room.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => alert(`Editing room ${room.number}...`)}>
                      ✏️ Edit
                    </button>
                    <button className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium text-gray-600" onClick={() => alert(`Viewing calendar for room ${room.number}...`)}>
                      📅 Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="glass-card rounded-2xl p-8 mt-8 slide-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => alert('Opening housekeeping task assignment...')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">🧹</div>
                <span className="font-semibold text-gray-900">Update Housekeeping</span>
              </div>
              <p className="text-sm text-gray-600">Mark rooms as clean/ready</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => alert('Opening bulk price update tool...')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">💲</div>
                <span className="font-semibold text-gray-900">Bulk Price Update</span>
              </div>
              <p className="text-sm text-gray-600">Adjust rates for multiple rooms</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => alert('Generating availability report...')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">📊</div>
                <span className="font-semibold text-gray-900">Availability Report</span>
              </div>
              <p className="text-sm text-gray-600">View occupancy analytics</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => alert('Managing room categories...')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">🏷️</div>
                <span className="font-semibold text-gray-900">Room Categories</span>
              </div>
              <p className="text-sm text-gray-600">Manage room types & amenities</p>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
