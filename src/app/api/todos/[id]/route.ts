import { db } from '@/db';
import { todos, type Todo } from '@/db/schema/todos';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

type UpdateTodoInput = Partial<Pick<Todo, 'completed' | 'content'>>;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt((await params).id);
    const input: UpdateTodoInput = await request.json();

    const updatedTodo = await db.update(todos).set(input).where(eq(todos.id, id)).returning();

    return NextResponse.json(updatedTodo[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt((await params).id);

    await db.delete(todos).where(eq(todos.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
