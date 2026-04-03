import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StayOS - Hotel Booking Platform',
  description: 'Find and book your perfect hotel stay',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
