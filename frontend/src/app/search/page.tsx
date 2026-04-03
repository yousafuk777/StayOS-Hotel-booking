'use client'

import { useState } from 'react'

export default function SearchPage() {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  return (
    <main className="min-h-screen p-8 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-indigo-400 rounded-full opacity-10 float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 fade-in">
          <div className="flex justify-center mb-6">
            <div className="glass-card p-4 rounded-2xl shadow-xl float border border-gray-200">
              <span className="text-6xl">🔍</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold gradient-text drop-shadow-sm">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-[#2D4A42] font-light max-w-2xl mx-auto">
            Discover amazing hotels at unbeatable prices
          </p>
        </div>

        {/* Search Form */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl slide-up border border-gray-200" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-6">
            {/* Destination */}
            <div>
              <label className="block text-lg font-semibold text-[#1A2E2B] mb-3">
                📍 Where are you going?
              </label>
              <input
                type="text"
                placeholder="Enter destination, city, or hotel name"
                className="input-field w-full px-6 py-4 rounded-xl text-lg focus:outline-none"
              />
            </div>

            {/* Dates and Guests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Check-in */}
              <div>
                <label className="block text-sm font-semibold text-[#2D4A42] mb-2">
                  📅 Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-lg text-base focus:outline-none"
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-sm font-semibold text-[#2D4A42] mb-2">
                  📅 Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-lg text-base focus:outline-none"
                />
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-semibold text-[#2D4A42] mb-2">
                  👥 Guests
                </label>
                <select className="input-field w-full px-4 py-3 rounded-lg text-base focus:outline-none">
                  <option>1 Guest</option>
                  <option>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4 Guests</option>
                  <option>5+ Guests</option>
                </select>
              </div>

              {/* Rooms */}
              <div>
                <label className="block text-sm font-semibold text-[#2D4A42] mb-2">
                  🏨 Rooms
                </label>
                <select className="input-field w-full px-4 py-3 rounded-lg text-base focus:outline-none">
                  <option>1 Room</option>
                  <option>2 Rooms</option>
                  <option>3 Rooms</option>
                  <option>4+ Rooms</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button className="btn-primary w-full py-5 rounded-xl text-xl font-bold shadow-2xl">
              🔍 Search Hotels
            </button>
          </div>
        </div>

        {/* Featured Hotels */}
        <div className="space-y-8">
          <div className="text-center slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-4xl font-bold gradient-text mb-3">Featured Hotels</h2>
            <p className="text-[#2D4A42] text-lg">Handpicked selection of the best properties</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((hotel, index) => (
              <div
                key={hotel}
                className="glass-card rounded-2xl overflow-hidden card-hover slide-up border border-gray-200"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                {/* Hotel Image Placeholder */}
                <div className="relative h-56 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl opacity-30">🏨</span>
                  </div>
                  <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full border border-white/20">
                    <span className="text-yellow-400 font-bold">★★★★☆</span>
                  </div>
                  <div className="absolute bottom-4 left-4 glass px-3 py-1 rounded-full border border-white/20">
                    <span className="text-white font-semibold">Popular</span>
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[#1A2E2B] mb-1">
                      Grand Palace Hotel {hotel}
                    </h3>
                    <p className="text-[#2D4A42] flex items-center gap-2">
                      <span className="text-blue-500">📍</span>
                      <span>New York, Manhattan</span>
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2">
                    <span className="glass px-3 py-1 rounded-full text-sm text-[#1A2E2B] border border-gray-200">📶 WiFi</span>
                    <span className="glass px-3 py-1 rounded-full text-sm text-[#1A2E2B] border border-gray-200">🏊 Pool</span>
                    <span className="glass px-3 py-1 rounded-full text-sm text-[#1A2E2B] border border-gray-200">💪 Gym</span>
                    <span className="glass px-3 py-1 rounded-full text-sm text-[#1A2E2B] border border-gray-200">🅿️ Parking</span>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-500">
                        {'★'.repeat(4)}{'☆'}
                      </div>
                      <span className="text-[#2D4A42] text-sm">(248 reviews)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold gradient-text">$299</span>
                      <span className="text-[#2D4A42] text-sm">/night</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button className="btn-primary w-full py-3 rounded-xl font-semibold">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="glass-card rounded-3xl p-10 mt-16 slide-up border border-gray-200" style={{ animationDelay: '1s' }}>
          <h2 className="text-4xl font-bold gradient-text text-center mb-10">Why Choose StayOS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="text-6xl float">💎</div>
              <h3 className="text-2xl font-bold text-[#1A2E2B]">Best Price Guarantee</h3>
              <p className="text-[#2D4A42] text-lg">We match any competitor's price</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-6xl float">⚡</div>
              <h3 className="text-2xl font-bold text-[#1A2E2B]">Instant Confirmation</h3>
              <p className="text-[#2D4A42] text-lg">Get your booking confirmed immediately</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-6xl float">🛡️</div>
              <h3 className="text-2xl font-bold text-[#1A2E2B]">Secure Booking</h3>
              <p className="text-[#2D4A42] text-lg">Your payment and data are protected</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
