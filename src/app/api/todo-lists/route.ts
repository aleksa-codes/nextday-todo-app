import { db } from '@/db';
import { todoLists, type NewTodoList } from '@/db/schema/todos';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lists = await db.select().from(todoLists).where(eq(todoLists.userId, session.user.id));

    return NextResponse.json(lists);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch todo lists' }, { status: 500 });
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

    const { name } = await request.json();
    const newList: NewTodoList = {
      name,
      userId: session.user.id,
    };

    const list = await db.insert(todoLists).values(newList).returning();

    return NextResponse.json(list[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to create todo list' }, { status: 500 });
  }
}
