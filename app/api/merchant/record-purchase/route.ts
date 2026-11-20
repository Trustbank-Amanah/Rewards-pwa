import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RecordPurchaseBody {
  sessionId: string;
  purchaseAmount: number;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  let body: RecordPurchaseBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldige request body' }, { status: 400 });
  }

  const { sessionId, purchaseAmount } = body;

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'Ongeldige sessie' }, { status: 400 });
  }
  if (
    !purchaseAmount ||
    typeof purchaseAmount !== 'number' ||
    purchaseAmount <= 0
  ) {
    return NextResponse.json({ error: 'Ongeldig aankoopbedrag' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('record_purchase', {
    p_session_id: sessionId,
    p_purchase_amount: purchaseAmount,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}