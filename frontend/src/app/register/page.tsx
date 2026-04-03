'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loginStep, setLoginStep] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Step 1: Register the user
      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/auth/register`,
        {
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      )

      // Step 2: Automatically log in the user after successful registration
      setLoginStep(true)
      const params = new URLSearchParams()
      params.append('username', formData.email)
      params.append('password', formData.password)

      const loginResponse = await axios.post(
        `${API_BASE_URL}/api/v1/auth/login`,
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true
        }
      )

      localStorage.setItem('access_token', loginResponse.data.access_token)
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user))

      // Step 3: Redirect based on role
      if (loginResponse.data.user.role === 'super_admin') {
        router.replace('/super-admin')
      } else {
        router.replace('/admin')
      }
    } catch (err: any) {
      setSuccess(false)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please try again.'
      setError(errorMessage.includes('already registered') 
        ? 'This email is already registered. Please login instead.' 
        : errorMessage)
      setLoading(false)
    }
  }

  // Show loading/success states during the process
  if (loading || success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative glass-card p-12 rounded-3xl shadow-2xl border border-white/60 flex flex-col items-center max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-8 animate-pulse">
             <span className="text-4xl text-white">🚀</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {loginStep ? 'Signing you in...' : 'Setting up your desk...'}
          </h2>
          <p className="text-[#2D4A42] mb-8 font-medium">
            Join the premium property management ecosystem.
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 shadow-sm" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10"
          style={{ boxShadow: '0 25px 60px rgba(99,102,241,0.12)' }}
        >
          {/* Logo / Brand */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl mb-4 bg-white flex items-center justify-center">
              <img
                src="/logo.png"
                alt="StayOS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              StayOS
            </h1>
            <p className="text-[#2D4A42] text-sm mt-1 text-center px-4">Start your premium management journey</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A2E2B] ml-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white/70 text-[#1A2E2B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A2E2B] ml-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white/70 text-[#1A2E2B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#1A2E2B] ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@yourhotel.com"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white/70 text-[#1A2E2B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#1A2E2B] ml-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white/70 text-[#1A2E2B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 disabled: disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating Desk...
                </span>
              ) : (
                '✨ Join the Platform'
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-50">
            <p className="text-sm text-[#2D4A42]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
