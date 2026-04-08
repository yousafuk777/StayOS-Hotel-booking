'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'
import apiClient from '../../../services/apiClient'

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [roomStatsFilter, setRoomStatsFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editRoomData, setEditRoomData] = useState({
    number: '',
    type: 'Standard Queen',
    floor: 1,
    price: 199,
    capacity: 2,
    status: 'clean',
    categoryId: '',
    amenities: [] as string[]
  })
  const [editRoomImageFile, setEditRoomImageFile] = useState<File | null>(null)
  const [editRoomImagePreview, setEditRoomImagePreview] = useState<string | null>(null)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [selectedFloor, setSelectedFloor] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [showAllRooms, setShowAllRooms] = useState(false)
  const [showHousekeepingModal, setShowHousekeepingModal] = useState(false)
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [bulkPriceData, setBulkPriceData] = useState({ categoryId: '', price: 0 })
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/api/v1/rooms/')
      
      // Ensure data is an array before mapping
      if (!Array.isArray(data)) {
        console.error('Expected rooms data to be an array, got:', typeof data)
        setRooms([])
        return
      }
      
      const mappedRooms = data.map((r: any) => ({
        id: r.id,
        number: r.room_number,
        type: r.category?.name || 'Standard Queen',
        categoryId: r.category_id,
        floor: r.floor || 1,
        status: r.status,
        price: r.custom_price || r.category?.base_price || 0,
        capacity: r.category?.capacity || 2,
        amenities: r.notes ? (JSON.parse(r.notes).amenities || []) : [],
        image: r.images && r.images.length > 0 
          ? (r.images.find((img: any) => img.is_primary)?.url || r.images[r.images.length - 1].url) 
          : null
      }))
      setRooms(mappedRooms)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get('/api/v1/rooms/categories')
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchRooms()
    fetchCategories()
  }, [])
  
  const [newRoom, setNewRoom] = useState({
    number: '',
    type: 'Standard Queen',
    floor: 1,
    price: 199,
    capacity: 2,
    status: 'clean',
    amenities: ['wifi', 'tv', 'ac', 'coffee'],
    imageFile: null as File | null
  })
  
  const router = useRouter()
  
  const handleEdit = (room: any) => {
    setSelectedRoom(room)
    setEditRoomData({
      number: room.number,
      type: room.type,
      floor: room.floor,
      status: room.status,
      price: room.price,
      capacity: room.capacity,
      categoryId: room.categoryId,
      amenities: room.amenities
    })
    setEditRoomImageFile(null)
    setEditRoomImagePreview(room.image)
    setShowEditModal(true)
  }

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const updateData = {
        room_number: editRoomData.number,
        floor: editRoomData.floor,
        status: editRoomData.status,
        price: editRoomData.price,
        type: editRoomData.type,
        capacity: editRoomData.capacity,
        amenities: editRoomData.amenities
      }
      
      const { data: updatedRoom } = await apiClient.put(`/api/v1/rooms/${selectedRoom.id}`, updateData)
      
      // Handle image upload if a new file is selected
      if (editRoomImageFile) {
        const formData = new FormData()
        formData.append('file', editRoomImageFile)
        await apiClient.post(`/api/v1/rooms/${selectedRoom.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      
      await fetchRooms()
      setShowEditModal(false)
      setToastMessage('Room updated successfully')
    } catch (error: any) {
      console.error('Error updating room:', error.response?.data || error.message)
      alert(error.response?.data?.detail || 'Failed to update room')
    } finally {
      setLoading(false)
    }
  }

  const STATUS_CONFIG: any = {
    clean: { label: 'Clean', color: 'bg-green-500', icon: '✓' },
    dirty: { label: 'Dirty', color: 'bg-red-500', icon: '✕' },
    inspection: { label: 'Inspection', color: 'bg-orange-500', icon: '⚠️' },
    maintenance: { label: 'Maintenance', color: 'bg-purple-500', icon: '🔧' },
    cleaning: { label: 'Cleaning', color: 'bg-yellow-500', icon: '🧹' },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-3 slide-up">
          <span className="text-xl">✅</span>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

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
                <p className="text-sm text-[#2D4A42]">Manage room availability and pricing</p>
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
          <StatCard
            label="Total Rooms"
            value={rooms.length}
            icon="🏨"
            color="blue"
            subtext={`Across ${Math.max(...rooms.map(r => r.floor))} floors`}
            onClick={() => setActiveTab('all')}
            isActive={activeTab === 'all'}
          />
          <StatCard
            label="Available"
            value={rooms.filter(r => r.status === 'clean').length}
            icon="✓"
            color="green"
            subtext={`${Math.round((rooms.filter(r => r.status === 'clean').length / rooms.length) * 100)}% occupancy`}
            onClick={() => setActiveTab('available')}
            isActive={activeTab === 'available'}
          />
          <StatCard
            label="Occupied"
            value={rooms.filter(r => ['dirty', 'cleaning'].includes(r.status)).length}
            icon="👥"
            color="blue"
            subtext="Currently staying"
            onClick={() => setActiveTab('occupied')}
            isActive={activeTab === 'occupied'}
          />
          <StatCard
            label="Out of Service"
            value={rooms.filter(r => ['maintenance', 'inspection'].includes(r.status)).length}
            icon="🔧"
            color="orange"
            subtext="Maintenance/Cleaning"
            onClick={() => setActiveTab('maintenance')}
            isActive={activeTab === 'maintenance'}
          />
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
                      : 'glass hover:bg-gray-50 text-[#1A2E2B]'
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
                className="glass px-4 py-2 rounded-xl text-[#1A2E2B] focus:outline-none cursor-pointer"
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
                className="glass px-4 py-2 rounded-xl text-[#1A2E2B] focus:outline-none cursor-pointer"
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
                  <p className="text-[#2D4A42]">Try adjusting your filters or add a new room</p>
                </div>
              )
            }
            
            return displayRooms.map((room, index) => (
              <div
                key={room.id}
                className="glass-card rounded-2xl overflow-hidden card-hover slide-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
              {/* Room Image */}
              <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 relative overflow-hidden">
                {room.image ? (
                  <img src={room.image.startsWith('http') ? room.image : `http://localhost:8000${room.image}`} alt={`Room ${room.number}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl opacity-30">🛏️</span>
                  </div>
                )}
                
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
                  <h3 className="text-xl font-bold text-[#1A2E2B] mb-1">{room.type}</h3>
                  <p className="text-sm text-[#2D4A42]">Floor {room.floor} • Sleeps {room.capacity}</p>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  {room.amenities && room.amenities.map((amenity: string) => {
                    const amenityConfig: any = {
                      wifi: { icon: '📶', label: 'WiFi' },
                      tv: { icon: '📺', label: 'TV' },
                      ac: { icon: '❄️', label: 'AC' },
                      coffee: { icon: '☕', label: 'Coffee' }
                    }
                    const config = amenityConfig[amenity]
                    return config ? (
                      <span key={amenity} className="glass px-2 py-1 rounded-lg text-xs text-[#1A2E2B]">
                        {config.icon} {config.label}
                      </span>
                    ) : null
                  })}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-[#2D4A42]">Nightly Rate</p>
                    <p className="text-2xl font-bold gradient-text">${room.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600" onClick={() => handleEdit(room)}>
                      ✏️ Edit
                    </button>
                    <button className="glass px-4 py-2 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium text-[#2D4A42]" onClick={() => {
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
            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => setShowHousekeepingModal(true)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">🧹</div>
                <span className="font-semibold text-[#1A2E2B]">Update Housekeeping</span>
              </div>
              <p className="text-sm text-[#2D4A42]">Mark rooms as clean/ready</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => setShowBulkPriceModal(true)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">💲</div>
                <span className="font-semibold text-[#1A2E2B]">Bulk Price Update</span>
              </div>
              <p className="text-sm text-[#2D4A42]">Adjust rates for multiple rooms</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => setShowReportModal(true)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">📊</div>
                <span className="font-semibold text-[#1A2E2B]">Availability Report</span>
              </div>
              <p className="text-sm text-[#2D4A42]">View occupancy analytics</p>
            </button>

            <button className="glass p-6 rounded-xl card-hover text-left group" onClick={() => setShowCategoriesModal(true)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform">🏷️</div>
                <span className="font-semibold text-[#1A2E2B]">Room Categories</span>
              </div>
              <p className="text-sm text-[#2D4A42]">Manage room types & amenities</p>
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

            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const res = await apiClient.post('/api/v1/rooms/', {
                  room_number: newRoom.number,
                  type: newRoom.type,
                  floor: newRoom.floor,
                  status: newRoom.status,
                  price: newRoom.price,
                  capacity: newRoom.capacity,
                  amenities: newRoom.amenities
                });
                
                if (newRoom.imageFile) {
                  const formData = new FormData();
                  formData.append("file", newRoom.imageFile);
                  await apiClient.post(`/api/v1/rooms/${res.data.id}/image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                }
                
                await fetchRooms();
                setShowAddModal(false)
                setToastMessage('Room added successfully!')
                setNewRoom({ number: '', type: 'Standard Queen', floor: 1, price: 199, capacity: 2, status: 'clean', amenities: [], imageFile: null })
              } catch (error) {
                console.error('Error creating room:', error)
                alert('Failed to create room')
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewRoom({ ...newRoom, imageFile: e.target.files[0] })
                      }
                    }}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room Number *</label>
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
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room Type *</label>
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
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room Status *</label>
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
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Floor *</label>
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
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Price per Night ($) *</label>
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
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Capacity (Guests) *</label>
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

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-3">Room Amenities</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'wifi', icon: '📶', label: 'WiFi' },
                      { key: 'tv', icon: '📺', label: 'TV' },
                      { key: 'ac', icon: '❄️', label: 'Air Conditioning' },
                      { key: 'coffee', icon: '☕', label: 'Coffee Maker' }
                    ].map((amenity) => (
                      <label key={amenity.key} className="flex items-center gap-3 glass p-3 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={newRoom.amenities.includes(amenity.key)}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setNewRoom({
                              ...newRoom,
                              amenities: checked
                                ? [...newRoom.amenities, amenity.key]
                                : newRoom.amenities.filter(a => a !== amenity.key)
                            })
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-[#1A2E2B]">
                          {amenity.icon} {amenity.label}
                        </span>
                      </label>
                    ))}
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

            <form onSubmit={handleUpdateRoom}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room Number *</label>
                  <input
                    type="text"
                    value={editRoomData.number}
                    onChange={(e) => setEditRoomData({ ...editRoomData, number: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room Type *</label>
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
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room Status *</label>
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
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Floor *</label>
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
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Price per Night ($) *</label>
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
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Capacity (Guests) *</label>
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

                {/* Image Upload for Editing */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#1A2E2B] mb-2 uppercase tracking-wider">Room Image</label>
                  <div className="flex flex-col items-center gap-4 p-6 glass rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all group">
                    {editRoomImagePreview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                        <img src={editRoomImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => {
                            setEditRoomImageFile(null)
                            setEditRoomImagePreview(null)
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4 cursor-pointer w-full" onClick={() => document.getElementById('edit-room-image')?.click()}>
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📸</div>
                        <p className="text-sm font-bold text-[#1A2E2B]">Click to change image</p>
                        <p className="text-xs text-[#2D4A42]">JPG, PNG or WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input 
                      id="edit-room-image"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setEditRoomImageFile(file)
                          setEditRoomImagePreview(URL.createObjectURL(file))
                        }
                      }}
                    />
                    {editRoomImagePreview && (
                       <button 
                         type="button"
                         onClick={() => document.getElementById('edit-room-image')?.click()}
                         className="text-sm font-bold text-blue-600 hover:underline"
                       >
                         Change Image
                       </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#1A2E2B] mb-2 uppercase tracking-wider">Amenities</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['WiFi', 'TV', 'AC', 'Coffee'].map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editRoomData.amenities?.includes(amenity) || false}
                          onChange={(e) => {
                            const updatedAmenities = e.target.checked
                              ? [...(editRoomData.amenities || []), amenity]
                              : (editRoomData.amenities || []).filter(a => a !== amenity);
                            setEditRoomData({ ...editRoomData, amenities: updatedAmenities });
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-[#1A2E2B]">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('⚠️ Are you sure you want to delete this room? This action cannot be undone.')) {
                        try {
                          setIsDeleting(true)
                          await apiClient.delete(`/api/v1/rooms/${selectedRoom.id}`)
                          await fetchRooms()
                          setShowEditModal(false)
                          setSelectedRoom(null)
                          setToastMessage('Room deleted successfully')
                        } catch (error) {
                          console.error('Error deleting room:', error)
                          alert('Failed to delete room')
                        } finally {
                          setIsDeleting(false)
                        }
                      }
                    }}
                    className="glass px-6 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all border border-red-100 flex items-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : '🗑️ Delete Room'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold text-white shadow-lg"
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
              <p className="text-[#2D4A42] mb-4">View and manage bookings for this room</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-[#1A2E2B] mb-2">📍 Room {selectedRoom.number}</h3>
                <p className="text-[#1A2E2B] mb-1"><strong>Type:</strong> {selectedRoom.type}</p>
                <p className="text-[#1A2E2B] mb-1"><strong>Floor:</strong> Floor {selectedRoom.floor}</p>
                <p className="text-[#1A2E2B] mb-1"><strong>Price:</strong> ${selectedRoom.price}/night</p>
                <p className="text-[#1A2E2B] mb-1"><strong>Capacity:</strong> {selectedRoom.capacity} guests</p>
                <p className="text-[#1A2E2B]"><strong>Status:</strong> <span className={`font-semibold capitalize ${
                  selectedRoom.status === 'clean' ? 'text-green-600' :
                  selectedRoom.status === 'dirty' ? 'text-orange-600' :
                  selectedRoom.status === 'maintenance' ? 'text-red-600' :
                  'text-blue-600'
                }`}>{selectedRoom.status}</span></p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-6">
              <h4 className="text-lg font-bold text-[#1A2E2B] mb-3">📆 Upcoming Availability</h4>
              <p className="text-[#1A2E2B] mb-2">This feature would show a calendar view with:</p>
              <ul className="list-disc list-inside space-y-1 text-[#1A2E2B]">
                <li>Current bookings and reservations</li>
                <li>Check-in and check-out dates</li>
                <li>Blocked dates for maintenance</li>
                <li>Available dates for new bookings</li>
              </ul>
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-100">
                <p className="text-sm text-[#2D4A42]">💡 In the full version, this would integrate with the booking system to show real-time availability.</p>
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
      {/* Housekeeping Modal */}
      {showHousekeepingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text flex items-center gap-2">🧹 Housekeeping Manager</h2>
              <button onClick={() => setShowHousekeepingModal(false)} className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-4">
              {rooms.filter(r => r.status !== 'clean').length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-[#1A2E2B]">All Rooms Clean!</h3>
                  <p className="text-[#2D4A42]">Great job. All rooms are currently ready for guests.</p>
                </div>
              ) : (
                rooms.filter(r => r.status !== 'clean').map(room => (
                  <div key={room.id} className="glass p-4 rounded-xl flex items-center justify-between border border-gray-100 card-hover">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${STATUS_CONFIG[room.status].color}`}>
                        {room.number}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A2E2B]">{room.type}</p>
                        <p className="text-xs text-[#2D4A42] uppercase font-semibold flex items-center gap-1">
                          {STATUS_CONFIG[room.status].icon} {STATUS_CONFIG[room.status].label}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          await apiClient.put(`/api/v1/rooms/${room.id}`, { status: 'clean' });
                          await fetchRooms();
                          setToastMessage(`Room ${room.number} marked as Clean!`);
                        } catch (error) {
                          alert('Failed to update room');
                        }
                      }}
                      className="btn-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all"
                    >
                      ✓ Mark Clean
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowHousekeepingModal(false)}
              className="w-full mt-8 glass py-4 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bulk Price Modal */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">💲 Bulk Rate Update</h2>
              <button onClick={() => setShowBulkPriceModal(false)} className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const roomsToUpdate = rooms.filter(r => r.categoryId === parseInt(bulkPriceData.categoryId));
              if (roomsToUpdate.length === 0) return alert('No rooms found in this category');
              
              if (confirm(`Update ${roomsToUpdate.length} rooms to $${bulkPriceData.price}/night?`)) {
                try {
                  const updatePromises = roomsToUpdate.map(room => 
                    apiClient.put(`/api/v1/rooms/${room.id}`, { price: bulkPriceData.price })
                  );
                  await Promise.all(updatePromises);
                  await fetchRooms();
                  setShowBulkPriceModal(false);
                  setToastMessage('Bulk rates updated successfully!');
                } catch (error) {
                  alert('Bulk update failed');
                }
              }
            }}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#1A2E2B] mb-2">Select Room Type</label>
                  <select 
                    className="input-field w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none"
                    value={bulkPriceData.categoryId}
                    onChange={(e) => setBulkPriceData({ ...bulkPriceData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Choose a category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#1A2E2B] mb-2">New Nightly Rate ($)</label>
                  <input 
                    type="number"
                    className="input-field w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none"
                    placeholder="e.g. 299"
                    value={bulkPriceData.price || ''}
                    onChange={(e) => setBulkPriceData({ ...bulkPriceData, price: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800">
                    💡 This will override the custom price for every room in the selected category.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowBulkPriceModal(false)} className="flex-1 glass py-3 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-200">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary text-white py-3 rounded-xl font-bold shadow-lg">Update All</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Availability Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">📊 Inventory Analytics</h2>
              <button onClick={() => setShowReportModal(false)} className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass p-6 rounded-2xl border-l-4 border-l-green-500 bg-white">
                <h4 className="text-sm text-[#2D4A42] uppercase font-bold mb-1">Occupancy Rate</h4>
                <p className="text-4xl font-black text-green-600">
                  {Math.round((rooms.filter(r => r.status === 'clean').length / rooms.length) * 100)}%
                </p>
                <p className="text-xs text-[#2D4A42] mt-1">Available for check-in</p>
              </div>
              <div className="glass p-6 rounded-2xl border-l-4 border-l-blue-500 bg-white">
                <h4 className="text-sm text-[#2D4A42] uppercase font-bold mb-1">Total Assets</h4>
                <p className="text-4xl font-black text-blue-600">{rooms.length}</p>
                <p className="text-xs text-[#2D4A42] mt-1">Live Inventory</p>
              </div>
              <div className="glass p-6 rounded-2xl border-l-4 border-l-orange-500 bg-white">
                <h4 className="text-sm text-[#2D4A42] uppercase font-bold mb-1">Off-Market</h4>
                <p className="text-4xl font-black text-orange-600">{rooms.filter(r => r.status === 'maintenance').length}</p>
                <p className="text-xs text-[#2D4A42] mt-1">Under Maintenance</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#1A2E2B] border-b pb-2">Status Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(STATUS_CONFIG).map(statusKey => (
                  <div key={statusKey} className="flex items-center justify-between glass p-4 rounded-xl bg-white border border-gray-100">
                    <span className="flex items-center gap-2 font-medium">
                      <span className={`w-3 h-3 rounded-full ${STATUS_CONFIG[statusKey].color}`}></span>
                      {STATUS_CONFIG[statusKey].label}
                    </span>
                    <span className="font-bold text-lg">{rooms.filter(r => r.status === statusKey).length} Rooms</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-[#2D4A42] to-[#1A2E2B] p-8 rounded-2xl text-white shadow-xl mt-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold italic tracking-wider opacity-90">StayOS Intelligence</h3>
                    <p className="text-blue-200 text-sm">Automated Inventory Report - {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-5xl opacity-20 font-serif">OS</div>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <p className="text-blue-100 text-sm mb-1 uppercase font-bold tracking-widest">Potential Rev/Night</p>
                    <p className="text-4xl font-black text-white italic">
                      ${rooms.reduce((acc, r) => acc + (parseInt(r.price) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm mb-1 uppercase font-bold tracking-widest">Available Rev</p>
                    <p className="text-4xl font-black text-green-400 italic">
                      ${rooms.filter(r => r.status === 'clean').reduce((acc, r) => acc + (parseInt(r.price) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Categories Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text flex items-center gap-2">🏷️ Category Manager</h2>
              <button onClick={() => setShowCategoriesModal(false)} className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">✕</button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="glass p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-all">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1A2E2B]">{cat.name}</h3>
                    <p className="text-sm text-[#2D4A42] flex items-center gap-3">
                      <span>👤 Capacity: {cat.capacity}</span>
                      <span>💰 Base: ${cat.base_price}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-24">
                      <label className="text-[10px] uppercase font-bold text-[#2D4A42]">Base Price</label>
                      <input 
                        type="number" 
                        defaultValue={cat.base_price}
                        onBlur={async (e) => {
                          const val = parseInt(e.target.value);
                          if (val !== cat.base_price) {
                            try {
                              await apiClient.put(`/api/v1/rooms/categories/${cat.id}`, { base_price: val });
                              await fetchCategories();
                              setToastMessage(`${cat.name} price updated!`);
                            } catch (error) {
                              alert('Update failed');
                            }
                          }
                        }}
                        className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] uppercase font-bold text-[#2D4A42]">Guests</label>
                      <input 
                        type="number" 
                        defaultValue={cat.capacity}
                        onBlur={async (e) => {
                          const val = parseInt(e.target.value);
                          if (val !== cat.capacity) {
                            try {
                              await apiClient.put(`/api/v1/rooms/categories/${cat.id}`, { capacity: val });
                              await fetchCategories();
                              setToastMessage(`${cat.name} capacity updated!`);
                            } catch (error) {
                              alert('Update failed');
                            }
                          }
                        }}
                        className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-xl font-bold flex items-center justify-center">
                      {rooms.filter(r => r.categoryId === cat.id).length} Rms
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 items-center">
              <span className="text-xl">💡</span>
              <p className="text-sm text-orange-800">
                Updating categories will ONLY affect future additions and default fallback prices. Active rooms with custom rates will keep those rates.
              </p>
            </div>
            
            <button
              onClick={() => setShowCategoriesModal(false)}
              className="w-full mt-8 glass py-4 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-200"
            >
              Finish Editing
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
