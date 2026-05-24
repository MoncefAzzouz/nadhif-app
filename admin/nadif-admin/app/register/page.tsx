'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, Phone, Zap, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="h-screen w-full bg-white font-gilmer overflow-hidden selection:bg-primary selection:text-white flex flex-col lg:flex-row">
      
      {/* LEFT SIDE: The Immersive Visual Studio (50%) */}
      <div className="hidden lg:flex w-1/2 h-full bg-[#0066FF] relative items-center justify-center overflow-hidden">
        {/* Animated Background Textures */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[1000px] h-[1000px] bg-white/10 rounded-full blur-[200px] animate-pulse" />
        
        {/* THE PICTURE - Optimized Position & Shape ("Chep") */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-12 translate-y-10">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
             {/* Removed circular background, applied curve directly to image container */}
             <div className="relative group rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.3)] border-4 border-white/10">
                {/* The 3D Illustration - Rounded & Compact */}
                <div className="relative z-20 group-hover:scale-105 transition-transform duration-1000">
                   <Image 
                     src="/hero-3d.png" 
                     alt="Nadif Elite" 
                     width={350} 
                     height={350} 
                     className="w-full h-auto object-cover"
                   />
                </div>
             </div>
             
             {/* Refined Ground Shadow underneath the curved image */}
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/40 blur-[40px] rounded-[100%] z-10" />
          </motion.div>

          <div className="text-center space-y-4">
             <h2 className="text-white text-5xl font-black uppercase tracking-tighter leading-none italic">
                Join The <br /> <span className="opacity-40">Elite Circle.</span>
             </h2>
             <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.4em]">Nadif Premium Cleaning Services</p>
          </div>
        </div>

        {/* Brand Logo Overlay - Safely above the content */}
        <Link href="/" className="absolute top-12 left-12 flex items-center gap-3 z-50">
          <div className="bg-white p-2 rounded-xl shadow-2xl">
            <Image src="/logo.png" alt="Nadif" width={24} height={24} />
          </div>
          <span className="text-white text-xl font-black tracking-tighter uppercase">NADIF</span>
        </Link>
      </div>

      {/* RIGHT SIDE: The Minimalist Studio Form (50%) */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center relative bg-white overflow-y-auto lg:overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[540px] px-8 py-12 space-y-10"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <ShieldCheck size={14} className="text-primary fill-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">New Account</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground-nadif uppercase italic leading-none">
               Create <br /> <span className="text-primary">Identity.</span>
            </h1>
          </div>

          {/* Form */}
          <form className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-foreground-nadif/30 uppercase tracking-[0.3em] ml-2">Full Name</label>
                   <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                      <input type="text" placeholder="John Doe" className="w-full pl-16 pr-8 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-foreground-nadif" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-foreground-nadif/30 uppercase tracking-[0.3em] ml-2">Phone</label>
                   <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                      <input type="tel" placeholder="+213..." className="w-full pl-16 pr-8 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-foreground-nadif" />
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground-nadif/30 uppercase tracking-[0.3em] ml-2">Email Access</label>
                <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                   <input type="email" placeholder="you@example.com" className="w-full pl-16 pr-8 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-foreground-nadif" />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-foreground-nadif/30 uppercase tracking-[0.3em] ml-2">Secure Password</label>
                <div className="relative group">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                   <input type="password" placeholder="••••••••" className="w-full pl-16 pr-8 py-4 bg-gray-50/50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-foreground-nadif" />
                </div>
             </div>

             <div className="flex items-start gap-4 px-4 py-2 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary/20 mt-1" />
                <p className="text-[9px] font-black text-foreground-nadif/30 uppercase tracking-[0.2em] leading-relaxed">
                   I agree to the <Link href="#" className="text-primary hover:underline">Terms</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link> of Nadif Premium Services.
                </p>
             </div>

             <button className="w-full py-6 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                Create My Account
                <ArrowRight size={20} />
             </button>
          </form>

          <div className="pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
             <p className="text-[10px] font-bold text-foreground-nadif/30 uppercase tracking-[0.2em]">
                Already have an account? <Link href="/login" className="text-primary hover:underline ml-1">Sign In</Link>
             </p>
          </div>
        </motion.div>

        {/* Page Footer Link */}
        <div className="absolute bottom-10 text-[8px] font-black uppercase tracking-[0.6em] text-foreground-nadif/10">
           NADIF &copy; 2026 — ALGERIA
        </div>
      </div>
    </div>
  );
}
