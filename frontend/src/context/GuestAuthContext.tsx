'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import guestApi from '../services/guestApi'

interface GuestUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
}

interface GuestAuthContextType {
  guestUser: GuestUser | null
  guestToken: string | null
  isLoading: boolean
  loginRequest: (email: string) => Promise<void>
  verifyToken: (token: string) => Promise<void>
  logout: () => void
}

const GuestAuthContext = createContext<GuestAuthContextType | undefined>(undefined)

export function GuestAuthProvider({ children }: { children: ReactNode }) {
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null)
  const [guestToken, setGuestToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Initial sync from localStorage
    const savedToken = localStorage.getItem('guest_token')
    const savedUser = localStorage.getItem('guest_user')

    if (savedToken && savedUser) {
      try {
        setGuestToken(savedToken)
        setGuestUser(JSON.parse(savedUser))
      } catch (err) {
        console.error('[GuestAuth] Failed to parse guest user from storage', err)
        localStorage.removeItem('guest_token')
        localStorage.removeItem('guest_user')
      }
    }
    setIsLoading(false)
  }, [])

  const loginRequest = async (email: string) => {
    await guestApi.post('/api/v1/guest/auth/request-link', { email })
  }

  const verifyToken = async (token: string) => {
    const response = await guestApi.post('/api/v1/guest/auth/verify-link', { token })
    const { access_token, user } = response.data

    localStorage.setItem('guest_token', access_token)
    localStorage.setItem('guest_user', JSON.stringify(user))

    setGuestToken(access_token)
    setGuestUser(user)

    router.push('/guest/bookings')
  }

  const logout = () => {
    localStorage.removeItem('guest_token')
    localStorage.removeItem('guest_user')
    setGuestToken(null)
    setGuestUser(null)
    router.push('/guest/login')
  }

  return (
    <GuestAuthContext.Provider
      value={{
        guestUser,
        guestToken,
        isLoading,
        loginRequest,
        verifyToken,
        logout,
      }}
    >
      {children}
    </GuestAuthContext.Provider>
  )
}

export function useGuestAuth() {
  const context = useContext(GuestAuthContext)
  if (context === undefined) {
    throw new Error('useGuestAuth must be used within a GuestAuthProvider')
  }
  return context
}
