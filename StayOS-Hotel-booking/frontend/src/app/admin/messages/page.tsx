'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MessagesPage() {
  const router = useRouter()
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null)

  const messages = [
    {
      id: 1,
      from: 'Sarah Johnson',
      subject: 'Late Check-out Request',
      preview: 'Hi, I was wondering if it would be possible to have a late check-out...',
      date: 'Mar 24, 2025 10:30 AM',
      read: false,
      type: 'guest'
    },
    {
      id: 2,
      from: 'Maria Garcia (Housekeeping)',
      subject: 'Room 305 Maintenance Issue',
      preview: 'The air conditioning in room 305 is not working properly...',
      date: 'Mar 24, 2025 9:15 AM',
      read: true,
      type: 'staff'
    },
    {
      id: 3,
      from: 'Michael Chen',
      subject: 'Airport Transfer Booking',
      preview: 'I would like to book an airport transfer for my upcoming stay...',
      date: 'Mar 23, 2025 4:45 PM',
      read: true,
      type: 'guest'
    },
    {
      id: 4,
      from: 'Front Desk System',
      subject: 'System Alert: Payment Gateway',
      preview: 'Scheduled maintenance for payment gateway on March 30th...',
      date: 'Mar 23, 2025 2:00 PM',
      read: false,
      type: 'system'
    },
    {
      id: 5,
      from: 'Emma Williams',
      subject: 'Anniversary Celebration',
      preview: 'We are celebrating our 10th anniversary during our stay...',
      date: 'Mar 23, 2025 11:20 AM',
      read: true,
      type: 'guest'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Messages & Communications</h1>
        <p className="text-gray-600">Manage guest communications and internal messages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Total Messages</p>
              <p className="text-4xl font-bold gradient-text">{messages.length}</p>
            </div>
            <div className="text-5xl">💬</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Unread</p>
              <p className="text-4xl font-bold gradient-text">{messages.filter(m => !m.read).length}</p>
            </div>
            <div className="text-5xl">🔔</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Guest Messages</p>
              <p className="text-4xl font-bold gradient-text">{messages.filter(m => m.type === 'guest').length}</p>
            </div>
            <div className="text-5xl">👤</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium mb-2">Staff Messages</p>
              <p className="text-4xl font-bold gradient-text">{messages.filter(m => m.type === 'staff').length}</p>
            </div>
            <div className="text-5xl">👥</div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold gradient-text">Inbox</h2>
            <button 
              onClick={() => alert('Compose message feature coming soon!')}
              className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
            >
              ✏️ Compose Message
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessage(message.id)}
              className={`p-6 hover:bg-gray-50 transition-all cursor-pointer ${
                selectedMessage === message.id ? 'bg-blue-50' : ''
              } ${!message.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    message.type === 'guest' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                    message.type === 'staff' ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                    'bg-gradient-to-br from-purple-500 to-pink-600'
                  }`}>
                    {message.type === 'guest' ? '👤' : message.type === 'staff' ? '👥' : '⚙️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {message.from}
                      </h3>
                      {!message.read && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                          New
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{message.date}</span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">{message.subject}</p>
                    <p className="text-gray-600 text-sm truncate">{message.preview}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      alert(`Replying to ${message.from}...`)
                    }}
                    className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium cursor-pointer"
                  >
                    Reply
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      alert('Message archived')
                    }}
                    className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium cursor-pointer"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Replies Template */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Quick Reply Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Check-in Instructions', icon: '🏠' },
            { name: 'Amenities Info', icon: '📋' },
            { name: 'Local Recommendations', icon: '🗺️' },
            { name: 'Payment Confirmation', icon: '💳' },
            { name: 'Late Check-out Policy', icon: '⏰' },
            { name: 'Thank You Message', icon: '💌' },
          ].map((template, index) => (
            <button
              key={index}
              onClick={() => alert(`Using template: ${template.name}`)}
              className="glass p-4 rounded-xl hover:bg-gray-50 transition-all text-left cursor-pointer"
            >
              <span className="text-2xl mb-2 block">{template.icon}</span>
              <span className="font-medium text-gray-700">{template.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
