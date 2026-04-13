'use client'

import AdminLayout from '@/components/admin/AdminShell'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import { BookingsProvider } from '@/context/BookingsContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRouteGuard>
      <BookingsProvider>
        <AdminLayout>{children}</AdminLayout>
      </BookingsProvider>
    </AdminRouteGuard>
  )
}
