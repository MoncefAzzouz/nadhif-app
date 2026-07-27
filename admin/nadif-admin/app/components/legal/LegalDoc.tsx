'use client';

// ─── Shared shell for the public legal / support pages ───────────────────────
// Used by /privacy-policy, /terms, /delete-account and /support. Each page
// passes its own EN/FR/AR content; this component renders the chrome (navbar,
// language switcher, table of contents, footer) and the document body.
//
// Pages stay server-rendered on first load (this client component is prerendered
// with `defaultLang`), so crawlers and the Google Play review team always see the
// full text in the HTML without running any JavaScript.

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Globe, Mail, MapPin, Phone, Clock, AlertTriangle } from 'lucide-react';
import { SITE_INFO, type LegalLang } from '../../lib/site-info';

export interface LegalSection {
  /** Heading shown in the body and in the table of contents. */
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  /** Rendered as a numbered list (used for the account deletion steps). */
  steps?: string[];
  /** Highlighted note rendered at the end of the section. */
  callout?: string;
}

export interface LegalDocContent {
  title: string;
  subtitle: string;
  intro?: string;
  sections: LegalSection[];
}

const UI: Record<LegalLang, {
  backToSite: string;
  lastUpdated: string;
  contents: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  footerLegal: string;
  pages: { href: string; label: string }[];
}> = {
  EN: {
    backToSite: 'Back to site',
    lastUpdated: 'Last updated',
    contents: 'Contents',
    email: 'Email us',
    phone: 'Call us',
    address: 'Address',
    hours: 'Opening hours',
    footerLegal: 'Legal & support',
    pages: [
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms & Conditions' },
      { href: '/delete-account', label: 'Delete account' },
      { href: '/support', label: 'Support' },
    ],
  },
  FR: {
    backToSite: 'Retour au site',
    lastUpdated: 'Dernière mise à jour',
    contents: 'Sommaire',
    email: 'Écrivez-nous',
    phone: 'Appelez-nous',
    address: 'Adresse',
    hours: "Heures d'ouverture",
    footerLegal: 'Mentions légales & support',
    pages: [
      { href: '/privacy-policy', label: 'Politique de confidentialité' },
      { href: '/terms', label: 'Conditions générales' },
      { href: '/delete-account', label: 'Supprimer le compte' },
      { href: '/support', label: 'Support' },
    ],
  },
  AR: {
    backToSite: 'العودة إلى الموقع',
    lastUpdated: 'آخر تحديث',
    contents: 'المحتويات',
    email: 'راسلنا',
    phone: 'اتصل بنا',
    address: 'العنوان',
    hours: 'ساعات العمل',
    footerLegal: 'القانونية والدعم',
    pages: [
      { href: '/privacy-policy', label: 'سياسة الخصوصية' },
      { href: '/terms', label: 'الشروط والأحكام' },
      { href: '/delete-account', label: 'حذف الحساب' },
      { href: '/support', label: 'الدعم' },
    ],
  },
};

