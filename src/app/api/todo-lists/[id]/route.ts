import { db } from '@/db';
import { todoLists, type TodoList } from '@/db/schema/todos';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';

type UpdateTodoListInput = Pick<TodoList, 'name'>;

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listId = parseInt((await params).id);
    const { name }: UpdateTodoListInput = await request.json();

    const list = await db.update(todoLists).set({ name }).where(eq(todoLists.id, listId)).returning();

    return NextResponse.json(list[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to update todo list' }, { status: 500 });
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

    const listId = parseInt((await params).id);

    // Delete the list - todos will be automatically deleted due to cascade delete
    await db.delete(todoLists).where(eq(todoLists.id, listId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete todo list' }, { status: 500 });
  }
}
