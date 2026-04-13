'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { API_BASE_URL } from '../services/apiClient'

export default function LandingPage() {
  const router = useRouter()
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2 Guests')
  const [searchMessage, setSearchMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true)
        console.log('Fetching hotels from API...')
        const response = await api.get('/api/v1/hotels/')
        console.log('Hotels response:', response.data)
        console.log('Hotels count:', response.data?.length)
        
        if (Array.isArray(response.data)) {
          setHotels(response.data)
          setError(null)
        } else {
          console.error('Invalid response format:', response.data)
          setError('Invalid data format received')
        }
      } catch (err: any) {
        console.error('Error fetching hotels:', err)
        console.error('Error response:', err.response)
        console.error('Error status:', err.response?.status)
        setError(`Failed to load hotels: ${err.response?.status || 'Network error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      setSearchMessage('⚠️ Please select check-in and check-out dates')
      setTimeout(() => setSearchMessage(null), 3000)
      return
    }
    
    setSearchMessage('✅ Searching for available hotels...')
    setTimeout(() => setSearchMessage(null), 2000)
    
    // Navigate to search results or first hotel
    if (hotels.length > 0) {
      const firstHotel = hotels[0]
      router.push(`/rooms?hotel=${firstHotel.slug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
    }
  }

  const handleBookNow = (hotelSlug: string) => {
    router.push(`/rooms?hotel=${hotelSlug}${checkIn ? `&checkIn=${checkIn}` : ''}${checkOut ? `&checkOut=${checkOut}` : ''}`)
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-lightBg">
      <Navbar />

      {/* Search Message Toast */}
      {searchMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[99999] bg-white shadow-2xl rounded-xl px-6 py-4 border-l-4 border-primary-600 max-w-md"
        >
          <p className="text-gray-900 font-semibold">{searchMessage}</p>
        </motion.div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="fade-in max-w-4xl space-y-6 sm:space-y-8 mt-6 sm:mt-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-darkText drop-shadow-sm leading-tight">
            Your Perfect Stay <br className="hidden sm:block" /><span className="text-primary-500">Awaits</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-mutedText font-light max-w-2xl mx-auto">
            Discover comfort, luxury, and world-class hospitality
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button 
              onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl pulse cursor-pointer"
            >
              Book Now
            </button>
            <button 
              onClick={() => document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg cursor-pointer"
            >
              Explore Hotels
            </button>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div id="search" className="mt-8 sm:mt-12 md:mt-16 w-full max-w-5xl glass-card rounded-2xl p-4 sm:p-6 slide-up shadow-xl" style={{ animationDelay: '0.2s' }}>
          <form className="flex flex-col sm:flex-row gap-3 sm:gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex-1 flex flex-col items-start gap-1">
              <label className="form-label ml-1 text-xs sm:text-sm">Check-in</label>
              <input 
                type="date" 
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input-field w-full rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none transition-all text-sm sm:text-base" 
              />
            </div>
            <div className="flex-1 flex flex-col items-start gap-1">
              <label className="form-label ml-1 text-xs sm:text-sm">Check-out</label>
              <input 
                type="date" 
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input-field w-full rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none transition-all text-sm sm:text-base" 
              />
            </div>
            <div className="flex-1 flex flex-col items-start gap-1">
              <label className="form-label ml-1 text-xs sm:text-sm">Guests</label>
              <select 
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="input-field w-full rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none transition-all cursor-pointer appearance-none text-sm sm:text-base"
              >
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4+ Guests</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <button 
                type="button" 
                onClick={handleSearch}
                className="btn-primary w-full px-6 sm:px-8 py-2.5 sm:py-3 h-auto sm:h-[50px] rounded-xl font-bold text-sm sm:text-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-16 md:pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Hotels', value: '150+', icon: '🏨', delay: '0.4s' },
            { label: 'Happy Guests', value: '50k+', icon: '😊', delay: '0.5s' },
            { label: 'Rooms Available', value: '10k+', icon: '🛏️', delay: '0.6s' },
            { label: 'Years of Service', value: '15+', icon: '⭐', delay: '0.7s' }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 sm:p-6 text-center card-hover slide-up" style={{ animationDelay: stat.delay }}>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 float inline-block">{stat.icon}</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-primary-500 mb-1">{stat.value}</div>
              <div className="text-mutedText font-bold uppercase text-[10px] sm:text-xs tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AVAILABLE HOTELS */}
      <section id="hotels" className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 sm:mb-10 gap-4 fade-in">
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-darkText mb-2">Our Top Hotels</h2>
            <p className="text-mutedText text-base sm:text-lg">Handpicked properties for an unforgettable stay.</p>
          </div>
          <button 
            onClick={() => {
              if (hotels.length > 0) {
                handleBookNow(hotels[0].slug)
              }
            }}
            className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base cursor-pointer active:scale-95 transition-transform"
          >
            View All Hotels
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            // Skeleton loaders
            [1, 2, 3].map((n) => (
              <div key={n} className="glass-card rounded-3xl overflow-hidden animate-pulse">
                <div className="h-48 sm:h-56 bg-gray-200" />
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded mt-4" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full py-16 sm:py-20 text-center glass-card rounded-3xl">
              <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">⚠️</span>
              <p className="text-mutedText font-medium text-sm sm:text-base mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary px-6 py-3 rounded-xl font-bold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : hotels.length === 0 ? (
            <div className="col-span-full py-16 sm:py-20 text-center glass-card rounded-3xl">
              <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">🏨</span>
              <p className="text-mutedText font-medium text-sm sm:text-base">No hotels currently available. Check back soon!</p>
              <p className="text-xs text-gray-400 mt-2">Debug: hotels.length = {hotels.length}</p>
            </div>
          ) : (
            <>
              <p className="col-span-full text-center text-sm text-gray-600 mb-4">
                Showing {hotels.length} hotel{hotels.length !== 1 ? 's' : ''}
              </p>
              {hotels.map((hotel, i) => (
              <div key={hotel.id} className="glass-card rounded-3xl overflow-hidden card-hover slide-up flex flex-col border border-brandBorder" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="h-48 sm:h-56 bg-brandBorder relative overflow-hidden group">
                  {hotel.image_url ? (
                    <img
                      src={`${API_BASE_URL}${hotel.image_url}`}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/10 flex items-center justify-center text-primary-500/50 text-4xl sm:text-5xl">🏨</div>                  )}
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <h3 className="text-lg sm:text-xl font-bold text-darkText mb-2">{hotel.name}</h3>
                  <p className="text-mutedText text-xs sm:text-sm mb-4 flex-1 line-clamp-3">{hotel.description || 'A wonderful place to stay with exceptional service and amenities.'}</p>
                  <div className="flex items-center justify-between mt-auto gap-2">
                    <div className="text-primary-500 font-bold text-base sm:text-lg">
                      ${hotel.base_price || '199'}<span className="text-xs sm:text-sm font-normal">/night</span>
                    </div>
                    <button 
                      onClick={() => handleBookNow(hotel.slug)}
                      className="btn-primary px-3 sm:px-4 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer active:scale-95 transition-transform"
                    >
                      View Rooms
                    </button>
                  </div>
                </div>
              </div>
            ))}
              </>
          )}
        </div>
      </section>
    </main>
  )
}
