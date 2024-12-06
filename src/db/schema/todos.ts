// LibSQL
// import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
// import { timestamps } from '@/db/columns.helpers';
// import { users } from '@/db/schema/auth';

// export const todoLists = sqliteTable('todo_lists', {
//   id: integer().primaryKey({ autoIncrement: true }),
//   name: text().notNull(),
//   userId: text()
//     .notNull()
//     .references(() => users.id, { onDelete: 'cascade' }),
//   ...timestamps,
// });

// export const todos = sqliteTable('todos', {
//   id: integer().primaryKey({ autoIncrement: true }),
//   content: text().notNull(),
//   completed: integer({ mode: 'boolean' }).notNull().default(false),
//   listId: integer()
//     .notNull()
//     .references(() => todoLists.id, { onDelete: 'cascade' }),
//   userId: text()
//     .notNull()
//     .references(() => users.id, { onDelete: 'cascade' }),
//   ...timestamps,
// });

// export type Todo = typeof todos.$inferSelect;
// export type NewTodo = typeof todos.$inferInsert;
// export type TodoList = typeof todoLists.$inferSelect;
// export type NewTodoList = typeof todoLists.$inferInsert;

// Postgres
import { boolean, integer, pgTable, text, serial } from 'drizzle-orm/pg-core';
import { timestamps } from '@/db/columns.helpers';
import { users } from '@/db/schema/auth';

export const todoLists = pgTable('todo_lists', {
  id: serial().notNull().primaryKey(),
  name: text().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
});

export const todos = pgTable('todos', {
  id: serial().notNull().primaryKey(),
  content: text().notNull(),
  completed: boolean().notNull().default(false),
  listId: integer()
    .notNull()
    .references(() => todoLists.id, { onDelete: 'cascade' }),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps,
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type TodoList = typeof todoLists.$inferSelect;
export type NewTodoList = typeof todoLists.$inferInsert;
