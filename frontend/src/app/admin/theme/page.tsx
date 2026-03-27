'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ThemePage() {
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
                <h1 className="text-3xl font-bold gradient-text">Theme & Branding</h1>
                <p className="text-sm text-gray-600">Customize your hotel's visual identity</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                // Theme saved successfully
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
            >
              💾 Save Theme
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Theme Preview */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
                🎨 Live Preview
              </h2>
              
              {/* Preview Card */}
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                  <h3 className="text-3xl font-bold mb-2">Grand Plaza Hotel</h3>
                  <p className="opacity-90">Luxury & Comfort Redefined</p>
                </div>
                <div className="p-8 bg-white">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🏊</div>
                      <p className="font-semibold text-gray-900">Pool</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🍽️</div>
                      <p className="font-semibold text-gray-900">Dining</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">💆</div>
                      <p className="font-semibold text-gray-900">Spa</p>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold">
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold gradient-text mb-6">Color Scheme</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { name: 'Primary', value: '#3B82F6' },
                  { name: 'Secondary', value: '#6366F1' },
                  { name: 'Accent', value: '#8B5CF6' },
                  { name: 'Success', value: '#10B981' },
                  { name: 'Warning', value: '#F59E0B' },
                  { name: 'Danger', value: '#EF4444' },
                ].map((color) => (
                  <div key={color.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{color.name}</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        defaultValue={color.value}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        defaultValue={color.value}
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
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold gradient-text mb-6">Brand Colors</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <input type="color" defaultValue="#3B82F6" className="w-full h-12 rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Color</label>
                  <input type="color" defaultValue="#6366F1" className="w-full h-12 rounded-lg cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold gradient-text mb-6">Typography</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Font Family</label>
                  <select className="input-field w-full px-4 py-3 rounded-xl focus:outline-none">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                    <option>Lato</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold gradient-text mb-6">Logo Upload</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-all cursor-pointer">
                <div className="text-5xl mb-4">📷</div>
                <p className="font-semibold text-gray-900 mb-2">Drop your logo here</p>
                <p className="text-sm text-gray-600">or click to browse</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
