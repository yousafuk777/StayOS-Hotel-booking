'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '../../../services/apiClient'

interface HotelSettings {
  general: {
    name: string
    description: string
    checkInTime: string
    checkOutTime: string
  }
  contact: {
    email: string
    phone: string
    address: string
  }
  amenities: string[]
  policies: {
    cancellation: string
    checkInRequirements: string
    petPolicy: string
  }
  payment: {
    methods: string[]
    terms: string
  }
  notifications: {
    email: string[]
    sms: string[]
  }
}

const defaultSettings: HotelSettings = {
  general: {
    name: '',
    description: '',
    checkInTime: '15:00',
    checkOutTime: '11:00'
  },
  contact: {
    email: '',
    phone: '',
    address: ''
  },
  amenities: [],
  policies: {
    cancellation: '',
    checkInRequirements: '',
    petPolicy: ''
  },
  payment: {
    methods: [],
    terms: ''
  },
  notifications: {
    email: [],
    sms: []
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<HotelSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [hotel, setHotel] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('hotel-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('hotel-settings', JSON.stringify(settings))
    setHasChanges(false)
    // Show success message
    alert('Settings saved successfully!')
  }

  // Update settings
  const updateSettings = (section: keyof HotelSettings, data: any) => {
    setSettings(prev => ({ ...prev, [section]: data }))
    setHasChanges(true)
  }

  // Generate sample settings
  const generateSampleSettings = () => {
    const sampleSettings: HotelSettings = {
      general: {
        name: 'Grand Plaza Hotel',
        description: 'Luxury hotel in the heart of the city offering world-class amenities and exceptional service.',
        checkInTime: '15:00',
        checkOutTime: '11:00'
      },
      contact: {
        email: 'info@grandplazahotel.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, Downtown District, City, State 12345'
      },
      amenities: [
        'Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa & Wellness',
        'Restaurant', 'Room Service', 'Parking', 'Airport Shuttle',
        'Business Center', 'Pet Friendly', 'Bar/Lounge', 'Concierge'
      ],
      policies: {
        cancellation: 'Free cancellation up to 24 hours before check-in. Cancellations within 24 hours will be charged 50% of the total booking amount.',
        checkInRequirements: 'Valid government-issued ID and credit card required at check-in. Minimum age for check-in is 18 years.',
        petPolicy: 'Pets are welcome with a $50 non-refundable fee per stay. Maximum 2 pets per room.'
      },
      payment: {
        methods: [
          'Credit Cards (Visa, MasterCard, Amex)',
          'Debit Cards',
          'Cash',
          'Bank Transfer',
          'Digital Wallets (Apple Pay, Google Pay)',
          'Cryptocurrency (BTC, ETH)'
        ],
        terms: 'Full payment required at check-in for cash bookings. Credit card bookings are charged upon reservation.'
      },
      notifications: {
        email: [
          'New booking confirmations',
          'Booking modifications',
          'Cancellation notifications',
          'Payment reminders',
          'Guest feedback requests'
        ],
        sms: [
          'Check-in reminders',
          'Room ready notifications',
          'Maintenance updates'
        ]
      }
    }
    setSettings(sampleSettings)
    saveSettings()
  }

  // Clear all settings
  const clearSettings = () => {
    if (confirm('Are you sure you want to clear all settings? This action cannot be undone.')) {
      setSettings(defaultSettings)
      localStorage.removeItem('hotel-settings')
      setHasChanges(false)
    }
  }

  const isEmpty = !settings.general.name && !settings.contact.email && settings.amenities.length === 0

  useEffect(() => {
    fetchHotel()
  }, [])

  const fetchHotel = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/api/v1/hotels/mine')
      setHotel(data)
    } catch (error) {
      console.error('Error fetching hotel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateHotel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiClient.patch('/api/v1/hotels/mine', {
        name: hotel.name,
        description: hotel.description,
        address_line1: hotel.address_line1,
        phone: hotel.phone,
        email: hotel.email,
        website: hotel.website
      })
      setToast('Settings saved successfully!')
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      setSaving(true)
      const { data } = await apiClient.post(`/api/v1/hotels/${hotel.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setHotel({ ...hotel, image_url: data.image_url })
      setToast('Logo updated!')
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image')
    } finally {
      setSaving(false)
    }
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
                <h1 className="text-3xl font-bold gradient-text">Hotel Settings</h1>
                <p className="text-sm text-[#2D4A42]">Configure hotel information and preferences</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEmpty ? (
                <button
                  onClick={generateSampleSettings}
                  className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer"
                >
                  📝 Add Sample Settings
                </button>
              ) : (
                <button
                  onClick={clearSettings}
                  className="glass px-4 py-2 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  🗑️ Clear All
                </button>
              )}

              <button
                onClick={saveSettings}
                disabled={!hasChanges}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  hasChanges
                    ? 'btn-primary'
                    : 'glass text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>💾</span>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        {isEmpty ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-8xl mb-6">⚙️</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">No Settings Configured</h2>
              <p className="text-[#2D4A42] mb-8 text-lg">
                Set up your hotel information, contact details, amenities, and policies to get started.
              </p>
              <button
                onClick={generateSampleSettings}
                className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto cursor-pointer"
              >
                📊 Try Sample Settings
              </button>
            </div>
          </div>
        ) : (
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
                          : 'hover:bg-gray-50 text-[#1A2E2B]'
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
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Hotel Name</label>
                      <input
                        type="text"
                        value={settings.general.name}
                        onChange={(e) => updateSettings('general', { ...settings.general, name: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                        placeholder="Enter hotel name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Description</label>
                      <textarea
                        rows={4}
                        value={settings.general.description}
                        onChange={(e) => updateSettings('general', { ...settings.general, description: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                        placeholder="Describe your hotel..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-in Time</label>
                        <input
                          type="time"
                          value={settings.general.checkInTime}
                          onChange={(e) => updateSettings('general', { ...settings.general, checkInTime: e.target.value })}
                          className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-out Time</label>
                        <input
                          type="time"
                          value={settings.general.checkOutTime}
                          onChange={(e) => updateSettings('general', { ...settings.general, checkOutTime: e.target.value })}
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
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Email Address</label>
                      <input
                        type="email"
                        value={settings.contact.email}
                        onChange={(e) => updateSettings('contact', { ...settings.contact, email: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                        placeholder="info@yourhotel.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={settings.contact.phone}
                        onChange={(e) => updateSettings('contact', { ...settings.contact, phone: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Address</label>
                      <textarea
                        rows={3}
                        value={settings.contact.address}
                        onChange={(e) => updateSettings('contact', { ...settings.contact, address: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                        placeholder="123 Main Street, City, State 12345"
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
                        <input
                          type="checkbox"
                          checked={settings.amenities.includes(amenity)}
                          onChange={(e) => {
                            const newAmenities = e.target.checked
                              ? [...settings.amenities, amenity]
                              : settings.amenities.filter(a => a !== amenity)
                            updateSettings('amenities', newAmenities)
                          }}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-[#1A2E2B]">{amenity}</span>
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
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Cancellation Policy</label>
                      <textarea
                        rows={4}
                        value={settings.policies.cancellation}
                        onChange={(e) => updateSettings('policies', { ...settings.policies, cancellation: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                        placeholder="Describe your cancellation policy..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-in Requirements</label>
                      <textarea
                        rows={3}
                        value={settings.policies.checkInRequirements}
                        onChange={(e) => updateSettings('policies', { ...settings.policies, checkInRequirements: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                        placeholder="What do guests need for check-in?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Pet Policy</label>
                      <textarea
                        rows={3}
                        value={settings.policies.petPolicy}
                        onChange={(e) => updateSettings('policies', { ...settings.policies, petPolicy: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                        placeholder="Describe your pet policy..."
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
                            <input
                              type="checkbox"
                              checked={settings.payment.methods.includes(method)}
                              onChange={(e) => {
                                const newMethods = e.target.checked
                                  ? [...settings.payment.methods, method]
                                  : settings.payment.methods.filter(m => m !== method)
                                updateSettings('payment', { ...settings.payment, methods: newMethods })
                              }}
                              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-medium text-[#1A2E2B]">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Payment Terms</label>
                      <textarea
                        rows={3}
                        value={settings.payment.terms}
                        onChange={(e) => updateSettings('payment', { ...settings.payment, terms: e.target.value })}
                        className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                        placeholder="Describe your payment terms..."
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
                            <input
                              type="checkbox"
                              checked={settings.notifications.email.includes(notification)}
                              onChange={(e) => {
                                const newEmails = e.target.checked
                                  ? [...settings.notifications.email, notification]
                                  : settings.notifications.email.filter(n => n !== notification)
                                updateSettings('notifications', { ...settings.notifications, email: newEmails })
                              }}
                              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-medium text-[#1A2E2B]">{notification}</span>
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
                            <input
                              type="checkbox"
                              checked={settings.notifications.sms.includes(notification)}
                              onChange={(e) => {
                                const newSms = e.target.checked
                                  ? [...settings.notifications.sms, notification]
                                  : settings.notifications.sms.filter(n => n !== notification)
                                updateSettings('notifications', { ...settings.notifications, sms: newSms })
                              }}
                              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-medium text-[#1A2E2B]">{notification}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
