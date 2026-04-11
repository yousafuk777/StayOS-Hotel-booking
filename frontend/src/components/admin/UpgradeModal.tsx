'use client'

import React from 'react'
import { Lock } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  requiredPlan: string
}

export default function UpgradeModal({ isOpen, onClose, featureName, requiredPlan }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-amber-600" size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {featureName} Requires {requiredPlan} Plan
          </h2>
          
          <p className="text-gray-600 mb-8">
            This feature is not available on your current plan. To upgrade your plan, please contact your platform administrator.
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-[#1A2E2B] text-white py-3 rounded-xl font-bold hover:bg-[#2D4541] transition-all shadow-lg active:scale-95"
          >
            Close
          </button>
        </div>
        
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
            Premium Feature
          </span>
        </div>
      </div>
    </div>
  )
}
