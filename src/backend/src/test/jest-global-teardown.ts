import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

export default async function globalTeardown() {
  const stampPath = join(process.cwd(), '.jest-test-db');
  if (!existsSync(stampPath)) return;
  const dbName = readFileSync(stampPath, 'utf8');

  const host = process.env.DB_HOST ?? 'localhost';
  const port = parseInt(process.env.DB_PORT ?? '5432', 10);
  const user = process.env.DB_USER ?? 'admin';
  const password = process.env.DB_PASSWORD ?? 'admin';
  // Always connect to a stable admin DB to avoid terminating our own connection
  const adminDb = process.env.PG_DATABASE_ADMIN ?? 'postgres';

  // connect to admin DB, terminate connections, drop test DB
  const adminClient = new Client({ host, port, user, password, database: adminDb });
  await adminClient.connect();
  try {
    await adminClient.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1`, [dbName]);
    await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
  } finally {
    await adminClient.end();
    unlinkSync(stampPath);
  }
}