const slugify = (heading: string, index: number) =>
  `section-${index + 1}-${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

export default function LegalDoc({
  doc,
  defaultLang = 'FR',
  showContactCards = false,
  tone = 'primary',
}: {
  doc: Record<LegalLang, LegalDocContent>;
  defaultLang?: LegalLang;
  /** Renders the email / phone / address / hours cards under the intro. */
  showContactCards?: boolean;
  /** `danger` switches the accents to red — used by /delete-account. */
  tone?: 'primary' | 'danger';
}) {
  const [lang, setLang] = useState<LegalLang>(defaultLang);
  const content = doc[lang];
  const t = UI[lang];
  const isRTL = lang === 'AR';
  const accentText = tone === 'danger' ? 'text-rose-600' : 'text-primary';
  const accentBg = tone === 'danger' ? 'bg-rose-500' : 'bg-primary';
  const accentSoft = tone === 'danger' ? 'bg-rose-50 border-rose-100' : 'bg-primary/5 border-primary/10';

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-slate-50/50 text-slate-800 selection:bg-primary selection:text-white overflow-x-hidden ${isRTL ? 'font-cairo' : 'font-gilmer'}`}
    >
      {/* Navbar (kept intentionally light — these pages are entry points from the app store listing) */}
      <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-lg shadow-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20">
              <Image src="/logo.png" alt="Nadif Logo" width={26} height={26} className="brightness-0 invert" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase text-primary">NADIF</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <Globe size={15} className="text-slate-400" />
              <div className="flex gap-1.5">
                {(['EN', 'FR', 'AR'] as LegalLang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`text-[10px] font-extrabold transition-colors py-1 px-1.5 rounded-md cursor-pointer ${lang === l ? 'text-primary bg-primary/5' : 'text-slate-400 hover:text-slate-800'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors"
            >
              {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              {t.backToSite}
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative pt-36 pb-12">
        <div className="absolute inset-0 hero-gradient pointer-events-none opacity-40" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <p className={`text-[9px] font-extrabold uppercase tracking-[0.35em] ${accentText} mb-5`}>
            {t.lastUpdated}: {SITE_INFO.lastUpdated[lang]}
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold leading-[1] tracking-tighter uppercase text-slate-850 mb-6">
            {content.title}
          </h1>
          <p className="text-slate-500 text-md lg:text-lg leading-relaxed font-semibold max-w-2xl">
            {content.subtitle}
          </p>
        </div>
      </section>

      {/* Contact cards (/support) */}
      {showContactCards && (
        <section className="max-w-5xl mx-auto px-6 mb-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href={`mailto:${SITE_INFO.supportEmail}`}
              className="flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Mail size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.email}</p>
                <p className="text-sm font-bold text-slate-850 truncate">{SITE_INFO.supportEmail}</p>
              </div>
            </a>

            <a
              href={`tel:${SITE_INFO.phoneHref}`}
              className="flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Phone size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.phone}</p>
                <p className="text-sm font-bold text-slate-850" dir="ltr">{SITE_INFO.phoneDisplay}</p>
              </div>
            </a>

            <div className="flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.address}</p>
                <p className="text-sm font-bold text-slate-850">{SITE_INFO.address[lang]}</p>
              </div>
            </div>

            <div className="flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Clock size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t.hours}</p>
                <p className="text-sm font-bold text-slate-850">{SITE_INFO.hours[lang]}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Body */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 items-start">
          {/* Table of contents */}
          <aside className="hidden lg:block sticky top-28">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">{t.contents}</p>
            <ul className="space-y-2.5">
              {content.sections.map((section, i) => (
                <li key={section.heading}>
                  <a
                    href={`#${slugify(section.heading, i)}`}
                    className="text-[11px] font-bold text-slate-500 hover:text-primary transition-colors leading-snug block"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <article className="bg-white p-8 lg:p-14 rounded-[2.5rem] shadow-sm border border-slate-100">
            {content.intro && (
              <p className="text-sm lg:text-[15px] leading-loose font-semibold text-slate-600 mb-12 pb-12 border-b border-slate-100">
                {content.intro}
              </p>
            )}

            <div className="space-y-12">
              {content.sections.map((section, i) => (
                <div key={section.heading} id={slugify(section.heading, i)} className="scroll-mt-28">
                  <div className={`flex items-baseline gap-3 mb-5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <span className={`text-[10px] font-black ${accentText} tabular-nums`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-lg lg:text-xl font-bold uppercase tracking-tight text-slate-850">
                      {section.heading}
                    </h2>
                  </div>

                  {section.paragraphs?.map((paragraph, p) => (
                    <p key={p} className="text-[13.5px] leading-loose font-medium text-slate-600 mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="mt-5 space-y-3">
                      {section.bullets.map((bullet, b) => (
                        <li key={b} className="flex gap-3.5 text-[13.5px] leading-loose font-medium text-slate-600">
                          <span className={`mt-2.5 w-1.5 h-1.5 rounded-full ${accentBg} shrink-0`} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.steps && (
                    <ol className="mt-5 space-y-4">
                      {section.steps.map((step, s) => (
                        <li key={s} className="flex gap-4 text-[13.5px] leading-loose font-medium text-slate-600">
                          <span className={`w-6 h-6 rounded-full ${accentBg} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-1.5`}>
                            {s + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {section.callout && (
                    <div className={`mt-6 flex gap-4 p-5 rounded-2xl border ${accentSoft}`}>
                      <AlertTriangle size={16} className={`${accentText} shrink-0 mt-0.5`} />
                      <p className="text-[12.5px] leading-relaxed font-bold text-slate-700">{section.callout}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 text-slate-600 py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                  <Image src="/logo.png" alt="Nadif Logo" width={22} height={22} className="brightness-0 invert" />
                </div>
                <span className="text-xl font-bold tracking-tighter uppercase text-primary">NADIF</span>
              </Link>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose max-w-xs">
                {SITE_INFO.legalName} — {SITE_INFO.address[lang]}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t.footerLegal}</h4>
              <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t.pages.map((page) => (
                  <li key={page.href}>
                    <Link href={page.href} className="hover:text-primary transition-colors">{page.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.45em] text-slate-400">
              &copy; 2026 {SITE_INFO.legalName.toUpperCase()}.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              <a href={`mailto:${SITE_INFO.supportEmail}`} className="hover:text-primary transition-colors">{SITE_INFO.supportEmail}</a>
              <a href={`tel:${SITE_INFO.phoneHref}`} className="hover:text-primary transition-colors" dir="ltr">{SITE_INFO.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
