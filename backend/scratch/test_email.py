import asyncio
import os
import sys

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.services.email_service import email_service

async def test():
    print("Testing email service...")
    success = await email_service.send_email(
        'bushubalti@gmail.com', 
        'StayOS Diagnostic Test', 
        '<h1>Test Email</h1><p>You requested a magic link test.</p>'
    )
    print(f"Result: {'SUCCESS' if success else 'FAILURE'}")

if __name__ == "__main__":
    asyncio.run(test())
