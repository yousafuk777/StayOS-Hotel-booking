import urllib.request, json
data = json.dumps({"hotel_id": 1, "room_id": 1, "guest_name": "Test Guest", "email": "test@test.com", "phone": "1234567890", "room_type": "Standard Queen", "check_in_date": "2026-04-18", "check_out_date": "2026-04-19", "nights": 1, "num_guests": 1, "room_total": 500, "addon_total": 0, "discount_amount": 0, "tax_amount": 0, "total_amount": 500, "status": "pending", "special_requests": ""}).encode("utf-8")
req = urllib.request.Request("http://localhost:8000/api/v1/bookings/", data=data, headers={"Content-Type": "application/json", "Origin": "http://localhost:3001", "Authorization": "Bearer fake_token"})
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(f"Status: {e.code}", e.read().decode())
