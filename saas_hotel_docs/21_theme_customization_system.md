# 21 — Theme Customization System

## Overview

The theme system operates on three levels:
1. **Platform Defaults** — set by Super Admin, apply to all tenants
2. **Tenant Branding** — hotel admin configures hotel-specific brand
3. **User Preferences** — individual guest prefers light/dark/font size

---

## Theme Architecture

```
[Tenant slug resolved from subdomain]
         │
         ▼
[Fetch tenant_settings from API/cache]
         │
         ▼
[Inject CSS variables via ThemeProvider]
         │
         ▼
[Check user_theme_preferences (if logged in)]
         │
         ▼
[Apply dark mode class if user prefers dark]
```

---

## CSS Variables Strategy

```css
/* src/app/globals.css */

/* Platform defaults */
:root {
  --font-family: 'Inter', sans-serif;
  --color-primary-50: 239 246 255;
  --color-primary-100: 219 234 254;
  --color-primary-500: 59 130 246;
  --color-primary-600: 37 99 235;
  --color-primary-700: 29 78 216;

  --color-surface: 255 255 255;
  --color-surface-secondary: 249 250 251;
  --color-border: 229 231 235;
  --color-text-primary: 17 24 39;
  --color-text-secondary: 107 114 128;
}

/* Dark mode overrides */
.dark {
  --color-surface: 17 24 39;
  --color-surface-secondary: 31 41 55;
  --color-border: 55 65 81;
  --color-text-primary: 249 250 251;
  --color-text-secondary: 156 163 175;
}
```

---

## ThemeProvider Component

```typescript
// src/components/theme/ThemeProvider.tsx

'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { themeService } from '@/services/theme.service'

interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  fontFamily: string
  logoUrl?: string
}

const ThemeContext = createContext<{
  theme: ThemeConfig
  setMode: (mode: 'light' | 'dark' | 'system') => void
  updateTheme: (config: Partial<ThemeConfig>) => void
}>({
  theme: { mode: 'system', primaryColor: '#1a56db', fontFamily: 'Inter' },
  setMode: () => {},
  updateTheme: () => {},
})

export function ThemeProvider({
  children,
  tenantTheme,
}: {
  children: ReactNode
  tenantTheme?: Partial<ThemeConfig>
}) {
  const { user } = useAuthStore()
  const [theme, setTheme] = useState<ThemeConfig>({
    mode: 'system',
    primaryColor: tenantTheme?.primaryColor ?? '#1a56db',
    fontFamily: tenantTheme?.fontFamily ?? 'Inter',
    logoUrl: tenantTheme?.logoUrl,
  })

  // Apply CSS variables to :root whenever theme changes
  useEffect(() => {
    applyThemeVariables(theme)
  }, [theme])

  // Apply dark class
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = theme.mode === 'dark' || (theme.mode === 'system' && prefersDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme.mode])

  // Load user preferences on login
  useEffect(() => {
    if (user) {
      themeService.getUserPreferences().then(prefs => {
        if (prefs) setTheme(t => ({ ...t, mode: prefs.mode }))
      })
    }
  }, [user?.id])

  const setMode = async (mode: ThemeConfig['mode']) => {
    setTheme(t => ({ ...t, mode }))
    if (user) {
      await themeService.saveUserPreferences({ mode })
    }
  }

  const updateTheme = (config: Partial<ThemeConfig>) => {
    setTheme(t => ({ ...t, ...config }))
  }

  return (
    <ThemeContext.Provider value={{ theme, setMode, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function applyThemeVariables(theme: ThemeConfig) {
  const root = document.documentElement
  const hex = theme.primaryColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  root.style.setProperty('--color-primary-500', `${r} ${g} ${b}`)
  root.style.setProperty('--font-family', `'${theme.fontFamily}', sans-serif`)
}

export const useTheme = () => useContext(ThemeContext)
```

---

