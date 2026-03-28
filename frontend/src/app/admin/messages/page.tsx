'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MessagesPage() {
  const router = useRouter()
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null)
  
  const defaultMessages = [
    {
      id: 1,
      from: 'Sarah Johnson',
      subject: 'Late Check-out Request',
      preview: 'Hi, I was wondering if it would be possible to have a late check-out...',
      date: 'Mar 24, 2025 10:30 AM',
      read: false,
      type: 'guest',
      archived: false
    },
    {
      id: 2,
      from: 'Maria Garcia (Housekeeping)',
      subject: 'Room 305 Maintenance Issue',
      preview: 'The air conditioning in room 305 is not working properly...',
      date: 'Mar 24, 2025 9:15 AM',
      read: true,
      type: 'staff',
      archived: false
    },
    {
      id: 3,
      from: 'Michael Chen',
      subject: 'Airport Transfer Booking',
      preview: 'I would like to book an airport transfer for my upcoming stay...',
      date: 'Mar 23, 2025 4:45 PM',
      read: true,
      type: 'guest',
      archived: false
    },
    {
      id: 4,
      from: 'Front Desk System',
      subject: 'System Alert: Payment Gateway',
      preview: 'Scheduled maintenance for payment gateway on March 30th...',
      date: 'Mar 23, 2025 2:00 PM',
      read: false,
      type: 'system',
      archived: false
    },
    {
      id: 5,
      from: 'Emma Williams',
      subject: 'Anniversary Celebration',
      preview: 'We are celebrating our 10th anniversary during our stay...',
      date: 'Mar 23, 2025 11:20 AM',
      read: true,
      type: 'guest',
      archived: false
    }
  ]
  
  const [messages, setMessages] = useState(defaultMessages)
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    message: ''
  })
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyForm, setReplyForm] = useState({
    message: ''
  })
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'guest' | 'staff'>('all')

  // Load ALL data from localStorage on component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('hotelMessages')
      const savedShowArchived = localStorage.getItem('hotelShowArchived')
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      }
      
      if (savedShowArchived) {
        setShowArchived(JSON.parse(savedShowArchived))
      }
      
      setIsLoaded(true)
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      setIsLoaded(true)
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hotelMessages', JSON.stringify(messages))
    }
  }, [messages, isLoaded])

  // Save archived view state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hotelShowArchived', JSON.stringify(showArchived))
    }
  }, [showArchived, isLoaded])

  const messageTemplates = [
    {
      title: 'Check-in Instructions',
      icon: '🏠',
      content: 'Dear Guest,\n\nWelcome to our hotel! Here are your check-in instructions:\n\n- Check-in time: 3:00 PM\n- Please bring valid ID and credit card\n- Early check-in may be available upon request\n\nWe look forward to your stay!\n\nBest regards,\nHotel Management'
    },
    {
      title: 'Amenities Info',
      icon: '📋',
      content: 'Dear Guest,\n\nHere are the amenities available during your stay:\n\n- Free Wi-Fi throughout the hotel\n- Fitness center (24/7 access)\n- Swimming pool (6 AM - 10 PM)\n- Room service (6 AM - 11 PM)\n- Concierge services\n\nPlease let us know if you need any assistance.\n\nBest regards,\nHotel Management'
    },
    {
      title: 'Local Recommendations',
      icon: '🗺️',
      content: 'Dear Guest,\n\nHere are some local recommendations for your stay:\n\nRestaurants:\n- Fine Dining: The Golden Spoon (5-star)\n- Casual: Beachside Café\n\nAttractions:\n- City Museum (free admission)\n- Harbor Walk (scenic views)\n\nTransportation:\n- Airport shuttle available\n- Taxi services recommended\n\nEnjoy your time in our beautiful city!\n\nBest regards,\nHotel Management'
    },
    {
      title: 'Payment Confirmation',
      icon: '💳',
      content: 'Dear Guest,\n\nThank you for your payment. Here are the details:\n\nAmount Paid: $XXX.XX\nPayment Method: Credit Card\nTransaction ID: XXXX-XXXX-XXXX\nDate: [Current Date]\n\nYour booking is now confirmed. We look forward to welcoming you!\n\nBest regards,\nHotel Management'
    },
    {
      title: 'Late Check-out Policy',
      icon: '⏰',
      content: 'Dear Guest,\n\nRegarding your late check-out request:\n\nOur standard check-out time is 11:00 AM. Late check-out is available based on availability:\n\n- 1 PM: $25 fee\n- 3 PM: $50 fee\n- 6 PM: $100 fee\n\nPlease confirm your preferred time. We\'ll do our best to accommodate your request.\n\nBest regards,\nHotel Management'
    },
    {
      title: 'Thank You Message',
      icon: '💌',
      content: 'Dear Guest,\n\nThank you for choosing our hotel for your stay! We hope you enjoyed your time with us.\n\nYour feedback is important to us. Please take a moment to leave a review on our website.\n\nWe look forward to welcoming you back soon!\n\nBest regards,\nHotel Management'
    }
  ]

  // Filter messages based on archive status and selected filter
  const activeMessages = messages.filter(m => !m.archived)
  
  const displayMessages = (() => {
    let filtered = showArchived 
      ? messages.filter(m => m.archived)
      : activeMessages
    
    // Apply additional filters based on stats card selection
    switch(messageFilter) {
      case 'unread':
        return filtered.filter(m => !m.read)
      case 'guest':
        return filtered.filter(m => m.type === 'guest')
      case 'staff':
        return filtered.filter(m => m.type === 'staff')
      default:
        return filtered
    }
  })()

  const handleComposeMessage = () => {
    setShowComposeModal(true)
  }

  const handleSendMessage = () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.message) {
      alert('Please fill in all fields')
      return
    }

    // In a real app, this would send the message via API
    alert(`Message sent to ${composeForm.to}: "${composeForm.subject}"`)
    
    // Reset form and close modal
    setComposeForm({ to: '', subject: '', message: '' })
    setShowComposeModal(false)
  }

  const handleReply = (message: any) => {
    setReplyingTo(message)
    setReplyForm({ message: '' })
    setShowReplyModal(true)
  }

  const handleSendReply = () => {
    if (!replyForm.message.trim()) {
      alert('Please enter a reply message')
      return
    }

    // In a real app, this would send the reply via API
    alert(`Reply sent to ${replyingTo.from}`)
    
    // Mark message as read
    setMessages(messages.map(m => 
      m.id === replyingTo.id ? { ...m, read: true } : m
    ))
    
    // Reset and close modal
    setReplyForm({ message: '' })
    setReplyingTo(null)
    setShowReplyModal(false)
  }

  const handleArchive = (messageId: number) => {
    const confirmArchive = confirm('Are you sure you want to archive this message?')
    if (confirmArchive) {
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, archived: true } : m
      ))
    }
  }

  const handleUnarchive = (messageId: number) => {
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, archived: false } : m
    ))
  }

  const handleUseTemplate = (template: any) => {
    if (showComposeModal) {
      setComposeForm({
        ...composeForm,
        subject: template.title,
        message: template.content
      })
    } else if (showReplyModal) {
      setReplyForm({
        message: template.content
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Messages & Communications</h1>
        <p className="text-gray-600">Manage guest communications and internal messages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => setMessageFilter('all')}
          className={`glass-card rounded-2xl p-6 card-hover border-l-4 border-blue-500 cursor-pointer transition-all ${
            messageFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center justify-between text-left">
            <div>
              <p className="text-gray-600 font-medium mb-2">Total Messages</p>
              <p className="text-4xl font-bold gradient-text">{activeMessages.length}</p>
            </div>
            <div className="text-5xl">💬</div>
          </div>
        </button>
        <button
          onClick={() => setMessageFilter('unread')}
          className={`glass-card rounded-2xl p-6 card-hover border-l-4 border-red-500 cursor-pointer transition-all ${
            messageFilter === 'unread' ? 'ring-2 ring-red-500 bg-red-50' : ''
          }`}
        >
          <div className="flex items-center justify-between text-left">
            <div>
              <p className="text-gray-600 font-medium mb-2">Unread</p>
              <p className="text-4xl font-bold gradient-text">{activeMessages.filter(m => !m.read).length}</p>
            </div>
            <div className="text-5xl">🔔</div>
          </div>
        </button>
        <button
          onClick={() => setMessageFilter('guest')}
          className={`glass-card rounded-2xl p-6 card-hover border-l-4 border-green-500 cursor-pointer transition-all ${
            messageFilter === 'guest' ? 'ring-2 ring-green-500 bg-green-50' : ''
          }`}
        >
          <div className="flex items-center justify-between text-left">
            <div>
              <p className="text-gray-600 font-medium mb-2">Guest Messages</p>
              <p className="text-4xl font-bold gradient-text">{activeMessages.filter(m => m.type === 'guest').length}</p>
            </div>
            <div className="text-5xl">👤</div>
          </div>
        </button>
        <button
          onClick={() => setMessageFilter('staff')}
          className={`glass-card rounded-2xl p-6 card-hover border-l-4 border-purple-500 cursor-pointer transition-all ${
            messageFilter === 'staff' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
          }`}
        >
          <div className="flex items-center justify-between text-left">
            <div>
              <p className="text-gray-600 font-medium mb-2">Staff Messages</p>
              <p className="text-4xl font-bold gradient-text">{activeMessages.filter(m => m.type === 'staff').length}</p>
            </div>
            <div className="text-5xl">👥</div>
          </div>
        </button>
      </div>

      {/* Messages List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold gradient-text">{showArchived ? 'Archived' : 'Inbox'}</h2>
              {messageFilter !== 'all' && !showArchived && (
                <p className="text-sm text-gray-500 mt-1">Filtered: {messageFilter === 'unread' ? 'Unread Messages' : messageFilter === 'guest' ? 'Guest Messages' : 'Staff Messages'}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowArchived(false)
                  setMessageFilter('all')
                }}
                className={`px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all ${
                  !showArchived 
                    ? 'btn-primary' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                ✏️ Compose Message
              </button>
              <button 
                onClick={() => setShowArchived(true)}
                className={`px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all ${
                  showArchived 
                    ? 'btn-primary' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                📦 Archived ({messages.filter(m => m.archived).length})
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {displayMessages.map((message) => (
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
                      handleReply(message)
                    }}
                    className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium cursor-pointer"
                  >
                    Reply
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (showArchived) {
                        handleUnarchive(message.id)
                      } else {
                        handleArchive(message.id)
                      }
                    }}
                    className="glass px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium cursor-pointer"
                  >
                    {showArchived ? 'Unarchive' : 'Archive'}
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
          {messageTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => handleUseTemplate(template)}
              className="glass p-4 rounded-xl hover:bg-gray-50 transition-all text-left cursor-pointer"
            >
              <span className="text-2xl mb-2 block">{template.icon}</span>
              <span className="font-medium text-gray-700">{template.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">Compose Message</h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="text"
                  value={composeForm.to}
                  onChange={(e) => setComposeForm({...composeForm, to: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter recipient email or name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter message subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({...composeForm, message: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Type your message here..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && replyingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">Reply to {replyingTo.from}</h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Original Message */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">
                <strong>From:</strong> {replyingTo.from} • <strong>Subject:</strong> {replyingTo.subject}
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">{replyingTo.preview}</div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                <textarea
                  value={replyForm.message}
                  onChange={(e) => setReplyForm({...replyForm, message: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Type your reply here..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendReply}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 font-semibold"
                >
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
