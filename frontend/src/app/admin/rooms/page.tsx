'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [selectedFloor, setSelectedFloor] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [showAllRooms, setShowAllRooms] = useState(false)
  const [editRoomData, setEditRoomData] = useState({
    number: '',
    type: 'Standard Queen',
    floor: 1,
    price: 199,
    capacity: 2,
    status: 'clean'
  })
  
  // Initialize rooms from localStorage or use defaults
  const [rooms, setRooms] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedRooms = localStorage.getItem('rooms')
      if (storedRooms) {
        try {
          const parsed = JSON.parse(storedRooms)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        } catch (e) {
          console.error('Error loading rooms from localStorage:', e)
        }
      }
    }
    // Default rooms - 10 rooms per floor for 5 floors (50 total)
    return [
      // Floor 1 - Rooms 101-110
      { id: 101, number: '101', type: 'Standard Queen', floor: 1, status: 'clean', price: 199, capacity: 2 },
      { id: 102, number: '102', type: 'Deluxe Suite', floor: 1, status: 'dirty', price: 299, capacity: 3 },
      { id: 103, number: '103', type: 'Executive King', floor: 1, status: 'clean', price: 349, capacity: 2 },
      { id: 104, number: '104', type: 'Ocean View', floor: 1, status: 'inspection', price: 399, capacity: 2 },
      { id: 105, number: '105', type: 'Business Suite', floor: 1, status: 'clean', price: 449, capacity: 2 },
      { id: 106, number: '106', type: 'Standard Queen', floor: 1, status: 'maintenance', price: 199, capacity: 2 },
      { id: 107, number: '107', type: 'Deluxe Suite', floor: 1, status: 'clean', price: 299, capacity: 3 },
      { id: 108, number: '108', type: 'Executive King', floor: 1, status: 'cleaning', price: 349, capacity: 2 },
      { id: 109, number: '109', type: 'Presidential Suite', floor: 1, status: 'clean', price: 899, capacity: 4 },
      { id: 110, number: '110', type: 'Business Suite', floor: 1, status: 'clean', price: 449, capacity: 2 },
      
      // Floor 2 - Rooms 201-210
      { id: 201, number: '201', type: 'Executive King', floor: 2, status: 'clean', price: 349, capacity: 2 },
      { id: 202, number: '202', type: 'Ocean View', floor: 2, status: 'dirty', price: 399, capacity: 2 },
      { id: 203, number: '203', type: 'Presidential Suite', floor: 2, status: 'clean', price: 899, capacity: 4 },
      { id: 204, number: '204', type: 'Standard Queen', floor: 2, status: 'inspection', price: 199, capacity: 2 },
      { id: 205, number: '205', type: 'Deluxe Suite', floor: 2, status: 'clean', price: 299, capacity: 3 },
      { id: 206, number: '206', type: 'Executive King', floor: 2, status: 'maintenance', price: 349, capacity: 2 },
      { id: 207, number: '207', type: 'Ocean View', floor: 2, status: 'clean', price: 399, capacity: 2 },
      { id: 208, number: '208', type: 'Business Suite', floor: 2, status: 'cleaning', price: 449, capacity: 2 },
      { id: 209, number: '209', type: 'Standard Queen', floor: 2, status: 'clean', price: 199, capacity: 2 },
      { id: 210, number: '210', type: 'Deluxe Suite', floor: 2, status: 'clean', price: 299, capacity: 3 },
      
      // Floor 3 - Rooms 301-310
      { id: 301, number: '301', type: 'Presidential Suite', floor: 3, status: 'clean', price: 899, capacity: 4 },
      { id: 302, number: '302', type: 'Business Suite', floor: 3, status: 'dirty', price: 449, capacity: 2 },
      { id: 303, number: '303', type: 'Ocean View', floor: 3, status: 'clean', price: 399, capacity: 2 },
      { id: 304, number: '304', type: 'Executive King', floor: 3, status: 'inspection', price: 349, capacity: 2 },
      { id: 305, number: '305', type: 'Deluxe Suite', floor: 3, status: 'clean', price: 299, capacity: 3 },
      { id: 306, number: '306', type: 'Standard Queen', floor: 3, status: 'maintenance', price: 199, capacity: 2 },
      { id: 307, number: '307', type: 'Presidential Suite', floor: 3, status: 'clean', price: 899, capacity: 4 },
      { id: 308, number: '308', type: 'Ocean View', floor: 3, status: 'cleaning', price: 399, capacity: 2 },
      { id: 309, number: '309', type: 'Executive King', floor: 3, status: 'clean', price: 349, capacity: 2 },
      { id: 310, number: '310', type: 'Business Suite', floor: 3, status: 'clean', price: 449, capacity: 2 },
      
      // Floor 4 - Rooms 401-410
      { id: 401, number: '401', type: 'Standard Queen', floor: 4, status: 'clean', price: 199, capacity: 2 },
      { id: 402, number: '402', type: 'Deluxe Suite', floor: 4, status: 'dirty', price: 299, capacity: 3 },
      { id: 403, number: '403', type: 'Executive King', floor: 4, status: 'clean', price: 349, capacity: 2 },
      { id: 404, number: '404', type: 'Ocean View', floor: 4, status: 'inspection', price: 399, capacity: 2 },
      { id: 405, number: '405', type: 'Business Suite', floor: 4, status: 'clean', price: 449, capacity: 2 },
      { id: 406, number: '406', type: 'Standard Queen', floor: 4, status: 'maintenance', price: 199, capacity: 2 },
      { id: 407, number: '407', type: 'Deluxe Suite', floor: 4, status: 'clean', price: 299, capacity: 3 },
      { id: 408, number: '408', type: 'Executive King', floor: 4, status: 'cleaning', price: 349, capacity: 2 },
      { id: 409, number: '409', type: 'Presidential Suite', floor: 4, status: 'clean', price: 899, capacity: 4 },
      { id: 410, number: '410', type: 'Business Suite', floor: 4, status: 'clean', price: 449, capacity: 2 },
      
      // Floor 5 - Rooms 501-510
      { id: 501, number: '501', type: 'Executive King', floor: 5, status: 'clean', price: 349, capacity: 2 },
      { id: 502, number: '502', type: 'Ocean View', floor: 5, status: 'dirty', price: 399, capacity: 2 },
      { id: 503, number: '503', type: 'Presidential Suite', floor: 5, status: 'clean', price: 899, capacity: 4 },
      { id: 504, number: '504', type: 'Standard Queen', floor: 5, status: 'inspection', price: 199, capacity: 2 },
      { id: 505, number: '505', type: 'Deluxe Suite', floor: 5, status: 'clean', price: 299, capacity: 3 },
      { id: 506, number: '506', type: 'Executive King', floor: 5, status: 'maintenance', price: 349, capacity: 2 },
      { id: 507, number: '507', type: 'Ocean View', floor: 5, status: 'clean', price: 399, capacity: 2 },
      { id: 508, number: '508', type: 'Business Suite', floor: 5, status: 'cleaning', price: 449, capacity: 2 },
      { id: 509, number: '509', type: 'Standard Queen', floor: 5, status: 'clean', price: 199, capacity: 2 },
      { id: 510, number: '510', type: 'Deluxe Suite', floor: 5, status: 'clean', price: 299, capacity: 3 },
    ]
  })
  
  const [newRoom, setNewRoom] = useState({
    number: '',
    type: 'Standard Queen',
    floor: 1,
    price: 199,
    capacity: 2,
    status: 'clean'
  })
  
  const router = useRouter()
  
  // Save rooms to localStorage whenever they change
  useEffect(() => {
    console.log('Saving rooms to localStorage:', rooms.length, 'rooms')
    localStorage.setItem('rooms', JSON.stringify(rooms))
  }, [rooms])

  const STATUS_CONFIG: any = {
    clean: { label: 'Clean', color: 'bg-green-500', icon: '✓' },
    dirty: { label: 'Dirty', color: 'bg-red-500', icon: '✕' },
    inspection: { label: 'Inspection', color: 'bg-orange-500', icon: '⚠️' },
    maintenance: { label: 'Maintenance', color: 'bg-purple-500', icon: '🔧' },
    cleaning: { label: 'Cleaning', color: 'bg-yellow-500', icon: '🧹' },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="glass-card border-b border-gray-200 mb-8">
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
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span>
              <span>Add New Room</span>
            </button>
            
            <button
              onClick={() => {
                if (confirm('⚠️ This will delete all custom room data and restore the default 50 rooms. Are you sure?')) {
                  localStorage.removeItem('rooms')
                  window.location.reload()
                }
              }}
              className="glass px-4 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all text-red-600 border border-red-200 cursor-pointer text-sm ml-2"
            >
              🔄 Reset to 50 Rooms
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
                <p className="text-4xl font-bold gradient-text">{rooms.length}</p>
              </div>
              <div className="text-5xl float">🏨</div>
            </div>
            <p className="text-sm text-gray-600">Across {Math.max(...rooms.map(r => r.floor))} floors</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Available</p>
                <p className="text-4xl font-bold gradient-text">{rooms.filter(r => r.status === 'clean').length}</p>
              </div>
              <div className="text-5xl float">✓</div>
            </div>
            <p className="text-sm text-green-600 font-semibold">
              {Math.round((rooms.filter(r => r.status === 'clean').length / rooms.length) * 100)}% occupancy
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Occupied</p>
                <p className="text-4xl font-bold gradient-text">{rooms.filter(r => ['dirty', 'cleaning'].includes(r.status)).length}</p>
              </div>
              <div className="text-5xl float">👥</div>
            </div>
            <p className="text-sm text-blue-600 font-semibold">Currently staying</p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 font-medium mb-2">Out of Service</p>
                <p className="text-4xl font-bold gradient-text">{rooms.filter(r => ['maintenance', 'inspection'].includes(r.status)).length}</p>
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
              <select 
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Standard Queen">Standard Queen</option>
                <option value="Deluxe Suite">Deluxe Suite</option>
                <option value="Executive King">Executive King</option>
                <option value="Ocean View">Ocean View</option>
                <option value="Presidential Suite">Presidential Suite</option>
                <option value="Business Suite">Business Suite</option>
              </select>
              <select 
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Floors</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
              </select>
              <input
                type="search"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field px-4 py-2 rounded-xl w-48 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* See All Button */}
        {(() => {
          const filteredRooms = rooms.filter(room => {
            // Tab filter
            if (activeTab !== 'all') {
              if (activeTab === 'available' && room.status !== 'clean') return false
              if (activeTab === 'occupied' && room.status === 'clean') return false
              if (activeTab === 'maintenance' && !['maintenance', 'inspection'].includes(room.status)) return false
            }
            
            // Type filter
            if (selectedRoomType !== 'all' && room.type !== selectedRoomType) return false
            
            // Floor filter
            if (selectedFloor !== 'all' && room.floor.toString() !== selectedFloor) return false
            
            // Search filter
            if (searchQuery && !room.number.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !room.type.toLowerCase().includes(searchQuery.toLowerCase())) return false
            
            return true
          })
          
          if (filteredRooms.length > 6 && !showAllRooms) {
            return (
              <div className="text-center mb-6 slide-up" style={{ animationDelay: '0.25s' }}>
                <button 
                  onClick={() => setShowAllRooms(true)}
                  className="btn-primary px-8 py-3 rounded-xl font-semibold cursor-pointer"
                >
                  See All Rooms ({filteredRooms.length})
                </button>
              </div>
            )
          }
          return null
        })()}

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.2s' }}>
          {(() => {
            // Filter rooms based on tab, type, floor, and search
            const filteredRooms = rooms.filter(room => {
              // Tab filter
              if (activeTab !== 'all') {
                if (activeTab === 'available' && room.status !== 'clean') return false
                if (activeTab === 'occupied' && room.status === 'clean') return false
                if (activeTab === 'maintenance' && !['maintenance', 'inspection'].includes(room.status)) return false
              }
              
              // Type filter
              if (selectedRoomType !== 'all' && room.type !== selectedRoomType) return false
              
              // Floor filter
              if (selectedFloor !== 'all' && room.floor.toString() !== selectedFloor) return false
              
              // Search filter
              if (searchQuery && !room.number.toLowerCase().includes(searchQuery.toLowerCase()) && 
                  !room.type.toLowerCase().includes(searchQuery.toLowerCase())) return false
              
              return true
            })
            
            const displayRooms = showAllRooms ? filteredRooms : filteredRooms.slice(0, 6)
            
            if (displayRooms.length === 0) {
              return (
                <div className="col-span-full text-center py-20">
                  <div className="text-6xl mb-4">🏨</div>
                  <h3 className="text-2xl font-bold gradient-text mb-2">No Rooms Found</h3>
                  <p className="text-gray-600">Try adjusting your filters or add a new room</p>
                </div>
              )
            }
            
            return displayRooms.map((room, index) => (
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
                    <button className="glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => {
                      setSelectedRoom(room)
                      setEditRoomData({
                        number: room.number,
                        type: room.type,
                        floor: room.floor,
                        price: room.price,
                        capacity: room.capacity,
                        status: room.status
                      })
                      setShowEditModal(true)
                    }}>
                      ✏️ Edit
                    </button>
                    <button className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium text-gray-600" onClick={() => {
                      setSelectedRoom(room)
                      setShowCalendarModal(true)
                    }}>
                      📅 Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        })()}
        </div>

        {/* Bulk Actions */}
        <div className="glass-card rounded-2xl p-8 mt-8 slide-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => {}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">🧹</div>
                <span className="font-semibold text-gray-900">Update Housekeeping</span>
              </div>
              <p className="text-sm text-gray-600">Mark rooms as clean/ready</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => {
              // Bulk price update logic would go here
            }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">💲</div>
                <span className="font-semibold text-gray-900">Bulk Price Update</span>
              </div>
              <p className="text-sm text-gray-600">Adjust rates for multiple rooms</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => {
              // Availability report logic would go here
            }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">📊</div>
                <span className="font-semibold text-gray-900">Availability Report</span>
              </div>
              <p className="text-sm text-gray-600">View occupancy analytics</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => {
              // Room categories management logic would go here
            }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">🏷️</div>
                <span className="font-semibold text-gray-900">Room Categories</span>
              </div>
              <p className="text-sm text-gray-600">Manage room types & amenities</p>
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">➕ Add New Room</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const room = {
                id: Date.now(),
                number: newRoom.number,
                type: newRoom.type,
                floor: newRoom.floor,
                status: 'clean',
                price: newRoom.price,
                capacity: newRoom.capacity
              }
              setRooms([...rooms, room])
              setShowAddModal(false)
              setNewRoom({ number: '', type: 'Standard Queen', floor: 1, price: 199, capacity: 2, status: 'clean' })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number *</label>
                  <input
                    type="text"
                    value={newRoom.number}
                    onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                    placeholder="e.g., 103"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
                    <select
                      value={newRoom.type}
                      onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Standard Queen">Standard Queen</option>
                      <option value="Deluxe Suite">Deluxe Suite</option>
                      <option value="Executive King">Executive King</option>
                      <option value="Ocean View">Ocean View</option>
                      <option value="Presidential Suite">Presidential Suite</option>
                      <option value="Business Suite">Business Suite</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Status *</label>
                    <select
                      value={newRoom.status}
                      onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="clean">✓ Clean (Available)</option>
                      <option value="dirty">⚠️ Dirty (Needs Cleaning)</option>
                      <option value="inspection">🔍 Inspection Required</option>
                      <option value="maintenance">🔧 Under Maintenance</option>
                      <option value="cleaning">🧹 Currently Cleaning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Floor *</label>
                    <select
                      value={newRoom.floor}
                      onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="1">Floor 1</option>
                      <option value="2">Floor 2</option>
                      <option value="3">Floor 3</option>
                      <option value="4">Floor 4</option>
                      <option value="5">Floor 5</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Night ($) *</label>
                    <input
                      type="number"
                      value={newRoom.price}
                      onChange={(e) => setNewRoom({ ...newRoom, price: parseInt(e.target.value) })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity (Guests) *</label>
                    <input
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold"
                  >
                    ✓ Add Room
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">✏️ Edit Room Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const updatedRooms = rooms.map(r => 
                r.id === selectedRoom.id ? {
                  ...r,
                  number: editRoomData.number,
                  type: editRoomData.type,
                  floor: editRoomData.floor,
                  price: editRoomData.price,
                  capacity: editRoomData.capacity
                } : r
              )
              setRooms(updatedRooms)
              setShowEditModal(false)
              setSelectedRoom(null)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number *</label>
                  <input
                    type="text"
                    value={editRoomData.number}
                    onChange={(e) => setEditRoomData({ ...editRoomData, number: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
                  <select
                    value={editRoomData.type}
                    onChange={(e) => setEditRoomData({ ...editRoomData, type: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option>Standard Queen</option>
                    <option>Deluxe Suite</option>
                    <option>Executive King</option>
                    <option>Ocean View</option>
                    <option>Presidential Suite</option>
                    <option>Business Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Status *</label>
                  <select
                    value={editRoomData.status}
                    onChange={(e) => setEditRoomData({ ...editRoomData, status: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="clean">✓ Clean (Available)</option>
                    <option value="dirty">⚠️ Dirty (Needs Cleaning)</option>
                    <option value="inspection">🔍 Inspection Required</option>
                    <option value="maintenance">🔧 Under Maintenance</option>
                    <option value="cleaning">🧹 Currently Cleaning</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Floor *</label>
                    <input
                      type="number"
                      value={editRoomData.floor}
                      onChange={(e) => setEditRoomData({ ...editRoomData, floor: parseInt(e.target.value) })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Night ($) *</label>
                    <input
                      type="number"
                      value={editRoomData.price}
                      onChange={(e) => setEditRoomData({ ...editRoomData, price: parseInt(e.target.value) })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity (Guests) *</label>
                  <input
                    type="number"
                    value={editRoomData.capacity}
                    onChange={(e) => setEditRoomData({ ...editRoomData, capacity: parseInt(e.target.value) })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                    required
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold"
                  >
                    ✓ Update Room
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Calendar Modal */}
      {showCalendarModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">📅 Room {selectedRoom.number} Calendar</h2>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">View and manage bookings for this room</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">📍 Room {selectedRoom.number}</h3>
                <p className="text-gray-700 mb-1"><strong>Type:</strong> {selectedRoom.type}</p>
                <p className="text-gray-700 mb-1"><strong>Floor:</strong> Floor {selectedRoom.floor}</p>
                <p className="text-gray-700 mb-1"><strong>Price:</strong> ${selectedRoom.price}/night</p>
                <p className="text-gray-700 mb-1"><strong>Capacity:</strong> {selectedRoom.capacity} guests</p>
                <p className="text-gray-700"><strong>Status:</strong> <span className={`font-semibold capitalize ${
                  selectedRoom.status === 'clean' ? 'text-green-600' :
                  selectedRoom.status === 'dirty' ? 'text-orange-600' :
                  selectedRoom.status === 'maintenance' ? 'text-red-600' :
                  'text-blue-600'
                }`}>{selectedRoom.status}</span></p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">📆 Upcoming Availability</h4>
              <p className="text-gray-700 mb-2">This feature would show a calendar view with:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Current bookings and reservations</li>
                <li>Check-in and check-out dates</li>
                <li>Blocked dates for maintenance</li>
                <li>Available dates for new bookings</li>
              </ul>
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-100">
                <p className="text-sm text-gray-600">💡 In the full version, this would integrate with the booking system to show real-time availability.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/admin/new-booking?room=${selectedRoom.id}`)
                  setShowCalendarModal(false)
                }}
                className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold"
              >
                ➕ Create Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
