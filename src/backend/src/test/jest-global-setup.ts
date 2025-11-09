import { Client } from 'pg';
import { writeFileSync } from 'fs';
import { join } from 'path';

export default async function globalSetup() {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = parseInt(process.env.DB_PORT ?? '5432', 10);
  const user = process.env.DB_USER ?? 'admin';
  const password = process.env.DB_PASSWORD ?? 'admin';
  const baseDb = process.env.DB_NAME ?? 'postgres';

  const dbName = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const adminClient = new Client({ host, port, user, password, database: baseDb });
  await adminClient.connect();
  try {
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
  } finally {
    await adminClient.end();
  }

  // Persist chosen test DB name for workers and teardown
  const stampPath = join(process.cwd(), '.jest-test-db');
  writeFileSync(stampPath, dbName, 'utf8');

  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = dbName;
}




