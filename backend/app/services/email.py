import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def _send_email(self, recipient: str, subject: str, html_content: str, raise_on_error: bool = False):
        # Fallback if SMTP password is not configured
        if not settings.SMTP_PASSWORD:
            msg = f"SMTP password is not configured. Skipping sending email to {recipient} with subject '{subject}'"
            logger.warning(msg)
            # Print it in logs for development verification
            logger.info(f"EMAIL OUTPUT:\nTo: {recipient}\nSubject: {subject}\nBody: {html_content}")
            if raise_on_error:
                raise ValueError(msg)
            return

        # If using Resend, send via their HTTPS API (Port 443) to bypass Render firewall SMTP blocks
        if "resend" in settings.SMTP_HOST.lower():
            try:
                import requests
                headers = {
                    "Authorization": f"Bearer {settings.SMTP_PASSWORD}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "from": settings.EMAIL_FROM,
                    "to": [recipient],
                    "subject": subject,
                    "html": html_content
                }
                logger.info(f"Attempting email dispatch via Resend HTTPS API to {recipient}...")
                response = requests.post("https://api.resend.com/emails", json=payload, headers=headers, timeout=15)
                if response.status_code in (200, 201, 202):
                    logger.info(f"Email sent successfully via Resend API to {recipient} with subject '{subject}'")
                    return
                else:
                    raise ValueError(f"Resend API returned {response.status_code}: {response.text}")
            except Exception as api_err:
                logger.warning(f"Resend HTTP API failed: {api_err}. Falling back to standard SMTP...")
                if raise_on_error:
                    raise api_err

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.EMAIL_FROM
            msg['To'] = recipient

            part = MIMEText(html_content, 'html')
            msg.attach(part)

            # Connect to SMTP server with a 15-second timeout to prevent hanging
            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
                server.starttls()

            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, recipient, msg.as_string())
            server.quit()
            logger.info(f"Email sent successfully to {recipient} with subject '{subject}'")
        except Exception as e:
            logger.error(f"Failed to send email to {recipient}: {e}")
            if raise_on_error:
                raise e

    def send_verification_email(self, email: str, name: str, token: str):
        verify_url = f"{settings.FRONTEND_URL}?verify_token={token}"
        subject = "Verify Your PlacePilot AI Account"
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0c0a09; color: #f4f4f5; padding: 24px; text-align: center; margin: 0;">
            <div style="max-width: 500px; margin: 40px auto; background-color: #1c1917; border: 1px solid #2e2a24; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);">
              <h2 style="color: #ffffff; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">Verify Your Email</h2>
              <p style="color: #a1a1aa; font-size: 14px; margin-top: 16px; line-height: 1.6; text-align: left;">
                Hello {name or 'Pilot'},<br/><br/>
                Thank you for registering on PlacePilot AI. Click the button below to verify your email address and unlock your career tracking dashboard:
              </p>
              <a href="{verify_url}" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; margin-bottom: 24px;">Verify Email</a>
              <p style="color: #71717a; font-size: 11px; margin-top: 12px; text-align: left; border-top: 1px solid #2e2a24; padding-top: 16px;">
                If the button above does not work, copy and paste this link in your browser:<br/>
                <a href="{verify_url}" style="color: #ef4444; text-decoration: underline;">{verify_url}</a>
              </p>
            </div>
          </body>
        </html>
        """
        self._send_email(email, subject, html)

    def send_password_reset_email(self, email: str, name: str, token: str):
        reset_url = f"{settings.FRONTEND_URL}?reset_token={token}"
        subject = "Reset Your PlacePilot AI Password"
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0c0a09; color: #f4f4f5; padding: 24px; text-align: center; margin: 0;">
            <div style="max-width: 500px; margin: 40px auto; background-color: #1c1917; border: 1px solid #2e2a24; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);">
              <h2 style="color: #ffffff; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">Reset Your Password</h2>
              <p style="color: #a1a1aa; font-size: 14px; margin-top: 16px; line-height: 1.6; text-align: left;">
                Hello {name or 'Pilot'},<br/><br/>
                We received a request to reset the password for your PlacePilot AI account. Click the button below to set a new password:
              </p>
              <a href="{reset_url}" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; margin-bottom: 24px;">Reset Password</a>
              <p style="color: #71717a; font-size: 11px; margin-top: 12px; text-align: left; border-top: 1px solid #2e2a24; padding-top: 16px;">
                This link will expire in 30 minutes. If you did not request this, please ignore this email.<br/><br/>
                Alternative link:<br/>
                <a href="{reset_url}" style="color: #ef4444; text-decoration: underline;">{reset_url}</a>
              </p>
            </div>
          </body>
        </html>
        """
        self._send_email(email, subject, html)

    def send_weekly_report_email(self, email: str, name: str, report):
        subject = f"Your PlacePilot AI Weekly Recruiter Report: {report.applications_count} Applications"
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0c0a09; color: #f4f4f5; padding: 24px; margin: 0;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #1c1917; border: 1px solid #2e2a24; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);">
              <span style="font-size: 10px; font-weight: bold; color: #ef4444; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px;">AI Recruiter Summary</span>
              <h2 style="color: #ffffff; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; margin-top: 16px; margin-bottom: 8px;">Weekly Performance Checklist</h2>
              <span style="font-size: 11px; color: #71717a;">Period: {report.start_date.strftime('%d %b %Y')} — {report.end_date.strftime('%d %b %Y')}</span>
              
              <div style="display: flex; gap: 16px; margin-top: 24px; padding-bottom: 20px; border-bottom: 1px solid #2e2a24;">
                <div style="flex: 1; text-align: center; background-color: #0c0a09; border: 1px solid #2e2a24; padding: 12px; border-radius: 12px;">
                  <span style="font-size: 9px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block;">Readiness Score</span>
                  <span style="font-size: 20px; color: #ef4444; font-weight: bold; display: block; margin-top: 4px;">{report.readiness_score:.1f}%</span>
                </div>
                <div style="flex: 1; text-align: center; background-color: #0c0a09; border: 1px solid #2e2a24; padding: 12px; border-radius: 12px;">
                  <span style="font-size: 9px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block;">Tech OA Rating</span>
                  <span style="font-size: 20px; color: #10b981; font-weight: bold; display: block; margin-top: 4px;">{report.oa_success_rate:.1f}%</span>
                </div>
              </div>

              <div style="margin-top: 20px;">
                <div style="margin-bottom: 16px;">
                  <span style="font-size: 9px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Biggest Improvement</span>
                  <p style="font-size: 13px; color: #f4f4f5; margin: 0; line-height: 1.5;">{report.biggest_improvement}</p>
                </div>
                <div style="margin-bottom: 16px;">
                  <span style="font-size: 9px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px;">Needs Attention</span>
                  <p style="font-size: 13px; color: #f4f4f5; margin: 0; line-height: 1.5;">{report.needs_attention}</p>
                </div>
              </div>

              <div style="margin-top: 24px; text-align: center;">
                <a href="{settings.FRONTEND_URL}" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">View Full Report</a>
              </div>
            </div>
          </body>
        </html>
        """
        self._send_email(email, subject, html)

    def send_event_reminder_email(self, email: str, name: str, company: str, role: str, event_type: str, date_str: str, details: str):
        subject = f"Reminder: Upcoming {event_type} with {company}!"
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0c0a09; color: #f4f4f5; padding: 24px; margin: 0;">
            <div style="max-width: 500px; margin: 40px auto; background-color: #1c1917; border: 1px solid #2e2a24; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);">
              <span style="font-size: 10px; font-weight: bold; color: #ef4444; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px;">Upcoming Event Reminder</span>
              <h2 style="color: #ffffff; font-size: 18px; letter-spacing: 1px; text-transform: uppercase; margin-top: 16px; margin-bottom: 8px;">{event_type}</h2>
              <p style="color: #a1a1aa; font-size: 14px; margin-top: 16px; line-height: 1.6;">
                Hello {name or 'Pilot'},<br/><br/>
                This is a quick reminder that you have an upcoming <strong>{event_type}</strong> for the <strong>{role}</strong> role at <strong>{company}</strong>.
              </p>
              
              <div style="background-color: #0c0a09; border: 1px solid #2e2a24; padding: 16px; border-radius: 12px; margin-top: 20px; margin-bottom: 20px;">
                <span style="font-size: 9px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block;">Scheduled Time</span>
                <span style="font-size: 14px; color: #ffffff; font-weight: bold; display: block; margin-top: 4px;">{date_str}</span>
                {f'<span style="font-size: 9px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block; margin-top: 12px;">Details</span><span style="font-size: 12px; color: #a1a1aa; display: block; margin-top: 4px;">{details}</span>' if details else ''}
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="{settings.FRONTEND_URL}" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Go to Dashboard</a>
              </div>
            </div>
          </body>
        </html>
        """
        self._send_email(email, subject, html)

    def send_test_email(self, email: str, raise_on_error: bool = False):
        subject = "PlacePilot AI SMTP Connection Test"
        html = """
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0c0a09; color: #f4f4f5; padding: 24px; text-align: center; margin: 0;">
            <div style="max-width: 500px; margin: 40px auto; background-color: #1c1917; border: 1px solid #2e2a24; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);">
              <h2 style="color: #ffffff; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">Connection Test Successful</h2>
              <p style="color: #a1a1aa; font-size: 14px; margin-top: 16px; line-height: 1.6;">
                Your PlacePilot AI SMTP configurations are fully functional! You will now receive automated event reminders, registration tokens, and password reset requests.
              </p>
            </div>
          </body>
        </html>
        """
        self._send_email(email, subject, html, raise_on_error=raise_on_error)

