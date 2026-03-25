'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Received',
      message: 'Sarah Johnson booked Deluxe Suite for Mar 25-28',
      time: '5 minutes ago',
      read: false,
      icon: '📅'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Low Occupancy Alert',
      message: 'Occupancy rate for next week is below 50%',
      time: '1 hour ago',
      read: false,
      icon: '⚠️'
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Maintenance Request',
      message: 'Room 205 AC requires immediate attention',
      time: '2 hours ago',
      read: true,
      icon: '🔧'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Failed',
      message: 'Credit card declined for booking #1234',
      time: '3 hours ago',
      read: true,
      icon: '💳'
    },
    {
      id: 5,
      type: 'review',
      title: 'New Review Received',
      message: 'Michael Chen left a 5-star review',
      time: 'Yesterday',
      read: true,
      icon: '⭐'
    },
    {
      id: 6,
      type: 'housekeeping',
      title: 'Room Ready',
      message: 'Room 301 has been cleaned and inspected',
      time: 'Yesterday',
      read: true,
      icon: '✨'
    }
  ])

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with your hotel's activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Total Notifications</p>
              <p className="text-4xl font-bold gradient-text">{notifications.length}</p>
            </div>
            <div className="text-5xl">🔔</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Unread</p>
              <p className="text-4xl font-bold gradient-text">{unreadCount}</p>
            </div>
            <div className="text-5xl">📩</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Read</p>
              <p className="text-4xl font-bold gradient-text">{notifications.filter(n => n.read).length}</p>
            </div>
            <div className="text-5xl">✓</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">All Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-6 hover:bg-gray-50 transition-all cursor-pointer ${
                !notification.read ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                  notification.type === 'booking' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                  notification.type === 'alert' ? 'bg-gradient-to-br from-red-500 to-orange-600' :
                  notification.type === 'maintenance' ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                  notification.type === 'payment' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                  notification.type === 'review' ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                  'bg-gradient-to-br from-cyan-500 to-blue-600'
                }`}>
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-bold text-lg ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                        New
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`Viewing details: ${notification.title}\n\n${notification.message}`);
                      }}
                      className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                    >
                      View Details
                    </button>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="glass px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { name: 'New Bookings', description: 'Get notified when a new booking is made', enabled: true },
            { name: 'Payment Alerts', description: 'Receive alerts for failed or pending payments', enabled: true },
            { name: 'Maintenance Requests', description: 'Be alerted about urgent maintenance issues', enabled: true },
            { name: 'Review Notifications', description: 'Get notified when guests leave reviews', enabled: false },
            { name: 'Daily Digest', description: 'Receive a daily summary of hotel activities', enabled: false },
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-4 glass rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-900">{setting.name}</h3>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
