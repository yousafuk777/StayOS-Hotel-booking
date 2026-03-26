'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin dashboard as the main landing page
    router.push('/admin')
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center space-y-6">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
        <h1 className="text-3xl font-bold gradient-text">Redirecting to Admin Dashboard...</h1>
        <p className="text-gray-600">Please wait</p>
      </div>
    </main>
  )
}
