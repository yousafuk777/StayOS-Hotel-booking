'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

interface PlanContextType {
  planKey: string
  displayName: string
  maxRooms: number | null
  maxUsers: number | null
  features: Record<string, boolean>
  isLoading: boolean
  hasFeature: (key: string) => boolean
  refreshPlan: () => Promise<void>
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [planData, setPlanData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPlan = useCallback(async () => {
    try {
      setIsLoading(true)
      const storedUser = localStorage.getItem('user') || localStorage.getItem('super_admin_user')
      if (!storedUser) {
        setIsLoading(false)
        return
      }

      const user = JSON.parse(storedUser)
      const tenantId = user.tenant_id

      if (!tenantId) {
        // Fallback for Super Admin viewing a specific hotel from state
        // In a real scenario, we might pull this from the URL or a shared state
        setIsLoading(false)
        return
      }

      // Ensure tenantId is sent as a string/integer correctly
      const response = await api.get('/api/v1/tenants/me/plan', {
        headers: {
          'X-Tenant-ID': String(tenantId)
        }
      })
      
      if (response.data) {
        setPlanData(response.data)
      }
    } catch (error: any) {
      console.error('Plan Context Error:', error.response?.data?.detail || error.message)
      // Do not clear planData here to avoid flickering to Starter
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const hasFeature = (key: string) => {
    if (!planData) return false
    return !!planData.features?.[key]
  }

  const value = {
    planKey: planData?.plan_key || 'starter',
    displayName: planData?.display_name || 'Starter',
    maxRooms: planData?.max_rooms ?? 5,
    maxUsers: planData?.max_users ?? 2,
    features: planData?.features || {},
    isLoading,
    hasFeature,
    refreshPlan: fetchPlan
  }

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}
