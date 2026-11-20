import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const instant = false;

export default async function TransactionsPage() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const { data: txnData } = await supabase
    .from('transactions')
    .select('id, amount, currency, reference, status, created_at, merchant_id')
    .eq('customer_id', profile.id)
    .order('created_at', { ascending: false });

  const merchantIds = [
    ...new Set((txnData ?? []).map((t) => t.merchant_id).filter(Boolean)),
  ];

  let merchantMap: Record<string, string> = {};
  if (merchantIds.length > 0) {
    const { data: merchants } = await supabase
      .from('merchants')
      .select('id, business_name')
      .in('id', merchantIds);

    merchantMap = Object.fromEntries(
      (merchants ?? []).map((m) => [m.id, m.business_name])
    );
  }

  const grouped: Record<string, NonNullable<typeof txnData>> = {};
  (txnData ?? []).forEach((t) => {
    const monthKey = new Date(t.created_at).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
    });
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey]!.push(t);
  });

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
            Transacties
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Content — gecentreerd, smaller */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {!txnData || txnData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-500">Nog geen transacties.</p>
            <p className="text-xs text-slate-400 mt-1">
              Je transacties verschijnen hier zodra je punten inwisselt.
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
                          {t.merchant_id
                            ? merchantMap[t.merchant_id] ?? 'Onbekende merchant'
                            : 'Trustbank Amanah'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(t.created_at).toLocaleString('nl-NL')}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate">
                          {t.reference}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-bold text-red-600">
                          -{Number(t.amount).toFixed(0)} pt
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