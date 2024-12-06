import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema',
  // dialect: 'sqlite',
  dialect: 'postgresql',
  dbCredentials: {
    // sqlite:
    // url: process.env.DB_FILE_NAME!,
    // postgres:
    url: process.env.DATABASE_URL!,
  },
  casing: 'snake_case',
});
