import sqlite3
import os

def cleanup():
    db_path = 'hotel.db'
    if not os.path.exists(db_path):
        # Check in the current directory or backend directory
        db_path = 'backend/hotel.db'

    if not os.path.exists(db_path):
        print(f"[ERROR] Database file not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        # Delete the duplicate user with ID 1 (incorrectly linked to Tenant 3)
        # Keep ID 6 (the correct global super-admin)
        cur.execute("DELETE FROM users WHERE id = 1 AND email = 'admin@stayos.com'")
        
        if cur.rowcount > 0:
            print(f"[OK] Successfully deleted duplicate Super Admin (ID: 1)")
            conn.commit()
        else:
            print(f"[SKIP] No duplicate record (ID 1) found for admin@stayos.com")

        conn.close()
    except Exception as e:
        print(f"[ERROR] Database cleanup failed: {str(e)}")

if __name__ == "__main__":
    cleanup()
