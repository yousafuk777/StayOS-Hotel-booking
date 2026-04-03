'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PoliciesPage() {
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
                <h1 className="text-3xl font-bold gradient-text">Hotel Policies</h1>
                <p className="text-sm text-[#2D4A42]">Manage rules and regulations</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                // Policies saved successfully
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer"
            >
              💾 Save Policies
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-8 space-y-8">
        {/* Cancellation Policy */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            📋 Cancellation Policy
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Free Cancellation Period</label>
              <select className="input-field w-full px-4 py-3 rounded-xl focus:outline-none">
                <option>Up to 24 hours before check-in</option>
                <option>Up to 48 hours before check-in</option>
                <option>Up to 7 days before check-in</option>
                <option>No free cancellation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Cancellation Fee</label>
              <textarea
                rows={3}
                defaultValue="Guests who cancel within 24 hours of check-in will be charged one night's stay. No-shows will be charged the full reservation amount."
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Check-in/Check-out Policy */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            ⏰ Check-in & Check-out
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-in Time</label>
              <input
                type="time"
                defaultValue="15:00"
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Check-out Time</label>
              <input
                type="time"
                defaultValue="11:00"
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Early Check-in / Late Check-out</label>
              <textarea
                rows={3}
                defaultValue="Early check-in and late check-out are subject to availability. Additional charges may apply: $50 for early check-in before 12 PM, $75 for late check-out after 2 PM."
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Pet Policy */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            🐾 Pet Policy
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
              <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
              <div className="flex-1">
                <p className="font-semibold text-[#1A2E2B]">Pets Allowed</p>
                <p className="text-sm text-[#2D4A42]">Allow guests to bring pets</p>
              </div>
            </label>
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Pet Fee</label>
              <input
                type="text"
                defaultValue="$75 per pet per night"
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Pet Rules</label>
              <textarea
                rows={3}
                defaultValue="Maximum 2 pets per room. Pets must not be left unattended in rooms. Weight limit: 50 lbs per pet."
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Children Policy */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            👶 Children & Extra Beds
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Children Stay Free</label>
              <input
                type="text"
                defaultValue="Children under 12 years stay free when using existing beds"
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Extra Bed Policy</label>
              <textarea
                rows={3}
                defaultValue="One extra bed allowed per room at $50 per night. Cribs available free of charge upon request."
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Policy */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-3">
            💳 Payment Policy
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Accepted Payment Methods</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'].map((method) => (
                  <label key={method} className="flex items-center gap-3 p-4 glass rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                    <span className="font-medium text-[#1A2E2B]">{method}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A2E2B] mb-2">Deposit Required</label>
              <textarea
                rows={3}
                defaultValue="A refundable security deposit of $200 is required upon check-in for incidental charges."
                className="input-field w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
