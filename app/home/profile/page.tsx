import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import ProfileClient from './profile-client';

export const instant = false;

export default async function ProfilePage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, account_number, account_last_four, status, created_at')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const { data: voucher } = await supabase
    .from('vouchers')
    .select('voucher_number, current_balance, status, expires_at')
    .eq('customer_id', profile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ backgroundColor: '#0A1F44' }}
      >
        <div className="w-full px-4 py-4 relative flex items-center justify-between">
          <Link
            href="/home"
            className="text-sm text-white/80 hover:text-white z-10"
          >
            ← Terug
          </Link>
          <span
            className="absolute left-1/2 -translate-x-1/2 text-white text-2xl"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontStyle: 'italic',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            Profiel
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Content — gecentreerd */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Card met achtergrondafbeelding — bovenaan */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            backgroundImage: 'url(/card_background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative p-6 text-center">
            <div className="flex justify-center mb-3">
              <Image
                src="/Amanah_logo.png"
                alt="Amanah"
                width={120}
                height={32}
                className="h-8 w-auto"
                style={{ width: 'auto' }}
              />
            </div>
            <p className="text-lg font-bold text-white">
              {profile.full_name ?? 'Klant'}
            </p>
            <p className="text-xs text-white/80 mt-1 font-mono">
              {profile.account_number
                ? `${profile.account_number.slice(0, 6)} •••• •••• ${profile.account_last_four}`
                : '—'}
            </p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
              {profile.status === 'active' ? 'ACTIEF' : profile.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Persoonlijke gegevens — wit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#0A1F44' }}>
            Persoonlijke gegevens
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Naam</p>
              <p className="text-sm font-medium" style={{ color: '#0A1F44' }}>
                {profile.full_name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">E-mail</p>
              <p className="text-sm" style={{ color: '#0A1F44' }}>
                {profile.email ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Klant sinds</p>
              <p className="text-sm" style={{ color: '#0A1F44' }}>
                {new Date(profile.created_at).toLocaleDateString('nl-NL')}
              </p>
            </div>
          </div>
        </div>

        {/* Voucher info — wit */}
        {voucher && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#0A1F44' }}>
              Voucher
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Voucher-nummer</p>
                <p className="text-sm font-mono" style={{ color: '#0A1F44' }}>
                  {voucher.voucher_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Saldo</p>
                <p className="text-sm font-medium" style={{ color: '#0A1F44' }}>
                  {Number(voucher.current_balance).toFixed(0)} punten
                </p>
              </div>
              {voucher.expires_at && (
                <div>
                  <p className="text-xs text-slate-500">Verloopt</p>
                  <p className="text-sm" style={{ color: '#0A1F44' }}>
                    {new Date(voucher.expires_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Uitloggen */}
        <ProfileClient />
      </main>
    </div>
  );
}