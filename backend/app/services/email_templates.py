def booking_confirmation_guest(
    guest_name: str,
    hotel_name: str,
    room_name: str,
    check_in: str,
    check_out: str,
    reference: str,
    booking_url: str,
    nights: int,
) -> tuple[str, str]:
    """Returns (subject, html_body) for guest booking confirmation email."""

    subject = f"Booking Confirmed — {reference} | {hotel_name}"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
      <div style="background-color: #1a3c34; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">StayOS</h1>
      </div>
      
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1a3c34;">Booking Confirmed ✅</h2>
        <p>Hi {guest_name},</p>
        <p>Your booking at <strong>{hotel_name}</strong> has been received 
           and is pending confirmation from the hotel.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 4px 0;"><strong>Reference:</strong> {reference}</p>
          <p style="margin: 4px 0;"><strong>Room:</strong> {room_name}</p>
          <p style="margin: 4px 0;"><strong>Check-in:</strong> {check_in}</p>
          <p style="margin: 4px 0;"><strong>Check-out:</strong> {check_out}</p>
          <p style="margin: 4px 0;"><strong>Nights:</strong> {nights}</p>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="{booking_url}" 
             style="background:#1a3c34; color:white; padding:14px 28px; 
                    text-decoration:none; border-radius:6px; display:inline-block; font-weight: bold;">
            View My Booking
          </a>
        </div>
        
        <p style="color: #666; margin-top: 24px; font-size: 14px;">
          You'll receive another email once the hotel confirms your booking.
        </p>
      </div>
      <div style="background: #f9f9f9; padding: 16px; text-align: center; font-size: 12px; color: #999;">
        © {hotel_name} via StayOS. All rights reserved.
      </div>
    </div>
    """
    return subject, html


def booking_notification_hotel(
    hotel_name: str,
    guest_name: str,
    guest_email: str,
    guest_phone: str,
    room_name: str,
    check_in: str,
    check_out: str,
    reference: str,
    special_requests: str,
    admin_dashboard_url: str,
) -> tuple[str, str]:
    """Returns (subject, html_body) for hotel admin new booking notification."""

    subject = f"New Booking Received — {reference}"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
      <div style="background-color: #1a3c34; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">StayOS</h1>
      </div>
      
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1a3c34;">New Booking — Action Required</h2>
        <p>A new booking has been submitted for <strong>{hotel_name}</strong>.</p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 4px 0;"><strong>Reference:</strong> {reference}</p>
          <p style="margin: 4px 0;"><strong>Guest:</strong> {guest_name}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> {guest_email}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> {guest_phone}</p>
          <p style="margin: 4px 0;"><strong>Room:</strong> {room_name}</p>
          <p style="margin: 4px 0;"><strong>Check-in:</strong> {check_in}</p>
          <p style="margin: 4px 0;"><strong>Check-out:</strong> {check_out}</p>
          {"<p style='margin: 4px 0;'><strong>Special Requests:</strong> " + special_requests + "</p>" if special_requests else ""}
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{admin_dashboard_url}"
             style="background: #1a3c34; color: white; padding: 14px 28px;
                    text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Manage Booking
          </a>
        </div>
      </div>
      <div style="background: #f9f9f9; padding: 16px; text-align: center; font-size: 12px; color: #999;">
        StayOS Internal Notification
      </div>
    </div>
    """
    return subject, html
