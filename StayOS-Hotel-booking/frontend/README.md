# StayOS Frontend - Next.js Application

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend/README.md)

### Installation

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. **Run development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── (auth)/                 # Auth pages (login, register)
│   ├── (public)/               # Public pages (search, hotel details)
│   ├── (dashboard)/            # Guest dashboard
│   └── (admin)/                # Admin panels
│
├── components/
│   ├── ui/                     # Base UI components
│   ├── layout/                 # Layout components
│   ├── search/                 # Search components
│   ├── hotel/                  # Hotel components
│   ├── booking/                # Booking components
│   └── admin/                  # Admin components
│
├── services/                   # API calls
│   ├── api.ts                  # Axios instance
│   ├── auth.service.ts
│   ├── hotel.service.ts
│   └── booking.service.ts
│
├── store/                      # Zustand stores
│   ├── auth.store.ts
│   └── booking.store.ts
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   └── useTheme.ts
│
└── utils/                      # Utility functions
```

## 🎨 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **TanStack Query** for data fetching
- **Zustand** for state management
- **React Hook Form** for forms
- **Stripe** for payments

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Pages

### Public Pages
- `/` - Landing page
- `/search` - Hotel search
- `/hotels/[slug]` - Hotel detail page
- `/checkout` - Booking checkout

### Auth Pages
- `/login` - Login page
- `/register` - Registration page
- `/reset-password` - Password reset

### Dashboard
- `/dashboard` - Guest overview
- `/dashboard/bookings` - Booking history
- `/dashboard/profile` - User profile

### Admin
- `/admin` - Admin dashboard
- `/admin/rooms` - Room management
- `/admin/bookings` - Booking management
- `/admin/analytics` - Reports and analytics

## 🎯 Key Components

### API Service
Centralized API client with automatic token refresh.

### Auth Store
Zustand store for managing authentication state.

### Theme System
Supports light/dark mode with tenant-specific branding.

## 📝 Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_NAME=StayOS
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚢 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

## 🔗 Related

- [Backend Documentation](../backend/README.md)
- [API Documentation](http://localhost:8000/docs)

---

**Built with Next.js 14 and TypeScript**
