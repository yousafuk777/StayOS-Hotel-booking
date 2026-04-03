'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/auth/forgot-password`,
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      )

      setSuccess(true)
      console.log('Password reset email sent:', data)
    } catch (err: any) {
      console.error('Forgot password error:', err)
      console.error('Error response:', err.response?.data)
      
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to send reset email. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-extrabold gradient-text">Check Your Email!</h2>
            <p className="mt-2 text-[#2D4A42]">
              We've sent a password reset link to <strong className="text-[#1A2E2B]">{email}</strong>
            </p>
            <p className="mt-4 text-sm text-[#2D4A42]">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="mt-6 space-y-3">
              <Link 
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                ← Back to Login
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full flex justify-center py-3 px-4 glass rounded-xl shadow-sm text-sm font-medium text-indigo-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                Try Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card rounded-2xl p-8 shadow-xl">
        <div>
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="mt-4 text-3xl font-extrabold gradient-text">Forgot Password?</h2>
            <p className="mt-2 text-sm text-[#2D4A42]">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1A2E2B] mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-[#1A2E2B] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer ${
                loading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              href="/login" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-all cursor-pointer"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
