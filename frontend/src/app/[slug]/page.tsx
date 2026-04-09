'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

interface RoomCategory {
  id: number
  name: string
  description: string
  base_price: number
  capacity: number
  bed_type: string
  image_url: string | null
}

interface Hotel {
  id: number
  name: string
  slug: string
  city: string | null
  country: string | null
  star_rating: number | null
  description: string | null
  starting_price: number
  address_line1: string | null
  phone: string | null
  email: string | null
  website: string | null
  image_url?: string | null
  room_categories: RoomCategory[]
}

export default function HotelLandingPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`${API_BASE_URL}/api/v1/hotels/${slug}`)
        setHotel(data)
      } catch (err: any) {
        console.error('Error fetching hotel details:', err)
        setError('We couldn\'t find the hotel you\'re looking for.')
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchHotelDetails()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-mutedText font-medium animate-pulse">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center">
          <span className="text-6xl mb-6 block">🏨</span>
          <h1 className="text-2xl font-bold text-darkText mb-2">Oops!</h1>
          <p className="text-mutedText mb-8">{error || 'Hotel not found.'}</p>
          <Link href="/" className="btn-primary px-8 py-3 rounded-xl font-bold inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-darkText">
            Stay<span className="text-primary-600">OS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-bold text-darkText hover:text-primary-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="btn-primary px-6 py-2 rounded-xl font-bold text-sm">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider">
              ⭐ {hotel.star_rating} Star Property
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-darkText tracking-tight">
              Welcome to <br />
              <span className="text-primary-600">{hotel.name}</span>
            </h1>

            {/* Price Tag below Name */}
            <div className="inline-flex flex-col bg-white border border-gray-100 p-6 rounded-3xl shadow-xl shadow-primary-600/5 slide-up">
              <p className="text-xs text-mutedText font-bold uppercase tracking-widest mb-1">Starting From</p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-black text-primary-600">${hotel.starting_price.toLocaleString()}</p>
                <p className="text-sm text-mutedText">/ night</p>
              </div>
              <p className="text-[10px] text-mutedText mt-1 uppercase tracking-tighter">All Taxes & Fees Included</p>
            </div>
            <p className="text-xl text-mutedText font-light leading-relaxed">
              {hotel.description || `Experience world-class hospitality in the heart of ${hotel.city}.`}
            </p>
            <div className="flex items-center gap-6 text-darkText font-medium">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <span>{hotel.city}, {hotel.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📞</span>
                <span>{hotel.phone || 'Contact for info'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => router.push('/login')} className="btn-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary-600/20 active:scale-95 transition-all">
                Book Your Stay
              </button>
              <Link href="#rooms" className="bg-gray-100 text-darkText px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all active:scale-95">
                Explore Rooms
              </Link>
            </div>
          </div>
          <div className="relative group">
            <div className="aspect-[4/5] rounded-[3rem] bg-gray-100 overflow-hidden relative shadow-2xl">
              {hotel.image_url ? (
                <img 
                  src={`${API_BASE_URL}${hotel.image_url}`} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center text-primary-200 text-8xl">🏨</div>
              )}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ROOM CATEGORIES */}
      <section id="rooms" className="py-32 px-6 bg-gray-50 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-darkText mb-4">Our Luxurious Rooms</h2>
            <p className="text-mutedText text-lg max-w-2xl mx-auto">Selected accommodations designed for your absolute comfort.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotel.room_categories.map((category) => (
              <div key={category.id} className="bg-white rounded-[2.5rem] p-4 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group">
                <div className="h-64 bg-gray-50 rounded-[2rem] relative overflow-hidden mb-6">
                  {category.image_url ? (
                    <img 
                      src={`${API_BASE_URL}${category.image_url}`} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-primary-600 opacity-5 group-hover:opacity-10 transition-opacity"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-primary-100 text-5xl">🛏️</div>
                    </>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-sm font-bold text-darkText">
                    {category.bed_type} Bed
                  </div>
                </div>
                <div className="px-4 pb-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-darkText">{category.name}</h3>
                    <p className="text-2xl font-black text-primary-600">${category.base_price}</p>
                  </div>
                  <p className="text-mutedText text-sm mb-6 line-clamp-2">
                    {category.description || 'Spacious and elegant room with modern amenities.'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-sm font-bold text-darkText">
                       <span>👥</span> {category.capacity} Guests
                    </div>
                    <button onClick={() => router.push('/login')} className="text-primary-600 font-bold hover:underline">
                      Book This Room →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 bg-darkText text-white mt-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
          <Link href="/" className="text-3xl font-black text-white">
            Stay<span className="text-primary-400">OS</span>
          </Link>
          <p className="text-gray-300 max-w-lg leading-relaxed">
            This property is part of the StayOS network. Premium hospitality, guaranteed.
          </p>
          <div className="flex gap-8 font-bold text-white">
            <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <Link href="/login" className="hover:text-primary-400 transition-colors">Portal Login</Link>
            <Link href="/register" className="hover:text-primary-400 transition-colors">Register</Link>
          </div>
          <div className="pt-10 border-t border-white/10 w-full text-sm text-gray-400">
             © 2026 {hotel.name} / Powered by StayOS
          </div>
        </div>
      </footer>
    </main>
  )
}
