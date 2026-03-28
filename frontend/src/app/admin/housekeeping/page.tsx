'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'

export default function HousekeepingPage() {
  const [filter, setFilter] = useState('all')
  const [housekeepingFilter, setHousekeepingFilter] = useState<'all' | 'clean' | 'dirty' | 'cleaning' | 'inspection' | 'maintenance'>('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingList, setBookingList] = useState<any[]>([])
  const [showAllRooms, setShowAllRooms] = useState(false)

  // Initialize rooms from localStorage or use defaults
  const [rooms, setRooms] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedRooms = localStorage.getItem('rooms')
      if (storedRooms) {
        try {
          const parsed = JSON.parse(storedRooms)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Add housekeeping fields if not present
            return parsed.map((room: any) => ({
              ...room,
              priority: room.priority || 'normal',
              assignedTo: room.assignedTo || null,
              progress: room.progress !== undefined ? room.progress : (room.status === 'clean' ? 100 : room.status === 'cleaning' ? 50 : 0)
            }))
          }
        } catch (e) {
          console.error('Error loading rooms from localStorage:', e)
        }
      }
    }
    // Default rooms with housekeeping fields
    return [
      { id: 101, number: '101', type: 'Standard Queen', status: 'clean', priority: 'normal', assignedTo: 'Maria G.', progress: 100 },
      { id: 102, number: '102', type: 'Deluxe Suite', status: 'dirty', priority: 'high', assignedTo: 'John D.', progress: 0 },
      { id: 201, number: '201', type: 'Executive King', status: 'cleaning', priority: 'normal', assignedTo: 'Sarah M.', progress: 65 },
      { id: 202, number: '202', type: 'Ocean View', status: 'inspection', priority: 'vip', assignedTo: null, progress: 100 },
      { id: 301, number: '301', type: 'Presidential Suite', status: 'dirty', priority: 'vip', assignedTo: 'Maria G.', progress: 25 },
      { id: 302, number: '302', type: 'Business Suite', status: 'maintenance', priority: 'normal', assignedTo: null, progress: 0 },
    ]
  })
  
  const [taskAssignment, setTaskAssignment] = useState({
    roomNumber: '',
    staff: 'Maria Garcia',
    task: 'Clean room'
  })
  
  const router = useRouter()
  
  // Save rooms to localStorage whenever they change
  useEffect(() => {
    console.log('Saving rooms to localStorage:', rooms.length, 'rooms')
    localStorage.setItem('rooms', JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    const storedBookings = localStorage.getItem('bookings')
    if (storedBookings) {
      try {
        const parsed = JSON.parse(storedBookings)
        if (Array.isArray(parsed)) {
          setBookingList(parsed)
        }
      } catch (e) {
        console.error('Error loading bookings from localStorage:', e)
      }
    }
  }, [])

  const STATUS_CONFIG: any = {
    clean: { label: 'Clean & Ready', color: 'bg-green-500', icon: '✓' },
    dirty: { label: 'Dirty', color: 'bg-red-500', icon: '✕' },
    cleaning: { label: 'Cleaning in Progress', color: 'bg-blue-500', icon: '🧹' },
    inspection: { label: 'Awaiting Inspection', color: 'bg-orange-500', icon: '⚠️' },
    maintenance: { label: 'Maintenance', color: 'bg-purple-500', icon: '🔧' },
  }

  // Calculate dynamic stats from actual room data
  const calculateRoomStats = () => {
    const stats = {
      clean: { count: 0, label: 'Clean & Ready', note: 'Available rooms', icon: '✓', color: 'from-green-500 to-green-600' },
      dirty: { count: 0, label: 'Dirty', note: 'Needs cleaning', icon: '✕', color: 'from-red-500 to-red-600' },
      cleaning: { count: 0, label: 'Cleaning', note: 'In progress', icon: '🧹', color: 'from-blue-500 to-blue-600' },
      inspection: { count: 0, label: 'Inspection', note: 'Waiting approval', icon: '⚠️', color: 'from-orange-500 to-orange-600' },
      maintenance: { count: 0, label: 'Maintenance', note: 'Requires attention', icon: '🔧', color: 'from-purple-500 to-purple-600' },
    }

    rooms.forEach(room => {
      if (stats[room.status as keyof typeof stats]) {
        stats[room.status as keyof typeof stats].count++
      }
    })

    return Object.values(stats)
  }

  const roomStats = calculateRoomStats()

  const PRIORITY_CONFIG: any = {
    normal: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
    high: { label: 'High Priority', color: 'bg-yellow-100 text-yellow-700' },
    vip: { label: 'VIP', color: 'bg-purple-100 text-purple-700' },
  }

  const bookingsThisMonth = bookingList.filter((booking: any) => {
    const checkinDate = new Date(booking.checkin)
    const now = new Date()
    return checkinDate.getFullYear() === now.getFullYear() && checkinDate.getMonth() === now.getMonth()
  }).length

  const pendingCount = bookingList.filter((booking: any) => booking.status === 'pending').length
  const checkedInCount = bookingList.filter((booking: any) => booking.status === 'checked_in').length
  const vipGuestCount = bookingList.reduce((sum: number, booking: any) => sum + (booking.status === 'vip' ? (booking.guests || 1) : 0), 0)
  const newBookingsCount = bookingsThisMonth + pendingCount

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
                <h1 className="text-3xl font-bold gradient-text">Housekeeping Board</h1>
                <p className="text-sm text-gray-600">Real-time room status tracking</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAssignModal(true)}
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
          {roomStats.map((stat, index) => {
            const totalRooms = rooms.length
            const progress = stat.count > 0 ? Math.round((stat.count / totalRooms) * 100) : 0
            const statusKeys = ['clean', 'dirty', 'cleaning', 'inspection', 'maintenance'] as const
            const statusKey = statusKeys[index] as typeof statusKeys[number]
            const colorMap: Record<typeof statusKeys[number], 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'teal'> = {
              clean: 'green',
              dirty: 'red', 
              cleaning: 'blue',
              inspection: 'orange',
              maintenance: 'purple'
            }
            
            return (
              <StatCard
                key={index}
                label={stat.label}
                value={stat.count}
                icon={stat.icon}
                color={colorMap[statusKey]}
                subtext={stat.note}
                progress={progress}
                total={totalRooms}
                onClick={() => setHousekeepingFilter(statusKey)}
                isActive={housekeepingFilter === statusKey}
              />
            )
          })}
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
                  onClick={() => setHousekeepingFilter(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    housekeepingFilter === item.id
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
              <select 
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="glass px-4 py-2 rounded-xl text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Staff</option>
                <option value="Maria Garcia">Maria Garcia</option>
                <option value="John Doe">John Doe</option>
                <option value="Sarah Miller">Sarah Miller</option>
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
            // Status filter from stat cards
            if (housekeepingFilter !== 'all' && room.status !== housekeepingFilter) return false
            
            // Staff filter
            if (selectedStaff !== 'all' && room.assignedTo !== selectedStaff) return false
            
            // Search filter
            if (searchQuery && !room.number.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !room.type.toLowerCase().includes(searchQuery.toLowerCase())) return false
            
            return true
          })
          
          if (filteredRooms.length > 6 && !showAllRooms) {
            return (
              <div className="text-center mb-6 slide-up" style={{ animationDelay: '0.65s' }}>
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

        {/* Room Status Table */}
        <div className="glass-card rounded-2xl overflow-hidden slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold gradient-text">Room Status Overview</h2>
            <p className="text-gray-600">All 50 rooms organized by current status</p>
          </div>

          <div className="overflow-x-auto">
            {['clean', 'dirty', 'cleaning', 'inspection', 'maintenance'].map((status) => {
              const statusRooms = rooms.filter(room => room.status === status)
              const statusInfo = STATUS_CONFIG[status]

              return (
                <div key={status} className="border-b border-gray-100 last:border-b-0">
                  {/* Status Header */}
                  <div className={`${statusInfo.color} px-6 py-4 text-white`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{statusInfo.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold">{statusInfo.label}</h3>
                        <p className="text-sm opacity-90">{statusRooms.length} of 50 rooms</p>
                      </div>
                    </div>
                  </div>

                  {/* Rooms Table */}
                  {statusRooms.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Floor</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {statusRooms.map((room, index) => (
                            <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">Room {room.number}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{room.type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">Floor {room.floor}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`${PRIORITY_CONFIG[room.priority].color} px-2 py-1 text-xs font-semibold rounded-full`}>
                                  {PRIORITY_CONFIG[room.priority].label}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                                    {room.assignedTo ? room.assignedTo.charAt(0) : '?'}
                                  </div>
                                  <div className="text-sm text-gray-900">{room.assignedTo || 'Unassigned'}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all ${
                                        room.progress === 100 ? 'bg-green-500' :
                                        room.progress > 50 ? 'bg-blue-500' :
                                        'bg-orange-500'
                                      }`}
                                      style={{ width: `${room.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{room.progress}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  {room.status === 'cleaning' && (
                                    <button
                                      onClick={() => {
                                        // Marking room as complete
                                      }}
                                      className="text-green-600 hover:text-green-900 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                                    >
                                      ✓ Complete
                                    </button>
                                  )}
                                  {room.status === 'dirty' && (
                                    <button
                                      onClick={() => {
                                        // Assigning cleaning task
                                      }}
                                      className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                      🧹 Assign
                                    </button>
                                  )}
                                  {room.status === 'inspection' && (
                                    <button
                                      onClick={() => {
                                        // Approving room
                                      }}
                                      className="text-purple-600 hover:text-purple-900 px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                                    >
                                      ✓ Approve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      // Editing room
                                    }}
                                    className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    ✏️ Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      <p>No rooms in this status</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
      
      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold gradient-text">📋 Assign Housekeeping Task</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="glass p-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              // Find the room and update assignment
              const updatedRooms = rooms.map(room => {
                if (room.number === taskAssignment.roomNumber) {
                  return {
                    ...room,
                    assignedTo: taskAssignment.staff,
                    status: 'dirty',
                    progress: 0
                  }
                }
                return room
              })
              
              setRooms(updatedRooms)
              // Task assigned successfully
              setShowAssignModal(false)
              setTaskAssignment({ roomNumber: '', staff: 'Maria Garcia', task: 'Clean room' })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number *</label>
                  <input
                    type="text"
                    value={taskAssignment.roomNumber}
                    onChange={(e) => setTaskAssignment({ ...taskAssignment, roomNumber: e.target.value })}
                    placeholder="e.g., 101"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign To *</label>
                  <select
                    value={taskAssignment.staff}
                    onChange={(e) => setTaskAssignment({ ...taskAssignment, staff: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Maria Garcia">Maria Garcia</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Sarah Miller">Sarah Miller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Task Type *</label>
                  <select
                    value={taskAssignment.task}
                    onChange={(e) => setTaskAssignment({ ...taskAssignment, task: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Clean room">Clean Room</option>
                    <option value="Deep clean">Deep Clean</option>
                    <option value="Turn-down service">Turn-down Service</option>
                    <option value="Express cleaning">Express Cleaning</option>
                    <option value="Maintenance follow-up">Maintenance Follow-up</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold"
                  >
                    ✓ Assign Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
