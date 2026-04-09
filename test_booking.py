import requests
import json

# First login to get token
login_url = "http://localhost:8001/api/v1/auth/login"
login_data = {
    "username": "admin@stayos.com",
    "password": "admin123"
}

try:
    login_response = requests.post(login_url, data=login_data)
    print(f"Login Status: {login_response.status_code}")
    if login_response.status_code == 200:
        token_data = login_response.json()
        access_token = token_data.get("access_token")
        print(f"Got token: {access_token[:50]}...")
    else:
        print(f"Login failed: {login_response.text}")
        exit(1)
except Exception as e:
    print(f"Login error: {e}")
    exit(1)

# Now test booking creation
url = "http://localhost:8001/api/v1/bookings/"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {access_token}"
}

data = {
    "hotel_id": 1,
    "room_id": 1,
    "guest_name": "mark",
    "email": "youasfuk777@gmail.com",  # Back to original email
    "phone": "+92 347 5503669",
    "room_type": "Deluxe",
    "check_in_date": "2026-04-10",
    "check_out_date": "2026-04-12",
    "nights": 2,
    "num_guests": 1,
    "room_total": 1000,
    "addon_total": 0,
    "discount_amount": 0,
    "tax_amount": 0,
    "total_amount": 1000,
    "status": "confirmed",
    "special_requests": "Test booking"
}

try:
    response = requests.post(url, json=data, headers=headers)
    print(f"Booking Status Code: {response.status_code}")
    print(f"Booking Response: {response.text}")
except Exception as e:
    print(f"Booking error: {e}")