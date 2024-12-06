// not working
// import { sql } from 'drizzle-orm';
// import { text } from 'drizzle-orm/sqlite-core';

// const timestamps = {
//   createdAt: text()
//     .default(sql`(current_timestamp)`)
//     .notNull(),
//   updatedAt: text()
//     .default(sql`(current_timestamp)`)
//     .$onUpdate(() => sql`(current_timestamp)`)
//     .notNull(),
// };

// export { timestamps };

// LibSQL
// import { sql } from 'drizzle-orm';
// import { integer } from 'drizzle-orm/sqlite-core';

// const timestamps = {
//   createdAt: integer()
//     .default(sql`(strftime('%s', 'now'))`)
//     .notNull(),
//   updatedAt: integer()
//     .$onUpdate(() => sql`(strftime('%s', 'now'))`)
//     .notNull(),
// };

// export { timestamps };

// Postgres
import { sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp({ mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp({ mode: 'string' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
};

export { timestamps };
