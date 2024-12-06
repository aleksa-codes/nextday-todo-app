// LibSQL
// import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// export const users = sqliteTable('users', {
//   id: text().primaryKey(),
//   name: text().notNull(),
//   email: text().notNull().unique(),
//   emailVerified: integer({ mode: 'boolean' }).notNull(),
//   image: text(),
//   createdAt: integer({ mode: 'timestamp' }).notNull(),
//   updatedAt: integer({ mode: 'timestamp' }).notNull(),
//   normalizedEmail: text().unique(),
// });

// export const sessions = sqliteTable('sessions', {
//   id: text().primaryKey(),
//   expiresAt: integer({ mode: 'timestamp' }).notNull(),
//   token: text().notNull().unique(),
//   createdAt: integer({ mode: 'timestamp' }).notNull(),
//   updatedAt: integer({ mode: 'timestamp' }).notNull(),
//   ipAddress: text(),
//   userAgent: text(),
//   userId: text()
//     .notNull()
//     .references(() => users.id),
// });

// export const accounts = sqliteTable('accounts', {
//   id: text().primaryKey(),
//   accountId: text().notNull(),
//   providerId: text().notNull(),
//   userId: text()
//     .notNull()
//     .references(() => users.id),
//   accessToken: text(),
//   refreshToken: text(),
//   idToken: text(),
//   accessTokenExpiresAt: integer({ mode: 'timestamp' }),
//   refreshTokenExpiresAt: integer({ mode: 'timestamp' }),
//   scope: text(),
//   password: text(),
//   createdAt: integer({ mode: 'timestamp' }).notNull(),
//   updatedAt: integer({ mode: 'timestamp' }).notNull(),
// });

// export const verifications = sqliteTable('verifications', {
//   id: text().primaryKey(),
//   identifier: text().notNull(),
//   value: text().notNull(),
//   expiresAt: integer({ mode: 'timestamp' }).notNull(),
//   createdAt: integer({ mode: 'timestamp' }),
//   updatedAt: integer({ mode: 'timestamp' }),
// });

// Postgres
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull(),
  image: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  normalizedEmail: text().unique(),
});

export const sessions = pgTable('sessions', {
  id: text().primaryKey(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => users.id),
});

export const accounts = pgTable('accounts', {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp().notNull(),
});

export const verifications = pgTable('verifications', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp(),
  updatedAt: timestamp(),
});