## Server-Side Tenant Theme Injection

```typescript
// src/app/layout.tsx

import { tenantService } from '@/services/tenant.service'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenantTheme = await tenantService.getTheme().catch(() => null)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {tenantTheme?.primaryColor && (
          <style>{`
            :root {
              --color-primary-500: ${hexToRgb(tenantTheme.primaryColor)};
              --font-family: '${tenantTheme.fontFamily}', sans-serif;
            }
          `}</style>
        )}
        {tenantTheme?.fontFamily && (
          <link
            href={`https://fonts.googleapis.com/css2?family=${tenantTheme.fontFamily}:wght@400;500;600;700&display=swap`}
            rel="stylesheet"
          />
        )}
      </head>
      <body>
        <ThemeProvider tenantTheme={tenantTheme ?? undefined}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## Theme Toggle Component

```typescript
// src/components/theme/ThemeToggle.tsx

'use client'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, setMode } = useTheme()

  const options = [
    { value: 'light' as const, icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { value: 'dark' as const, icon: <Moon className="w-4 h-4" />, label: 'Dark' },
    { value: 'system' as const, icon: <Monitor className="w-4 h-4" />, label: 'System' },
  ]

  return (
    <div className="flex bg-surface-secondary rounded-xl p-1 gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setMode(opt.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors
            ${theme.mode === opt.value
              ? 'bg-white dark:bg-gray-700 shadow text-text-primary font-medium'
              : 'text-text-secondary hover:text-text-primary'}`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Admin Theme Settings Page

