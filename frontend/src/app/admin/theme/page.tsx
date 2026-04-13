'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { canAccess } from '@/config/permissions'

interface ThemeSettings {
  brand: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    danger: string
  }
  typography: {
    fontFamily: string
  }
  logo: {
    url: string
    alt: string
  }
}

const defaultTheme: ThemeSettings = {
  brand: {
    primaryColor: '#3B82F6',
    secondaryColor: '#6366F1',
    accentColor: '#8B5CF6'
  },
  colors: {
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  },
  typography: {
    fontFamily: 'Inter'
  },
  logo: {
    url: '',
    alt: ''
  }
}

export default function ThemePage() {
  const router = useRouter()
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [hasChanges, setHasChanges] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('hotel-theme')
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme))
      } catch (error) {
        console.error('Error loading theme:', error)
      }
    }
  }, [])

  // RBAC Fallback Check
  useEffect(() => {
    const stored = localStorage.getItem('user') || localStorage.getItem('super_admin_user')
    if (stored) {
      const user = JSON.parse(stored)
      if (!canAccess(user.role, 'theme_branding')) {
        router.replace('/admin/access-denied')
      } else {
        setIsAuthorized(true)
      }
    } else {
      router.replace('/login')
    }
  }, [router])

  // Save theme to localStorage
  const saveTheme = () => {
    localStorage.setItem('hotel-theme', JSON.stringify(theme))
    setHasChanges(false)
    alert('Theme saved successfully!')
  }

  // Update theme
  const updateTheme = (section: keyof ThemeSettings, data: any) => {
    setTheme(prev => ({ ...prev, [section]: data }))
    setHasChanges(true)
  }

  // Generate sample theme
  const generateSampleTheme = () => {
    const sampleTheme: ThemeSettings = {
      brand: {
        primaryColor: '#1E40AF',
        secondaryColor: '#7C3AED',
        accentColor: '#EC4899'
      },
      colors: {
        primary: '#1E40AF',
        secondary: '#7C3AED',
        accent: '#EC4899',
        success: '#059669',
        warning: '#D97706',
        danger: '#DC2626'
      },
      typography: {
        fontFamily: 'Inter'
      },
      logo: {
        url: 'https://via.placeholder.com/200x80/1E40AF/FFFFFF?text=LOGO',
        alt: 'Hotel Logo'
      }
    }
    setTheme(sampleTheme)
    saveTheme()
  }

  // Clear theme
  const clearTheme = () => {
    if (confirm('Are you sure you want to reset the theme to defaults?')) {
      setTheme(defaultTheme)
      localStorage.removeItem('hotel-theme')
      setHasChanges(false)
    }
  }

  const isEmpty = !theme.brand.primaryColor && !theme.logo.url

  if (isAuthorized === null) return null

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
                <h1 className="text-3xl font-bold gradient-text">Theme & Branding</h1>
                <p className="text-sm text-[#2D4A42]">Customize your hotel's visual identity</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEmpty ? (
                <button
                  onClick={generateSampleTheme}
                  className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer"
                >
                  🎨 Add Sample Theme
                </button>
              ) : (
                <button
                  onClick={clearTheme}
                  className="glass px-4 py-2 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  🗑️ Reset Theme
                </button>
              )}

              <button
                onClick={saveTheme}
                disabled={!hasChanges}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                  hasChanges
                    ? 'btn-primary'
                    : 'glass text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>💾</span>
                <span>Save Theme</span>
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
              <div className="text-8xl mb-6">🎨</div>
              <h2 className="text-3xl font-bold gradient-text mb-4">No Theme Configured</h2>
              <p className="text-[#2D4A42] mb-8 text-lg">
                Create a beautiful visual identity for your hotel with custom colors, fonts, and branding.
              </p>
              <button
                onClick={generateSampleTheme}
                className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto cursor-pointer"
              >
                🎨 Try Sample Theme
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Theme Preview */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl p-8 mb-8 slide-up">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                  🎨 Live Preview
                </h2>

                {/* Preview Card */}
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className="p-8 text-white"
                    style={{ background: `linear-gradient(to right, ${theme.brand.primaryColor}, ${theme.brand.secondaryColor})` }}
                  >
                    <h3 className="text-3xl font-bold mb-2">Grand Plaza Hotel</h3>
                    <p className="opacity-90">Luxury & Comfort Redefined</p>
                  </div>
                  <div className="p-8 bg-white">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div
                        className="rounded-xl p-4 text-center"
                        style={{ backgroundColor: `${theme.brand.primaryColor}20` }}
                      >
                        <div className="text-3xl mb-2">🏊</div>
                        <p className="font-semibold text-[#1A2E2B]">Pool</p>
                      </div>
                      <div
                        className="rounded-xl p-4 text-center"
                        style={{ backgroundColor: `${theme.brand.secondaryColor}20` }}
                      >
                        <div className="text-3xl mb-2">🍽️</div>
                        <p className="font-semibold text-[#1A2E2B]">Dining</p>
                      </div>
                      <div
                        className="rounded-xl p-4 text-center"
                        style={{ backgroundColor: `${theme.brand.accentColor}20` }}
                      >
                        <div className="text-3xl mb-2">💆</div>
                        <p className="font-semibold text-[#1A2E2B]">Spa</p>
                      </div>
                    </div>
                    <button
                      className="w-full text-white py-3 rounded-xl font-semibold"
                      style={{ background: `linear-gradient(to right, ${theme.brand.primaryColor}, ${theme.brand.secondaryColor})` }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-8 slide-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold gradient-text mb-6">Color Scheme</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Primary', key: 'primary', value: theme.colors.primary },
                    { name: 'Secondary', key: 'secondary', value: theme.colors.secondary },
                    { name: 'Accent', key: 'accent', value: theme.colors.accent },
                    { name: 'Success', key: 'success', value: theme.colors.success },
                    { name: 'Warning', key: 'warning', value: theme.colors.warning },
                    { name: 'Danger', key: 'danger', value: theme.colors.danger },
                  ].map((color) => (
                    <div key={color.key}>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">{color.name}</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={color.value}
                          onChange={(e) => updateTheme('colors', { ...theme.colors, [color.key]: e.target.value })}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                        />
                        <input
                          type="text"
                          value={color.value}
                          onChange={(e) => updateTheme('colors', { ...theme.colors, [color.key]: e.target.value })}
                          className="input-field flex-1 px-4 py-2 rounded-xl focus:outline-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="space-y-8">
              <div className="glass-card rounded-2xl p-6 slide-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-bold gradient-text mb-6">Brand Colors</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme.brand.primaryColor}
                        onChange={(e) => updateTheme('brand', { ...theme.brand, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={theme.brand.primaryColor}
                        onChange={(e) => updateTheme('brand', { ...theme.brand, primaryColor: e.target.value })}
                        className="input-field flex-1 px-4 py-2 rounded-xl focus:outline-none font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme.brand.secondaryColor}
                        onChange={(e) => updateTheme('brand', { ...theme.brand, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={theme.brand.secondaryColor}
                        onChange={(e) => updateTheme('brand', { ...theme.brand, secondaryColor: e.target.value })}
                        className="input-field flex-1 px-4 py-2 rounded-xl focus:outline-none font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme.brand.accentColor}
                        onChange={(e) => updateTheme('brand', { ...theme.brand, accentColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={theme.brand.accentColor}
                        onChange={(e) => updateTheme('brand', { ...theme.brand, accentColor: e.target.value })}
                        className="input-field flex-1 px-4 py-2 rounded-xl focus:outline-none font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 slide-up" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl font-bold gradient-text mb-6">Typography</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Font Family</label>
                    <select
                      value={theme.typography.fontFamily}
                      onChange={(e) => updateTheme('typography', { fontFamily: e.target.value })}
                      className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
                    >
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                      <option>Lato</option>
                      <option>Poppins</option>
                      <option>Montserrat</option>
                    </select>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-[#2D4A42] mb-2">Preview:</p>
                    <p
                      className="text-lg font-semibold"
                      style={{ fontFamily: theme.typography.fontFamily }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 slide-up" style={{ animationDelay: '0.8s' }}>
                <h3 className="text-xl font-bold gradient-text mb-6">Logo Upload</h3>
                {theme.logo.url ? (
                  <div className="space-y-4">
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                      <img
                        src={theme.logo.url}
                        alt={theme.logo.alt}
                        className="max-w-full h-20 object-contain mx-auto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Alt Text</label>
                      <input
                        type="text"
                        value={theme.logo.alt}
                        onChange={(e) => updateTheme('logo', { ...theme.logo, alt: e.target.value })}
                        className="input-field w-full px-4 py-2 rounded-xl focus:outline-none"
                        placeholder="Logo description"
                      />
                    </div>
                    <button
                      onClick={() => updateTheme('logo', { url: '', alt: '' })}
                      className="w-full glass px-4 py-2 rounded-xl hover:bg-red-50 transition-all text-sm font-medium text-red-600"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="text-5xl mb-4">📷</div>
                    <p className="font-semibold text-[#1A2E2B] mb-2">Drop your logo here</p>
                    <p className="text-sm text-[#2D4A42]">or click to browse</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            updateTheme('logo', {
                              url: e.target?.result as string,
                              alt: file.name
                            })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-block mt-4 glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
