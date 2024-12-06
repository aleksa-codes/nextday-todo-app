// LibSQL
// import 'dotenv/config';
// import { migrate } from 'drizzle-orm/libsql/migrator';
// import { db } from '@/db';

// (async () => {
//   await migrate(db, { migrationsFolder: './src/db/migrations' });
//   db.$client.close();
// })();

// Postgres
import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '@/db';

(async () => {
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  await db.$client.end();
})();
