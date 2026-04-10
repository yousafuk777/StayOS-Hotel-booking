'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  StarIcon, MapPinIcon, WifiIcon, TruckIcon, CakeIcon, UserGroupIcon, 
  PhoneIcon, EnvelopeIcon, ClockIcon, ArrowRightIcon, CameraIcon,
  ShieldCheckIcon, SparklesIcon, GiftIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import api from '../../services/api'
import { API_BASE_URL } from '../../services/apiClient'

interface Hotel {
  id: number
  name: string
  slug: string
  city: string
  country: string
  star_rating: number
  description: string
  image_url: string
  starting_price: number
  address_line1: string
  phone: string
  email: string
  website: string
  room_categories: RoomCategory[]
}

interface RoomCategory {
  id: number
  name: string
  description: string
  base_price: number
  max_occupancy: number
  square_feet?: number
  rooms: Room[]
}

interface Room {
  id: number
  room_number: string
  status: string
  images: RoomImage[]
}

interface RoomImage {
  id: number
  image_url: string
  is_primary: boolean
}

export default function RoomsPageClient() {
  const searchParams = useSearchParams()
  const hotelSlug = searchParams.get('hotel')

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [guests, setGuests] = useState('2 Guests')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (hotelSlug) {
      fetchHotelDetails()
    } else {
      setError('No hotel selected')
      setLoading(false)
    }
  }, [hotelSlug])

  const fetchHotelDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/v1/hotels/${hotelSlug}`)
      setHotel(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching hotel details:', err)
      setError('Failed to load hotel details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getPrimaryImage = (room: Room) => {
    const primaryImage = room.images.find(img => img.is_primary)
    return primaryImage ? `${API_BASE_URL}${primaryImage.image_url}` : '/placeholder-room.jpg'
  }

  const getHotelImage = () => {
    return hotel?.image_url ? `${API_BASE_URL}${hotel.image_url}` : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop'
  }

  const handleCheckAvailability = () => {
    if (!checkInDate || !checkOutDate) {
      setToastMessage('⚠️ Please select both check-in and check-out dates')
      setTimeout(() => setToastMessage(null), 4000)
      return
    }
    setToastMessage('✅ Checking availability...')
    setTimeout(() => setToastMessage(null), 3000)
    const roomsSection = document.getElementById('rooms-section')
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleBookNow = (roomId: number, categoryName: string, price: number) => {
    setToastMessage(`🎉 Booking ${categoryName} - $${price}/night`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your experience...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">🏨</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Hotel Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested hotel could not be found.'}</p>
          <Link href="/" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const galleryImages = [
    { url: getHotelImage(), span: 'md:col-span-2 md:row-span-2', label: 'Hotel Exterior' },
    { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop', span: '', label: 'Luxury Suite' },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop', span: '', label: 'Lobby' },
    { url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop', span: '', label: 'Pool Area' },
    { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', span: '', label: 'Restaurant' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[99999] bg-white shadow-2xl rounded-xl px-6 py-4 border-l-4 border-accent max-w-md"
          >
            <p className="text-gray-900 font-semibold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMMERSIVE HERO HEADER */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getHotelImage()}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              {[...Array(hotel.star_rating)].map((_, i) => (
                <StarIconSolid key={i} className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              ))}
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight">
              {hotel.name}
            </h1>
            
            <div className="flex items-center justify-center text-white/90 text-lg md:text-xl mb-6">
              <MapPinIcon className="w-5 h-5 mr-2" />
              <span>{hotel.city}, {hotel.country}</span>
            </div>
            
            <p className="text-white/90 text-xl md:text-2xl max-w-3xl font-light mb-8">
              {hotel.description || 'Your Sanctuary of Luxury and Comfort'}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
              <span className="flex items-center"><WifiIcon className="w-4 h-4 mr-2" /> Free Wi-Fi</span>
              <span className="flex items-center"><SparklesIcon className="w-4 h-4 mr-2" /> 5-Star Service</span>
              <span className="flex items-center"><GiftIcon className="w-4 h-4 mr-2" /> Complimentary Breakfast</span>
            </div>
          </motion.div>
        </div>

        {/* SMART BOOKING ENGINE */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div className="flex flex-col">
                <label className="text-gray-700 text-sm font-semibold mb-2">Check-in</label>
                <input 
                  type="date" 
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 text-sm font-semibold mb-2">Check-out</label>
                <input 
                  type="date" 
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 text-sm font-semibold mb-2">Guests</label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none transition cursor-pointer"
                >
                  <option>1 Guest</option>
                  <option>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4 Guests</option>
                  <option>5+ Guests</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 text-sm font-semibold mb-2">Room Type</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:outline-none transition cursor-pointer">
                  <option>All Rooms</option>
                  {hotel.room_categories.map(cat => (
                    <option key={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <button 
                  onClick={handleCheckAvailability}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-bold text-lg transition hover:shadow-lg"
                >
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">4.9/5</div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <div className="text-gray-600 text-sm">2,847 Reviews</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">{hotel.star_rating}⭐</div>
              <div className="text-gray-900 font-semibold mb-1">Star Rating</div>
              <div className="text-gray-600 text-sm">Certified Luxury</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">15+</div>
              <div className="text-gray-900 font-semibold mb-1">Years Experience</div>
              <div className="text-gray-600 text-sm">Hospitality Excellence</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50k+</div>
              <div className="text-gray-900 font-semibold mb-1">Happy Guests</div>
              <div className="text-gray-600 text-sm">Worldwide</div>
            </div>
          </div>
        </div>
      </section>

      {/* ROOM CATEGORIES WITH FILTERS */}
      <section id="rooms-section" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
              Our Rooms & Suites
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Each room is meticulously designed for your ultimate comfort and luxury
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                selectedCategory === null
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Rooms
            </button>
            {hotel.room_categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Room Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotel.room_categories
              .filter(category => selectedCategory === null || category.id === selectedCategory)
              .flatMap(category => 
                category.rooms.map((room) => ({ room, category }))
              )
              .map(({ room, category }, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={getPrimaryImage(room)} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg">
                      <span className={`text-sm font-bold ${
                        room.status === 'available' || room.status === 'clean' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {room.status === 'available' || room.status === 'clean' ? 'Available' : 'Occupied'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          <span>Up to {category.max_occupancy} guests</span>
                          {category.square_feet && (
                            <span className="ml-3">• {category.square_feet} sq ft</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary-600">${category.base_price}</div>
                        <div className="text-gray-500 text-sm">per night</div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6 line-clamp-2">{category.description}</p>

                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <WifiIcon className="w-4 h-4 mr-1" />
                        <span>Free WiFi</span>
                      </div>
                      <div className="flex items-center">
                        <CakeIcon className="w-4 h-4 mr-1" />
                        <span>Breakfast</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleBookNow(room.id, category.name, category.base_price)}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition hover:shadow-lg"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>

          {hotel.room_categories.every(cat => cat.rooms.length === 0) && (
            <div className="text-center py-20">
              <div className="text-7xl mb-6">🎉</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Grand Opening Soon!</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                We're preparing something extraordinary. Our luxurious rooms will be available for booking shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* LUXURY AMENITIES GRID */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
              World-Class Amenities
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need for an unforgettable stay
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: WifiIcon, title: 'High-Speed Wi-Fi', desc: 'Fiber-optic internet throughout the property', color: 'bg-blue-50 text-blue-600' },
              { icon: CakeIcon, title: 'Fine Dining', desc: 'Award-winning restaurant & 24/7 room service', color: 'bg-orange-50 text-orange-600' },
              { icon: SparklesIcon, title: 'Spa & Wellness', desc: 'Full-service spa with expert therapists', color: 'bg-purple-50 text-purple-600' },
              { icon: UserGroupIcon, title: 'Fitness Center', desc: 'State-of-the-art gym open 24/7', color: 'bg-green-50 text-green-600' },
              { icon: MapPinIcon, title: 'Swimming Pool', desc: 'Heated infinity pool with city views', color: 'bg-cyan-50 text-cyan-600' },
              { icon: TruckIcon, title: 'Airport Shuttle', desc: 'Complimentary airport transfer service', color: 'bg-indigo-50 text-indigo-600' },
              { icon: ClockIcon, title: 'Concierge', desc: '24/7 dedicated concierge assistance', color: 'bg-pink-50 text-pink-600' },
              { icon: ShieldCheckIcon, title: 'Safety & Security', desc: '24/7 surveillance & in-room safes', color: 'bg-red-50 text-red-600' },
            ].map((amenity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer"
              >
                <div className={`w-14 h-14 ${amenity.color} rounded-lg flex items-center justify-center mb-4`}>
                  <amenity.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{amenity.title}</h3>
                <p className="text-gray-600 text-sm">{amenity.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VISUAL GALLERY - BENTO GRID */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
              Explore Our Hotel
            </h2>
            <p className="text-gray-600 text-lg">
              Take a visual journey through our luxurious property
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-xl group cursor-pointer ${img.span}`}
              >
                <img 
                  src={img.url} 
                  alt={img.label}
                  className="w-full h-full object-cover min-h-[200px] group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="w-6 h-6 mb-2" />
                  <p className="font-semibold">{img.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GUEST REVIEWS / TESTIMONIALS */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
              What Our Guests Say
            </h2>
            <p className="text-gray-600 text-lg">
              Real experiences from real travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', role: 'Business Traveler', text: 'Exceptional service and attention to detail. The business center and Wi-Fi were perfect for my work needs.', rating: 5 },
              { name: 'John D.', role: 'Family Vacation', text: 'Our family had an amazing time. The kids loved the pool, and we loved the spa. Will definitely return!', rating: 5 },
              { name: 'Emily R.', role: 'Couple\'s Getaway', text: 'The most romantic setting imaginable. The staff made our anniversary truly unforgettable.', rating: 5 },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-md"
              >
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <StarIconSolid key={j} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-4">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{review.name}</div>
                    <div className="text-gray-600 text-sm">{review.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION & SURROUNDINGS */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-4xl text-gray-900 mb-6">
                Perfect Location
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Situated in the heart of {hotel.city}, our hotel offers easy access to major attractions, business districts, and transportation hubs.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: '✈️', text: '15 minutes from International Airport' },
                  { icon: '🏛️', text: '5 minutes to City Center' },
                  { icon: '🚉', text: '2 minutes to Metro Station' },
                  { icon: '🛍️', text: 'Walking distance to Shopping District' },
                  { icon: '🎭', text: '10 minutes to Entertainment Quarter' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {hotel.address_line1 && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-primary-600 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Address</div>
                      <div className="text-gray-600">{hotel.address_line1}</div>
                      <div className="text-gray-600">{hotel.city}, {hotel.country}</div>
                    </div>
                  </div>
                )}
                {hotel.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-primary-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Phone</div>
                      <div className="text-gray-600">{hotel.phone}</div>
                    </div>
                  </div>
                )}
                {hotel.email && (
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <div className="text-gray-600">{hotel.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <MapPinIcon className="w-20 h-20 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                <p className="text-gray-600 mb-4">{hotel.city}, {hotel.country}</p>
                <a 
                  href={`https://maps.google.com/?q=${hotel.city}+${hotel.country}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  View on Google Maps
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            Ready to Experience Luxury?
          </h2>
          <p className="text-white/90 text-xl mb-8">
            Book your stay today and create unforgettable memories
          </p>
          <button 
            onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-primary-600 px-12 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition hover:shadow-xl"
          >
            Book Your Room Now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Stay<span className="text-accent">OS</span></h3>
              <p className="text-gray-400 mb-4">
                Your trusted partner for luxury hotel bookings worldwide.
              </p>
              <div className="flex gap-4">
                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((social, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition">
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Our Hotels</a></li>
                <li><a href="#" className="hover:text-white transition">Rooms & Suites</a></li>
                <li><a href="#" className="hover:text-white transition">Amenities</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Subscribe for exclusive deals and updates</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary-600"
                />
                <button className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-r-lg transition">
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StayOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
