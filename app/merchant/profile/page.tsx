import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '../logout-button';

export default async function MerchantProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/merchant-login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, status, created_at')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'merchant') redirect('/login');

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, status, created_at')
    .eq('profile_id', profile.id)
    .single();

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="sticky top-0 z-10"
        style={{ backgroundColor: '#0A1F44' }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/merchant"
            className="text-sm text-white/80 hover:text-white"
          >
            ← Terug
          </Link>
          <p className="text-sm font-semibold text-white">Profiel</p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#0A1F44' }}>
            Bedrijfsgegevens
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Bedrijfsnaam</p>
              <p className="text-sm font-medium" style={{ color: '#0A1F44' }}>
                {merchant?.business_name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">E-mail</p>
              <p className="text-sm" style={{ color: '#0A1F44' }}>
                {profile.email ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <p className="text-sm font-medium" style={{ color: '#0A1F44' }}>
                {merchant?.status ?? profile.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Merchant sinds</p>
              <p className="text-sm" style={{ color: '#0A1F44' }}>
                {merchant?.created_at
                  ? new Date(merchant.created_at).toLocaleDateString('nl-NL')
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        <LogoutButton />
      </main>
    </div>
  );
}