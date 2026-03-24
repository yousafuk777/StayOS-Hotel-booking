# 11 — Frontend Next.js Structure

## Project Structure

```
frontend/
├── src/
│   ├── app/                           # Next.js 14 App Router
│   │   ├── layout.tsx                 # Root layout (providers, fonts)
│   │   ├── page.tsx                   # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (public)/
│   │   │   ├── search/page.tsx        # Hotel search results
│   │   │   ├── hotels/
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx       # Hotel detail page
│   │   │   │       └── rooms/
│   │   │   │           └── [roomId]/page.tsx
│   │   │   └── checkout/
│   │   │       ├── page.tsx           # Checkout page
│   │   │       └── confirmation/page.tsx
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx         # Dashboard shell
│   │   │       ├── page.tsx           # Overview
│   │   │       ├── bookings/page.tsx
│   │   │       ├── profile/page.tsx
│   │   │       └── saved/page.tsx
│   │   └── (admin)/
│   │       ├── admin/
│   │       │   ├── layout.tsx         # Admin shell
│   │       │   ├── page.tsx           # Admin overview
│   │       │   ├── rooms/page.tsx
│   │       │   ├── bookings/page.tsx
│   │       │   ├── calendar/page.tsx
│   │       │   ├── staff/page.tsx
│   │       │   ├── analytics/page.tsx
│   │       │   └── settings/
│   │       │       ├── page.tsx
│   │       │       └── theme/page.tsx
│   │       └── super-admin/
│   │           ├── layout.tsx
│   │           ├── page.tsx
│   │           ├── tenants/page.tsx
│   │           ├── users/page.tsx
│   │           ├── subscriptions/page.tsx
│   │           └── analytics/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                        # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Pagination.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── AdminShell.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── HotelCard.tsx
│   │   │   └── SearchResultsList.tsx
│   │   ├── hotel/
│   │   │   ├── HotelGallery.tsx
│   │   │   ├── HotelAmenities.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   └── ReviewsList.tsx
│   │   ├── booking/
│   │   │   ├── BookingForm.tsx
│   │   │   ├── BookingSummary.tsx
│   │   │   ├── GuestDetailsForm.tsx
│   │   │   └── AddonSelector.tsx
│   │   ├── admin/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── OccupancyCalendar.tsx
│   │   │   ├── BookingTable.tsx
│   │   │   └── RoomStatusBoard.tsx
│   │   └── theme/
│   │       ├── ThemeProvider.tsx
│   │       └── ThemeToggle.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useHotels.ts
│   │   ├── useBookings.ts
│   │   ├── useRooms.ts
│   │   ├── usePermissions.ts
│   │   └── useTheme.ts
│   │
│   ├── services/                      # API call functions
│   │   ├── api.ts                     # Axios instance
│   │   ├── auth.service.ts
│   │   ├── hotel.service.ts
│   │   ├── booking.service.ts
│   │   ├── payment.service.ts
│   │   └── admin.service.ts
│   │
│   ├── store/                         # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── booking.store.ts
│   │   └── ui.store.ts
│   │
│   ├── themes/
│   │   ├── default.ts
│   │   ├── dark.ts
│   │   └── types.ts
│   │
│   ├── types/
│   │   ├── hotel.ts
│   │   ├── booking.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   └── utils/
│       ├── formatDate.ts
│       ├── formatCurrency.ts
│       └── validators.ts
│
├── public/
│   └── images/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Axios Instance (services/api.ts)

```typescript
// src/services/api.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth.store'

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,  // send httpOnly cookies (refresh token)
})

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        )
        useAuthStore.getState().setAccessToken(data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## Zustand Auth Store

```typescript
// src/store/auth.store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  tenantId: number | null
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'stayos-auth',
      partialize: (state) => ({ user: state.user }),  // Don't persist token in localStorage
    }
  )
)
```

---

## TanStack Query Example

```typescript
// src/hooks/useHotels.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hotelService } from '@/services/hotel.service'

export interface SearchParams {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
  page?: number
}

export const useHotelSearch = (params: SearchParams) => {
  return useQuery({
    queryKey: ['hotels', 'search', params],
    queryFn: () => hotelService.search(params),
    enabled: !!params.destination && !!params.checkIn,
    staleTime: 5 * 60 * 1000,  // 5 minutes
  })
}

export const useHotelDetail = (hotelId: number) => {
  return useQuery({
    queryKey: ['hotels', hotelId],
    queryFn: () => hotelService.getById(hotelId),
    staleTime: 10 * 60 * 1000,
  })
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: hotelService.createRoom,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.hotelId] })
    },
  })
}
```

---

## Root Layout with Providers

```typescript
// src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StayOS — Hotel Booking',
  description: 'Find and book your perfect hotel stay',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

---

## TailwindCSS Config with CSS Variables

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          secondary: 'rgb(var(--color-surface-secondary) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['var(--font-family)', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

export default config
```

```css
/* src/app/globals.css */

:root {
  --color-primary-50: 239 246 255;
  --color-primary-500: 59 130 246;
  --color-primary-600: 37 99 235;
  --color-primary-700: 29 78 216;
  --color-surface: 255 255 255;
  --color-surface-secondary: 249 250 251;
  --color-text-primary: 17 24 39;
  --color-text-secondary: 107 114 128;
  --font-family: 'Inter';
}

.dark {
  --color-surface: 17 24 39;
  --color-surface-secondary: 31 41 55;
  --color-text-primary: 249 250 251;
  --color-text-secondary: 156 163 175;
}
```

---

## Hotel Service

```typescript
// src/services/hotel.service.ts

import api from './api'

export const hotelService = {
  search: async (params: SearchParams) => {
    const { data } = await api.get('/hotels/search', { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get(`/hotels/${id}`)
    return data
  },

  getRooms: async (hotelId: number, params: RoomAvailabilityParams) => {
    const { data } = await api.get(`/hotels/${hotelId}/rooms`, { params })
    return data
  },

  createRoom: async ({ hotelId, ...roomData }: CreateRoomPayload) => {
    const { data } = await api.post(`/admin/hotels/${hotelId}/rooms`, roomData)
    return data
  },
}
```