```typescript
// src/app/(admin)/admin/settings/theme/page.tsx

'use client'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { useTheme } from '@/components/theme/ThemeProvider'

const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Merriweather']
const PRESET_COLORS = ['#1a56db', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2']

export default function ThemeSettingsPage() {
  const { updateTheme } = useTheme()
  const [settings, setSettings] = useState({
    primaryColor: '#1a56db',
    fontFamily: 'Inter',
    defaultMode: 'light',
    logoFile: null as File | null,
  })

  const saveTheme = useMutation({
    mutationFn: (data: FormData) => adminService.saveThemeSettings(data),
    onSuccess: () => {
      updateTheme({ primaryColor: settings.primaryColor, fontFamily: settings.fontFamily })
    },
  })

  const handleSubmit = () => {
    const formData = new FormData()
    formData.append('primary_color', settings.primaryColor)
    formData.append('font_family', settings.fontFamily)
    formData.append('default_mode', settings.defaultMode)
    if (settings.logoFile) formData.append('logo', settings.logoFile)
    saveTheme.mutate(formData)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Branding & Theme</h1>

      {/* Logo Upload */}
      <section>
        <h2 className="font-semibold mb-3">Hotel Logo</h2>
        <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50">
          <input
            type="file"
            accept="image/*"
            onChange={e => setSettings(s => ({ ...s, logoFile: e.target.files?.[0] ?? null }))}
          />
          <p className="text-sm text-text-secondary mt-2">PNG or SVG, max 2MB</p>
        </div>
      </section>

      {/* Brand Color */}
      <section>
        <h2 className="font-semibold mb-3">Brand Color</h2>
        <div className="flex gap-3 flex-wrap items-center">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              onClick={() => setSettings(s => ({ ...s, primaryColor: color }))}
              style={{ backgroundColor: color }}
              className={`w-10 h-10 rounded-full border-4 transition-transform hover:scale-110
                ${settings.primaryColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
            />
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
              className="w-10 h-10 rounded-full cursor-pointer"
            />
            <span className="text-sm text-text-secondary font-mono">{settings.primaryColor}</span>
          </div>
        </div>
      </section>

      {/* Font Family */}
      <section>
        <h2 className="font-semibold mb-3">Typography</h2>
        <div className="grid grid-cols-3 gap-3">
          {FONT_OPTIONS.map(font => (
            <button
              key={font}
              onClick={() => setSettings(s => ({ ...s, fontFamily: font }))}
              style={{ fontFamily: font }}
              className={`p-3 border rounded-xl text-center transition-colors
                ${settings.fontFamily === font
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="font-medium text-sm">{font}</span>
              <p className="text-xs text-text-secondary mt-0.5">Aa Bb Cc 123</p>
            </button>
          ))}
        </div>
      </section>

      {/* Default Mode */}
      <section>
        <h2 className="font-semibold mb-3">Default Mode for Guests</h2>
        <div className="flex gap-3">
          {['light', 'dark'].map(mode => (
            <button
              key={mode}
              onClick={() => setSettings(s => ({ ...s, defaultMode: mode }))}
              className={`px-5 py-2 rounded-xl border capitalize font-medium text-sm
                ${settings.defaultMode === mode
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      {/* Live Preview */}
      <section>
        <h2 className="font-semibold mb-3">Preview</h2>
        <div
          className="rounded-2xl border p-6"
          style={{ fontFamily: settings.fontFamily }}
        >
          <div
            className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Book Now
          </div>
          <p className="mt-3 font-semibold" style={{ fontFamily: settings.fontFamily }}>
            Grand Hotel — {settings.fontFamily}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Your branding will appear across the booking portal.
          </p>
        </div>
      </section>

      <button
        onClick={handleSubmit}
        disabled={saveTheme.isPending}
        className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold
                   hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {saveTheme.isPending ? 'Saving...' : 'Save Theme Settings'}
      </button>
    </div>
  )
}
```

---

## Backend: Theme API Endpoints

```python
# app/api/v1/admin/hotel_admin.py

@router.get("/settings/theme")
async def get_theme(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireHotelAdmin)
):
    settings = await TenantSettingsRepository.get(db, request.state.tenant_id)
    return {
        "primary_color": settings.primary_color,
        "secondary_color": settings.secondary_color,
        "font_family": settings.font_family,
        "logo_url": settings.logo_url,
        "default_theme": settings.default_theme,
    }


@router.put("/settings/theme")
async def update_theme(
    primary_color: Optional[str] = Form(None),
    font_family: Optional[str] = Form(None),
    default_mode: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(RequireHotelAdmin),
):
    tenant_id = request.state.tenant_id
    update_data = {}

    if logo:
        url = await StorageService.upload_image(
            logo,
            f"{request.state.tenant_slug}/branding/logo"
        )
        update_data["logo_url"] = url

    if primary_color:
        update_data["primary_color"] = primary_color
    if font_family:
        update_data["font_family"] = font_family
    if default_mode and default_mode in ("light", "dark"):
        update_data["default_theme"] = default_mode

    await TenantSettingsRepository.update(db, tenant_id, update_data)
    # Bust tenant cache so next request gets fresh theme
    await redis_client.delete(f"tenant:{request.state.tenant_slug}")

    return {"message": "Theme updated successfully"}


# User preference endpoints
@router.get("/users/me/theme")
async def get_user_theme(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    prefs = await UserThemeRepository.get(db, current_user.id)
    return prefs or {"mode": "system", "color_scheme": "default", "font_size": "medium"}


@router.put("/users/me/theme")
async def update_user_theme(
    body: UserThemePreferenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    prefs = await UserThemeRepository.upsert(db, current_user.id, body.dict(exclude_none=True))
    return prefs
```

---

## User Theme Preference Schema

```python
# app/schemas/theme.py

from pydantic import BaseModel
from typing import Optional, Literal

class UserThemePreferenceUpdate(BaseModel):
    mode: Optional[Literal["light", "dark", "system"]] = None
    color_scheme: Optional[str] = None
    font_size: Optional[Literal["small", "medium", "large"]] = None

class TenantThemeUpdate(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    font_family: Optional[str] = None
    default_theme: Optional[Literal["light", "dark"]] = None
```
