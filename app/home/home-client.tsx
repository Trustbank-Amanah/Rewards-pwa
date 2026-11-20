'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdCarousel from './ad-carousel';
import QRModal from './qr-modal';
import type { MerchantAd, Voucher } from '@/lib/types';

interface Props {
  profileName: string;
  voucher: Voucher | null;
  ads: MerchantAd[];
}

export default function HomeClient({voucher, ads }: Props) {
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
                {/* Header — donkerblauw met logo */}
          <header
            className="sticky top-0 z-10"
            style={{ backgroundColor: '#0A1F44' }}
          >
            <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between relative">
              {/* Logo links */}
            <Image
              src="/Amanah_logo.png"
              alt="Amanah"
              width={120}
              height={32}
              className="h-8 w-auto"
              style={{ width: 'auto', height: 'auto' }}
            />

              {/* "Rewards" gecentreerd */}
              <span
                className="absolute left-1/2 -translate-x-1/2 text-white text-xl"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                Rewards
              </span>

              {/* Lege div rechts om balans te houden (zelfde breedte als logo) */}
              <div className="w-16" />
            </div>
          </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        {/* Ad-carousel */}
        <AdCarousel ads={ads} />

        {/* Saldo-card */}
        {voucher ? (
          <div
            className="rounded-2xl overflow-hidden mb-4 relative"
            style={{
              backgroundImage: 'url(/card_background.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative p-6 text-center">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Mijn punten
              </p>
              <p className="text-4xl font-bold mt-1 text-white">
                {voucher.current_balance.toFixed(0)} punten
              </p>
              <p className="text-xs text-white/60 mt-3 font-mono">
                {voucher.voucher_number}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                  {voucher.status.toUpperCase()}
                </span>
                {voucher.expires_at && (
                  <span className="text-xs text-white/80">
                    Verloopt{' '}
                    {new Date(voucher.expires_at).toLocaleDateString('nl-NL')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 text-center">
            <p className="text-sm text-slate-500">Geen actieve voucher gevonden.</p>
            <p className="text-xs text-slate-400 mt-1">
              Je voucher verschijnt hier zodra de bank er een aanmaakt.
            </p>
          </div>
        )}

        {/* QR-knop */}
        <button
          onClick={() => setQrOpen(true)}
          disabled={!voucher || voucher.current_balance <= 0}
          className="w-full text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition mb-3"
          style={{ backgroundColor: '#0A1F44' }}
        >
          Toon QR aan merchant
        </button>

        {/* Twee navigatie-knoppen */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/home/transactions"
            className="bg-white text-center py-3 rounded-xl font-semibold transition hover:bg-slate-50"
            style={{ borderWidth: 1, borderColor: '#b8b2a0', color: '#0A1F44' }}
          >
            Transacties
          </Link>
          <Link
            href="/home/profile"
            className="bg-white text-center py-3 rounded-xl font-semibold transition hover:bg-slate-50"
            style={{ borderWidth: 1, borderColor: '#b8b2a0', color: '#0A1F44' }}
          >
            Profiel
          </Link>
        </div>
      </main>

      {/* QR-modal */}
      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}