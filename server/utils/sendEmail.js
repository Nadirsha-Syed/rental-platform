import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Reusable Core Email Sender Utility (Powered by SendGrid Secure Web API)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML email body content
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const verifiedSender = process.env.SENDER_EMAIL || "nadirshasyed835@gmail.com";

    // compliant API message payload object
    const msg = {
      to,
      from: {
        name: "P2P Marketplace",
        email: verifiedSender, 
      },
      subject,
      html,
    };

    const response = await sgMail.send(msg);
    console.log(`📨 Web API Email delivered to SendGrid cluster. Status Code: ${response[0].statusCode}`);
    return response;
  } catch (error) {
    console.error("❌ SENDGRID WEB API ERROR DETAIL:");
    if (error.response) {
      console.error(error.response.body); // Displays exact form compliance reason if dropped
    } else {
      console.error(error);
    }
    throw new Error("Failed to send transactional email notification via SendGrid API.");
  }
};

/*
 Template 1: Notify Asset Owner about a New Booking Request
 */
export const sendNewBookingEmail = async (ownerEmail, ownerName, itemTitle, borrowerName, totalPrice) => {
  const subject = `📥 New Rental Request for your ${itemTitle}!`;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">New Booking Request Received!</h2>
      <p>Hello <strong>${ownerName}</strong>,</p>
      <p>Great news! Your listed item, <strong>${itemTitle}</strong>, has received a new booking request.</p>
      
      <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0;"><strong>Borrower:</strong> ${borrowerName}</p>
        <p style="margin: 0;"><strong>Estimated Total Earnings:</strong> ₹${totalPrice}</p>
      </div>

      <p>Please log directly into your account to either approve or reject this request from your dashboard actions list.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}/profile" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
      </div>
      <p style="font-size: 0.9rem; color: #6b7280;">Best regards,<br>The P2P Marketplace Engine</p>
    </div>
  `;

  return await sendEmail({ to: ownerEmail, subject, html });
};

/*
 Template 2: Notify Borrower that their Request was APPROVED
 */
export const sendBookingConfirmedEmail = async (borrowerEmail, borrowerName, itemTitle, totalPrice, ownerEmail) => {
  const subject = `🎉 Booking Confirmed: Your ${itemTitle} is ready!`;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
      <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Your Booking is Confirmed!</h2>
      <p>Hello <strong>${borrowerName}</strong>,</p>
      <p>Your request to rent the <strong>${itemTitle}</strong> has been officially approved by the owner.</p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0;"><strong>Item:</strong> ${itemTitle}</p>
        <p style="margin: 0 0 8px 0;"><strong>Total Charged:</strong> ₹${totalPrice}</p>
        <p style="margin: 0;"><strong>Lender Contact Email:</strong> ${ownerEmail}</p>
      </div>

      <p>You can complete checkout, process your Razorpay token, or check timing updates securely within your tracking portal panel view.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}/profile" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View My Bookings</a>
      </div>
      <p style="font-size: 0.9rem; color: #6b7280;">Enjoy your rental!<br>The P2P Marketplace Engine</p>
    </div>
  `;

  return await sendEmail({ to: borrowerEmail, subject, html });
};

/*
 Template 3: Notify Borrower/Owner that a Booking was CANCELLED/REJECTED
 */
export const sendBookingCancelledEmail = async (recipientEmail, recipientName, itemTitle, roleContext) => {
  const subject = `⚠️ Booking Update: Rental Request Cancelled`;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const alertText = roleContext === "owner" 
    ? `The borrower has cancelled their pending request for your <strong>${itemTitle}</strong>.`
    : `We regret to inform you that your rental request for the <strong>${itemTitle}</strong> has been declined or cancelled.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
      <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Booking Cancelled</h2>
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>${alertText}</p>
      <p>If any transactional payment thresholds were held, they will be processed back to the originating framework collections context immediately.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}/profile" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Return to Dashboard</a>
      </div>
      <p style="font-size: 0.9rem; color: #6b7280;">Best regards,<br>The P2P Marketplace Engine</p>
    </div>
  `;

  return await sendEmail({ to: recipientEmail, subject, html });
}
/**
 * 🔔 Template 4: Missed Search Demand Alert (Pings nearby owners when an item is missing)
 */
export const sendMissedSearchAlertEmail = async (ownerEmail, ownerName, searchQuery, location) => {
  const subject = `🔔 High Demand Alert: Someone nearby is looking for "${searchQuery}"!`;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #6366f1;">High Demand Alert on RentalHub 🚀</h2>
      <p>Hi <strong>${ownerName}</strong>,</p>
      <p>A user in <strong>${location}</strong> just searched for <strong>"${searchQuery}"</strong>, but no one has it listed yet!</p>
      <p>Since you lend out items in this category or area, we wanted to let you know. If you own this accessory or equipment, list it now to fulfill the request and start earning!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}/add-rental" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px;">List Item Now</a>
      </div>
      <p style="font-size: 0.85rem; color: #777;">Happy Renting,<br>The RentalHub Team</p>
    </div>
  `;

  return await sendEmail({ to: ownerEmail, subject, html });
};
;