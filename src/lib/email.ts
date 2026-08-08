import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env here too: this module is imported from several entry points and
// must not depend on another module having called dotenv.config() first.
dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || 'info@nadif.com';

// ─── Recipient safety ─────────────────────────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

/**
 * True for the fake addresses the backend generates itself, which no human ever
 * reads: phone-only signups get "<phone>@nadhif.com" (auth/register-phone) and
 * admin-created guest customers get "guest_<phone>_<ts>@nadif.com" (admin/orders).
 * Those domains belong to us, so mailing them either bounces or — if the domain
 * has a catch-all — drops every customer's order details into our own inbox.
 */
export function isPlaceholderEmail(address: string): boolean {
  const local = address.split('@')[0] ?? '';
  return /^\+?\d+$/.test(local) || /^guest_/i.test(local);
}

/** A real, external address we are allowed to send to. */
export function isDeliverableEmail(address?: string | null): address is string {
  if (!address) return false;
  const trimmed = address.trim();
  return EMAIL_PATTERN.test(trimmed) && !isPlaceholderEmail(trimmed);
}

/**
 * Extra mailbox(es) that receive the internal/operational notifications (new
 * order, new subscription, status changes), on top of the users holding the
 * ADMIN role. Use it for a shared business inbox that has no user account.
 * Comma-separated for several recipients; leave unset to notify ADMIN users only.
 */
export const adminNotificationEmails: string[] = Array.from(
  new Set(
    (process.env.ADMIN_EMAIL || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(isDeliverableEmail),
  ),
);

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

  const logFilePath = path.join(__dirname, '../../emails.log');
  const appendLog = (entry: string) => {
    // Always write to a local log file inside the backend directory for inspection/testing
    try {
      fs.appendFileSync(logFilePath, entry);
    } catch (err) {
      console.error('Failed to write to emails.log:', err);
    }
  };

  // Last line of defence: never hand a phone number, an empty string or one of
  // our generated placeholder addresses to the SMTP server.
  if (!isDeliverableEmail(to)) {
    appendLog(`[${new Date().toISOString()}] EMAIL SKIPPED (not a deliverable address)
To: ${to}
Subject: ${subject}
----------------------------------------------------------------------\n`);
    console.warn(`✉️ Skipped email "${subject}" — "${to}" is not a deliverable address.`);
    return;
  }

  const logEntry = `[${new Date().toISOString()}] EMAIL SENT
To: ${to}
Subject: ${subject}
Content: ${mailOptions.text}
----------------------------------------------------------------------\n`;

  appendLog(logEntry);

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