email_service = EmailService()


def check_and_send_reminders():
    from app.database.session import SessionLocal
    from app.models.application_event import ApplicationEvent
    from app.models.application import Application
    from app.models.user import User
    from datetime import datetime, timezone, timedelta
    
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        limit = now + timedelta(hours=24)
        
        # Query scheduled events within the next 24 hours that haven't sent a reminder
        upcoming_events = (
            db.query(ApplicationEvent)
            .join(Application)
            .join(User)
            .filter(ApplicationEvent.status == "Scheduled")
            .filter(ApplicationEvent.reminder_sent == False)
            .filter(ApplicationEvent.event_date >= now)
            .filter(ApplicationEvent.event_date <= limit)
            .all()
        )
        
        for event in upcoming_events:
            app = event.application
            user = app.user
            
            # Format event date
            date_str = event.event_date.strftime("%A, %b %d at %I:%M %p")
            
            # Send email
            email_service.send_event_reminder_email(
                email=user.email,
                name=user.full_name,
                company=app.company_name,
                role=app.role,
                event_type=event.event_type,
                date_str=date_str,
                details=event.details
            )
            
            # Mark reminder as sent
            event.reminder_sent = True
            db.commit()
            
    except Exception as e:
        logger.error(f"Error checking background reminders: {e}")
    finally:
        db.close()


def start_reminder_scheduler():
    import threading
    import time
    
    def run_scheduler():
        logger.info("Starting email reminder background scheduler loop...")
        # Give the server a few seconds to boot up completely
        time.sleep(10)
        while True:
            try:
                check_and_send_reminders()
            except Exception as e:
                logger.error(f"Error in reminder scheduler thread: {e}")
            # Sleep for 1 hour
            time.sleep(3600)
            
    thread = threading.Thread(target=run_scheduler, daemon=True)
    thread.start()
