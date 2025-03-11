import { db } from '@/db';
import { users } from '@/db/schema/auth';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalBalance = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.email, session.user.email));

    return NextResponse.json(totalBalance);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, amount } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First check if user has enough balance
    const currentBalance = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId));

    if (!currentBalance[0]?.balance || currentBalance[0].balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const result = await db
      .update(users)
      .set({
        balance: sql`${users.balance} - ${amount}`,
      })
      .where(eq(users.id, userId))
      .returning({ updatedBalance: users.balance });

    return NextResponse.json({ success: true, balance: result[0]?.updatedBalance });
  } catch (error) {
    console.error('Failed to subtract balance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to subtract balance',
      },
      { status: 500 },
    );
  }
}
