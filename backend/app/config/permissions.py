# backend/app/config/permissions.py

ROLE_PERMISSIONS = {
    "hotel_admin": {
        "dashboard":          "full",
        "bookings":           "full",
        "calendar":           "full",
        "rooms":              "full",
        "housekeeping":       "full",
        "staff_management":   "full",
        "guests":             "full",
        "analytics":          "full",
        "promotions":         "full",
        "reviews":            "full",
        "hotel_settings":     "full",
        "theme_branding":     "full",
        "policies":           "full",
        "subscription":       "view",   # view only — cannot change plan
    },
    "hotel_manager": {
        "dashboard":          "full",
        "bookings":           "full",
        "calendar":           "full",
        "rooms":              "full",
        "housekeeping":       "full",
        "staff_management":   "view",   # view only — cannot add or delete
        "guests":             "full",
        "analytics":          "full",
        "promotions":         "full",
        "reviews":            "full",
        "hotel_settings":     "view",   # view only
        "theme_branding":     "none",   # no access
        "policies":           "view",   # view only
        "subscription":       "view",   # view only — needed for plan gating logic
    },
    "front_desk": {
        "dashboard":          "limited", # today's arrivals/departures only
        "bookings":           "full",
        "calendar":           "view",
        "rooms":              "view",
        "housekeeping":       "view",
        "staff_management":   "none",
        "guests":             "full",
        "analytics":          "none",
        "promotions":         "view",
        "reviews":            "none",
        "hotel_settings":     "none",
        "theme_branding":     "none",
        "policies":           "view",
        "subscription":       "view",   # view only
    },
    "housekeeping": {
        "dashboard":          "limited", # assigned tasks only
        "bookings":           "view",    # check-out times only
        "calendar":           "none",
        "rooms":              "view",    # room status only
        "housekeeping":       "full",    # their own tasks only
        "staff_management":   "none",
        "guests":             "none",
        "analytics":          "none",
        "promotions":         "none",
        "reviews":            "none",
        "hotel_settings":     "none",
        "theme_branding":     "none",
        "policies":           "none",
        "subscription":       "view",   # view only
    },
    "guest": {
        # Guests have zero access to the admin dashboard
        # They are redirected to the guest portal on login
    }
}

# TODO: Apply require_module_access() to analytics, theme_branding, promotions, and reviews when their routes are built

# Helper: check if a role has at least view access to a module
def can_access(role: str, module: str) -> bool:
    perms = ROLE_PERMISSIONS.get(role, {})
    return perms.get(module, "none") != "none"

# Helper: check if a role has full (write) access to a module
def can_write(role: str, module: str) -> bool:
    perms = ROLE_PERMISSIONS.get(role, {})
    return perms.get(module, "none") == "full"
