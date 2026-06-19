'use client';

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Zap, Star, ShieldCheck, Download, Smartphone, Play, Apple, Truck, Globe, Mail, Phone, MapPin, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { categoriesApi, imgUrl } from './lib/api';

type Lang = 'EN' | 'FR' | 'AR';

const translations = {
  EN: {
    nav: ['Services', 'Process', 'App', 'Contact'],
    login: 'Login',
    cta: 'Order Now',
    heroBadge: 'Premium Cleaning Service',
    heroTitle: 'Your Home Impeccable.',
    heroDesc: 'Free up your time. Nadif takes care of everything: from home cleaning to laundry care, with 24h delivery.',
    heroBtn: 'Book a Service',
    servicesTitle: 'Explore our Services.',
    servicesSub: 'Complete cleaning for your daily life',
    popularTitle: 'The Essentials.',
    popularSub: 'Most requested services this month',
    popularItems: [
      { t: "Welcome Offer", d: "Get -20% on your first cleaning or laundry order.", p: "-20%" },
      { t: "Clean Air (Clima+)", d: "HEALTH & COMFORT: Breathe pure air with our expert service.", p: "1500 DA" },
      { t: "Home Pack", d: "Full cleaning subscription for your home and laundry.", p: "On Quote" }
    ],
    howTitle: 'L&apos;Expérience Nadif.',
    howSub: 'Your cleaning service in 4 simple steps',
    steps: [
      { t: "Order", d: "Choose your services on the Nadif app." },
      { t: "Arrival", d: "Our expert arrives at your home or picks up your laundry." },
      { t: "Expert Care", d: "Specialized treatment by our qualified experts." },
      { t: "Result", d: "Enjoy a clean home and fresh laundry." }
    ],
    contactTitle: 'Contact Us.',
    contactSub: 'Our team is here to help you',
    contactName: 'Full Name',
    contactEmail: 'Email Address',
    contactMsg: 'Your Message',
    contactBtn: 'Send Message',
    appTitle: 'Nadif in your Pocket.',
    appDesc: 'Book your home cleaning or laundry in seconds. Track our agents in real-time.',
    footerDesc: 'Professional home cleaning and premium laundry in Algeria.',
    catItems: ["Laundry & Ironing", "Carpet Cleaning", "Air Conditioning", "Deep Cleaning"],
    catCounts: ["Premium Care", "Deep Clean", "Expert Tech", "Full Home"],
    footerLinks: ['Home', 'Contact', 'FAQ'],
    location: 'Algeria — Algiers, DZ 16000',
    download: 'Download for',
    viewAll: 'View all catalog'
  },
  FR: {
    nav: ['Services', 'Processus', 'Application', 'Contact'],
    login: 'Login',
    cta: 'Commander',
    heroBadge: 'Service de Nettoyage Premium',
    heroTitle: 'Votre Maison Impeccable.',
    heroDesc: 'Libérez votre temps. Nadif s&apos;occupe de tout : du nettoyage de votre domicile à l&apos;entretien de votre linge, avec une livraison en 24h.',
    heroBtn: 'Réserver un Service',
    servicesTitle: 'Explorez nos Services.',
    servicesSub: 'Nettoyage complet pour votre quotidien',
    popularTitle: 'Les Incontournables.',
    popularSub: 'Services les plus demandés ce mois-ci',
    popularItems: [
      { t: "Offre de Bienvenue", d: "Bénéficiez de -20% sur votre première commande de nettoyage.", p: "-20%" },
      { t: "Clean Air (Clima+)", d: "SANTÉ & CONFORT: Respirez un air pur avec notre service expert.", p: "1500 DA" },
      { t: "Pack Maison", d: "Abonnement nettoyage complet pour votre domicile et linge.", p: "Sur Devis" }
    ],
    howTitle: 'L&apos;Expérience Nadif.',
    howSub: 'Votre service de nettoyage en 4 étapes simples',
    steps: [
      { t: "Commande", d: "Choisissez vos services sur l&apos;application Nadif." },
      { t: "Arrivée", d: "Notre expert arrive à votre domicile ou récupère votre linge." },
      { t: "Soin Expert", d: "Traitement spécialisé par nos experts qualifiés." },
      { t: "Résultat", d: "Profitez d&apos;une maison propre et d&apos;un linge frais." }
    ],
    contactTitle: 'Contactez-nous.',
    contactSub: 'Notre équipe est à votre écoute',
    contactName: 'Nom Complet',
    contactEmail: 'Adresse Email',
    contactMsg: 'Votre Message',
    contactBtn: 'Envoyer',
    appTitle: 'Nadif dans votre Poche.',
    appDesc: 'Réservez votre nettoyage de maison ou votre pressing en quelques secondes. Suivez nos agents en temps réel.',
    footerDesc: 'Nettoyage professionnel de domicile et pressing premium en Algérie.',
    catItems: ["Lavage & Repassage", "Nettoyage Tapis", "Climatisation", "Nettoyage Profond"],
    catCounts: ["Premium Care", "Deep Clean", "Expert Tech", "Full Home"],
    footerLinks: ['Accueil', 'Contact', 'FAQ'],
    location: 'Algérie — Alger, DZ 16000',
    download: 'Télécharger pour',
    viewAll: 'Voir tout le catalogue'
  },
  AR: {
    nav: ['خدماتنا', 'كيف نعمل', 'التطبيق', 'اتصل بنا'],
    login: 'دخول',
    cta: 'اطلب الآن',
    heroBadge: 'خدمة تنظيف ممتازة',
    heroTitle: 'منزلك في أبهى حلة.',
    heroDesc: 'وفر وقتك. نظيف يهتم بكل شيء: من تنظيف منزلك إلى العناية بغسيلك، مع توصيل خلال 24 ساعة.',
    heroBtn: 'احجز خدمة',
    servicesTitle: 'اكتشف خدماتنا.',
    servicesSub: 'تنظيف كامل لحياتك اليومية',
    popularTitle: 'الأساسيات.',
    popularSub: 'الخدمات الأكثر طلباً هذا الشهر',
    popularItems: [
      { t: "عرض الترحيب", d: "احصل على خصم 20% على أول طلب تنظيف أو غسيل.", p: "-20%" },
      { t: "هواء نقي (كليما+)", d: "الصحة والراحة: تنفس هواءً نقياً مع خدمتنا الخبيرة.", p: "1500 دج" },
      { t: "باقة المنزل", d: "اشتراك تنظيف كامل لمنزلك وغسيلك.", p: "حسب الطلب" }
    ],
    howTitle: 'تجربة نظيف.',
    howSub: 'خدمة التنظيف الخاصة بك في 4 خطوات بسيطة',
    steps: [
      { t: "الطلب", d: "اختر خدماتك على تطبيق نظيف." },
      { t: "الوصول", d: "يصل خبيرنا إلى منزلك أو يستلم غسيلك." },
      { t: "عناية خبيرة", d: "معالجة متخصصة من قبل خبرائنا المؤهلين." },
      { t: "النتيجة", d: "استمتع بمنزل نظيف وغسيل منعش." }
    ],
    contactTitle: 'اتصل بنا.',
    contactSub: 'فريقنا هنا لمساعدتك',
    contactName: 'الاسم الكامل',
    contactEmail: 'البريد الإلكتروني',
    contactMsg: 'رسالتك',
    contactBtn: 'إرسال',
    appTitle: 'نظيف في جيبك.',
    appDesc: 'احجز تنظيف منزلك أو غسيلك في ثوانٍ. تتبع وكلائنا في الوقت الفعلي.',
    footerDesc: 'تنظيف احترافي للمنازل ومصبغة ممتازة في الجزائر.',
    catItems: ["غسيل وكي", "تنظيف السجاد", "تكييف الهواء", "تنظيف عميق"],
    catCounts: ["عناية ممتازة", "تنظيف عميق", "تقنية الخبراء", "منزل كامل"],
    footerLinks: ['الرئيسية', 'اتصل بنا', 'الأسئلة الشائعة'],
    location: 'الجزائر — الجزائر العاصمة، DZ 16000',
    download: 'تحميل لـ',
    viewAll: 'مشاهدة الكل'
  }
};

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [lang, setLang] = useState<Lang>('FR');

  const t = translations[lang];
  const isRTL = lang === 'AR';

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    categoriesApi.getPublicAll()
      .then(setCategories)
      .catch(err => console.error("Error loading categories for homepage:", err));
  }, []);

  const servicesFallback = [
    { name: t.catItems[0], image: "/assets/landiring.JPG", count: t.catCounts[0] },
    { name: t.catItems[1], image: "/assets/sejadaclean.JPG", count: t.catCounts[1] },
    { name: t.catItems[2], image: "/assets/clima.JPG", count: t.catCounts[2] },
    { name: t.catItems[3], image: "/assets/deepclean.JPG", count: t.catCounts[3] },
  ];

  const services = categories.length > 0 
    ? categories.map(cat => ({
        name: lang === 'AR' ? (cat.nameAr || cat.name) : lang === 'FR' ? (cat.nameFr || cat.name) : cat.name,
        image: imgUrl(cat.picture),
        count: (() => {
          if (!cat.categoryServices || cat.categoryServices.length === 0) {
            return lang === 'AR' ? 'عناية ممتازة' : 'Premium Care';
          }
          const minPrice = Math.min(...cat.categoryServices.map((cs: any) => cs.basePrice));
          return lang === 'AR' ? `ابتداءً من ${minPrice} دج` : lang === 'FR' ? `À partir de ${minPrice} DA` : `Starting at ${minPrice} DA`;
        })()
      }))
    : servicesFallback;

  const popular = [
    { ...t.popularItems[0], image: "/assets/promo.png", tag: "NEW" },
    { ...t.popularItems[1], image: "/assets/cleanair.png", tag: "HOT" },
    { ...t.popularItems[2], image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop", tag: "PREMIUM" },
  ];

  return (
    <main className={`min-h-screen bg-white font-gilmer text-foreground-nadif selection:bg-primary selection:text-white overflow-x-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Premium Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <Image src="/logo.png" alt="Nadif" width={28} height={28} className="brightness-0 invert" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase text-primary">NADIF</span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {t.nav.map((item, i) => (
              <Link key={item} href={`#${['services', 'processus', 'application', 'contact'][i]}`} className="text-[11px] font-bold uppercase tracking-widest text-foreground-nadif/60 hover:text-primary transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 border-r border-gray-100 pr-6 mr-2">
              <Globe size={14} className="text-gray-400" />
              <div className="flex gap-2">
                {(['EN', 'FR', 'AR'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`text-[10px] font-bold transition-colors ${lang === l ? 'text-primary' : 'text-gray-400 hover:text-foreground-nadif'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/login" className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-foreground-nadif hover:text-primary transition-colors">{t.login}</Link>
            <button className="px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              {t.cta}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 hero-gradient pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: isRTL ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 mb-8">
                <Zap size={14} className="text-primary fill-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t.heroBadge}</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-bold leading-[0.9] tracking-tighter text-foreground-nadif mb-8 uppercase font-gilmer">
                {t.heroTitle.split('.')[0]} <br />
                <span className="text-primary underline decoration-primary/10 underline-offset-8">Impeccable.</span>
              </h1>
              <p className="text-lg lg:text-xl text-foreground-nadif/50 max-w-lg mb-10 leading-relaxed font-medium">
                {t.heroDesc}
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="btn-premium flex items-center gap-3">
                  {t.heroBtn}
                  <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="relative flex flex-col items-center group">
              <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-[1.02]">
                <Image src="/hero-3d.png" alt="Nadif 3D" width={700} height={700} className="w-full h-auto" />
              </div>
              <div className="w-[60%] h-12 bg-black/20 blur-[50px] rounded-[100%] mt-[-40px] mx-auto animate-pulse opacity-50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="services" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter uppercase font-gilmer">{t.servicesTitle}</h2>
            <p className="text-foreground-nadif/40 text-sm font-bold uppercase tracking-[0.3em]">{t.servicesSub}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, i) => (
              <motion.div key={i} whileHover={{ y: -10 }} className="group relative bg-gray-50/50 rounded-[3rem] p-10 text-center cursor-pointer border border-gray-100 hover:border-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className="w-32 h-32 relative mx-auto mb-8 rounded-full overflow-hidden shadow-xl ring-4 ring-white group-hover:scale-110 transition-transform duration-700 bg-slate-100">
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-bold text-foreground-nadif mb-2 uppercase tracking-tight">{service.name}</h3>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-60">{service.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-24 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter uppercase font-gilmer">{t.popularTitle}</h2>
              <p className="text-foreground-nadif/40 text-sm font-bold uppercase tracking-[0.3em]">{t.popularSub}</p>
            </div>
            <Link href="#" className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] group">
              {t.viewAll} <ArrowRight size={14} className={isRTL ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {popular.map((item, i) => (
              <motion.div key={i} whileHover={{ y: -10 }} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
                <div className="relative h-64 overflow-hidden">
                  <Image src={item.image} alt={item.t} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-6 left-6">
                    <span className="bg-primary text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">{item.tag}</span>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-foreground-nadif mb-4 uppercase tracking-tighter">{item.t}</h3>
                  <p className="text-sm text-foreground-nadif/40 leading-relaxed font-medium mb-8">{item.d}</p>
                  <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                    <p className="text-2xl font-bold text-primary">{item.p}</p>
                    <button className="w-14 h-14 bg-foreground-nadif text-white rounded-full flex items-center justify-center hover:bg-primary transition-all shadow-lg hover:rotate-90">
                      <ArrowRight size={24} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section - REDESIGNED "BEST UI" */}
      <section id="processus" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl lg:text-8xl font-bold tracking-tighter uppercase font-gilmer italic">{t.howTitle}</h2>
            <p className="text-foreground-nadif/40 text-sm font-bold uppercase tracking-[0.3em]">{t.howSub}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-1/3 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />

            {t.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative group text-center lg:text-left space-y-8 p-8 bg-gray-50/50 rounded-[3rem] border border-transparent hover:border-primary/10 hover:bg-white hover:shadow-xl transition-all duration-500"
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10">
                  {[<Smartphone key="1" />, <Truck key="2" />, <Zap key="3" />, <CheckCircle key="4" />][i]}
                  <span className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-xl shadow-primary/20 border-4 border-white">{i + 1}</span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-foreground-nadif uppercase tracking-tighter leading-none">{step.t}</h3>
                  <p className="text-sm text-foreground-nadif/40 font-medium leading-relaxed">{step.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/2" />
      </section>

      {/* Contact Section - NEW SECTION */}
      <section id="contact" className="py-32 bg-gray-50/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-8xl font-bold tracking-tighter uppercase font-gilmer">{t.contactTitle}</h2>
                <p className="text-foreground-nadif/40 text-sm font-bold uppercase tracking-[0.3em]">{t.contactSub}</p>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground-nadif/40 uppercase tracking-widest">Phone</p>
                    <p className="text-xl font-bold text-foreground-nadif">+213 555 123 456</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground-nadif/40 uppercase tracking-widest">Email</p>
                    <p className="text-xl font-bold text-foreground-nadif">contact@nadif.dz</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground-nadif/40 uppercase tracking-widest">Location</p>
                    <p className="text-xl font-bold text-foreground-nadif">{t.location.split(' — ')[1]}</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
              <form className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground-nadif/40 uppercase tracking-[0.2em] px-2">{t.contactName}</label>
                  <input type="text" className="w-full px-8 py-5 bg-gray-50 rounded-3xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white border border-transparent focus:border-primary/20 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground-nadif/40 uppercase tracking-[0.2em] px-2">{t.contactEmail}</label>
                  <input type="email" className="w-full px-8 py-5 bg-gray-50 rounded-3xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white border border-transparent focus:border-primary/20 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground-nadif/40 uppercase tracking-[0.2em] px-2">{t.contactMsg}</label>
                  <textarea rows={4} className="w-full px-8 py-5 bg-gray-50 rounded-3xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white border border-transparent focus:border-primary/20 transition-all font-bold resize-none" />
                </div>
                <button className="btn-premium w-full !py-5 flex items-center justify-center gap-3">
                  {t.contactBtn}
                  <Send size={20} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Download */}
      <section id="application" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-50/80 border border-gray-100 rounded-[4rem] p-16 lg:p-24 flex flex-col md:flex-row items-center justify-between gap-20 overflow-hidden relative shadow-sm">
            <div className={`md:w-1/2 space-y-10 relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className="text-5xl lg:text-7xl font-bold text-foreground-nadif tracking-tighter leading-[0.9] font-gilmer uppercase italic">{t.appTitle.split(' ')[0]} <span className="text-primary">{t.appTitle.split(' ').slice(1).join(' ')}</span></h2>
              <p className="text-foreground-nadif/50 text-lg leading-relaxed font-medium">{t.appDesc}</p>
              <div className="flex flex-wrap gap-6">
                <button className="flex items-center gap-4 bg-white border border-gray-100 text-foreground-nadif px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-sm">
                  <Apple size={28} />
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-[10px] font-bold opacity-40 uppercase">{t.download}</p>
                    <p className="text-lg leading-none font-gilmer">iPhone</p>
                  </div>
                </button>
                <button className="flex items-center gap-4 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl">
                  <Play size={28} className="fill-white" />
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-[10px] font-bold opacity-40 uppercase">{t.download}</p>
                    <p className="text-lg leading-none font-gilmer">Android</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center relative">
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="w-[280px] aspect-[9/19.5] bg-white rounded-[3rem] border-[12px] border-foreground-nadif shadow-2xl overflow-hidden relative z-10">
                <Image src="/postcss.config.jpg" alt="Nadif App Mockup" fill className="object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Compact Gray */}
      <footer className="bg-gray-50 border-t border-gray-100 text-foreground-nadif py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10 text-left">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                  <Image src="/logo.png" alt="Nadif" width={24} height={24} className="brightness-0 invert" />
                </div>
                <span className="text-2xl font-bold tracking-tighter uppercase font-gilmer text-primary">NADIF</span>
              </Link>
              <p className="text-foreground-nadif/40 text-[10px] font-bold uppercase tracking-widest leading-loose max-w-xs">{t.footerDesc}</p>
              <div className="flex gap-3">
                {['FB', 'IG', 'TW'].map(s => (
                  <Link key={s} href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[10px] font-black hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">{s}</Link>
                ))}
              </div>
            </div>
            {t.nav.slice(0, 3).map((title, i) => (
              <div key={i} className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{title}</h4>
                <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-foreground-nadif/50">
                  {t.footerLinks.map(link => (
                    <li key={link}><Link href="#" className="hover:text-primary transition-colors">{link}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-foreground-nadif/20">&copy; 2026 NADIF PRESSING.</p>
            <div className="flex gap-10 text-[8px] font-black uppercase tracking-[0.2em] text-foreground-nadif/30">
              <span>{t.location}</span>
              <Link href="tel:+213555123456" className="hover:text-primary transition-all">+213 555 123 456</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
