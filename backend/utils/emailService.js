const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const fs = require('fs');
const path = require('path');

const sendEmail = async ({ to, subject, html }) => {
  try {
    // For local development, save the email content to a file
    fs.writeFileSync(path.join(__dirname, '../latest_email.html'), html);

    const hasConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
    if (!hasConfig) {
      console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      return { messageId: 'mock-id-' + Date.now() };
    }

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GharSeva" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return null;
  }
};

const sendRegistrationOTP = async (email, otp) => {
  const subject = 'GharSeva Email Verification';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Welcome to GharSeva!</h2>
      <p style="color: #475569; font-size: 16px;">Please use the following OTP to verify your email address and complete your registration:</p>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

const sendForgotPasswordOTP = async (email, otp) => {
  const subject = 'GharSeva Password Reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Password Reset Request</h2>
      <p style="color: #475569; font-size: 16px;">We received a request to reset your password. Use the OTP below to proceed:</p>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">This OTP is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

const sendBookingCompletionOTP = async (email, otp, serviceTitle) => {
  const subject = 'GharSeva Service Completion Verification';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #059669; text-align: center;">Service Completion</h2>
      <p style="color: #475569; font-size: 16px;">Your service provider for <strong>${serviceTitle}</strong> has requested to mark the booking as complete.</p>
      <p style="color: #475569; font-size: 16px;">Please provide the following OTP to the provider ONLY IF the service has been satisfactorily completed:</p>
      <div style="background-color: #ecfdf5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #065f46;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">This OTP is valid for 10 minutes.</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

const sendNotificationEmail = async (email, title, message) => {
  const subject = `GharSeva Notification: ${title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">${title}</h2>
      <p style="color: #475569; font-size: 16px;">${message}</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-align: center;">
        <p>This is an automated notification from GharSeva. Please do not reply.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendRegistrationOTP,
  sendForgotPasswordOTP,
  sendBookingCompletionOTP,
  sendNotificationEmail
};
