'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const router = useRouter()

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
                <h1 className="text-3xl font-bold gradient-text">Hotel Settings</h1>
                <p className="text-sm text-gray-600">Configure hotel information and preferences</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                // Settings saved successfully
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-[120px]">
              <nav className="space-y-2">
                {[
                  { id: 'general', label: 'General Information', icon: 'ℹ️' },
                  { id: 'contact', label: 'Contact Details', icon: '📞' },
                  { id: 'amenities', label: 'Amenities', icon: '🏊' },
                  { id: 'policies', label: 'Policies', icon: '📋' },
                  { id: 'payment', label: 'Payment Methods', icon: '💳' },
                  { id: 'notifications', label: 'Notifications', icon: '🔔' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            {/* General Information */}
            {activeTab === 'general' && (
              <div className="glass-card rounded-2xl p-8 slide-up">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  ℹ️ General Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Name</label>
                    <input
                      type="text"
                      defaultValue="Grand Plaza Hotel"
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={4}
                      defaultValue="Luxury hotel in the heart of the city offering world-class amenities and exceptional service."
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in Time</label>
                      <input
                        type="time"
                        defaultValue="15:00"
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out Time</label>
                      <input
                        type="time"
                        defaultValue="11:00"
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Details */}
            {activeTab === 'contact' && (
              <div className="glass-card rounded-2xl p-8 slide-up">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  📞 Contact Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="info@grandplazahotel.com"
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <textarea
                      rows={3}
                      defaultValue="123 Main Street, Downtown District, City, State 12345"
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Amenities */}
            {activeTab === 'amenities' && (
              <div className="glass-card rounded-2xl p-8 slide-up">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  🏊 Hotel Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa & Wellness',
                    'Restaurant', 'Room Service', 'Parking', 'Airport Shuttle',
                    'Business Center', 'Pet Friendly', 'Bar/Lounge', 'Concierge',
                  ].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                      <span className="font-medium text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            {activeTab === 'policies' && (
              <div className="glass-card rounded-2xl p-8 slide-up">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  📋 Hotel Policies
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Policy</label>
                    <textarea
                      rows={4}
                      defaultValue="Free cancellation up to 24 hours before check-in. Cancellations within 24 hours will be charged 50% of the total booking amount."
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in Requirements</label>
                    <textarea
                      rows={3}
                      defaultValue="Valid government-issued ID and credit card required at check-in. Minimum age for check-in is 18 years."
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Policy</label>
                    <textarea
                      rows={3}
                      defaultValue="Pets are welcome with a $50 non-refundable fee per stay. Maximum 2 pets per room."
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {activeTab === 'payment' && (
              <div className="glass-card rounded-2xl p-8 slide-up">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  💳 Payment Methods
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Accepted Payment Methods</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        'Credit Cards (Visa, MasterCard, Amex)',
                        'Debit Cards',
                        'Cash',
                        'Bank Transfer',
                        'Digital Wallets (Apple Pay, Google Pay)',
                        'Cryptocurrency (BTC, ETH)'
                      ].map((method) => (
                        <label key={method} className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                          <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                          <span className="font-medium text-gray-700">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Terms</label>
                    <textarea
                      rows={3}
                      defaultValue="Full payment required at check-in for cash bookings. Credit card bookings are charged upon reservation."
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="glass-card rounded-2xl p-8 slide-up">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  🔔 Notification Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {[
                        'New booking confirmations',
                        'Booking modifications',
                        'Cancellation notifications',
                        'Payment reminders',
                        'Guest feedback requests'
                      ].map((notification) => (
                        <label key={notification} className="flex items-center gap-3 p-3 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                          <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                          <span className="font-medium text-gray-700">{notification}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">SMS Notifications</h3>
                    <div className="space-y-3">
                      {[
                        'Check-in reminders',
                        'Room ready notifications',
                        'Maintenance updates'
                      ].map((notification) => (
                        <label key={notification} className="flex items-center gap-3 p-3 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                          <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                          <span className="font-medium text-gray-700">{notification}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
