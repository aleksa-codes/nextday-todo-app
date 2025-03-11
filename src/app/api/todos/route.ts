import { db } from '@/db';
import { todos, type NewTodo } from '@/db/schema/todos';
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

    const userTodos = await db.select().from(todos).where(eq(todos.userId, session.user.id));

    return NextResponse.json(userTodos);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
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

    const { content, listId } = await request.json();
    const newTodo: NewTodo = {
      content,
      listId,
      userId: session.user.id,
    };

    const todo = await db.insert(todos).values(newTodo).returning();

    return NextResponse.json(todo[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
