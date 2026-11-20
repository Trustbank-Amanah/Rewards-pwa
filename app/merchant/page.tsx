import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './dashboard-client';

export const instant = false;


export default async function MerchantDashboard() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/merchant-login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'merchant') {
    redirect('/login');
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, status')
    .eq('profile_id', profile.id)
    .single();

  if (!merchant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md text-center">
          <p className="text-sm text-slate-600">
            Merchant-account is niet correct ingesteld. Neem contact op met de bank.
          </p>
        </div>
      </div>
    );
  }

  const { data: balanceData } = await supabase.rpc('get_merchant_balance');
  const balance = balanceData?.balance ?? 0;

  const { data: txns } = await supabase
    .from('transactions')
    .select('id, amount, currency, reference, created_at, customer_id')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: pendingRequests } = await supabase
    .from('redemption_requests')
    .select('id, amount, status, submitted_at')
    .eq('merchant_id', merchant.id)
    .in('status', ['pending', 'review']);

  return (
    <DashboardClient
      businessName={merchant.business_name}
      balance={Number(balance)}
      transactions={(txns ?? []).map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        currency: t.currency,
        reference: t.reference,
        created_at: t.created_at,
        customer_ref: t.customer_id.slice(0, 8),
      }))}
      pendingRequests={(pendingRequests ?? []).map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        status: r.status,
        submitted_at: r.submitted_at,
      }))}
    />
  );
}