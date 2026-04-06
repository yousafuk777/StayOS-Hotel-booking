'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../components/StatCard'
import apiClient from '@/services/apiClient'

export default function HousekeepingPage() {
  const [housekeepingFilter, setHousekeepingFilter] = useState<'all' | 'clean' | 'dirty' | 'cleaning' | 'inspection' | 'maintenance'>('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingList, setBookingList] = useState<any[]>([])
  const [showAllRooms, setShowAllRooms] = useState(false)

  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staffList, setStaffList] = useState<any[]>([])
  
  // Form handling states
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch Rooms
      const roomsRes = await apiClient.get('/api/v1/rooms')
      const mappedRooms = roomsRes.data.map((room: any) => ({
        id: room.id,
        number: room.room_number,
        type: room.category?.name || 'Standard',
        floor: room.floor || 1,
        status: room.housekeeping_status || 'clean',
        priority: room.housekeeping_priority || 'normal',
        assignedTo: room.assigned_staff ? `${room.assigned_staff.first_name} ${room.assigned_staff.last_name}` : null,
        assignedToId: room.assigned_staff_id,
        progress: room.housekeeping_progress || 0,
        task: room.housekeeping_task || 'Clean room'
      }))
      setRooms(mappedRooms)

      // Fetch Staff
      const staffRes = await apiClient.get('/api/v1/staff')
      setStaffList(staffRes.data)
      
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch housekeeping data:', err)
      setError('Failed to load housekeeping board. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const [taskAssignment, setTaskAssignment] = useState({
    roomId: '',
    staffId: '',
    task: 'Clean room'
  })
  
  const router = useRouter()
  
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
    normal: { label: 'Normal', color: 'bg-gray-100 text-[#1A2E2B]' },
    high: { label: 'High Priority', color: 'bg-yellow-100 text-yellow-700' },
    vip: { label: 'VIP', color: 'bg-purple-100 text-purple-700' },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                <p className="text-sm text-[#2D4A42]">Real-time room status tracking</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setTaskAssignment({ roomId: '', staffId: '', task: 'Clean room' })
                setShowAssignModal(true)
                setFormError(null)
                setFormSuccess(null)
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>📋</span>
              <span>Assign Tasks</span>
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-blue-900">Loading housekeeping data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass-card p-8 rounded-2xl text-center max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-[#2D4A42] mb-6">{error}</p>
            <button 
              onClick={() => fetchData()}
              className="btn-primary px-6 py-2 rounded-xl"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto p-8">
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
                        : 'glass hover:bg-gray-50 text-[#1A2E2B]'
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
                  className="glass px-4 py-2 rounded-xl text-[#1A2E2B] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Staff</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={`${staff.first_name} ${staff.last_name}`}>
                      {staff.first_name} {staff.last_name}
                    </option>
                  ))}
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

          <div className="glass-card rounded-2xl overflow-hidden slide-up" style={{ animationDelay: '0.7s' }}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold gradient-text">Room Status Overview</h2>
              <p className="text-[#2D4A42]">Rooms organized by current status</p>
            </div>

            <div className="overflow-x-auto">
              {['clean', 'dirty', 'cleaning', 'inspection', 'maintenance'].map((status) => {
                const statusRooms = rooms.filter(room => room.status === status)
                const statusInfo = STATUS_CONFIG[status]

                return (
                  <div key={status} className="border-b border-gray-100 last:border-b-0">
                    <div className={`${statusInfo.color} px-6 py-4 text-white`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{statusInfo.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold">{statusInfo.label}</h3>
                          <p className="text-sm opacity-90">{statusRooms.length} rooms</p>
                        </div>
                      </div>
                    </div>

                    {statusRooms.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[#2D4A42] uppercase tracking-wider">Room</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[#2D4A42] uppercase tracking-wider">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[#2D4A42] uppercase tracking-wider">Floor</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[#2D4A42] uppercase tracking-wider">Priority</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[#2D4A42] uppercase tracking-wider">Assigned To</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[#2D4A42] uppercase tracking-wider">Progress</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-[#2D4A42] uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {statusRooms.map((room) => (
                              <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-bold text-[#1A2E2B]">Room {room.number}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-[#1A2E2B]">{room.type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-[#1A2E2B]">Floor {room.floor}</div>
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
                                    <div className="text-sm text-[#1A2E2B]">{room.assignedTo || 'Unassigned'}</div>
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
                                    <span className="text-sm font-medium text-[#1A2E2B]">{room.progress}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    {room.status === 'cleaning' && (
                                      <button
                                        onClick={async () => {
                                          try {
                                            await apiClient.put(`/api/v1/rooms/${room.id}`, {
                                              housekeeping_status: 'inspection',
                                              housekeeping_progress: 100
                                            })
                                            fetchData()
                                          } catch (err) {
                                            console.error('Failed to update room:', err)
                                          }
                                        }}
                                        className="text-green-600 hover:text-green-900 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                                      >
                                        ✓ Complete
                                      </button>
                                    )}
                                    {room.status === 'dirty' && (
                                      <button
                                        onClick={() => {
                                          setTaskAssignment({ ...taskAssignment, roomId: room.id.toString() })
                                          setShowAssignModal(true)
                                          setFormError(null)
                                          setFormSuccess(null)
                                        }}
                                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                                      >
                                        🧹 Assign
                                      </button>
                                    )}
                                    {room.status === 'inspection' && (
                                      <button
                                        onClick={async () => {
                                          try {
                                            await apiClient.put(`/api/v1/rooms/${room.id}`, {
                                              housekeeping_status: 'clean',
                                              housekeeping_progress: 100
                                            })
                                            fetchData()
                                          } catch (err) {
                                            console.error('Failed to update room:', err)
                                          }
                                        }}
                                        className="text-purple-600 hover:text-purple-900 px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                                      >
                                        ✓ Approve
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-6 py-8 text-center text-[#2D4A42]">
                        <div className="text-4xl mb-2">📭</div>
                        <p>No rooms in this status</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 mt-8 slide-up" style={{ animationDelay: '1.5s' }}>
            <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
              👥 Housekeeping Staff
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {staffList.filter(s => s.role === 'housekeeping').map((staff, index) => (
                <div key={staff.id} className="glass p-6 rounded-xl slide-up" style={{ animationDelay: `${1.6 + index * 0.1}s` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                      {staff.first_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A2E2B]">{staff.first_name} {staff.last_name}</h3>
                      <p className="text-sm text-[#2D4A42]">{staff.role}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#2D4A42]">Status</span>
                      <span className={`font-bold ${staff.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {staff.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#2D4A42]">Email</span>
                      <span className="text-xs text-[#2D4A42] truncate max-w-[150px]">{staff.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!taskAssignment.roomId || !taskAssignment.staffId) {
                setFormError('Please select both a room and a staff member.')
                return
              }
              
              setSubmitting(true)
              setFormError(null)
              setFormSuccess(null)
              
              try {
                await apiClient.put(`/api/v1/rooms/${taskAssignment.roomId}`, {
                  assigned_staff_id: parseInt(taskAssignment.staffId),
                  housekeeping_status: 'cleaning',
                  housekeeping_progress: 0,
                  housekeeping_task: taskAssignment.task
                })
                
                setFormSuccess('Task assigned successfully!')
                await fetchData()
                
                // Close modal after a brief delay to show success message
                setTimeout(() => {
                  setShowAssignModal(false)
                  setTaskAssignment({ roomId: '', staffId: '', task: 'Clean room' })
                  setFormSuccess(null)
                }, 1500)
              } catch (err: any) {
                console.error('Failed to assign task:', err)
                setFormError(err.response?.data?.detail || 'Failed to assign task. Please try again.')
              } finally {
                setSubmitting(false)
              }
            }}>
              <div className="space-y-4">
                {formError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{formError}</p>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                    <p className="text-green-700 text-sm font-medium">{formSuccess}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Room *</label>
                  <select
                    value={taskAssignment.roomId}
                    onChange={(e) => setTaskAssignment({ ...taskAssignment, roomId: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">Select Room</option>
                    {/* Group rooms by status for better usability */}
                    {['dirty', 'clean', 'cleaning', 'inspection', 'maintenance'].map(status => {
                      const statusRooms = rooms.filter(r => r.status === status)
                      if (statusRooms.length === 0) return null
                      return (
                        <optgroup key={status} label={status.charAt(0).toUpperCase() + status.slice(1)}>
                          {statusRooms.map(room => (
                            <option key={room.id} value={room.id}>
                              Room {room.number} ({room.type})
                            </option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Assign To *</label>
                  <select
                    value={taskAssignment.staffId}
                    onChange={(e) => setTaskAssignment({ ...taskAssignment, staffId: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">Select Staff</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Task Type *</label>
                  <select
                    value={taskAssignment.task}
                    onChange={(e) => setTaskAssignment({ ...taskAssignment, task: e.target.value })}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="Clean room">Clean Room</option>
                    <option value="Deep clean">Deep Clean</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setShowAssignModal(false)} 
                      className="flex-1 glass px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Assigning...</span>
                        </>
                      ) : (
                        <span>Assign Task</span>
                      )}
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
