'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  Calendar,
  Clock,
  Smartphone,
  Trash2,
  Sparkles,
  CheckCircle,
  Play
} from 'lucide-react';
import { notificationsApi } from '../../lib/api';

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  targetAudience: string;
  scheduledTime: string;
  status: 'sent' | 'scheduled' | 'failed';
  createdAt: string;
  recipientCount: number;
  phone?: string;
}

// Maps the form's audience values to the backend broadcast API ones.
const AUDIENCE_MAP = {
  all_users: 'all',
  cleaners_only: 'cleaners',
  specific_client: 'phone',
} as const;

const DEFAULT_LOGS: NotificationLog[] = [
  {
    id: 'NTF-901',
    title: '🔥 Sétif Grand Launch Discount!',
    body: 'We are officially open in Sétif! Get 25% off all deep cleaning services this week using code SETIF25.',
    targetAudience: 'all_users',
    scheduledTime: 'Immediate',
    status: 'sent',
    createdAt: '2026-05-17T09:30:00Z',
    recipientCount: 840
  },
  {
    id: 'NTF-902',
    title: '🛠️ Important Update for Cleaning Partners',
    body: 'Please make sure to review updated labor price rules for Grand deep cleaning packages inside your portal.',
    targetAudience: 'cleaners_only',
    scheduledTime: 'Immediate',
    status: 'sent',
    createdAt: '2026-05-16T14:15:00Z',
    recipientCount: 120
  },
  {
    id: 'NTF-903',
    title: '⏳ Is your home ready for summer?',
    body: 'Beat the heat! Schedule our AC cleaning & airflow disinfection services now. Guaranteed completion in 4h.',
    targetAudience: 'all_users',
    scheduledTime: '2026-05-20T10:00:00Z',
    status: 'scheduled',
    createdAt: '2026-05-17T11:00:00Z',
    recipientCount: 1450
  }
];

