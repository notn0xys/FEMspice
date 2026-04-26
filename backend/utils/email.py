import os
import smtplib
import ssl
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER or "no-reply@femspice.local")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "FEMspice")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"


class EmailNotConfigured(Exception):
    pass


def _send(to_email: str, subject: str, html: str, text: str) -> None:
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        # Don't raise to caller; log so dev can still test locally without SMTP.
        print("[email] SMTP not configured. Would have sent to:", to_email)
        print(f"[email] Subject: {subject}\n{text}")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM}>"
    msg["To"] = to_email
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    if SMTP_USE_TLS:
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
    else:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)


def send_verification_email(to_email: str, code: str) -> None:
    subject = "Your FEMspice verification code"
    text = (
        f"Welcome to FEMspice!\n\n"
        f"Your verification code is: {code}\n"
        f"This code expires in 10 minutes.\n\n"
        f"If you didn't request this, you can ignore this email."
    )
    html = f"""
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin:0 0 16px 0;">Welcome to FEMspice</h2>
      <p>Use this code to finish creating your account:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px;
                  background: #f4f4f5; padding: 14px 18px; border-radius: 8px;
                  text-align: center; margin: 16px 0;">
        {code}
      </div>
      <p style="color:#666;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
    """
    _send(to_email, subject, html, text)


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    subject = "Reset your FEMspice password"
    text = (
        f"Someone requested a password reset for your FEMspice account.\n\n"
        f"Click the link below to set a new password (valid for 30 minutes):\n"
        f"{reset_link}\n\n"
        f"If you didn't request this, you can safely ignore this email."
    )
    html = f"""
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin:0 0 16px 0;">Reset your password</h2>
      <p>Click the button below to choose a new password. This link expires in 30 minutes.</p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="{reset_link}"
           style="background:#2563eb;color:#fff;padding:12px 22px;border-radius:8px;
                  text-decoration:none;font-weight:600;">
          Reset Password
        </a>
      </p>
      <p style="color:#666; font-size: 12px;">
        If the button doesn't work, paste this URL into your browser:<br/>
        <span style="word-break:break-all;">{reset_link}</span>
      </p>
      <p style="color:#666;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    _send(to_email, subject, html, text)
