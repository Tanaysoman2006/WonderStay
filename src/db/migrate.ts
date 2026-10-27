import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './index.ts';

const migrationId = '0001_full_data_model';
const migrationFile = fileURLToPath(new URL('./migrations/0001_full_data_model.sql', import.meta.url));

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const applied = await client.query('SELECT id FROM schema_migrations WHERE id = $1', [migrationId]);
    if (applied.rowCount) {
      await client.query('COMMIT');
      console.log(`Database migration ${migrationId} already applied.`);
      return;
    }

    const sql = await readFile(migrationFile, 'utf8');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [migrationId]);
    await client.query('COMMIT');
    console.log(`Applied database migration ${migrationId}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Database migration ${migrationId} failed:`, error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => {
  process.exitCode = 1;
});