export default function NotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Form states
  const [notificationForm, setNotificationForm] = useState({
    title: '🌟 Elite Home Maintenance Offer!',
    body: 'Get a professional sparkling clean with 4 workers. Enjoy flat rate discounts on materials today.',
    targetAudience: 'all_users' as 'all_users' | 'cleaners_only' | 'specific_client',
    specificClientPhone: '',
    deliveryType: 'now' as 'now' | 'schedule',
    scheduledDate: '',
    scheduledTime: ''
  });

  // Load logs from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('nadif_notification_logs');
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch (e) {
        setLogs(DEFAULT_LOGS);
      }
    } else {
      localStorage.setItem('nadif_notification_logs', JSON.stringify(DEFAULT_LOGS));
      setLogs(DEFAULT_LOGS);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nadif_notification_logs', JSON.stringify(logs));
    }
  }, [logs, isLoaded]);

  // Form Handler
  const handleInputChange = (key: string, val: any) => {
    setNotificationForm(prev => ({
      ...prev,
      [key]: val
    }));
  };

  // Sends a real FCM broadcast through the backend and returns the log entry.
  const dispatchBroadcast = async (
    title: string,
    body: string,
    targetAudience: 'all_users' | 'cleaners_only' | 'specific_client',
    phone?: string,
  ): Promise<NotificationLog> => {
    try {
      const result = await notificationsApi.broadcast({
        title,
        body,
        audience: AUDIENCE_MAP[targetAudience],
        phone: targetAudience === 'specific_client' ? phone : undefined,
      });
      setSuccessToast(
        `🚀 Broadcast pushed to ${result.recipients} device(s) — ${result.success} delivered!`,
      );
      return {
        id: `NTF-${Math.floor(100 + Math.random() * 900)}`,
        title,
        body,
        targetAudience,
        scheduledTime: 'Immediate',
        status: 'sent',
        createdAt: new Date().toISOString(),
        recipientCount: result.recipients,
        phone,
      };
    } catch (err: any) {
      setSuccessToast(`❌ Broadcast failed: ${err?.message || 'unknown error'}`);
      return {
        id: `NTF-${Math.floor(100 + Math.random() * 900)}`,
        title,
        body,
        targetAudience,
        scheduledTime: 'Immediate',
        status: 'failed',
        createdAt: new Date().toISOString(),
        recipientCount: 0,
        phone,
      };
    }
  };

  // Submit Broadcast
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    setIsSending(true);
    const newLog = await dispatchBroadcast(
      notificationForm.title,
      notificationForm.body,
      notificationForm.targetAudience,
      notificationForm.specificClientPhone,
    );
    setIsSending(false);

    setLogs(prev => [newLog, ...prev]);

    // Auto dismiss toast
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);

    // Reset Form only when the send succeeded (keep input on failure to retry)
    if (newLog.status !== 'failed') {
      setNotificationForm({
        title: '🌟 Elite Home Maintenance Offer!',
        body: 'Get a professional sparkling clean with 4 workers. Enjoy flat rate discounts on materials today.',
        targetAudience: 'all_users',
        specificClientPhone: '',
        deliveryType: 'now',
        scheduledDate: '',
        scheduledTime: ''
      });
    }
  };

  // Resend notification (real send through the backend)
  const handleResend = async (log: NotificationLog) => {
    if (isSending) return;
    if (log.targetAudience === 'specific_client' && !log.phone) {
      setSuccessToast('❌ Cannot resend: client phone not stored on this entry. Send it again from the form.');
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }
    setIsSending(true);
    const resubmittedLog = await dispatchBroadcast(
      log.title,
      log.body,
      log.targetAudience as 'all_users' | 'cleaners_only' | 'specific_client',
      log.phone,
    );
    setIsSending(false);
    setLogs(prev => [resubmittedLog, ...prev]);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Delete notification log
  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto animate-fadeIn relative">
      {/* Dynamic Alert Banner */}
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
          <Bell size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Push Broadcast Console</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
          Push <span className="text-primary">Notifications</span> Studio
        </h1>
        <p className="text-sm text-slate-400 font-medium font-inter">
          Compose beautiful push notifications, select target audiences, configure timing schedules, and inspect dynamic previews on a virtual screen.
        </p>
      </div>

      {/* 2. Form & Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Composer Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Send size={18} className="text-primary" />
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
              Notification Composer
            </h2>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Audience */}
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Target Audience</label>
                <div className="relative">
                  <select
                    value={notificationForm.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="all_users">All Registered Clients</option>
                    
                    <option value="specific_client">Specific Client Direct Message</option>
                  </select>
                  <Users size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>

              {/* Target Phone Input based on specific audience */}
              {notificationForm.targetAudience === 'specific_client' && (
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Client Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0555667788"
                    value={notificationForm.specificClientPhone}
                    onChange={(e) => handleInputChange('specificClientPhone', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-mono"
                  />
                </div>
              )}

              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Notification Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🔥 Ramadan Deep Clean special!"
                  value={notificationForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                />
              </div>

              {/* Message Body */}
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Notification Body Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the message body details that clients will tap to unlock..."
                  value={notificationForm.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                />
              </div>
            </div>

            {/* Action dispatch */}
            <button
              type="submit"
              className="w-full py-4.5 bg-primary hover:bg-primary/95 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-xl shadow-primary/15 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >

              <Send size={14} />
              Dispatch Live Broadcast
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Mobile Simulator Mock (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-slate-900 rounded-[3.5rem] p-4.5 shadow-2xl border-4 border-slate-800 relative z-10 overflow-hidden aspect-[9/18]">

            {/* Smartphone Display */}
            <div className="w-full h-full bg-slate-950 rounded-[2.75rem] relative overflow-hidden flex flex-col justify-between p-6">
              {/* Smartphone lockscreen wallpaper */}
              <div
                className="absolute inset-0 bg-cover bg-center brightness-[0.45] z-0 blur-[2px]"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80')` }}
              />

              {/* Status Header */}
              <div className="flex justify-between items-center relative z-10 text-white/95 font-inter text-[10px] font-black pt-1">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-2.5 bg-white/20 border border-white/20 rounded-sm relative overflow-hidden">
                    <div className="w-2.5 h-full bg-white rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Dynamic Notification lockscreen Card */}
              <div className="flex-1 flex flex-col justify-start pt-16 relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  key={notificationForm.title + notificationForm.body}
                  className="w-full bg-white/95 backdrop-blur-md p-4.5 rounded-3xl shadow-xl border border-white/20 space-y-2.5"
                >
                  {/* Notification App Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                        <Bell size={10} className="text-white fill-current" />
                      </div>
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Nadif App</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 font-inter">Now</span>
                  </div>

                  {/* Notification details */}
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-slate-900 tracking-tight leading-tight">
                      {notificationForm.title || "Voucher Title Preview"}
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-600 leading-normal font-inter line-clamp-3">
                      {notificationForm.body || "Voucher descriptive message body."}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Lockscreen bottom bar */}
              <div className="flex justify-between items-center relative z-10 pb-2">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs">
                  🔦
                </div>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs">
                  📷
                </div>
              </div>
            </div>

            {/* Phone Speaker Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-950 border-2 border-slate-900 rounded-full ml-3" />
            </div>

          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mt-4">
            Push Notification Simulator
          </span>
        </div>
      </div>

      {/* 3. Dispatch History Log */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
              Notification Dispatch History
            </h2>
          </div>
          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">
            {logs.length} Campaigns Logged
          </span>
        </div>

        {!isLoaded ? (
          <div className="min-h-[20vh] flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-wider">
            No push campaigns sent yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  <th className="pb-4 pl-4">Campaign Title</th>
                  <th className="pb-4">Target Audience</th>
                  <th className="pb-4">Audience Reach</th>
                  <th className="pb-4">Dispatch Status</th>
                  <th className="pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors font-semibold">
                    {/* Title & Body preview */}
                    <td className="py-4 pl-4 max-w-[350px]">
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-800 line-clamp-1">{log.title}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 font-inter font-bold">{log.body}</p>
                      </div>
                    </td>

                    {/* Target Audience */}
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase ${log.targetAudience === 'all_users'
                          ? 'bg-blue-50 text-blue-600'
                          : log.targetAudience === 'cleaners_only'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                        {log.targetAudience === 'all_users' && 'Clients'}
                        {log.targetAudience === 'cleaners_only' && 'Cleaners'}
                        {log.targetAudience === 'specific_client' && 'Direct'}
                      </span>
                    </td>

                    {/* Recipients Count */}
                    <td className="py-4 text-xs font-inter text-slate-600 font-black">{log.recipientCount} Recip.</td>

                    {/* Status badge */}
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${log.status === 'sent' && 'bg-emerald-50 text-emerald-600'
                        } ${log.status === 'scheduled' && 'bg-amber-50 text-amber-600'
                        } ${log.status === 'failed' && 'bg-rose-50 text-rose-600'
                        }`}>
                        {log.status === 'sent' && '🟢 Sent'}
                        {log.status === 'scheduled' && '⏳ Sched.'}
                        {log.status === 'failed' && '🔴 Failed'}
                      </span>
                    </td>

                    {/* Quick Resend / Delete actions */}
                    <td className="py-4 pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleResend(log)}
                          className="w-7.5 h-7.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                          title="Resend Notification Campaign"
                        >
                          <Play size={11} className="fill-current" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="w-7.5 h-7.5 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                          title="Delete Campaign Record"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
