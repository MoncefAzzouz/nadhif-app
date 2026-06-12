'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Info,
  Plus,
  Trash2,
  Pencil,
  Save,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Eye,
  FileText,
  MessageSquare,
  Layers
} from 'lucide-react';
import { pagesApi, type ApiFaq as FAQItem, type ApiAboutUs as AboutUsData , type ServiceDetails } from '../../lib/api';

// Initial Seeds
const DEFAULT_FAQS: Omit<FAQItem, 'id' | 'createdAt'>[] = [
  {
    question: '🇩🇿 Comment réserver un service sur Nadhif?',
    answer: 'Sélectionnez d’abord le type de nettoyage de votre choix (Simple, Semi-Grand ou Grand Service). Renseignez ensuite la dimension de votre habitation (F2, F3, F4 ou F5) puis planifiez l’arrivée de nos agents de nettoyage via notre carte interactive.',
    order: 1
  },
  {
    question: '🛠️ Les produits et matériels sont-ils inclus?',
    answer: 'Oui ! Pour les forfaits Semi-Grand et Grand Service, Nadhif fournit l’intégralité des équipements professionnels et des produits détergents (locaux ou premium importés, selon votre sélection). Seul le forfait Simple Service offre la possibilité d’utiliser vos propres consommables.',
    order: 2
  },
  {
    question: '⏳ Puis-je annuler ou reporter une intervention?',
    answer: 'Absolument. Vous pouvez reporter ou annuler une commande planifiée sans aucun frais supplémentaire directement depuis l’application mobile jusqu’à 24 heures avant l’heure prévue de l’arrivée de nos agents.',
    order: 3
  }
];

const DEFAULT_PRIVACY = `### POLITIQUE DE CONFIDENTIALITÉ DE NADHIF ELITE

Dernière mise à jour: 17 Mai 2026

Chez Nadhif, nous accordons une importance primordiale à la protection de vos données personnelles. Cette charte détaille en toute transparence la collecte et le traitement de vos informations.

#### 1. Collecte des Données de Localisation
Pour assurer le déplacement rapide de nos agents de nettoyage qualifiés, l'application Nadhif collecte vos coordonnées géographiques (latitude et longitude précises) lorsque vous finalisez une commande. Ces coordonnées nous permettent de tracer l'itinéraire optimal.

#### 2. Informations de Contact
Nous collectons votre nom, prénom et numéro de téléphone mobile. Le numéro est indispensable pour vous notifier du statut de votre réservation ("En Attente", "Approuvée", "Complétée") ou pour vous contacter en cas de difficultés d'accès à votre domicile.

#### 3. Partage des Données
Vos données sont hébergées de manière sécurisée et ne sont sous aucun prétexte vendues ou louées à des tiers. Les coordonnées de géolocalisation sont partagées de façon temporaire uniquement avec l'équipe de nettoyage assignée à votre domicile.

#### 4. Droits de Suppression
Conformément à la réglementation sur la protection des données, vous disposez d'un droit permanent de consultation, de rectification et de suppression de votre compte et de vos données. Pour toute requête, contactez-nous directement par e-mail à l'adresse support@nadhif.com.`;

const DEFAULT_ABOUT: AboutUsData = {
  vision: 'Nadhif Elite est la plateforme de référence en Algérie pour connecter les ménages les plus exigeants avec des experts du nettoyage professionnel. Notre mission est d’apporter une hygiène irréprochable et un service de standing hôtelier directement à votre porte.',
  hotline: '+213 555 90 90 90',
  email: 'contact@nadhif.com',
  website: 'www.nadhif-elite.dz',
  facebook: 'Nadhif Elite Algérie',
  instagram: '@nadhif_elite',
  wilayaCenter: 'Sétif, Algérie'
};

