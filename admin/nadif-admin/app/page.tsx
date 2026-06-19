'use client';

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Zap, Star, ShieldCheck, Download, Smartphone, Play, Apple, Truck, Globe, Mail, Phone, MapPin, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { categoriesApi, imgUrl, slidesApi, servicesApi } from './lib/api';

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
      { t: "Standard Service", d: "Professional home cleaning and laundry care with 48h delivery.", p: "" },
      { t: "Service Rapide", d: "Express laundry service with home pickup and delivery within 24h.", p: "" },
      { t: "Subscription Packs", d: "Flexible monthly schedules for regular cleaning visits and laundry care.", p: "" }
    ],
    howTitle: 'L\'Expérience Nadif.',
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
    heroDesc: 'Libérez votre temps. Nadif s\'occupe de tout : du nettoyage de votre domicile à l\'entretien de votre linge, avec une livraison en 24h.',
    heroBtn: 'Réserver un Service',
    servicesTitle: 'Explorez nos Services.',
    servicesSub: 'Nettoyage complet pour votre quotidien',
    popularTitle: 'Les Incontournables.',
    popularSub: 'Services les plus demandés ce mois-ci',
    popularItems: [
      { t: "Service Standard", d: "Nettoyage de domicile et entretien de votre linge avec livraison en 48h.", p: "" },
      { t: "Service Rapide", d: "Service express avec collecte et livraison à domicile en moins de 24h.", p: "" },
      { t: "Abonnement Mensuel", d: "Formules mensuelles pour des passages réguliers de nettoyage et repassage.", p: "" }
    ],
    howTitle: 'L\'Expérience Nadif.',
    howSub: 'Votre service de nettoyage en 4 étapes simples',
    steps: [
      { t: "Commande", d: "Choisissez vos services sur l'application Nadif." },
      { t: "Arrivée", d: "Notre expert arrive à votre domicile ou récupère votre linge." },
      { t: "Soin Expert", d: "Traitement spécialisé par nos experts qualifiés." },
      { t: "Résultat", d: "Profitez d'une maison propre et d'un linge frais." }
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
      { t: "الخدمة العادية", d: "تنظيف احترافي للمنازل والعناية بالغسيل مع التوصيل خلال 48 ساعة.", p: "" },
      { t: "الخدمة السريعة", d: "خدمة الغسيل السريع مع الاستلام والتوصيل للمنازل في أقل من 24 ساعة.", p: "" },
      { t: "باقات الاشتراك", d: "باقات شهرية مرنة لزيارات تنظيف دورية وخدمات الغسيل المستمرة.", p: "" }
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
  const [categories, setCategories] = useState<any[]>([]);
  const [dbServicesList, setDbServicesList] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Contact Form states
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    // Load categories
    categoriesApi.getPublicAll()
      .then(setCategories)
      .catch((err: any) => console.error("Error loading categories for homepage:", err));

    // Load services
    servicesApi.getAll()
      .then(setDbServicesList)
      .catch((err: any) => console.error("Error loading services for homepage:", err));

    // Load active slides
    slidesApi.getPublicAll()
      .then((data) => {
        if (data && data.length > 0) {
          setSlides(data);
        }
      })
      .catch((err: any) => console.error("Error loading slides for homepage:", err));
  }, []);

  // Autoplay slides carousel
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setIsSubmittingContact(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSubmittingContact(false);
    setContactSuccess(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const t = translations[lang];
  const isRTL = lang === 'AR';

  // Map dynamic database services with static fallback services as backup
  const dbServices = dbServicesList.map((srv, idx) => {
    let subServicesList: string[] = [];
    const sName = (srv.name || '').toLowerCase();
    if (sName.includes('simple')) {
      subServicesList = lang === 'AR' 
        ? ["غسيل وكي", "تنظيف الغبار", "كنس ومسح"] 
        : lang === 'FR' 
        ? ["Lavage & Repassage", "Dépoussiérage", "Balayage & Aspirateur"] 
        : ["Wash & Ironing", "Dusting surfaces", "Sweeping & Vacuuming"];
    } else if (sName.includes('semi grand') || sName.includes('semi-grand')) {
      subServicesList = lang === 'AR' 
        ? ["تنظيف النوافذ", "تعقيم الحمام", "تنظيف السجاد"] 
        : lang === 'FR' 
        ? ["Vitres intérieures", "Désinfection sanitaire", "Nettoyage Tapis/Tissus"] 
        : ["Inside windows", "Sanitizing bathroom", "Carpet & Upholstery"];
    } else if (sName.includes('grand')) {
      subServicesList = lang === 'AR' 
        ? ["تنظيف عميق للمطبخ", "غسيل الدهون والزيوت", "تنظيف النوافذ والأبواب"] 
        : lang === 'FR' 
        ? ["Cuisine en profondeur", "Dégraissage complet", "Rails de fenêtres & Aérations"] 
        : ["Kitchen deep clean", "Grease removal", "Window tracks & Vents"];
    } else {
      subServicesList = (srv.description || '')
        .split(/[.,;]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0 && s.length < 45)
        .slice(0, 3);
    }
    return {
      name: lang === 'AR' ? (srv.nameAr || srv.name) : lang === 'FR' ? (srv.nameFr || srv.name) : srv.name,
      image: imgUrl(srv.picture),
      count: (() => {
        const labels = {
          EN: ["Premium Care", "Deep Clean", "Expert Tech", "Full Home"],
          FR: ["Soin Premium", "Nettoyage Profond", "Technique Experte", "Complet"],
          AR: ["عناية ممتازة", "تنظيف عميق", "تقنية الخبراء", "منزل كامل"]
        };
        const list = labels[lang] || labels.FR;
        return list[idx % list.length];
      })(),
      subServices: subServicesList
    };
  });

  const fallbackServices = [
    { 
      name: t.catItems[0], 
      image: "/assets/landiring.JPG", 
      count: t.catCounts[0],
      subServices: lang === 'AR' ? ["تنظيف جاف", "غسيل وكي", "كي فقط"] : lang === 'FR' ? ["Nettoyage à sec", "Lavage & Repassage", "Repassage seul"] : ["Dry Clean", "Wash & Iron", "Ironing Only"]
    },
    { 
      name: t.catItems[1], 
      image: "/assets/sejadaclean.JPG", 
      count: t.catCounts[1],
      subServices: lang === 'AR' ? ["سجاد الصالون", "سجاد الصوف", "سجاد فارسي"] : lang === 'FR' ? ["Tapis de salon", "Tapis de laine", "Tapis persans"] : ["Living Room Carpet", "Woolen Rugs", "Persian Rugs"]
    },
    { 
      name: t.catItems[2], 
      image: "/assets/clima.JPG", 
      count: t.catCounts[2],
      subServices: lang === 'AR' ? ["تنظيف الفلاتر", "شحن الغاز", "فحص التكييف"] : lang === 'FR' ? ["Nettoyage filtre", "Recharge Gaz", "Audit Climatisation"] : ["Filter Cleaning", "Gas Recharge", "Full AC Audit"]
    },
    { 
      name: t.catItems[3], 
      image: "/assets/deepclean.JPG", 
      count: t.catCounts[3],
      subServices: lang === 'AR' ? ["تنظيف المطبخ", "تعقيم الحمام", "تنظيف المنزل بالكامل"] : lang === 'FR' ? ["Cuisine en profondeur", "Soin de salle de bain", "Pack maison complète"] : ["Kitchen Deep Clean", "Bathroom Care", "Full House Pack"]
    },
  ];

  const services = dbServicesList.length > 0 ? dbServices : fallbackServices;

  const popular = [
    { ...t.popularItems[0], image: "/assets/second.png", tag: lang === 'AR' ? 'عادي' : 'STANDARD' },
    { ...t.popularItems[1], image: "/assets/urgent.png", tag: lang === 'AR' ? 'سريع' : 'EXPRESS' },
    { ...t.popularItems[2], image: "/assets/cleanair.png", tag: lang === 'AR' ? 'اشتراك' : 'PREMIUM' },
  ];

  // Formatting utility to highlight the last word in titles
  const formatHeading = (titleText: string) => {
    const parts = (titleText || '').trim().split(/\s+/);
    if (parts.length <= 1) return <>{titleText}</>;
    const lastWord = parts[parts.length - 1];
    const rest = parts.slice(0, -1).join(' ');
    return (
      <>
        {rest}{' '}
        <span className="text-primary underline decoration-primary/10 underline-offset-8 block sm:inline">{lastWord}</span>
      </>
    );
  };

  return (
    <main className={`min-h-screen bg-slate-50/50 text-slate-800 selection:bg-primary selection:text-white overflow-x-hidden ${isRTL ? 'font-cairo rtl' : 'font-gilmer ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Premium Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-lg shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20">
              <Image src="/logo.png" alt="Nadif Logo" width={26} height={26} className="brightness-0 invert animate-none" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase text-primary">NADIF</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {t.nav.map((item, i) => (
              <Link key={item} href={`#${['services', 'processus', 'application', 'contact'][i]}`} className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors duration-200">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 border-r border-slate-100 pr-6">
              <Globe size={15} className="text-slate-400" />
              <div className="flex gap-2">
                {(['EN', 'FR', 'AR'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`text-[10px] font-extrabold transition-colors py-1 px-1.5 rounded-md ${lang === l ? 'text-primary bg-primary/5' : 'text-slate-400 hover:text-slate-800'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/login" className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-slate-700 hover:text-primary transition-colors duration-200">{t.login}</Link>
            
            <button 
              onClick={() => {
                const element = document.getElementById('services');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-primary text-white text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {t.cta}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="relative pt-40 pb-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient pointer-events-none opacity-40" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="inline-flex items-center gap-2 bg-primary/5 px-4.5 py-2 rounded-full border border-primary/10 mb-8">
                <Zap size={13} className="text-primary fill-primary" />
                <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-primary">{t.heroBadge}</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[0.95] tracking-tighter text-slate-850 mb-8 uppercase font-gilmer">
                {formatHeading(t.heroTitle)}
              </h1>
              <p className="text-slate-500 text-md lg:text-lg leading-relaxed font-semibold max-w-lg mb-10">
                {t.heroDesc}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => {
                    const element = document.getElementById('services');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-premium flex items-center gap-3 text-xs uppercase tracking-widest cursor-pointer font-bold"
                >
                  {t.heroBtn}
                  <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                </button>
              </div>
            </motion.div>

            {/* Slider/Carousel or Hero Image (Right Side) */}
            <div className="relative w-full flex flex-col items-center">
              {slides.length > 0 ? (
                <div className="w-full relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-[6px] border-white bg-white group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlideIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img 
                        src={imgUrl(slides[currentSlideIndex].imageUrl)} 
                        alt={slides[currentSlideIndex].title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                      />
                      
                      {/* Glassmorphic Slide Information Box */}
                      <div className="absolute inset-x-4 bottom-4 glass-morphism rounded-[2rem] p-5 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/40 shadow-lg">
                        <div className="space-y-1">
                          <span className="bg-primary/10 text-primary text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {slides[currentSlideIndex].actionRoute || 'NADIF EXCLUSIVE'}
                          </span>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                            {slides[currentSlideIndex].title}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-semibold line-clamp-1">
                            {slides[currentSlideIndex].description}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => {
                            const element = document.getElementById('services');
                            if (element) element.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-4 py-2.5 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded-xl hover:bg-primary-600 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {lang === 'AR' ? 'اطلب الآن' : lang === 'FR' ? 'Réserver' : 'Book Now'}
                          <ArrowRight size={10} className={isRTL ? 'rotate-180' : ''} />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  <div className="absolute inset-y-0 left-4 right-4 flex justify-between items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-350">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
                      }}
                      className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-white/30 text-slate-700 hover:bg-white hover:text-primary flex items-center justify-center pointer-events-auto transition-all active:scale-90 cursor-pointer shadow-md"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
                      }}
                      className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-white/30 text-slate-700 hover:bg-white hover:text-primary flex items-center justify-center pointer-events-auto transition-all active:scale-90 cursor-pointer shadow-md"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative flex flex-col items-center group w-full">
                  <div className="relative z-10 rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-transform duration-700 group-hover:scale-[1.01] aspect-[16/10] w-full bg-white border border-slate-100/50">
                    <img src="/hero-3d.png" alt="Nadif Hero illustration" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              )}

              {/* Slider Dots */}
              {slides.length > 1 && (
                <div className="flex gap-2 mt-6 z-20 relative">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentSlideIndex === idx ? 'w-6 bg-primary shadow-sm' : 'w-1.5 bg-slate-200 hover:bg-slate-350'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter uppercase font-gilmer">{t.servicesTitle}</h2>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em]">{t.servicesSub}</p>
          </div>
          
          <div className={`grid gap-8 ${services.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {services.map((service, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -8, scale: 1.01 }} 
                transition={{ duration: 0.3 }}
                className="group relative bg-slate-50/50 rounded-[2.5rem] p-6 text-center cursor-pointer border border-slate-100 hover:border-primary/10 hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-square relative mb-6 rounded-[1.8rem] overflow-hidden shadow-sm bg-slate-100/50">
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500" />
                  </div>
                  <h3 className="text-md font-bold text-slate-800 mb-4 uppercase tracking-tight">{service.name}</h3>
                  
                  {service.subServices && service.subServices.length > 0 && (
                    <div className="flex justify-center mb-6">
                      <ul className="space-y-2 text-left inline-block">
                        {service.subServices.slice(0, 3).map((sub: string, sIdx: number) => (
                          <li key={sIdx} className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold">
                            <CheckCircle size={12} className="text-primary shrink-0" />
                            <span className="line-clamp-1">{sub}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <span className="inline-block bg-primary/5 text-primary text-[9px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
                    {service.count}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-28 bg-slate-50/40 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter uppercase font-gilmer">{t.popularTitle}</h2>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em]">{t.popularSub}</p>
            </div>
            <Link href="#" className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] group">
              {t.viewAll} <ArrowRight size={14} className={isRTL ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {popular.map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -8 }} 
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-100 transition-all duration-300 border border-slate-100/50 group"
              >
                <div className="relative h-64 overflow-hidden bg-slate-50">
                  <Image src={item.image} alt={item.t} fill className="object-cover group-hover:scale-104 transition-transform duration-700" />
                  <div className="absolute top-6 left-6">
                    <span className="bg-primary text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-md">{item.tag}</span>
                  </div>
                </div>
                <div className="p-9">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 uppercase tracking-tighter">{item.t}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-semibold mb-8 line-clamp-2">{item.d}</p>
                  <div className="flex justify-end items-center pt-6 border-t border-slate-100/70">
                    <button className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-all shadow-sm hover:scale-105 active:scale-95">
                      <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="processus" className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl lg:text-7xl font-bold tracking-tighter uppercase font-gilmer italic">{t.howTitle}</h2>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em]">{t.howSub}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 relative">
            <div className="hidden lg:block absolute top-1/3 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-100 to-transparent -translate-y-1/2" />

            {t.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="relative group text-center lg:text-left space-y-6 p-8 bg-slate-50/50 rounded-[2.2rem] border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform duration-300 relative z-10">
                  {[<Smartphone size={22} key="1" />, <Truck size={22} key="2" />, <Zap size={22} key="3" />, <CheckCircle size={22} key="4" />][i]}
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center text-xs font-black shadow-md border-2 border-white">{i + 1}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">{step.t}</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">{step.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Interactive Contact Section */}
      <section id="contact" className="py-28 bg-slate-50/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter uppercase font-gilmer">{t.contactTitle}</h2>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em]">{t.contactSub}</p>
              </div>

              <div className="space-y-6">
                <a href="tel:+213555123456" className="flex items-center gap-5 group cursor-pointer">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="text-lg font-bold text-slate-850">+213 555 123 456</p>
                  </div>
                </a>
                
                <a href="mailto:contact@nadif.dz" className="flex items-center gap-5 group cursor-pointer">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-lg font-bold text-slate-850">contact@nadif.dz</p>
                  </div>
                </a>

                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Location</p>
                    <p className="text-lg font-bold text-slate-850">{t.location.split(' — ')[1]}</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden"
            >
              {contactSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-10 text-center flex flex-col items-center justify-center min-h-[300px]"
                >
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6 animate-bounce">
                    <CheckCircle size={28} />
                  </div>
                  <h3 className="text-lg font-extrabold uppercase text-emerald-800 mb-2">
                    {lang === 'AR' ? 'تم الإرسال بنجاح!' : lang === 'FR' ? 'Message Envoyé !' : 'Message Sent!'}
                  </h3>
                  <p className="text-xs text-emerald-600 font-semibold max-w-xs leading-relaxed">
                    {lang === 'AR' 
                      ? 'شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.' 
                      : lang === 'FR' 
                      ? 'Merci de nous avoir contactés. Notre équipe vous répondra très rapidement.' 
                      : 'Thank you for reaching out. Our team will get back to you shortly.'}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.contactName}</label>
                    <input 
                      type="text" 
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all font-semibold text-xs" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.contactEmail}</label>
                    <input 
                      type="email" 
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all font-semibold text-xs" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.contactMsg}</label>
                    <textarea 
                      rows={4} 
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all font-semibold text-xs resize-none" 
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmittingContact}
                    className="btn-premium w-full !py-4.5 flex items-center justify-center gap-2.5 uppercase text-[10px] tracking-[0.2em] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingContact ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {t.contactBtn}
                        <Send size={15} className={isRTL ? 'rotate-180' : ''} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

          </div>
        </div>
      </section>

      {/* App Download Screen Mockup */}
      <section id="application" className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-50/70 border border-slate-100/70 rounded-[3rem] p-12 lg:p-20 flex flex-col md:flex-row items-center justify-between gap-16 overflow-hidden relative shadow-sm">
            <div className={`md:w-1/2 space-y-8 relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className="text-4xl lg:text-6xl font-bold text-slate-850 tracking-tighter leading-[0.95] font-gilmer uppercase italic">
                {t.appTitle.split(' ')[0]} <span className="text-primary">{t.appTitle.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-slate-400 text-md leading-relaxed font-semibold max-w-md">{t.appDesc}</p>
              
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-3.5 bg-white border border-slate-100 text-slate-700 px-6 py-3.5 rounded-2xl font-extrabold hover:scale-103 hover:shadow-md transition-all">
                  <Apple size={24} />
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase">{t.download}</p>
                    <p className="text-md leading-none font-gilmer">iPhone</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3.5 bg-primary text-white px-6 py-3.5 rounded-2xl font-extrabold hover:scale-103 hover:shadow-lg hover:shadow-primary/25 transition-all">
                  <Play size={24} className="fill-white" />
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-[9px] font-black opacity-60 uppercase">{t.download}</p>
                    <p className="text-md leading-none font-gilmer">Android</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center relative">
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className="w-[260px] aspect-[9/19.5] bg-white rounded-[2.8rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden relative z-10">
                <Image src="/assets/photo_app.jpg" alt="Nadif App Screen Mockup" fill className="object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 text-slate-600 py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 text-left">
            
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                  <Image src="/logo.png" alt="Nadif Logo Small" width={22} height={22} className="brightness-0 invert" />
                </div>
                <span className="text-xl font-bold tracking-tighter uppercase text-primary">NADIF</span>
              </Link>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose max-w-xs">{t.footerDesc}</p>
              <div className="flex gap-2.5">
                {['FB', 'IG', 'TW'].map(s => (
                  <Link key={s} href="#" className="w-9 h-9 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-[10px] font-black text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">{s}</Link>
                ))}
              </div>
            </div>

            {t.nav.slice(0, 3).map((title, i) => (
              <div key={i} className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{title}</h4>
                <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t.footerLinks.map(link => (
                    <li key={link}><Link href="#" className="hover:text-primary transition-colors duration-200">{link}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.45em] text-slate-400">&copy; 2026 NADIF PRESSING.</p>
            <div className="flex gap-10 text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-450">
              <span>{t.location}</span>
              <a href="tel:+213555123456" className="hover:text-primary transition-all">+213 555 123 456</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
