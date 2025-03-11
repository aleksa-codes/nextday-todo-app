import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle({ client, logger: true, casing: 'snake_case' });

export { db };
