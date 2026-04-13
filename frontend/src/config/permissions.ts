// frontend/src/config/permissions.ts

export const ROLE_PERMISSIONS: Record<string, Record<string, string>> = {
  "hotel_admin": {
    "dashboard": "full",
    "bookings": "full",
    "calendar": "full",
    "rooms": "full",
    "housekeeping": "full",
    "staff_management": "full",
    "guests": "full",
    "analytics": "full",
    "promotions": "full",
    "reviews": "full",
    "hotel_settings": "full",
    "theme_branding": "full",
    "policies": "full",
    "subscription": "view",
  },
  "hotel_manager": {
    "dashboard": "full",
    "bookings": "full",
    "calendar": "full",
    "rooms": "full",
    "housekeeping": "full",
    "staff_management": "view",
    "guests": "full",
    "analytics": "full",
    "promotions": "full",
    "reviews": "full",
    "hotel_settings": "view",
    "theme_branding": "none",
    "policies": "view",
    "subscription": "none",
  },
  "front_desk": {
    "dashboard": "limited",
    "bookings": "full",
    "calendar": "view",
    "rooms": "view",
    "housekeeping": "view",
    "staff_management": "none",
    "guests": "full",
    "analytics": "none",
    "promotions": "view",
    "reviews": "none",
    "hotel_settings": "none",
    "theme_branding": "none",
    "policies": "view",
    "subscription": "none",
  },
  "housekeeping": {
    "dashboard": "limited",
    "bookings": "view",
    "calendar": "none",
    "rooms": "view",
    "housekeeping": "full",
    "staff_management": "none",
    "guests": "none",
    "analytics": "none",
    "promotions": "none",
    "reviews": "none",
    "hotel_settings": "none",
    "theme_branding": "none",
    "policies": "none",
    "subscription": "none",
  },
  "guest": {
    // Guests are redirected on account mount
  }
}

export function canAccess(role: string, module: string): boolean {
  // Super Admin bypasses all checks
  if (role === 'super_admin') return true;
  
  const perms = ROLE_PERMISSIONS[role] || {};
  return (perms[module] || "none") !== "none";
}
