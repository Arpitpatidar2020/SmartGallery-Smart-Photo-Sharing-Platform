const transporter = require('../config/nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"SmartGallery" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

const sendOtpEmail = async (email, otp) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; border-radius: 16px; color: #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #818cf8; font-size: 28px; margin: 0;">SmartGallery</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
      </div>
      <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center;">
        <p style="color: #cbd5e1; font-size: 15px; margin-bottom: 16px;">Your verification code is:</p>
        <div style="background: #0f172a; border: 2px solid #818cf8; border-radius: 8px; padding: 16px; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #818cf8;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 13px; margin-top: 16px;">This code expires in <strong>10 minutes</strong>.</p>
      </div>
      <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 20px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'SmartGallery — Password Reset OTP',
    html,
  });
};

module.exports = { sendEmail, sendOtpEmail };
