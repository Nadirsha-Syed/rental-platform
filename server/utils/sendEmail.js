import nodemailer from "nodemailer";

/**
 * Reusable Core Email Sender Utility
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML email body content
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    // 1. Initialize the Nodemailer transporter engine using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Your secure 16-character Google App Password
      },
    });

    // 2. Define structural layout parameters
    const mailOptions = {
      from: `"P2P Marketplace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // 3. Dispatch the message asynchronously
    const info = await transporter.sendMail(mailOptions);
    console.log(`📨 Email dispatched successfully. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error);
    // Throwing the error ensures your controller knows the email phase failed
    throw new Error("Failed to send transactional email notification.");
  }
};

/**
 * 🎫 Template 1: Notify Asset Owner about a New Booking Request
 */
export const sendNewBookingEmail = async (ownerEmail, ownerName, itemTitle, borrowerName, totalPrice) => {
  const subject = `📥 New Rental Request for your ${itemTitle}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">New Booking Request Received!</h2>
      <p>Hello <strong>${ownerName}</strong>,</p>
      <p>Great news! Your listed item, <strong>${itemTitle}</strong>, has received a new booking request.</p>
      
      <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0;"><strong>Borrower:</strong> ${borrowerName}</p>
        <p style="margin: 0;"><strong>Estimated Total Earnings:</strong> ₹${totalPrice}</p>
      </div>

      <p>Please log directly into your <strong>Owner Dashboard</strong> to either approve or reject this request.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Owner Dashboard</a>
      </div>
      <p style="font-size: 0.9rem; color: #6b7280;">Best regards,<br>The P2P Marketplace Engine</p>
    </div>
  `;

  return await sendEmail({ to: ownerEmail, subject, html });
};

/**
 * 🎉 Template 2: Notify Borrower that their Request was APPROVED
 */
export const sendBookingConfirmedEmail = async (borrowerEmail, borrowerName, itemTitle, totalPrice, ownerEmail) => {
  const subject = `🎉 Booking Confirmed: Your ${itemTitle} is ready!`;
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

      <p>You can check the layout status and active timeframe schedules anytime on your profile orders grid tab.</p>
      <p style="font-size: 0.9rem; color: #6b7280;">Enjoy your rental!<br>The P2P Marketplace Engine</p>
    </div>
  `;

  return await sendEmail({ to: borrowerEmail, subject, html });
};

/**
 * ❌ Template 3: Notify Borrower/Owner that a Booking was CANCELLED/REJECTED
 */
export const sendBookingCancelledEmail = async (recipientEmail, recipientName, itemTitle, roleContext) => {
  const subject = `⚠️ Booking Update: Rental Request Cancelled`;
  
  const alertText = roleContext === "owner" 
    ? `The borrower has cancelled their pending request for your <strong>${itemTitle}</strong>.`
    : `We regret to inform you that your rental request for the <strong>${itemTitle}</strong> has been declined or cancelled.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
      <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Booking Cancelled</h2>
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>${alertText}</p>
      <p>If any transactional payment thresholds were held, they will be processed back to the originating framework collections context immediately.</p>
      <p style="font-size: 0.9rem; color: #6b7280;">Best regards,<br>The P2P Marketplace Engine</p>
    </div>
  `;

  return await sendEmail({ to: recipientEmail, subject, html });
};