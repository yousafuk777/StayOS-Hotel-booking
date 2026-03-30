'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Use OAuth2PasswordRequestForm compatible format (multipart/form-data or x-www-form-urlencoded)
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)

      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/auth/login`,
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true
        }
      )

      // Full Wipe of previous session data to prevent identity collisions
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('super_admin_user')
      localStorage.removeItem('tenant_id')
      localStorage.removeItem('profile_picture')

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Multi-Role Redirection Logic
      const role = data.user.role
      if (role === 'super_admin') {
        router.replace('/super-admin')
      } else if (['admin', 'hotel_admin', 'hotel_manager', 'staff'].includes(role)) {
        router.replace('/admin')
      } else {
        // Default destination for guests or customers
        router.replace('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
              <span className="text-3xl">🏨</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              StayOS
            </h1>
            <p className="text-gray-500 text-sm mt-1">Property Management Portal</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourhotel.com"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white/70 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                '🚀 Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Join StayOS Now
                </Link>
              </p>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Premium Property Management
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
