'use client'

import React from 'react'
import { GuestAuthProvider, useGuestAuth } from '../../context/GuestAuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function GuestNavbar() {
  const { guestUser, logout } = useGuestAuth()
  const pathname = usePathname()

  const isAuthPage = pathname === '/guest/login' || pathname === '/guest/verify'

  return (
    <header className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <Link href="/guest/bookings" className="flex items-center gap-2">
        <span className="text-2xl">🏨</span>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">StayOS <span className="text-primary-600">Guest</span></h1>
      </Link>
      <nav className="flex items-center gap-6">
        {!isAuthPage && guestUser ? (
          <>
            <Link 
              href="/guest/bookings" 
              className={`text-sm font-bold ${pathname.includes('/guest/bookings') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              My Bookings
            </Link>
            <button 
              onClick={logout}
              className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Back to Hotel
          </Link>
        )}
      </nav>
    </header>
  )
}

export default function GuestPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GuestAuthProvider>
      <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
        <GuestNavbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <footer className="py-10 px-6 text-center text-gray-400 text-xs border-t border-gray-100 bg-white">
          <p>© {new Date().getFullYear()} StayOS Hotel Platform. Powered by Advanced Agentic Coding.</p>
        </footer>
      </div>
    </GuestAuthProvider>
  )
}
