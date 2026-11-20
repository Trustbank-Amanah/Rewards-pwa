import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function MerchantTransactions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/merchant-login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'merchant') redirect('/login');

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  const { data: txns } = await supabase
    .from('transactions')
    .select('id, amount, currency, reference, status, created_at, customer_id')
    .eq('merchant_id', merchant?.id)
    .order('created_at', { ascending: false });

  // Groepeer per maand
  const grouped: Record<string, typeof txns> = {};
  (txns ?? []).forEach((t) => {
    const monthKey = new Date(t.created_at).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
    });
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey]!.push(t);
  });

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
          <p className="text-sm font-semibold text-white">Transacties</p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        {!txns || txns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-500">Nog geen transacties.</p>
            <p className="text-xs text-slate-400 mt-1">
              Scan een klant-QR om je eerste punten te verdienen.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([month, items]) => (
              <div key={month}>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2 px-1">
                  {month}
                </p>
                <ul className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {items!.map((t) => (
                    <li
                      key={t.id}
                      className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: '#0A1F44' }}
                        >
                          Customer #{t.customer_id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(t.created_at).toLocaleString('nl-NL')}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate">
                          {t.reference}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-bold text-green-600">
                          +punten {Number(t.amount).toFixed(2)}
                        </p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                          {t.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}