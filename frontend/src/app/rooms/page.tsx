import { Suspense } from 'react'
import RoomsPageClient from './RoomsPageClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading...</div>}>
      <RoomsPageClient />
    </Suspense>
  )
}
