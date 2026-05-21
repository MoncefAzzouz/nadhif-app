'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/categories');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center font-gilmer">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-foreground-nadif/40 animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    </div>
  );
}
