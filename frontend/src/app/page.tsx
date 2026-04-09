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
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/10 flex items-center justify-center text-primary-500/50 text-5xl">🏨</div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-darkText shadow-md">
                    ⭐ {hotel.star_rating?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col bg-surface">
                  <h3 className="text-2xl font-bold text-darkText mb-1">{hotel.name}</h3>
                  <p className="text-mutedText mb-4 flex items-center gap-1 font-medium line-clamp-1">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {hotel.city}, {hotel.country}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-brandBorder">
                    <div className="flex flex-col">
                      <span className="text-xs text-mutedText font-bold uppercase tracking-wider">Starting From</span>
                      <span className="text-2xl font-extrabold text-primary-500">${hotel.starting_price.toLocaleString()}</span>
                    </div>
                    <Link href={`/${hotel.slug}`} className="btn-primary px-5 py-2.5 rounded-xl font-bold shadow-md text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-10 text-center md:hidden">
          <Link href="#hotels" className="inline-flex btn-secondary px-6 py-3 rounded-xl font-bold w-full justify-center">
            View All Hotels
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section id="amenities" className="py-20 relative bg-surface">
        <div className="absolute inset-0 bg-primary-50/20 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-darkText mb-4">Why Book With Us?</h2>
            <p className="text-mutedText text-lg max-w-2xl mx-auto font-light">Experience seamless booking with premium perks built into every stay.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Easy Booking', desc: 'Secure your room in just a few clicks.', icon: '⚡' },
              { title: 'Verified Hotels', desc: 'Every property is handpicked and verified.', icon: '✅' },
              { title: '24/7 Support', desc: 'Our team is here to help anytime, anywhere.', icon: '🎧' },
              { title: 'Best Price Guarantee', desc: 'Find it cheaper? We will match the price.', icon: '💰' },
              { title: 'Secure Payments', desc: 'Your transactions are always protected.', icon: '🔒' },
              { title: 'Instant Confirmation', desc: 'No waiting. Get confirmed instantly.', icon: '📩' }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl card-hover slide-up border border-brandBorder" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <div className="text-4xl mb-6 p-4 bg-primary-50 text-primary-500 rounded-2xl inline-block float shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-darkText mb-2">{feature.title}</h3>
                <p className="text-mutedText leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="px-6 py-20 bg-lightBg">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <p className="text-accent font-semibold uppercase tracking-[0.3em]">About Us</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-darkText">A hospitality platform built for modern travelers.</h2>
            <p className="text-mutedText text-lg leading-relaxed max-w-2xl">
              StayOS combines curated hotel stays, fast booking, and personalized support across premium properties worldwide.
              We help travelers discover unforgettable experiences with trusted partners, real-time availability, and smart pricing.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-3xl p-6 border border-brandBorder">
                <h3 className="font-bold text-darkText mb-2">Trusted Stays</h3>
                <p className="text-mutedText text-sm leading-relaxed">Every hotel is reviewed and selected for comfort, design, and service.</p>
              </div>
              <div className="glass-card rounded-3xl p-6 border border-brandBorder">
                <h3 className="font-bold text-darkText mb-2">Effortless Booking</h3>
                <p className="text-mutedText text-sm leading-relaxed">Simple search, flexible dates, and fast checkout for every guest.</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-[2rem] overflow-hidden border border-brandBorder shadow-xl">
            <div className="h-full bg-[radial-gradient(circle_at_top,_rgba(15,110,86,0.2),_transparent_45%)] p-8">
              <div className="rounded-3xl bg-primary-500/10 p-10 backdrop-blur-sm">
                <p className="text-lg text-darkText leading-relaxed">
                  Since day one, StayOS has focused on creating stays that feel premium without the premium hassle.
                  Our journey is powered by hospitality experts, thoughtful design, and a commitment to guest delight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-darkText mb-4">What Our Guests Say</h2>
          <p className="text-mutedText text-lg max-w-2xl mx-auto font-light">Real stories from travelers who have experienced the magic of our top-rated properties.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Sarah Jenkins', avatar: 'SJ', review: 'Absolutely stunning! The staff went above and beyond.', hotel: 'Grand Resort & Spa' },
            { name: 'Michael Chen', avatar: 'MC', review: 'Best location in the city. The room was breathtaking and very spacious.', hotel: 'Urban Boutique Hotel' },
            { name: 'Emma Davis', avatar: 'ED', review: 'A true alpine paradise. The complimentary breakfast was exquisite!', hotel: 'Mountain Retreat' }
          ].map((testimonial, i) => (
            <div key={i} className="glass-card rounded-3xl p-8 card-hover slide-up relative" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="absolute -top-6 left-8 bg-primary-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-4 border-surface shadow-lg">
                {testimonial.avatar}
              </div>
              <div className="pt-6 flex flex-col h-full">
                <div className="text-xl mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-darkText italic font-medium leading-relaxed mb-6">"{testimonial.review}"</p>
                <div className="border-t border-brandBorder pt-5 mt-auto">
                  <h4 className="font-extrabold text-darkText">{testimonial.name}</h4>
                  <p className="text-xs text-mutedText font-bold uppercase mt-1.5 flex items-center gap-1.5 tracking-wider">
                    <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    {testimonial.hotel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-6 py-20 bg-surface">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
          <div className="space-y-6">
            <p className="text-accent font-semibold uppercase tracking-[0.3em]">Contact</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-darkText">Let us help plan your stay.</h2>
            <p className="text-mutedText text-lg leading-relaxed max-w-2xl">
              Have a question about rooms, availability, or group bookings? Send us a message and our team will respond quickly.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-3xl p-6 border border-brandBorder">
                <p className="font-bold text-darkText mb-2">Email</p>
                <p className="text-mutedText text-sm">support@stayos.com</p>
              </div>
              <div className="glass-card rounded-3xl p-6 border border-brandBorder">
                <p className="font-bold text-darkText mb-2">Phone</p>
                <p className="text-mutedText text-sm">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <form className="glass-card rounded-[2rem] border border-brandBorder p-8 shadow-xl bg-white">
            <div className="grid gap-4">
              <label className="form-label">Name</label>
              <input type="text" placeholder="Your name" className="input-field w-full rounded-2xl px-4 py-3" />
            </div>
            <div className="grid gap-4 mt-4">
              <label className="form-label">Email</label>
              <input type="email" placeholder="you@example.com" className="input-field w-full rounded-2xl px-4 py-3" />
            </div>
            <div className="grid gap-4 mt-4">
              <label className="form-label">Message</label>
              <textarea placeholder="Tell us what you'd like help with" className="input-field w-full rounded-2xl px-4 py-3 resize-none min-h-[150px]"></textarea>
            </div>
            <button type="button" className="btn-primary mt-6 w-full rounded-2xl px-6 py-4 font-semibold text-lg">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center fade-in">
        <div className="glass-card p-12 md:p-16 rounded-[3rem] shadow-xl relative overflow-hidden bg-primary-50">
          <div className="absolute inset-0 bg-primary-100 mix-blend-multiply opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-darkText mb-6 tracking-tight">
              Ready to find your <br className="hidden md:block" /> perfect hotel?
            </h2>
            <p className="text-mutedText text-xl font-light mb-10">
              Join thousands of travelers who book with us every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#hotels" className="btn-primary w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-xl pulse">
                Browse Hotels
              </Link>
              <Link href="/register" className="btn-accent w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-lg">
                Register Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-darkText text-white pt-20 pb-10 px-6 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 mb-16">
          <div className="space-y-4">
            <Link href="/" className="text-3xl font-black text-white inline-block mb-2">
              Stay<span className="text-accent">OS</span>
            </Link>
            <p className="text-gray-300 font-light leading-relaxed">
              Your trusted partner for finding the perfect accommodation, anywhere in the world.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link href="#hotels" className="hover:text-accent transition-colors">Our Hotels</Link></li>
              <li><Link href="#rooms" className="hover:text-accent transition-colors">Rooms & Suites</Link></li>
              <li><Link href="#about" className="hover:text-accent transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Support</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="#" className="hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Booking Guide</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Cancellation Policy</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Contact Info</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-3">
                <span className="text-accent">📧</span> support@stayos.com
              </li>
              <li className="flex items-center gap-3">
                <span className="text-accent">📞</span> +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-3">
                <span className="text-accent">🏢</span> 123 Hotel Avenue, NY 10001
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-gray-400 text-sm">
          <p>© 2026 StayOS. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-bold transition-all">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
            <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
