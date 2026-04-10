'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { API_BASE_URL } from '../services/apiClient'

export default function LandingPage() {
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/v1/hotels/')
        setHotels(response.data)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching hotels:', err)
        setError('Failed to load hotels. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  return (
    <main className="min-h-screen relative overflow-hidden bg-lightBg">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="fade-in max-w-4xl space-y-8 mt-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-darkText drop-shadow-sm">
            Your Perfect Stay <br className="md:hidden" /><span className="text-primary-500">Awaits</span>
          </h1>
          <p className="text-xl md:text-2xl text-mutedText font-light max-w-2xl mx-auto">
            Discover comfort, luxury, and world-class hospitality
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="#search" className="btn-primary px-8 py-4 rounded-xl font-bold text-lg shadow-xl pulse">
              Book Now
            </Link>
            <Link href="#hotels" className="btn-secondary px-8 py-4 rounded-xl font-bold text-lg shadow-lg">
              Explore Hotels
            </Link>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div id="search" className="mt-16 w-full max-w-5xl glass-card rounded-2xl p-4 md:p-6 slide-up shadow-xl" style={{ animationDelay: '0.2s' }}>
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col items-start gap-1">
              <label className="form-label ml-1">Check-in</label>
              <input type="date" className="input-field w-full rounded-xl px-4 py-3 focus:outline-none transition-all" />
            </div>
            <div className="flex-1 flex flex-col items-start gap-1">
              <label className="form-label ml-1">Check-out</label>
              <input type="date" className="input-field w-full rounded-xl px-4 py-3 focus:outline-none transition-all" />
            </div>
            <div className="flex-1 flex flex-col items-start gap-1">
              <label className="form-label ml-1">Guests</label>
              <select className="input-field w-full rounded-xl px-4 py-3 focus:outline-none transition-all cursor-pointer appearance-none">
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4+ Guests</option>
              </select>
            </div>
            <div className="flex flex-col justify-end pt-5 md:pt-0">
              <button type="button" className="btn-primary w-full md:w-auto px-8 py-3 h-[50px] rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Hotels', value: '150+', icon: '🏨', delay: '0.4s' },
            { label: 'Happy Guests', value: '50k+', icon: '😊', delay: '0.5s' },
            { label: 'Rooms Available', value: '10k+', icon: '🛏️', delay: '0.6s' },
            { label: 'Years of Service', value: '15+', icon: '⭐', delay: '0.7s' }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center card-hover slide-up" style={{ animationDelay: stat.delay }}>
              <div className="text-4xl mb-3 float inline-block">{stat.icon}</div>
              <div className="text-4xl font-extrabold text-primary-500 mb-1">{stat.value}</div>
              <div className="text-mutedText font-bold uppercase text-xs tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AVAILABLE HOTELS */}
      <section id="hotels" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4 fade-in">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-darkText mb-2">Our Top Hotels</h2>
            <p className="text-mutedText text-lg">Handpicked properties for an unforgettable stay.</p>
          </div>
          <Link href="#hotels" className="hidden md:inline-flex btn-secondary px-6 py-3 rounded-xl font-bold">
            View All Hotels
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton loaders
            [1, 2, 3].map((n) => (
              <div key={n} className="glass-card rounded-3xl overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded mt-4" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full py-20 text-center glass-card rounded-3xl">
              <span className="text-4xl mb-4 block">⚠️</span>
              <p className="text-mutedText font-medium">{error}</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card rounded-3xl">
              <span className="text-4xl mb-4 block">🏨</span>
              <p className="text-mutedText font-medium">No hotels currently available. Check back soon!</p>
            </div>
          ) : (
            hotels.map((hotel, i) => (
              <div key={hotel.id} className="glass-card rounded-3xl overflow-hidden card-hover slide-up flex flex-col border border-brandBorder" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="h-56 bg-brandBorder relative overflow-hidden group">
                  {hotel.image_url ? (
                    <img
                      src={`${API_BASE_URL}${hotel.image_url}`}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/10 flex items-center justify-center text-primary-500/50 text-5xl">🏨</div>                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-darkText mb-2">{hotel.name}</h3>
                  <p className="text-mutedText text-sm mb-4 flex-1">{hotel.description || 'A wonderful place to stay with exceptional service and amenities.'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-primary-500 font-bold text-lg">
                      From ${hotel.base_price || '199'}/night
                    </div>
                    <Link href={`/rooms?hotel=${hotel.slug}`} className="btn-primary px-4 py-2 rounded-lg text-sm font-bold">
                      View Rooms
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
