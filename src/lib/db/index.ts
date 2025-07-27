import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { uploads } from './schema.js';

const pool = new Pool({
	connectionString:
		process.env.DATABASE_URL || 'postgresql://packuser:packpass@localhost:5432/packdb'
});

export const db = drizzle(pool, { schema: { uploads } });

export * from './schema.js';
