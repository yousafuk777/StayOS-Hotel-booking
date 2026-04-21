#!/usr/bin/env python3
"""Check and display all hotels and rooms in the database"""

import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

async def check_database():
    try:
        from sqlalchemy import select
        from app.core.database import async_session_maker
        from app.models.hotel import Hotel
        from app.models.room import Room
        from app.models.tenant import Tenant
        from app.models.user import User
        
        async with async_session_maker() as session:
            print("\n" + "="*60)
            print("🏨 STAYOS DATABASE CHECK")
            print("="*60)
            
            # Check tenants
            print("\n📋 TENANTS:")
            tenants_result = await session.execute(select(Tenant))
            tenants = tenants_result.scalars().all()
            print(f"   Found {len(tenants)} tenants")
            for t in tenants:
                print(f"   ✓ ID: {t.id}, Name: {t.company_name}, Active: {t.is_active}, Deleted: {t.is_deleted}")
            
            if not tenants:
                print("   ❌ NO TENANTS FOUND!")
                print("   → You need to create a tenant first")
                print("   → Go to: http://localhost:3000/super-admin/tenants")
                print("   → Click 'Onboard Tenant'")
            
            # Check users
            print("\n👤 USERS:")
            users_result = await session.execute(select(User))
            users = users_result.scalars().all()
            print(f"   Found {len(users)} users")
            for u in users[:5]:  # Show first 5
                print(f"   ✓ ID: {u.id}, Email: {u.email}, Role: {u.role}, Tenant: {u.tenant_id}")
            
            # Check hotels
            print("\n🏨 HOTELS:")
            hotels_result = await session.execute(select(Hotel))
            hotels = hotels_result.scalars().all()
            print(f"   Found {len(hotels)} hotels")
            for h in hotels:
                print(f"   ✓ ID: {h.id}, Name: {h.name}, Tenant: {h.tenant_id}, Active: {h.is_active}")
                print(f"      Slug: {h.slug}, City: {h.city}")
            
            if not hotels:
                print("   ❌ NO HOTELS FOUND!")
                print("   → Hotels are created when you onboard a tenant")
                print("   → Or create manually in admin panel")
            
            # Check rooms
            print("\n🚪 ROOMS:")
            rooms_result = await session.execute(select(Room))
            rooms = rooms_result.scalars().all()
            print(f"   Found {len(rooms)} rooms")
            for r in rooms[:10]:  # Show first 10
                print(f"   ✓ ID: {r.id}, Number: {r.room_number}, Hotel: {r.hotel_id}, Status: {r.status}")
            
            if not rooms:
                print("   ❌ NO ROOMS FOUND!")
                print("   → Go to: http://localhost:3000/admin/rooms")
                print("   → Click 'Add Room' to create rooms")
            
            print("\n" + "="*60)
            print("📊 SUMMARY:")
            print("="*60)
            print(f"   Tenants: {len(tenants)}")
            print(f"   Users:   {len(users)}")
            print(f"   Hotels:  {len(hotels)}")
            print(f"   Rooms:   {len(rooms)}")
            print("="*60 + "\n")
            
            if not hotels:
                print("⚠️  ACTION NEEDED:")
                print("   You have NO hotels in the database!")
                print("\n   SOLUTION 1 - Via Super Admin:")
                print("   1. Login as super admin")
                print("   2. Go to: http://localhost:3000/super-admin/tenants")
                print("   3. Click 'Onboard Tenant'")
                print("   4. Fill in the form (this creates a hotel automatically)")
                print("\n   SOLUTION 2 - Direct Database (Quick Test):")
                print("   Run this command to create a test hotel:")
                print("   python3 backend/scripts/create_test_hotel.py")
                print()
            
            return len(hotels) > 0 and len(rooms) > 0
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(check_database())
    sys.exit(0 if success else 1)

