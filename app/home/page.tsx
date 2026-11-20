import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import HomeClient from './home-client';
import { unstable_cache } from 'next/cache';
import type { MerchantAd, Voucher } from '@/lib/types';

export const instant = false;

// Buiten de component — anders werkt de cache niet
// Gebruikt de publieke client (geen cookies) — veilig binnen unstable_cache
const getCachedAds = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase.rpc('get_active_merchant_ads');
    return (data as MerchantAd[] | null) ?? [];
  },
  ['merchant-ads'],
  { revalidate: 3600 }
);

export default async function HomePage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, account_number')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  const { data: voucherData } = await supabase
    .from('vouchers')
    .select('id, voucher_number, current_balance, initial_amount, currency, status, expires_at')
    .eq('customer_id', profile.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const voucher: Voucher | null = voucherData
    ? {
        ...voucherData,
        current_balance: Number(voucherData.current_balance),
        initial_amount: Number(voucherData.initial_amount),
      }
    : null;

  const ads = await getCachedAds();

  return (
    <HomeClient
      profileName={profile.full_name ?? 'Klant'}
      voucher={voucher}
      ads={ads}
    />
  );
}