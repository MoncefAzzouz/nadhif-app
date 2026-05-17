'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Zap, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your Digital Identity (Email) and Access Key (Password).');
      setIsLoading(false);
      return;
    }

    // Set authenticated flag in local storage
    localStorage.setItem('nadif_admin_logged_in', 'true');

    // Simulate premium visual checking delay
    setTimeout(() => {
      setIsLoading(false);
      router.push('/admin/categories');
    }, 1200);
  };

  return (
    <div className="h-screen w-full bg-white font-gilmer overflow-hidden selection:bg-primary selection:text-white flex flex-col lg:flex-row">
      
      {/* LEFT SIDE: The Immersive Visual Studio (50%) */}
      <div className="hidden lg:flex w-1/2 h-full bg-[#0066FF] relative items-center justify-center overflow-hidden">
        {/* Animated Background Textures */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        <div className="absolute top-[-20%] left-[-20%] w-[1000px] h-[1000px] bg-white/10 rounded-full blur-[200px] animate-pulse" />
        
        {/* THE PICTURE - Optimized Position & Shape */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-12 translate-y-10">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
             <div className="relative group rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.3)] border-4 border-white/10">
                {/* The 3D Illustration */}
                <div className="relative z-20 group-hover:scale-105 transition-transform duration-1000">
                   <Image 
                     src="/login-3d.png" 
                     alt="Nadif Premium" 
                     width={350} 
                     height={350} 
                     className="w-full h-auto object-cover"
                   />
                </div>
             </div>
             
             {/* Ground Shadow */}
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/40 blur-[40px] rounded-[100%] z-10" />
          </motion.div>

          <div className="text-center space-y-4">
             <h2 className="text-white text-5xl font-black uppercase tracking-tighter leading-none italic">
                Experience <br /> <span className="opacity-40">The Future.</span>
             </h2>
             <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.4em]">Nadif Premium Cleaning Services</p>
          </div>
        </div>

        {/* Brand Logo Overlay */}
        <Link href="/" className="absolute top-12 left-12 flex items-center gap-3 z-50">
          <div className="bg-white p-2 rounded-xl shadow-2xl">
            <Image src="/logo.png" alt="Nadif" width={24} height={24} />
          </div>
          <span className="text-white text-xl font-black tracking-tighter uppercase">NADIF</span>
        </Link>
      </div>

      {/* RIGHT SIDE: The Minimalist Studio Form (50%) */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center relative bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[440px] px-8 py-12 space-y-12"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <Zap size={14} className="text-primary fill-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Secure Portal</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground-nadif uppercase italic leading-none">
               Welcome <br /> <span className="text-primary">Back.</span>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-8">
             {/* Error notification */}
             <AnimatePresence>
               {error && (
                 <motion.div
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="bg-rose-50 border border-rose-100 text-rose-600 px-5 py-4 rounded-2xl text-xs font-bold flex items-center gap-3"
                 >
                   <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                   <p>{error}</p>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="space-y-3">
                <label className="text-[10px] font-black text-foreground-nadif/30 uppercase tracking-[0.3em] ml-2">Digital Identity</label>
                <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                   <input 
                     type="email" 
                     placeholder="Email address"
                     value={email}
                     onChange={(e) => {
                       setEmail(e.target.value);
                       if (error) setError('');
                     }}
                     className="w-full pl-16 pr-8 py-5 bg-gray-50/50 rounded-3xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-foreground-nadif" 
                   />
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex justify-between items-center ml-2">
                   <label className="text-[10px] font-black text-foreground-nadif/30 uppercase tracking-[0.3em]">Access Key</label>
                   <Link href="#" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</Link>
                </div>
                <div className="relative group">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                   <input 
                     type={showPassword ? "text" : "password"} 
                     placeholder="Password"
                     value={password}
                     onChange={(e) => {
                       setPassword(e.target.value);
                       if (error) setError('');
                     }}
                     className="w-full pl-16 pr-14 py-5 bg-gray-50/50 rounded-3xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-foreground-nadif" 
                   />
                   <button 
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                   >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                </div>
             </div>

             <button 
               type="submit" 
               disabled={isLoading}
               className="w-full py-6 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-80 transition-all flex items-center justify-center gap-4 cursor-pointer"
             >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying Access...
                  </>
                ) : (
                  <>
                    Login to Dashboard
                    <ArrowRight size={20} />
                  </>
                )}
             </button>
          </form>

          {/* Footer of form */}
          <div className="pt-10 border-t border-gray-100 flex flex-col items-center gap-6">
             <p className="text-[10px] font-bold text-foreground-nadif/30 uppercase tracking-[0.2em]">
                Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline ml-1">Create one now</Link>
             </p>
             <div className="flex gap-10 opacity-20 text-primary">
                <ShieldCheck size={20} />
                <Zap size={20} />
             </div>
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
