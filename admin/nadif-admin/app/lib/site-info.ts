// ─── Nadif public site / legal pages info ────────────────────────────────────
// Single source of truth for the company details shown on the public pages
// (/privacy-policy, /terms, /delete-account, /support).
//
// ⚠️ BEFORE SUBMITTING TO GOOGLE PLAY: replace the placeholder values below with
// the real ones. Google reviewers (and users) will try the email and the phone
// number, and the Data safety form must match what /privacy-policy says.
// These defaults were carried over from the marketing homepage footer.

export type LegalLang = 'EN' | 'FR' | 'AR';

export const SITE_INFO = {
  brand: 'Nadif',
  legalName: 'Nadif Pressing',
  appName: 'Nadif',
  androidPackage: 'com.nadif.app',

  // Public URL of this website (used by sitemap.ts / robots.ts and canonical URLs).
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://nadif.dz',

  // ⚠️ Placeholders — replace with real, monitored contact details.
  supportEmail: 'contact@nadif.dz',
  privacyEmail: 'contact@nadif.dz',
  phoneDisplay: '+213 555 123 456',
  phoneHref: '+213555123456',

  address: {
    EN: 'Algiers, Algeria — DZ 16000',
    FR: 'Alger, Algérie — DZ 16000',
    AR: 'الجزائر العاصمة، الجزائر — DZ 16000',
  } satisfies Record<LegalLang, string>,

  hours: {
    EN: 'Sunday to Thursday, 9:00 – 18:00 (GMT+1)',
    FR: 'Du dimanche au jeudi, 9h00 – 18h00 (GMT+1)',
    AR: 'من الأحد إلى الخميس، 9:00 – 18:00 (غرينتش+1)',
  } satisfies Record<LegalLang, string>,

  // Date these documents were last reviewed. Update whenever you edit the text.
  lastUpdated: {
    EN: 'July 27, 2026',
    FR: '27 juillet 2026',
    AR: '27 جويلية 2026',
  } satisfies Record<LegalLang, string>,
} as const;
