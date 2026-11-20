import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RedeemClient from './redeem-client';

export default async function RedeemPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/merchant-login');

  const params = await searchParams;

  return (
    <RedeemClient
      sessionId={params.sessionId}
      voucherNumber={params.voucherNumber}
      balance={parseFloat(params.balance ?? '0')}
      currency={params.currency ?? 'punten'}
      customerName={params.customerName ?? 'Klant'}
    />
  );
}