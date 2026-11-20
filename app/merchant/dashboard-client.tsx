'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  reference: string;
  created_at: string;
  customer_ref: string;
}

interface PendingRequest {
  id: string;
  amount: number;
  status: string;
  submitted_at: string;
}

interface Props {
  businessName: string;
  balance: number;
  transactions: Transaction[];
  pendingRequests: PendingRequest[];
}

export default function DashboardClient({
  businessName,
  balance,
  transactions,
  pendingRequests,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — donkerblauw met Amanah-logo, geen logout */}
      <header
        className="sticky top-0 z-10"
        style={{ backgroundColor: '#0A1F44' }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Image
            src="/Amanah_logo.png"
            alt="Amanah"
            width={120}
            height={32}
            className="h-8 w-auto"
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className="min-w-0">
            <p className="text-xs text-white/70">Merchant</p>
            <p className="text-sm font-semibold text-white truncate">
              {businessName}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        {/* Saldo-card met achtergrondafbeelding */}
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
              Beschikbaar saldo
            </p>
            <p className="text-4xl font-bold mt-1 text-white">
              {balance.toFixed(0)} punten
            </p>
            {pendingRequests.length > 0 && (
              <p className="text-xs text-white/80 mt-2">
                {pendingRequests.length} uitbetaalverzoek(en) in behandeling
              </p>
            )}
          </div>
        </div>

        {/* Primaire actie: QR scannen */}
        <Link
          href="/merchant/scan"
          className="block w-full text-white py-3.5 rounded-xl font-semibold text-center transition mb-3"
          style={{ backgroundColor: '#0A1F44' }}
        >
          Scan klant-QR
        </Link>

        {/* Twee secundaire knoppen */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link
            href="/merchant/transactions"
            className="bg-white text-center py-3 rounded-xl font-semibold transition hover:bg-slate-50"
            style={{ borderWidth: 1, borderColor: '#b8b2a0', color: '#0A1F44' }}
          >
            Transacties
          </Link>
          <Link
            href="/merchant/profile"
            className="bg-white text-center py-3 rounded-xl font-semibold transition hover:bg-slate-50"
            style={{ borderWidth: 1, borderColor: '#b8b2a0', color: '#0A1F44' }}
          >
            Profiel
          </Link>
        </div>

        {/* Uitbetaalverzoeken in behandeling (alleen als die er zijn) */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
            <div className="p-4 border-b border-slate-100">
              <h2
                className="font-semibold text-sm"
                style={{ color: '#0A1F44' }}
              >
                Uitbetaalverzoeken in behandeling
              </h2>
            </div>
            <ul>
              {pendingRequests.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: '#0A1F44' }}
                    >
                      {r.amount.toFixed(0)} punten
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(r.submitted_at).toLocaleString('nl-NL')}
                    </p>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    {r.status.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recente transacties */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2
              className="font-semibold text-sm"
              style={{ color: '#0A1F44' }}
            >
              Recente transacties
            </h2>
            <Link
              href="/merchant/transactions"
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Alles bekijken →
            </Link>
          </div>
          {transactions.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 text-center">
              Nog geen transacties. Scan een klant-QR om te beginnen.
            </p>
          ) : (
            <ul>
              {transactions.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: '#0A1F44' }}
                    >
                      Customer #{t.customer_ref}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(t.created_at).toLocaleString('nl-NL')}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600">
                    +{t.amount.toFixed(0)} pt
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}