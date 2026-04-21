'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGuestAuth } from '../../../context/GuestAuthContext'

export default function GuestVerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyToken } = useGuestAuth()
  const [error, setError] = useState<string | null>(null)
  const isVerifying = useRef(false)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setError('Missing token. Please use the link provided in your email.')
      return
    }

    if (isVerifying.current) return
    isVerifying.current = true

    const doVerify = async () => {
      try {
        await verifyToken(token)
        // Redirection is handled inside GuestAuthContext.verifyToken
      } catch (err: any) {
        console.error('Verification failed:', err)
        setError(err.response?.data?.detail || 'This login link is invalid or has expired.')
        isVerifying.current = false
      }
    }

    doVerify()
  }, [searchParams, verifyToken])

  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-[#fafafa]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        {!error ? (
          <div className="space-y-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-[6px] border-gray-100 rounded-[2rem] rotate-45"></div>
              <div className="absolute inset-0 border-[6px] border-primary-600 rounded-[2rem] border-t-transparent animate-spin rotate-45"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                🗝️
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Verifying Access</h2>
              <p className="text-gray-500 font-bold animate-pulse tracking-wide uppercase text-[10px]">Unlocking your portal...</p>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-gray-200/40 border border-gray-100"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl shadow-inner">
              ⚠️
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Access Error</h2>
            <p className="text-gray-600 mb-10 font-medium leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => router.push('/guest/login')}
              className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-gray-900/20 active:scale-[0.98]"
            >
              Request New Link
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
