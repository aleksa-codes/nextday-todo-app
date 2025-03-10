// not working
// import { sql } from 'drizzle-orm';
// import { text } from 'drizzle-orm/pg-core';

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
import { sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp({
    withTimezone: true,
    mode: 'string',
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({
    withTimezone: true,
    mode: 'string',
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
};

export { timestamps };
