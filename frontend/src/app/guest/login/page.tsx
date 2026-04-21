'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useGuestAuth } from '../../../context/GuestAuthContext'

export default function GuestLoginPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { loginRequest } = useGuestAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await loginRequest(email)
      setIsSubmitted(true)
    } catch (err: any) {
      console.error('Login request failed:', err)
      setError(err.response?.data?.detail || 'Failed to send login link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-gradient-to-br from-[#f8f9fa] to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 p-10 md:p-12 border border-gray-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner rotate-3">
            ✨
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 font-medium">Sign in to manage your bookings</p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-0 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary-500/25 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send Magic Link</span>
                  <span className="text-xl">🚀</span>
                </>
              )}
            </button>
            
            <p className="text-center text-[11px] text-gray-400 px-4 leading-relaxed font-medium">
              We'll email you a one-time login link. <br/>Safe, fast, and no password required.
            </p>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl shadow-inner -rotate-3">
              📧
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Check your inbox</h3>
            <p className="text-gray-500 mb-10 px-4 leading-relaxed font-medium">
              We've sent a magic login link to <br/><span className="text-gray-900 font-black">{email}</span>. <br/>Click the link in the email to sign in instantly.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-primary-600 font-black hover:text-primary-700 text-sm underline decoration-primary-200 underline-offset-4"
            >
              Didn't get the email? Try again
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
