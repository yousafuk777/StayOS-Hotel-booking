import type { Metadata } from 'next'
import './globals.css'
import NoopDialogs from '../components/NoopDialogs'

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
      <body>
        <NoopDialogs />
        {children}
      </body>
    </html>
  )
}
