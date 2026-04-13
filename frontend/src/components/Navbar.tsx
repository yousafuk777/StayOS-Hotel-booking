'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Our Hotels', href: '/#hotels' },
  { label: 'Rooms & Suites', href: '/rooms' },
  { label: 'Amenities', href: '/#amenities' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact', href: '/#contact' }
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-primary-900/95 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-black text-white tracking-tight">
          Stay<span className="text-accent">OS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-white/90 font-semibold">
          {navItems.map(item => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-white/90 hover:text-white transition-colors font-semibold">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90 hover:scale-105"
          >
            Register
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden text-white/90 hover:text-white transition-colors"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label="Toggle navigation"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-primary-900/98 backdrop-blur-xl border-t border-white/10 px-6 pb-6"
          >
            <div className="flex flex-col gap-4 pt-4 text-white/90">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center font-semibold transition hover:bg-white/15"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="block rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-white font-semibold transition hover:bg-white/15"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block rounded-full bg-accent px-4 py-3 text-center text-white font-semibold transition hover:bg-accent/90"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
