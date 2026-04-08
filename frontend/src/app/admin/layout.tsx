'use client'

import AdminLayout from '@/components/admin/AdminShell'
import { BookingsProvider } from '@/context/BookingsContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BookingsProvider>
      <AdminLayout>{children}</AdminLayout>
    </BookingsProvider>
  )
}
