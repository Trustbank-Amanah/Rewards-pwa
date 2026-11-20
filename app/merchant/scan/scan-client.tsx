'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Html5QrcodeInstance {
  stop: () => Promise<void>;
  clear: () => void;
}

interface ValidateResponse {
  session_id: string;
  voucher_number: string;
  balance: number;
  currency: string;
  customer_name: string | null;
}

export default function ScanClient() {
  const router = useRouter();
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const scannerContainerId = 'qr-reader';

  async function handleToken(token: string) {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/merchant/validate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {
          // negeren
        }
      }

      const validated = data as ValidateResponse;
      const params = new URLSearchParams({
        sessionId: validated.session_id,
        voucherNumber: validated.voucher_number,
        balance: String(validated.balance),
        currency: validated.currency,
        customerName: validated.customer_name ?? 'Klant',
      });
      router.push(`/merchant/redeem?${params.toString()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Onbekende fout';
      setError(message);
      setLoading(false);
    }
  }

  async function startCamera() {
    setError(null);
    setCameraActive(true);

    const { Html5Qrcode } = await import('html5-qrcode');

    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      // Html5Qrcode heeft meer methodes dan we hier typen, dus we casten
      scannerRef.current = scanner as unknown as Html5QrcodeInstance;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleToken(decodedText),
        () => {}
      );
    } catch {
      setError(
        'Camera kon niet worden gestart. Controleer toestemmingen of voer de code handmatig in.'
      );
      setCameraActive(false);
    }
  }

  // ... rest van je component (useEffect + return) blijft ongewijzigd

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch {}
      }
    };
  }, []);

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
          <p className="text-sm font-semibold text-white">Scan klant-QR</p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {!cameraActive && (
          <button
            onClick={startCamera}
            className="w-full text-white py-3.5 rounded-xl font-semibold mb-4"
            style={{ backgroundColor: '#0A1F44' }}
          >
            Camera starten
          </button>
        )}

        {cameraActive && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 bg-black">
            <div id={scannerContainerId} className="w-full" />
          </div>
        )}

        {loading && (
          <p className="text-center text-sm text-slate-500 mb-4">Valideren...</p>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-medium mb-2" style={{ color: '#0A1F44' }}>
            Of voer de QR-code handmatig in
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Handig als de camera niet werkt of in een testomgeving.
          </p>
          <textarea
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value.trim())}
            placeholder="Plak hier de token van de klant"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 mb-3"
          />
          <button
            onClick={() => handleToken(manualToken)}
            disabled={loading || !manualToken.trim()}
            className="w-full text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#0A1F44' }}
          >
            {loading ? 'Bezig...' : 'Token valideren'}
          </button>
        </div>
      </main>
    </div>
  );
}