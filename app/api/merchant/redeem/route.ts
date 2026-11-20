import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RedeemBody {
  sessionId: string;
  amount: number;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  let body: RedeemBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldige request body' }, { status: 400 });
  }

  const { sessionId, amount } = body;

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'Ongeldige sessie' }, { status: 400 });
  }
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Ongeldig bedrag' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('redeem_voucher', {
    p_session_id: sessionId,
    p_amount: amount,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}