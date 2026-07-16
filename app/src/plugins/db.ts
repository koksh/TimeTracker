import type { FastifyPluginAsync } from 'fastify';
import { Pool } from 'pg';

declare module 'fastify' {
  interface FastifyInstance {
    db: {
      pool: Pool;
      query: <T = any>(text: string, params?: any[]) => Promise<import('pg').QueryResult<T>>;
    };
  }
}

const dbPlugin: FastifyPluginAsync = async (app) => {
  const pool = new Pool({
    host: process.env.PGHOST ?? 'db',
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? 'postgres',
    database: process.env.PGDATABASE ?? 'time_tracker',
  });

  app.decorate('db', {
    pool,
    query: async (text: string, params?: any[]) => pool.query(text, params),
  });

  app.addHook('onClose', async () => {
    await pool.end();
  });

  await app.db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT
    );
  `);

  await app.db.query(`
    CREATE TABLE IF NOT EXISTS time_records (
      id SERIAL PRIMARY KEY,
      minutes INTEGER NOT NULL,
      date TIMESTAMPTZ NOT NULL,
      note TEXT,
      user_id INTEGER REFERENCES users(id)
    );
  `);

  await app.db.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      event TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      elapsed_ms INTEGER NOT NULL,
      active_time_ms INTEGER NOT NULL,
      file_path TEXT,
      file_language TEXT,
      file_name TEXT,
      workspace_folder TEXT,
      session_hostname TEXT NOT NULL,
      session_user TEXT NOT NULL,
      session_started_at TIMESTAMPTZ NOT NULL
    );
  `);
};

export default dbPlugin;
