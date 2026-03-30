import sqlite3
import os

def verify_all():
    db_path = 'hotel.db'
    if not os.path.exists(db_path):
        db_path = 'backend/hotel.db'

    if not os.path.exists(db_path):
        print(f"[ERROR] Database file not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        # 1. Verify all unverified users
        cur.execute("UPDATE users SET is_verified = 1 WHERE is_verified = 0")
        verified_count = cur.rowcount
        
        # 2. Assign missing tenant_id to Tenant 1 for hotel-scoped roles
        cur.execute("""
            UPDATE users 
            SET tenant_id = 1 
            WHERE tenant_id IS NULL 
            AND role NOT IN ('super_admin')
        """)
        assigned_count = cur.rowcount

        conn.commit()
        print(f"[OK] Successfully verified {verified_count} accounts.")
        print(f"[OK] Successfully assigned {assigned_count} users to Tenant 1.")
        
        conn.close()
    except Exception as e:
        print(f"[ERROR] Database verification failed: {str(e)}")

if __name__ == "__main__":
    verify_all()