export default function PagesManager() {
  const [activeTab, setActiveTab] = useState<'help' | 'privacy' | 'about' | 'subscription'>('help');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [aboutData, setAboutData] = useState<AboutUsData | null>(null);
  // Subscription Pack mobile-details content (shown on the app's subscription page)
  const emptySubDetails: ServiceDetails = {
    objective: '', objectiveFr: '', objectiveAr: '',
    includes: [], includesFr: [], includesAr: [],
    durationText: '', durationTextFr: '', durationTextAr: '',
    additional: '', additionalFr: '', additionalAr: '',
  };
  const [subDetails, setSubDetails] = useState<ServiceDetails>(emptySubDetails);
  const [isLoaded, setIsLoaded] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Phone Preview states
  const [phoneFaqExpanded, setPhoneFaqExpanded] = useState<string | null>(null);

  // CMS forms
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', order: 1 });
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingFaqData, setEditingFaqData] = useState({ question: '', answer: '', order: 1 });

  // Load from Backend API
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Fetch FAQs
        let faqsList = await pagesApi.faqs.getAll();
        if (faqsList.length === 0) {
          // If database has no FAQs, seed them!
          const seededFaqs: FAQItem[] = [];
          for (const item of DEFAULT_FAQS) {
            const created = await pagesApi.faqs.create({
              question: item.question,
              answer: item.answer,
              order: item.order
            });
            seededFaqs.push(created);
          }
          faqsList = seededFaqs;
        }
        setFaqs(faqsList.sort((a, b) => a.order - b.order));

        // Fetch Privacy Policy
        const privacyRes = await pagesApi.privacy.get();
        let privacyText = privacyRes.privacyPolicy;
        if (!privacyText) {
          // Seed default privacy policy
          const committed = await pagesApi.privacy.update(DEFAULT_PRIVACY);
          privacyText = committed.privacyPolicy;
        }
        setPrivacyPolicy(privacyText);

        // Fetch About Us
        let about = await pagesApi.about.get();
        if (!about) {
          // Seed default about us settings
          about = await pagesApi.about.update(DEFAULT_ABOUT);
        }
        setAboutData(about);

        // Fetch Subscription Pack details (may be empty until first save)
        const sub = await pagesApi.subscriptionDetails.get();
        if (sub) setSubDetails({ ...emptySubDetails, ...sub });

      } catch (err) {
        console.error('Failed to load page configurations from backend: ', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadContent();
  }, []);

  // FAQ handlers
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;

    try {
      const created = await pagesApi.faqs.create({
        question: newFaq.question,
        answer: newFaq.answer,
        order: Number(newFaq.order)
      });
      setFaqs(prev => [...prev, created].sort((a, b) => a.order - b.order));
      setNewFaq({ question: '', answer: '', order: faqs.length + 2 });
      triggerToast("✨ FAQ Question added to Centre d'aide!");
    } catch (err: any) {
      alert('Failed to save FAQ: ' + (err.message || err));
    }
  };

  const handleEditFaq = (faq: FAQItem) => {
    setEditingFaqId(faq.id);
    setEditingFaqData({ question: faq.question, answer: faq.answer, order: faq.order });
  };

  const handleSaveFaqEdit = async (id: string) => {
    try {
      const updatedItem = await pagesApi.faqs.update(id, {
        question: editingFaqData.question,
        answer: editingFaqData.answer,
        order: Number(editingFaqData.order)
      });
      setFaqs(prev => prev.map(f => f.id === id ? updatedItem : f).sort((a, b) => a.order - b.order));
      setEditingFaqId(null);
      triggerToast("✏️ FAQ item modified successfully!");
    } catch (err: any) {
      alert('Failed to save FAQ edits: ' + (err.message || err));
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await pagesApi.faqs.delete(id);
      setFaqs(prev => prev.filter(f => f.id !== id).map((f, idx) => ({ ...f, order: idx + 1 })));
      triggerToast("🗑️ FAQ item deleted from Help Center!");
    } catch (err: any) {
      alert('Failed to delete FAQ: ' + (err.message || err));
    }
  };

  // Save Privacy Policy text
  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await pagesApi.privacy.update(privacyPolicy);
      setPrivacyPolicy(res.privacyPolicy);
      triggerToast("💾 Privacy Policy document saved successfully!");
    } catch (err: any) {
      alert('Failed to save Privacy Policy: ' + (err.message || err));
    }
  };

  // Save About Us settings
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aboutData) {
      try {
        const updated = await pagesApi.about.update(aboutData);
        setAboutData(updated);
        triggerToast("🏢 Company Profile & About settings updated!");
      } catch (err: any) {
        alert('Failed to save Company profile: ' + (err.message || err));
      }
    }
  };

  // Save Subscription Pack details
  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await pagesApi.subscriptionDetails.update(subDetails);
      setSubDetails({ ...emptySubDetails, ...updated });
      triggerToast("📦 Subscription Pack details updated!");
    } catch (err: any) {
      alert('Failed to save Subscription details: ' + (err.message || err));
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto animate-fadeIn relative">
      {/* Alert toast notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-emerald-900/10 flex items-center gap-3 font-bold text-xs uppercase tracking-wider"
          >
            <CheckCircle size={16} />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Area */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <BookOpen size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Content Control Suite</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
          Mobile <span className="text-primary">Pages</span> Manager
        </h1>
        <p className="text-sm text-slate-400 font-medium font-inter">
          Edit and build content for mobile menus: FAQ Center, Privacy Guidelines, and Company contacts with a live interactive phone display!
        </p>
      </div>

      {/* Tab Menu selection */}
      <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-full max-w-md border border-slate-100">
        {[
          { id: 'help', label: "Centre d'aide", icon: HelpCircle },
          { id: 'privacy', label: "Confidentialité", icon: ShieldAlert },
          { id: 'about', label: "À propos de Nadhif", icon: Info },
          { id: 'subscription', label: "Pack Abonnement", icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                  ? 'bg-white text-slate-800 shadow-md shadow-slate-200 border border-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading state indicator */}
      {!isLoaded ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        /* 2. Main Studio editor Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Editing CMS Panel (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm min-h-[50vh] flex flex-col justify-between">
            <AnimatePresence mode="wait">

              {/* T1: CENTRE D'AIDE (FAQs) EDITOR */}
              {activeTab === 'help' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                  key="help-tab"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                      <HelpCircle size={18} className="text-primary" />
                      Centre d'aide (FAQ List)
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter mt-1">
                      Manage common mobile clients FAQs. Order rankings control which questions are loaded at the top.
                    </p>
                  </div>

                  {/* FAQ List table */}
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="border border-slate-100 bg-slate-50/50 p-4.5 rounded-2xl space-y-2 hover:border-slate-200 transition-colors"
                      >
                        {editingFaqId === faq.id ? (
                          /* Editing Sub Form */
                          <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-2">
                              <input
                                type="text"
                                value={editingFaqData.question}
                                onChange={(e) => setEditingFaqData({ ...editingFaqData, question: e.target.value })}
                                className="col-span-3 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-primary/20 outline-none"
                                placeholder="Edit question..."
                              />
                              <input
                                type="number"
                                value={editingFaqData.order}
                                onChange={(e) => setEditingFaqData({ ...editingFaqData, order: parseInt(e.target.value) })}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-primary/20 outline-none text-center"
                                placeholder="Rank"
                                min="1"
                              />
                            </div>
                            <textarea
                              rows={3}
                              value={editingFaqData.answer}
                              onChange={(e) => setEditingFaqData({ ...editingFaqData, answer: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-primary/20 outline-none resize-none font-inter"
                              placeholder="Edit answer..."
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingFaqId(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveFaqEdit(faq.id)}
                                className="px-4 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Read Only View */
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 flex-1">
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                Rank #{faq.order} • {faq.question}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-semibold font-inter leading-relaxed line-clamp-2">
                                {faq.answer}
                              </p>
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditFaq(faq)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-slate-500 hover:text-amber-500 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Pencil size={11} />
                              </button>
                              <button
                                onClick={() => handleDeleteFaq(faq.id)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-rose-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Add New FAQ Form Panel */}
                  <form onSubmit={handleAddFaq} className="space-y-4 pt-2">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      Add New FAQ Question
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Question Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 🇩🇿 Quels sont vos horaires de service?"
                          value={newFaq.question}
                          onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Display Order</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={newFaq.order}
                          onChange={(e) => setNewFaq({ ...newFaq, order: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all text-center"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Detailed Answer Description</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Write clean, direct answers for clients..."
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Insert FAQ Question
                    </button>
                  </form>
                </motion.div>
              )}

              {/* T2: POLITIQUE DE CONFIDENTIALITE EDITOR */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 flex-1 flex flex-col justify-between"
                  key="privacy-tab"
                >
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-primary" />
                        Politique de Confidentialité
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold font-inter mt-1">
                        Write legal privacy clauses. Use markdown headings (`###`) and bullet points to render structure inside client screens.
                      </p>
                    </div>

                    {/* Privacy Text Editor */}
                    <form onSubmit={handleSavePrivacy} className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Document Body (Markdown & Plain Text)</label>
                        <textarea
                          rows={16}
                          value={privacyPolicy}
                          onChange={(e) => setPrivacyPolicy(e.target.value)}
                          className="w-full px-4 py-4.5 bg-slate-50 border border-transparent rounded-3xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-mono leading-relaxed"
                          placeholder="Paste legal policy coordinates here..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save size={14} />
                        Commit Privacy Guidelines
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* T3: A PROPOS DE NADHIF (COMPANY PROFILE) */}
              {activeTab === 'about' && aboutData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                  key="about-tab"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                      <Info size={18} className="text-primary" />
                      À propos de Nadhif (Profile Data)
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter mt-1">
                      Edit corporate coordinates, social links, customer care hotlines, and company visions.
                    </p>
                  </div>

                  {/* About settings form */}
                  <form onSubmit={handleSaveAbout} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Vision Statement */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Company Vision & Pitch (About Text)</label>
                        <textarea
                          rows={4}
                          value={aboutData.vision}
                          onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter leading-relaxed"
                        />
                      </div>

                      {/* Support Hotline */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Support hotline (Phone)</label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={aboutData.hotline}
                            onChange={(e) => setAboutData({ ...aboutData, hotline: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                          />
                          <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      {/* Support Email */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Support Inquiries Email</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={aboutData.email}
                            onChange={(e) => setAboutData({ ...aboutData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                          />
                          <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Company Website URL</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={aboutData.website}
                            onChange={(e) => setAboutData({ ...aboutData, website: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                          />
                          <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      {/* Wilaya Center */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Central HQ Location</label>
                        <input
                          type="text"
                          value={aboutData.wilayaCenter}
                          onChange={(e) => setAboutData({ ...aboutData, wilayaCenter: e.target.value })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Social Facebook */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Facebook Page Link</label>
                        <input
                          type="text"
                          value={aboutData.facebook}
                          onChange={(e) => setAboutData({ ...aboutData, facebook: e.target.value })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Social Instagram */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Instagram Username</label>
                        <input
                          type="text"
                          value={aboutData.instagram}
                          onChange={(e) => setAboutData({ ...aboutData, instagram: e.target.value })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save size={14} />
                      Update Profile Parameters
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/50"
                >
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-1">Subscription Pack — Mobile Details</h3>
                  <p className="text-[10px] font-bold text-slate-400 mb-6">Content shown on the app's subscription description page (Objective, Includes, Duration, Additional).</p>
                  <form onSubmit={handleSaveSubscription} className="space-y-5">
                    {([
                      { label: 'Objective', en: 'objective', fr: 'objectiveFr', ar: 'objectiveAr', rows: 2, list: false },
                      { label: 'Includes (one per line)', en: 'includes', fr: 'includesFr', ar: 'includesAr', rows: 4, list: true },
                      { label: 'Duration Text', en: 'durationText', fr: 'durationTextFr', ar: 'durationTextAr', rows: 1, list: false },
                      { label: 'Additional Info', en: 'additional', fr: 'additionalFr', ar: 'additionalAr', rows: 2, list: false },
                    ] as const).map(group => {
                      const read = (k: keyof ServiceDetails) => {
                        const v = subDetails[k];
                        return Array.isArray(v) ? v.join('\n') : (v || '');
                      };
                      const write = (k: keyof ServiceDetails, val: string) =>
                        setSubDetails(prev => ({
                          ...prev,
                          [k]: group.list ? val.split('\n') : val,
                        }));
                      return (
                        <div key={group.en} className="space-y-2">
                          <label className="block text-[9px] font-black uppercase text-slate-400">{group.label}</label>
                          <textarea
                            rows={group.rows}
                            value={read(group.en)}
                            onChange={(e) => write(group.en, e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <textarea
                              rows={group.rows}
                              placeholder="Français (optionnel)"
                              value={read(group.fr)}
                              onChange={(e) => write(group.fr, e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-[11px] font-bold text-slate-700 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none"
                            />
                            <textarea
                              rows={group.rows}
                              dir="rtl"
                              placeholder="العربية (اختياري)"
                              value={read(group.ar)}
                              onChange={(e) => write(group.ar, e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-[11px] font-bold text-slate-700 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none text-right"
                            />
                          </div>
                        </div>
                      );
                    })}
                    <button
                      type="submit"
                      className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save size={14} />
                      Save Subscription Details
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] bg-slate-900 rounded-[3.5rem] p-4.5 shadow-2xl border-4 border-slate-800 relative z-10 overflow-hidden aspect-[9/18]">

              {/* Smartphone Display Container */}
              <div className="w-full h-full bg-slate-50 rounded-[2.75rem] relative overflow-hidden flex flex-col justify-between z-0">

                {/* App Status Header bar */}
                <div className="bg-slate-950 text-white px-6 py-2 flex justify-between items-center text-[10px] font-black z-20 font-inter">
                  <span>09:41</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">Nadif Elite App</span>
                  <div className="w-4.5 h-2 bg-white/20 rounded-sm relative" />
                </div>

                {/* Dynamic App Pages View */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  <AnimatePresence mode="wait">

                    {/* MOBILE VIEWPORT T1: CENTRE D'AIDE */}
                    {activeTab === 'help' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                        key="phone-help"
                      >
                        <div className="text-center space-y-1">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Centre d'aide</h3>
                          <p className="text-[8px] text-slate-400 font-bold font-inter">Foire Aux Questions (FAQ)</p>
                        </div>

                        {/* Accordions FAQs */}
                        <div className="space-y-2">
                          {faqs.length === 0 ? (
                            <p className="text-center text-[9px] text-slate-400 font-bold py-6">Aucune question configurée.</p>
                          ) : (
                            faqs.map((faq) => {
                              const isExpanded = phoneFaqExpanded === faq.id;
                              return (
                                <div
                                  key={faq.id}
                                  onClick={() => setPhoneFaqExpanded(isExpanded ? null : faq.id)}
                                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50/50 transition-colors space-y-2"
                                >
                                  <div className="flex justify-between items-center gap-2">
                                    <h4 className="text-[10px] font-black text-slate-700 leading-snug">
                                      {faq.question}
                                    </h4>
                                    <div className="text-primary shrink-0">
                                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <p className="text-[9px] font-medium leading-relaxed text-slate-500 font-inter border-t border-slate-50 pt-2 animate-fadeIn">
                                      {faq.answer}
                                    </p>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* MOBILE VIEWPORT T2: PRIVACY POLICY */}
                    {activeTab === 'privacy' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 text-slate-700"
                        key="phone-privacy"
                      >
                        <div className="text-center space-y-1">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Confidentialité</h3>
                          <p className="text-[8px] text-slate-400 font-bold font-inter">Mentions Légales & RGPD</p>
                        </div>

                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-[9px] leading-relaxed font-inter font-semibold space-y-2 font-medium">
                          {privacyPolicy.split('\n').map((line, idx) => {
                            if (line.startsWith('###')) {
                              return <h4 key={idx} className="text-[10px] font-black text-slate-900 pt-2 uppercase font-gilmer">{line.replace('###', '')}</h4>;
                            }
                            if (line.startsWith('####')) {
                              return <h5 key={idx} className="text-[9.5px] font-black text-primary pt-2 uppercase font-gilmer">{line.replace('####', '')}</h5>;
                            }
                            if (line.trim() === '') return <div key={idx} className="h-1" />;
                            return <p key={idx} className="text-slate-500">{line}</p>;
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* MOBILE VIEWPORT T3: ABOUT NADHIF */}
                    {activeTab === 'about' && aboutData && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                        key="phone-about"
                      >
                        {/* Logo header */}
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
                            <BookOpen size={20} />
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Nadhif Elite</h3>
                            <p className="text-[8px] text-slate-400 font-bold font-inter uppercase tracking-widest">{aboutData.wilayaCenter}</p>
                          </div>
                        </div>

                        {/* Vision card */}
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-center">
                          <span className="text-[8px] font-black uppercase text-primary tracking-widest">Notre Vision</span>
                          <p className="text-[9px] font-medium leading-relaxed text-slate-500 font-inter">
                            "{aboutData.vision}"
                          </p>
                        </div>

                        {/* Contact items */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block ml-1">Support Inquiries</span>

                          {/* Dial shortcut */}
                          <a
                            href={`tel:${aboutData.hotline}`}
                            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="w-7 h-7 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                              <Phone size={12} className="fill-current" />
                            </div>
                            <div className="text-left font-inter font-bold">
                              <span className="text-[8px] text-slate-400 block font-bold">Appel Téléphonique Hotline</span>
                              <span className="text-[9.5px] text-slate-800 block font-black font-mono">{aboutData.hotline}</span>
                            </div>
                          </a>

                          {/* Email shortcut */}
                          <a
                            href={`mailto:${aboutData.email}`}
                            className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="w-7 h-7 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                              <Mail size={12} />
                            </div>
                            <div className="text-left font-inter font-bold">
                              <span className="text-[8px] text-slate-400 block font-bold">Assistance par Email</span>
                              <span className="text-[9.5px] text-slate-800 block font-black font-mono">{aboutData.email}</span>
                            </div>
                          </a>

                          {/* Social shortcut */}
                          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className="w-7 h-7 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
                              <Globe size={12} />
                            </div>
                            <div className="text-left font-inter font-bold">
                              <span className="text-[8px] text-slate-400 block font-bold">Instag. Profile</span>
                              <span className="text-[9.5px] text-slate-800 block font-black">{aboutData.instagram}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* iPhone bottom pill bar */}
                <div className="py-2.5 flex justify-center bg-slate-900 border-t border-slate-950">
                  <div className="w-20 h-1 bg-white/20 rounded-full" />
                </div>

              </div>

              {/* Phone Speaker Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-1 bg-slate-800 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-950 border-2 border-slate-900 rounded-full ml-3" />
              </div>

            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mt-4">
              Interactive Phone Preview
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
