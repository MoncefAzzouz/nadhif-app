import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || 'info@nadif.com';
export const adminEmail = process.env.ADMIN_EMAIL || 'admin@nadif.com';

let transporter: nodemailer.Transporter | null = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
  console.log('✉️ SMTP Transporter initialized successfully');
} else {
  console.log('⚠️ SMTP Credentials missing. Emails will be logged to console and emails.log.');
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const mailOptions = {
    from: smtpFrom,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  };

  const logEntry = `[${new Date().toISOString()}] EMAIL SENT
To: ${to}
Subject: ${subject}
Content: ${mailOptions.text}
----------------------------------------------------------------------\n`;

  // Always write to a local log file inside the backend directory for inspection/testing
  try {
    const logFilePath = path.join(__dirname, '../../emails.log');
    fs.appendFileSync(logFilePath, logEntry);
  } catch (err) {
    console.error('Failed to write to emails.log:', err);
  }

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Email successfully sent to ${to}: "${subject}"`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
    }
  } else {
    console.log(`[MOCK EMAIL LOGGED TO emails.log] To: ${to} | Subject: "${subject}"`);
  }
}
