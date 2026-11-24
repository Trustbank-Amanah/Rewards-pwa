'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Step = 'account' | 'last_four' | 'pin' | 'setup_pin';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('account');
  const [accountNumber, setAccountNumber] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);

  function resetError() {
    setError(null);
  }

  // Stap 1: rekeningnummer (16 cijfers, prefix 561431)
  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetError();

    if (!/^561431\d{10}$/.test(accountNumber)) {
      setError('Rekeningnummer moet 16 cijfers zijn en beginnen met 561431');
      return;
    }

    setStep('last_four');
  }

  // Stap 2: laatste 4 cijfers
  async function handleLastFourSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetError();

    if (!/^\d{4}$/.test(lastFour)) {
      setError('Voer de laatste 4 cijfers van je rekeningnummer in');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.rpc('validate_customer_account', {
      p_account_number: accountNumber,
      p_last_four: lastFour,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setCustomerName(data.full_name);
    setLoading(false);

    // Als de klant nog geen PIN heeft, vraag om setup
    if (!data.has_pin) {
      setStep('setup_pin');
    } else {
      setStep('pin');
    }
  }

  // Stap 3a: eerste keer PIN instellen
  async function handleSetupPin(e: React.FormEvent) {
    e.preventDefault();
    resetError();

    if (!/^\d{4}$/.test(pin)) {
      setError('PIN moet 4 cijfers zijn');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN en bevestiging komen niet overeen');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: setupError } = await supabase.rpc('setup_customer_pin', {
      p_account_number: accountNumber,
      p_last_four: lastFour,
      p_pin: pin,
    });

    if (setupError) {
      setError(setupError.message);
      setLoading(false);
      return;
    }

    // Na setup: log direct in
    await performLogin();
  }

  // Stap 3b: bestaande PIN verifiëren
  async function handleVerifyPin(e: React.FormEvent) {
    e.preventDefault();
    resetError();

    if (!/^\d{4}$/.test(pin)) {
      setError('PIN moet 4 cijfers zijn');
      return;
    }

    await performLogin();
  }

  // Gedeelde login-logica
  async function performLogin() {
    setLoading(true);
    setError(null);
  
    const supabase = createClient();
  
    // 1. Verifieer PIN via database (4 cijfers, dit is de echte beveiliging)
    const { error: verifyError } = await supabase.rpc('verify_customer_pin', {
      p_account_number: accountNumber,
      p_pin: pin,   // ← '1234' (4 cijfers)
    });
  
    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      setPin('');
      return;
    }
  
    // 2. Interne Supabase Auth login
    // De gebruiker typte 4 cijfers. Supabase Auth eist minimaal 6 tekens.
    // Daarom plakken we intern een vaste string achter de PIN.
    // De gebruiker ziet dit nooit.
    const internalEmail = `${accountNumber}@customer.local`;
    const internalPassword = `${pin}-customer-pwa-secret`;
  
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password: internalPassword,
    });
  
    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: internalEmail,
          password: internalPassword,
          options: {
            data: {
              role: 'customer',
              account_number: accountNumber,
            },
          },
        });
  
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
      } else {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }
  
    router.push('/home');
    router.refresh();
  }

  // UI
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Voortgangsindicator */}
      <div className="flex justify-center gap-2 mb-6">
        {(['account', 'last_four', 'pin'] as const).map((s, i) => {
          const currentIdx = step === 'setup_pin' ? 2 : (['account', 'last_four', 'pin'] as const).indexOf(step);
          const isActive = i <= currentIdx;
          return (
            <div
              key={s}
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                isActive ? 'bg-[#1A1F24]' : 'bg-[#E2DFD9]'
              }`}
            />
          );
        })}
      </div>

      {/* Klantnaam na validatie */}
      {customerName && step !== 'account' && step !== 'last_four' && (
        <p className="text-center text-sm text-slate-600 mb-4">
          Welkom, <span className="font-semibold">{customerName}</span>
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stap 1: rekeningnummer */}
      {step === 'account' && (
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rekeningnummer
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              required
              placeholder="5614311234567890"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-[#A39B8B] placeholder: text-black"
            />
            <p className="text-xs text-slate-500 mt-1">16 cijfers, begint met 561431</p>
          </div>
          <button
            type="submit"
            className="w-full bg-[#1A1F24] text-white py-3 rounded-lg font-semibold hover:bg-[#2C333A] transition"
          >
            Volgende
          </button>
        </form>
      )}

      {/* Stap 2: laatste 4 cijfers */}
      {step === 'last_four' && (
        <form onSubmit={handleLastFourSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Laatste 4 cijfers van je rekeningnummer
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={lastFour}
              onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
              placeholder="••••"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-2xl text-center font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#A39B8B]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1F24] text-white py-3 rounded-lg font-semibold hover:bg-[#2C333A] disabled:opacity-50 transition"
          >
            {loading ? 'Controleren...' : 'Volgende'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('account'); setLastFour(''); resetError(); }}
            className="w-full text-sm text-slate-500 hover:text-slate-700"
          >
            Terug
          </button>
        </form>
      )}

      {/* Stap 3a: PIN instellen (eerste keer) */}
      {step === 'setup_pin' && (
        <form onSubmit={handleSetupPin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kies een 4-cijferige PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
              placeholder="••••"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-2xl text-center font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#A39B8B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bevestig je PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
              placeholder="••••"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-2xl text-center font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#A39B8B]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1F24] text-white py-3 rounded-lg font-semibold hover:bg-[#2C333A] disabled:opacity-50 transition"
          >
            {loading ? 'Bezig...' : 'PIN instellen en inloggen'}
          </button>
        </form>
      )}

      {/* Stap 3b: PIN verifiëren */}
      {step === 'pin' && (
        <form onSubmit={handleVerifyPin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Voer je 4-cijferige PIN in
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
              placeholder="••••"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-2xl text-center font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#A39B8B]"
            />
            <p className="text-xs text-slate-500 mt-1">
              3 foutieve pogingen blokkeren je account voor 15 minuten.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1F24] text-white py-3 rounded-lg font-semibold hover:bg-[#2C333A] disabled:opacity-50 transition"
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('account'); setPin(''); setCustomerName(null); resetError(); }}
            className="w-full text-sm text-slate-500 hover:text-slate-700"
          >
            Opnieuw beginnen
          </button>
        </form>
      )}
      <div className="mt-6 text-center">
  <Link
    href="/merchant-login"
    className="text-sm text-slate-500 hover:text-slate-700"
  >
    Ben je een merchant? Log hier in →
  </Link>
</div>
    </div>
    
  );
}