'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'

/**
 * AccessDenied page shown to users who navigate to a route 
 * they don't have permission for (Role-based restriction).
 */
export default function AccessDeniedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 text-center rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="text-red-500" size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">Access Denied</h1>
        <p className="text-gray-600 mb-10 text-sm">
          You don't have permission to access this section of the dashboard. 
          Please contact your Hotel Administrator if you believe this is an error.
        </p>
        
        <div className="flex flex-col gap-3 w-full">
          <Link 
            href="/admin"
            className="flex items-center justify-center gap-2 bg-[#1A2E2B] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#12211F] transition-all shadow-lg"
          >
            <Home size={18} />
            Return to Dashboard
          </Link>
          <button 
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 px-6 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
