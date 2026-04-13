# backend/app/config/plans.py
# Single source of truth for plan limits and features

PLAN_CONFIG = {
    "starter": {
        "display_name": "Starter",
        "price": 99,
        "max_rooms": 5,
        "max_users": 2,
        "features": {
            "bookings":          True,
            "calendar":          True,
            "rooms":             True,
            "housekeeping":      True,
            "guests":            True,
            "analytics":         False,
            "staff_management":  False,
            "promotions":        False,
            "reviews":           False,
            "theme_branding":    False,
            "policies":          True,
            "hotel_settings":    True,
        }
    },
    "professional": {
        "display_name": "Professional",
        "price": 299,
        "max_rooms": 100,
        "max_users": 25,
        "features": {
            "bookings":          True,
            "calendar":          True,
            "rooms":             True,
            "housekeeping":      True,
            "guests":            True,
            "analytics":         True,
            "staff_management":  True,
            "promotions":        True,
            "reviews":           True,
            "theme_branding":    False,
            "policies":          True,
            "hotel_settings":    True,
        }
    },
    "enterprise": {
        "display_name": "Enterprise",
        "price": 499,
        "max_rooms": None,   # None = unlimited
        "max_users": None,
        "features": {
            "bookings":          True,
            "calendar":          True,
            "rooms":             True,
            "housekeeping":      True,
            "guests":            True,
            "analytics":         True,
            "staff_management":  True,
            "promotions":        True,
            "reviews":           True,
            "theme_branding":    True,
            "policies":          True,
            "hotel_settings":    True,
        }
    }
}
