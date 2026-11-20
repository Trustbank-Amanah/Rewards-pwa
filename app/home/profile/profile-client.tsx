'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfileClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (!confirm('Weet je zeker dat je wilt uitloggen?')) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full bg-white py-3.5 rounded-xl font-semibold transition hover:bg-slate-50 disabled:opacity-50"
      style={{ borderWidth: 1, borderColor: '#b8b2a0', color: '#C0392B' }}
    >
      {loading ? 'Bezig...' : 'Uitloggen'}
    </button>
  );
}