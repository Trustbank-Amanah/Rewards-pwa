'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    if (!confirm('Weet je zeker dat je wilt uitloggen?')) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-white py-3.5 rounded-xl font-semibold transition hover:bg-slate-50"
      style={{ borderWidth: 1, borderColor: '#b8b2a0', color: '#C0392B' }}
    >
      Uitloggen
    </button>
  );
}