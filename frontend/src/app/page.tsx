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

      {/* Background Image Overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-screen z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/50 to-lightBg"></div>
      </div>

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
      <section className="relative pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="fade-in max-w-4xl space-y-6 sm:space-y-8 mt-6 sm:mt-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg leading-tight">
            Your Perfect Stay <br className="hidden sm:block" /><span className="text-accent">Awaits</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto drop-shadow-md">
            Discover comfort, luxury, and world-class hospitality
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button 
              onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl pulse cursor-pointer bg-white text-primary-600 hover:bg-gray-100"
            >
              Book Now
            </button>
            <button 
              onClick={() => document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg cursor-pointer bg-accent text-white hover:bg-accent/90"
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
      <section className="relative px-4 sm:px-6 pb-12 sm:pb-16 md:pb-20 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Hotels', value: '150+', icon: '🏨', delay: '0.4s' },
            { label: 'Happy Guests', value: '50k+', icon: '😊', delay: '0.5s' },
            { label: 'Rooms Available', value: '10k+', icon: '🛏️', delay: '0.6s' },
            { label: 'Years of Service', value: '15+', icon: '⭐', delay: '0.7s' }
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 sm:p-6 text-center card-hover slide-up bg-white/95 backdrop-blur-sm" style={{ animationDelay: stat.delay }}>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 float inline-block">{stat.icon}</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-primary-600 mb-1">{stat.value}</div>
              <div className="text-gray-700 font-bold uppercase text-[10px] sm:text-xs tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AVAILABLE HOTELS */}
      <section id="hotels" className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl mx-auto z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 sm:mb-10 gap-4 fade-in">
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Our Top Hotels</h2>
            <p className="text-gray-700 text-base sm:text-lg">Handpicked properties for an unforgettable stay.</p>
          </div>
          <button 
            onClick={() => {
              if (hotels.length > 0) {
                handleBookNow(hotels[0].slug)
              }
            }}
            className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base cursor-pointer active:scale-95 transition-transform bg-white text-primary-600 hover:bg-gray-100 border-2 border-primary-600"
          >
            View All Hotels
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            // Skeleton loaders
            [1, 2, 3].map((n) => (
              <div key={n} className="glass-card rounded-3xl overflow-hidden animate-pulse bg-white/95">
                <div className="h-48 sm:h-56 bg-gray-200" />
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded mt-4" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full py-16 sm:py-20 text-center glass-card rounded-3xl bg-white/95 backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">⚠️</span>
              <p className="text-gray-700 font-medium text-sm sm:text-base mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary px-6 py-3 rounded-xl font-bold cursor-pointer bg-primary-600 text-white hover:bg-primary-700"
              >
                Retry
              </button>
            </div>
          ) : hotels.length === 0 ? (
            <div className="col-span-full py-16 sm:py-20 text-center glass-card rounded-3xl bg-white/95 backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">🏨</span>
              <p className="text-gray-700 font-medium text-sm sm:text-base">No hotels currently available. Check back soon!</p>
              <p className="text-xs text-gray-500 mt-2">Debug: hotels.length = {hotels.length}</p>
            </div>
          ) : (
            <>
              <p className="col-span-full text-center text-sm text-gray-600 mb-4">
                Showing {hotels.length} hotel{hotels.length !== 1 ? 's' : ''}
              </p>
              {hotels.map((hotel, i) => (
              <div key={hotel.id} className="glass-card rounded-3xl overflow-hidden card-hover slide-up flex flex-col bg-white/95 backdrop-blur-sm border border-gray-200" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
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
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                  <p className="text-gray-700 text-xs sm:text-sm mb-4 flex-1 line-clamp-3">{hotel.description || 'A wonderful place to stay with exceptional service and amenities.'}</p>
                  <div className="flex items-center justify-between mt-auto gap-2">
                    <div className="text-primary-600 font-bold text-base sm:text-lg">
                      ${hotel.base_price || '199'}<span className="text-xs sm:text-sm font-normal">/night</span>
                    </div>
                    <button 
                      onClick={() => handleBookNow(hotel.slug)}
                      className="btn-primary px-3 sm:px-4 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer active:scale-95 transition-transform bg-primary-600 text-white hover:bg-primary-700"
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

      {/* ABOUT SECTION */}
      <section id="about" className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl mx-auto z-10">
        <div className="text-center mb-10 sm:mb-16 fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">About StayOS</h2>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl mx-auto">
            Your trusted partner in premium hospitality experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: '🏆',
              title: 'Premium Quality',
              description: 'Handpicked hotels with world-class amenities and exceptional service standards.'
            },
            {
              icon: '💎',
              title: 'Best Price Guarantee',
              description: 'We offer competitive pricing with exclusive deals and seasonal offers.'
            },
            {
              icon: '🌟',
              title: 'Trusted by Thousands',
              description: 'Over 50,000 happy guests and counting. Your satisfaction is our priority.'
            }
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 sm:p-8 text-center card-hover slide-up bg-white/95 backdrop-blur-sm" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="text-5xl sm:text-6xl mb-4">{item.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-700 text-sm sm:text-base">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OFFERS SECTION */}
      <section id="offers" className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl mx-auto z-10">
        <div className="text-center mb-10 sm:mb-16 fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Special Offers</h2>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl mx-auto">
            Exclusive deals and discounts for unforgettable stays
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              badge: '20% OFF',
              title: 'Early Bird Special',
              description: 'Book 30 days in advance and save 20% on your stay.',
              validity: 'Valid till Dec 31, 2026',
              gradient: 'from-primary-500 to-primary-700'
            },
            {
              badge: 'FREE NIGHT',
              title: 'Stay 3, Pay 2',
              description: 'Book 3 nights and get the 4th night absolutely free.',
              validity: 'Weekday stays only',
              gradient: 'from-accent to-primary-600'
            },
            {
              badge: 'VIP',
              title: 'Loyalty Rewards',
              description: 'Earn points with every booking and redeem for free stays.',
              validity: 'Join our loyalty program',
              gradient: 'from-purple-500 to-pink-600'
            }
          ].map((offer, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden card-hover slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className={`bg-gradient-to-r ${offer.gradient} p-6 text-white`}>
                <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-3">
                  {offer.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{offer.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-sm sm:text-base mb-4">{offer.description}</p>
                <p className="text-xs text-gray-600 mb-4">{offer.validity}</p>
                <button className="btn-primary w-full px-4 py-3 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-transform bg-primary-600 text-white hover:bg-primary-700">
                  Claim Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-7xl mx-auto z-10">
        <div className="text-center mb-10 sm:mb-16 fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 text-base sm:text-lg max-w-3xl mx-auto">
            Get in touch with our team for any inquiries or assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card rounded-2xl p-6 sm:p-8 bg-white/95 backdrop-blur-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Get In Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-700 text-sm sm:text-base">+1 234 567 8900</p>
                    <p className="text-gray-700 text-sm sm:text-base">+1 234 567 8901</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">✉️</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-700 text-sm sm:text-base">bookings@stayos.com</p>
                    <p className="text-gray-700 text-sm sm:text-base">support@stayos.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-700 text-sm sm:text-base">123 Hotel Street</p>
                    <p className="text-gray-700 text-sm sm:text-base">New York, NY 10001, USA</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">🕒</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Working Hours</h4>
                    <p className="text-gray-700 text-sm sm:text-base">24/7 Customer Support</p>
                    <p className="text-gray-700 text-sm sm:text-base">Office: Mon-Fri 9AM-6PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="glass-card rounded-2xl p-6 sm:p-8 bg-white/95 backdrop-blur-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="form-label ml-1 text-sm">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="input-field w-full rounded-xl px-4 py-3 focus:outline-none transition-all text-sm sm:text-base" 
                  />
                </div>
                <div>
                  <label className="form-label ml-1 text-sm">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="input-field w-full rounded-xl px-4 py-3 focus:outline-none transition-all text-sm sm:text-base" 
                  />
                </div>
                <div>
                  <label className="form-label ml-1 text-sm">Subject</label>
                  <input 
                    type="text" 
                    placeholder="How can we help?"
                    className="input-field w-full rounded-xl px-4 py-3 focus:outline-none transition-all text-sm sm:text-base" 
                  />
                </div>
                <div>
                  <label className="form-label ml-1 text-sm">Message</label>
                  <textarea 
                    placeholder="Your message here..."
                    rows={4}
                    className="input-field w-full rounded-xl px-4 py-3 focus:outline-none transition-all text-sm sm:text-base resize-none" 
                  />
                </div>
                <button 
                  type="submit"
                  className="btn-primary w-full px-6 py-3 rounded-xl font-bold text-sm sm:text-base cursor-pointer active:scale-95 transition-transform"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-black mb-4">Stay<span className="text-accent">OS</span></h3>
              <p className="text-white/70 text-sm mb-4">Your trusted partner in premium hospitality experiences.</p>
              <div className="flex gap-4">
                <a href="#" className="text-white/70 hover:text-white transition-colors text-xl">📘</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-xl">🐦</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-xl">📷</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-xl">💼</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-white/70 hover:text-white transition-colors">Home</a></li>
                <li><a href="#hotels" className="text-white/70 hover:text-white transition-colors">Hotels</a></li>
                <li><a href="#offers" className="text-white/70 hover:text-white transition-colors">Offers</a></li>
                <li><a href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#contact" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <p className="text-white/70 text-sm mb-4">Subscribe for exclusive deals and updates</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-l-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none text-sm"
                />
                <button className="bg-accent px-4 py-2 rounded-r-lg font-bold hover:bg-accent/90 transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/70 text-sm">© 2026 StayOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
