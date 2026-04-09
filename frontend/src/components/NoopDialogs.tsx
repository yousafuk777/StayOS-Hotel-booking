'use client'

import { useEffect } from 'react'

export default function NoopDialogs() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = () => undefined
      window.confirm = () => false
      window.prompt = () => null
    }
  }, [])

  return null
}
