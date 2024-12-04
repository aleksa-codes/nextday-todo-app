import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: integer({ mode: 'boolean' }).notNull(),
  image: text(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
  normalizedEmail: text().unique(),
});

export const sessions = sqliteTable('sessions', {
  id: text().primaryKey(),
  expiresAt: integer({ mode: 'timestamp' }).notNull(),
  token: text().notNull().unique(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => users.id),
});

export const accounts = sqliteTable('accounts', {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: integer({ mode: 'timestamp' }),
  refreshTokenExpiresAt: integer({ mode: 'timestamp' }),
  scope: text(),
  password: text(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),
});

export const verifications = sqliteTable('verifications', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: integer({ mode: 'timestamp' }).notNull(),
  createdAt: integer({ mode: 'timestamp' }),
  updatedAt: integer({ mode: 'timestamp' }),
});

// Postgres
// import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// export const users = pgTable('users', {
//   id: text('id').primaryKey(),
//   name: text('name').notNull(),
//   email: text('email').notNull().unique(),
//   emailVerified: boolean('email_verified').notNull(),
//   image: text('image'),
//   createdAt: timestamp('created_at').notNull(),
//   updatedAt: timestamp('updated_at').notNull(),
//   normalizedEmail: text('normalized_email').unique(),
// });

// export const sessions = pgTable('sessions', {
//   id: text('id').primaryKey(),
//   expiresAt: timestamp('expires_at').notNull(),
//   token: text('token').notNull().unique(),
//   createdAt: timestamp('created_at').notNull(),
//   updatedAt: timestamp('updated_at').notNull(),
//   ipAddress: text('ip_address'),
//   userAgent: text('user_agent'),
//   userId: text('user_id')
//     .notNull()
//     .references(() => users.id),
// });

// export const accounts = pgTable('accounts', {
//   id: text('id').primaryKey(),
//   accountId: text('account_id').notNull(),
//   providerId: text('provider_id').notNull(),
//   userId: text('user_id')
//     .notNull()
//     .references(() => users.id),
//   accessToken: text('access_token'),
//   refreshToken: text('refresh_token'),
//   idToken: text('id_token'),
//   accessTokenExpiresAt: timestamp('access_token_expires_at'),
//   refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
//   scope: text('scope'),
//   password: text('password'),
//   createdAt: timestamp('created_at').notNull(),
//   updatedAt: timestamp('updated_at').notNull(),
// });

// export const verifications = pgTable('verifications', {
//   id: text('id').primaryKey(),
//   identifier: text('identifier').notNull(),
//   value: text('value').notNull(),
//   expiresAt: timestamp('expires_at').notNull(),
//   createdAt: timestamp('created_at'),
//   updatedAt: timestamp('updated_at'),
// });
