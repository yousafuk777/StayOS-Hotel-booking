'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    hotelName: 'Grand Plaza Hotel',
    tagline: 'Luxury & Comfort Redefined',
    description: 'Experience world-class hospitality with premium amenities and exceptional service.',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    currency: 'USD',
    timezone: 'UTC+5:00'
  })

  // Contact Settings
  const [contactSettings, setContactSettings] = useState({
    email: 'info@grandplaza.com',
    phone: '+1 (555) 123-4567',
    address: '123 Luxury Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  })

  // Email/SMTP Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'notifications@grandplaza.com',
    smtpPassword: '',
    fromEmail: 'noreply@grandplaza.com',
    fromName: 'Grand Plaza Hotel'
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    stripePublishableKey: 'pk_test_...',
    stripeSecretKey: 'sk_test_...',
    paypalEnabled: false,
    paypalClientId: '',
    paypalSecret: ''
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    minPasswordLength: 8,
    requireSpecialChar: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    maxLoginAttempts: 5
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Settings saved successfully!')
    setIsSaving(false)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'email', label: 'Email & SMS', icon: '📧' },
    { id: 'payment', label: 'Payment Gateways', icon: '💳' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'theme', label: 'Theme & Branding', icon: '🎨' }
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">🔧 System Settings</h1>
            <p className="text-[#2D4A42]">Configure your hotel management system</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary px-8 py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-50"
          >
            {isSaving ? '⏳ Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-2xl p-2 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'glass hover:bg-gray-50 text-[#1A2E2B]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass-card rounded-2xl p-6 slide-up">
        
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">🏢 General Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="form-label">Hotel Name *</label>
                <input
                  type="text"
                  value={generalSettings.hotelName}
                  onChange={(e) => setGeneralSettings({...generalSettings, hotelName: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  value={generalSettings.tagline}
                  onChange={(e) => setGeneralSettings({...generalSettings, tagline: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your hotel's tagline"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  rows={4}
                  value={generalSettings.description}
                  onChange={(e) => setGeneralSettings({...generalSettings, description: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Brief description of your hotel"
                />
              </div>

              <div>
                <label className="form-label">Check-in Time *</label>
                <input
                  type="time"
                  value={generalSettings.checkInTime}
                  onChange={(e) => setGeneralSettings({...generalSettings, checkInTime: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="form-label">Check-out Time *</label>
                <input
                  type="time"
                  value={generalSettings.checkOutTime}
                  onChange={(e) => setGeneralSettings({...generalSettings, checkOutTime: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="form-label">Currency</label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div>
                <label className="form-label">Timezone</label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC+5:00">UTC+5:00 (Pakistan)</option>
                  <option value="UTC+0:00">UTC+0:00 (London)</option>
                  <option value="UTC-5:00">UTC-5:00 (New York)</option>
                  <option value="UTC+1:00">UTC+1:00 (Paris)</option>
                  <option value="UTC+8:00">UTC+8:00 (Singapore)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">📞 Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={contactSettings.email}
                  onChange={(e) => setContactSettings({...contactSettings, email: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  value={contactSettings.phone}
                  onChange={(e) => setContactSettings({...contactSettings, phone: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  value={contactSettings.address}
                  onChange={(e) => setContactSettings({...contactSettings, address: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={contactSettings.city}
                  onChange={(e) => setContactSettings({...contactSettings, city: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="form-label">State/Province</label>
                <input
                  type="text"
                  value={contactSettings.state}
                  onChange={(e) => setContactSettings({...contactSettings, state: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="form-label">ZIP/Postal Code</label>
                <input
                  type="text"
                  value={contactSettings.zipCode}
                  onChange={(e) => setContactSettings({...contactSettings, zipCode: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  value={contactSettings.country}
                  onChange={(e) => setContactSettings({...contactSettings, country: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">📧 Email & SMTP Configuration</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 font-semibold">💡 SMTP Configuration</p>
              <p className="text-sm text-blue-700 mt-1">Configure your email server settings to send booking confirmations and notifications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="form-label">SMTP Host *</label>
                <input
                  type="text"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="form-label">SMTP Port *</label>
                <input
                  type="text"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="form-label">Encryption</label>
                <select className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="tls">TLS (Recommended)</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="form-label">SMTP Username *</label>
                <input
                  type="email"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">SMTP Password</label>
                <input
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label className="form-label">From Email *</label>
                <input
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="form-label">From Name *</label>
                <input
                  type="text"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">💳 Payment Gateway Configuration</h2>
            
            {/* Stripe */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💳</div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1A2E2B]">Stripe</h3>
                    <p className="text-sm text-[#2D4A42]">Accept credit card payments</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.stripeEnabled}
                    onChange={(e) => setPaymentSettings({...paymentSettings, stripeEnabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {paymentSettings.stripeEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Publishable Key</label>
                    <input
                      type="text"
                      value={paymentSettings.stripePublishableKey}
                      onChange={(e) => setPaymentSettings({...paymentSettings, stripePublishableKey: e.target.value})}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div>
                    <label className="form-label">Secret Key</label>
                    <input
                      type="password"
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => setPaymentSettings({...paymentSettings, stripeSecretKey: e.target.value})}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PayPal */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🅿️</div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1A2E2B]">PayPal</h3>
                    <p className="text-sm text-[#2D4A42]">Accept PayPal payments</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.paypalEnabled}
                    onChange={(e) => setPaymentSettings({...paymentSettings, paypalEnabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {paymentSettings.paypalEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">PayPal Client ID</label>
                    <input
                      type="text"
                      value={paymentSettings.paypalClientId}
                      onChange={(e) => setPaymentSettings({...paymentSettings, paypalClientId: e.target.value})}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="form-label">PayPal Secret</label>
                    <input
                      type="password"
                      value={paymentSettings.paypalSecret}
                      onChange={(e) => setPaymentSettings({...paymentSettings, paypalSecret: e.target.value})}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">🔒 Security Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Minimum Password Length</label>
                <input
                  type="number"
                  value={securitySettings.minPasswordLength}
                  onChange={(e) => setSecuritySettings({...securitySettings, minPasswordLength: parseInt(e.target.value)})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="6"
                  max="20"
                />
              </div>

              <div>
                <label className="form-label">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="120"
                />
              </div>

              <div>
                <label className="form-label">Max Login Attempts</label>
                <input
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="3"
                  max="10"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="requireSpecialChar"
                  checked={securitySettings.requireSpecialChar}
                  onChange={(e) => setSecuritySettings({...securitySettings, requireSpecialChar: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="requireSpecialChar" className="form-label mb-0 cursor-pointer">Require Special Characters in Password</label>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="twoFactorAuth" className="form-label mb-0 cursor-pointer">Enable Two-Factor Authentication (2FA)</label>
              </div>
            </div>
          </div>
        )}

        {/* Theme Settings */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">🎨 Theme & Branding</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    defaultValue="#0F6E56"
                    className="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <input
                    type="text"
                    defaultValue="#0F6E56"
                    className="input-field flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    defaultValue="#C8941A"
                    className="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <input
                    type="text"
                    defaultValue="#C8941A"
                    className="input-field flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Hotel Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-[#1A2E2B] font-semibold mb-2">Drag & drop your logo here</p>
                  <p className="text-sm text-[#2D4A42] mb-4">or click to browse (PNG, JPG - Max 5MB)</p>
                  <button className="btn-primary px-6 py-2 rounded-xl font-semibold cursor-pointer">
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg cursor-pointer disabled:opacity-50"
        >
          {isSaving ? '⏳ Saving...' : '✓ Save All Changes'}
        </button>
        <button
          onClick={() => {
            if (confirm('Are you sure? This will reset all settings to default.')) {
              // Reset logic
            }
          }}
          className="glass px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-50 transition-all cursor-pointer text-red-600 border border-red-200"
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  )
}
