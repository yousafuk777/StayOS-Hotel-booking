#!/usr/bin/env python3
"""
Quick test script to verify the booking API endpoint works.
Run this from the backend directory.
"""
import sys
import subprocess
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

import asyncio
import httpx
from app.core.security import hash_password

# Test API endpoint
BASE_URL = "http://localhost:8000"

async def test_booking_creation():
    """Test booking creation API"""
    print("🧪 Testing Booking Creation API")
    print("=" * 60)
    
    # Get auth token first
    print("\n1️⃣  Getting auth token...")
    async with httpx.AsyncClient() as client:
        # Login as super admin
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={
                "email": "super@admin.com",
                "password": "super_admin_123"
            }
        )
        
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            return
        
        token = response.json().get("access_token")
        tenant_id = response.json().get("tenant_id")
        print(f"✅ Got token: {token[:20]}...")
        print(f"✅ Tenant ID: {tenant_id}")
        
        # Now try to create a booking
        print("\n2️⃣  Creating booking...")
        booking_data = {
            "hotel_id": 1,
            "room_id": 1,
            "guest_name": "Test Guest",
            "email": "test@example.com",
            "phone": "+1234567890",
            "room_type": "Deluxe Suite",
            "check_in_date": "2026-04-15",
            "check_out_date": "2026-04-17",
            "nights": 2,
            "num_guests": 2,
            "room_total": 500,
            "addon_total": 0,
            "discount_amount": 0,
            "tax_amount": 0,
            "total_amount": 1000,
            "status": "pending",
            "special_requests": "Test booking"
        }
        
        print(f"📨 Sending: {json.dumps(booking_data, indent=2)}")
        
        response = await client.post(
            f"{BASE_URL}/api/v1/bookings/",
            json=booking_data,
            headers={
                "Authorization": f"Bearer {token}",
                "X-Tenant-ID": str(tenant_id)
            }
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        print(f"📊 Response Body:\n{response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Success! Booking ID: {data.get('id')}")
            print(f"✅ Guest: {data.get('guest_name')}")
            print(f"✅ Status: {data.get('status')}")
        else:
            print(f"\n❌ Failed with status {response.status_code}")

if __name__ == "__main__":
    print("🚀 Backend Booking API Test")
    print("Ensure backend is running on http://localhost:8000\n")
    
    asyncio.run(test_booking_creation())
