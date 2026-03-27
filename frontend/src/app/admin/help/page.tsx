'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HelpPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: 'bookings', name: 'Bookings & Reservations', icon: '📅', color: 'from-blue-500 to-indigo-600' },
    { id: 'housekeeping', name: 'Housekeeping', icon: '🧹', color: 'from-green-500 to-teal-600' },
    { id: 'payments', name: 'Payments & Billing', icon: '💳', color: 'from-purple-500 to-pink-600' },
    { id: 'guests', name: 'Guest Management', icon: '👤', color: 'from-orange-500 to-red-600' },
    { id: 'rooms', name: 'Rooms & Inventory', icon: '🛏️', color: 'from-cyan-500 to-blue-600' },
    { id: 'reports', name: 'Reports & Analytics', icon: '📊', color: 'from-emerald-500 to-green-600' },
  ]

  const faqs = [
    {
      category: 'bookings',
      question: 'How do I create a new booking?',
      answer: 'Click on "New Booking" in the Quick Actions menu or navigate to the Bookings page and click the "New Booking" button. Fill in guest details, select dates and room type, then submit.'
    },
    {
      category: 'bookings',
      question: 'How can I modify an existing booking?',
      answer: 'Go to the Bookings page, find the booking you want to modify, and click on it. You can edit guest information, dates, and room type. Save changes after making modifications.'
    },
    {
      category: 'housekeeping',
      question: 'How do I assign housekeeping tasks?',
      answer: 'Navigate to Housekeeping page, view the room status board, and use the "Assign Tasks" button to allocate rooms to housekeeping staff members.'
    },
    {
      category: 'payments',
      question: 'What payment methods are accepted?',
      answer: 'The system supports credit cards (Visa, MasterCard, Amex), debit cards, bank transfers, and cash payments. All transactions are processed securely.'
    },
    {
      category: 'guests',
      question: 'How do I add a VIP guest?',
      answer: 'Go to Guest Management, click "Add Guest", fill in the guest information, and mark them as VIP in the guest type dropdown. VIP guests receive priority service.'
    },
    {
      category: 'rooms',
      question: 'How can I update room rates?',
      answer: 'Navigate to Rooms & Inventory, select the room you want to update, click "Edit", modify the pricing information, and save your changes.'
    }
  ]

  const filteredFaqs = selectedCategory 
    ? faqs.filter(faq => faq.category === selectedCategory)
    : faqs

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Help & Support</h1>
        <p className="text-gray-600">Find answers and get assistance with using the system</p>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles, guides, and FAQs..."
              className="input-field w-full px-6 py-4 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-gray-600 text-center">
            Try searching for "booking", "payment", "housekeeping", or "guest management"
          </p>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`glass-card rounded-2xl p-8 text-left transition-all hover:scale-105 cursor-pointer ${
                selectedCategory === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-4`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-gray-600">View guides and FAQs</p>
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} - ` : ''}Frequently Asked Questions
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="glass px-4 py-2 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <details key={index} className="group glass rounded-xl">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Still Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="font-bold text-lg mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Get help via email</p>
            <button
              onClick={() => {
                // Opening email client
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold w-full cursor-pointer"
            >
              support@grandplaza.com
            </button>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-bold text-lg mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Chat with our team</p>
            <button
              onClick={() => {
                const chatOpen = confirm('Start live chat with support team?');
                if (chatOpen) {
                  // Connecting to live chat
                }
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold w-full cursor-pointer"
            >
              Start Chat
            </button>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-5xl mb-4">📞</div>
            <h3 className="font-bold text-lg mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">Call us directly</p>
            <button
              onClick={() => {
                // Dialing support number
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold w-full cursor-pointer"
            >
              +1 (555) 123-4567
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'User Guide', icon: '📖' },
            { name: 'Video Tutorials', icon: '🎥' },
            { name: 'System Status', icon: '✅' },
            { name: 'Feature Requests', icon: '💡' },
          ].map((link, index) => (
            <button
              key={index}
              onClick={() => {
                if (link.name === 'User Guide') {
                  // Opening user guide PDF
                } else if (link.name === 'Video Tutorials') {
                  // Loading video tutorials
                } else if (link.name === 'System Status') {
                  // All systems operational
                } else if (link.name === 'Feature Requests') {
                  // Opening feature request form
                }
              }}
              className="glass p-6 rounded-xl hover:bg-gray-50 transition-all text-left cursor-pointer"
            >
              <span className="text-3xl mb-3 block">{link.icon}</span>
              <span className="font-semibold text-gray-900">{link.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
