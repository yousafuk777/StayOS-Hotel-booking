'use client'

import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

/**
 * AdminRouteGuard ensures that ONLY authorized staff and admins 
 * can access the /admin dashboard routes.
 * 
 * - Redirects to /login if not authenticated.
 * - Redirects guests (e.g. to homepage or guest portal) if they try to access admin.
 */
export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAccess = () => {
      const token = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user') || localStorage.getItem('super_admin_user')

      if (!token || !storedUser) {
        router.replace('/login')
        return
      }

      try {
        const user = JSON.parse(storedUser)
        const role = String(user.role || '').toLowerCase()
        
        // Guests are not allowed in the admin dashboard
        if (role === 'guest') {
          console.log('RBAC Check: User is guest, redirecting to landing page.')
          router.replace('/') 
          return
        }

        // Explicitly defined roles allowed to access the /admin context
        const ALLOWED_ADMIN_ROLES = [
          'super_admin', 
          'admin', 
          'hotel_admin', 
          'hotel_manager', 
          'manager',
          'staff', 
          'front_desk', 
          'front_desk_agent',
          'housekeeping'
        ]

        if (!ALLOWED_ADMIN_ROLES.includes(role)) {
          console.warn(`RBAC Check: Role "${role}" is not authorized for admin access.`)
          router.replace('/login')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('RBAC Guard Error:', error)
        router.replace('/login')
      }
    }

    checkAccess()
  }, [router])

  // Prevent flicker of protected content before redirect
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F6E56]"></div>
      </div>
    )
  }

  return <>{children}</>
}
