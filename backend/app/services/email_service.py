import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """
        Send an email. Returns True on success, False on failure.
        Failures are logged but never raise exceptions — 
        email failure must never break the booking flow.
        """
        try:
            # Check if SMTP is configured
            if not self.smtp_user or not self.smtp_password:
                print(f"[EMAIL SKIP] SMTP not configured. Skipping email to {to_email}")
                return False

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            if text_body:
                msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            print(f"[EMAIL SENT] Successfully sent to {to_email}")
            return True
        except Exception as e:
            # Log the error but never crash the booking
            print(f"[EMAIL ERROR] Failed to send to {to_email}: {str(e)}")
            return False

email_service = EmailService()
