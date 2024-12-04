import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({ url: process.env.DB_FILE_NAME! });
const db = drizzle({ client, logger: true, casing: 'snake_case' });

export { db };

// Postgres
// import postgres from 'postgres';
// import { drizzle } from 'drizzle-orm/postgres-js';

// const client = postgres(process.env.DATABASE_URL!, { prepare: false });
// const db = drizzle({ client, logger: true, casing: 'snake_case' });

// export { db };
