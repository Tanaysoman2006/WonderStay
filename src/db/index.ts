import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER || process.env.SQL_ADMIN_USER,
      password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD,
      database: process.env.SQL_DB_NAME,
      ssl: process.env.SQL_SSL === 'true'
        ? { rejectUnauthorized: process.env.SQL_SSL_REJECT_UNAUTHORIZED !== 'false' }
        : undefined,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });
