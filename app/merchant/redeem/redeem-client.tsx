'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface RedeemSuccess {
  transaction_id: string;
  reference: string;
  amount: number;
  new_balance: number;
  currency: string;
}

interface Props {
  sessionId: string;
  voucherNumber: string;
  balance: number;
  currency: string;
  customerName: string;
}

export default function RedeemClient({
  sessionId,
  voucherNumber,
  balance,
  customerName,
}: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [qrUsed, setQrUsed] = useState(false);

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const isValid = parsedAmount > 0 && parsedAmount <= balance && !qrUsed;

  async function handleConfirm() {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    setBanner(null);

    try {
      const res = await fetch('/api/merchant/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, amount: parsedAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const success = data as RedeemSuccess;

      // Toon bevestigingsbalk
      setBanner(`${success.amount.toFixed(0)} punten afgeschreven`);

      // QR is nu gebruikt — kan niet opnieuw
      setQrUsed(true);
      setAmount('');

      // Refresh dashboard-data in de achtergrond
      router.refresh();

      // Verberg banner na 2 seconden
      setTimeout(() => setBanner(null), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Onbekende fout';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="sticky top-0 z-10"
        style={{ backgroundColor: '#0A1F44' }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-white/80 hover:text-white"
          >
            ← Terug
          </button>
          <p className="text-sm font-semibold text-white">Punten inwisselen</p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* Groene bevestigingsbalk */}
        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: '#E6F4EE', color: '#1B8A5A' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{banner}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Klant-info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 space-y-2">
          <p className="text-xs text-slate-500">Voucher</p>
          <p className="font-mono text-sm" style={{ color: '#0A1F44' }}>
            {voucherNumber}
          </p>
          <p className="text-xs text-slate-500 mt-3">Klant</p>
          <p className="text-sm font-medium" style={{ color: '#0A1F44' }}>
            {customerName}
          </p>
          <p className="text-xs text-slate-500 mt-3">Beschikbaar saldo</p>
          <p className="text-2xl font-bold" style={{ color: '#0A1F44' }}>
            {balance.toFixed(0)} punten
          </p>
        </div>

        {/* Fout-melding */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR al gebruikt */}
        {qrUsed ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
            <p className="text-sm font-medium mb-1" style={{ color: '#0A1F44' }}>
              Deze QR is al gebruikt
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Vraag de klant een nieuwe QR te genereren.
            </p>
            <button
              onClick={() => router.push('/merchant')}
              className="w-full text-white py-3 rounded-lg font-semibold"
              style={{ backgroundColor: '#0A1F44' }}
            >
              Terug naar dashboard
            </button>
          </div>
        ) : (
          <>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#0A1F44' }}
            >
              Bedrag om in te wisselen
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              disabled={loading}
              className="w-full px-4 py-4 border border-slate-300 rounded-xl text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 mb-2 disabled:bg-slate-100"
            />
            {parsedAmount > balance && (
              <p className="text-sm text-red-600 mb-2">
                Onvoldoende saldo. Maximaal {balance.toFixed(0)} punten.
              </p>
            )}
            <p className="text-xs text-slate-500 mb-6">
              Na bevestiging wordt dit bedrag afgeschreven van de klant.
            </p>

            <button
              onClick={handleConfirm}
              disabled={!isValid || loading}
              className="w-full text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ backgroundColor: '#0A1F44' }}
            >
              {loading ? 'Bezig...' : `Bevestig ${parsedAmount.toFixed(0)} punten`}
            </button>

            <Link
              href="/merchant"
              className="block w-full text-center mt-3 text-sm text-slate-500 hover:text-slate-700"
            >
              Annuleer
            </Link>
          </>
        )}
      </main>
    </div>
  );
}