'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: ''
  })

  useEffect(() => {
    // Load user data from localStorage
    try {
      const stored = localStorage.getItem('super_admin_user') || localStorage.getItem('user')
      if (stored) {
        const userData = JSON.parse(stored)
        setUser({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || ''
        })
        // Load profile picture if exists
        const savedPic = localStorage.getItem('profile_picture')
        if (savedPic) {
          setProfilePic(savedPic)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to localStorage (in production, this would go to backend)
    if (profilePic) {
      localStorage.setItem('profile_picture', profilePic)
    }
    
    alert('Profile updated successfully!')
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Convert to base64 and store
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePic(reader.result as string)
      }
      reader.onerror = () => {
        alert('Error reading file')
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePic = () => {
    setProfilePic(null)
    localStorage.removeItem('profile_picture')
  }

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Administrator',
      'admin': 'Hotel Administrator',
      'staff': 'Staff Member',
      'guest': 'Guest'
    }
    return roleMap[role] || role
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">👤 My Profile</h1>
        <p className="text-gray-600">Manage your personal information and settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="glass-card rounded-2xl p-6 text-center slide-up">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {profilePic ? (
                <div className="relative">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white"
                  />
                  {isEditing && (
                    <button
                      onClick={removeProfilePic}
                      className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                      title="Remove photo"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-4xl">
                    {user.firstName && user.lastName 
                      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                      : 'U'}
                  </span>
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{getRoleDisplay(user.role)}</p>
            <p className="text-xs text-gray-500 mt-2">{user.email}</p>

            {isEditing && (
              <div className="mt-4 space-y-3">
                <label className="btn-primary px-6 py-2 rounded-xl font-semibold cursor-pointer w-full inline-block">
                  📷 {profilePic ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Max 5MB • JPG, PNG, GIF</p>
              </div>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 btn-primary px-6 py-2 rounded-xl font-semibold cursor-pointer w-full"
            >
              {isEditing ? '✓ Done Editing' : '✏️ Edit Profile'}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="glass-card rounded-2xl p-6 mt-6 slide-up">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Account Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-semibold text-gray-900">March 2026</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-semibold text-gray-900">Today</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="md:col-span-2">
          <div className="glass-card rounded-2xl p-6 slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">📝 Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-sm font-medium"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label className="form-label">First Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={user.firstName}
                    onChange={(e) => setUser({...user, firstName: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="form-label">Last Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={user.lastName}
                    onChange={(e) => setUser({...user, lastName: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Email Address *</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="form-label">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={user.phone}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                )}
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="form-label">Role</label>
                <p className="text-gray-900 font-medium">{getRoleDisplay(user.role)}</p>
                <p className="text-xs text-gray-500 mt-1">Contact system administrator to change role</p>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary px-8 py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="glass px-8 py-3 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="glass-card rounded-2xl p-6 mt-6 slide-up">
            <h3 className="text-2xl font-bold gradient-text mb-6">🔒 Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                </div>
                <button className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-sm font-medium">
                  Change Password
                </button>
              </div>

              <div className="flex items-center justify-between p-4 glass rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <button className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-sm font-medium">
                  Enable 2FA
                </button>
              </div>

              <div className="flex items-center justify-between p-4 glass rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Active Sessions</p>
                  <p className="text-sm text-gray-600">Manage your logged-in devices</p>
                </div>
                <button className="glass px-4 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-sm font-medium">
                  View Sessions
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="glass-card rounded-2xl p-6 mt-6 slide-up">
            <h3 className="text-2xl font-bold gradient-text mb-6">⚙️ Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive platform updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 glass rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Use dark theme across the platform</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 glass rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Language</p>
                  <p className="text-sm text-gray-600">Choose your preferred language</p>
                </div>
                <select className="glass px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
