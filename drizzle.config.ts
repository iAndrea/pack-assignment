import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString:
			process.env.DATABASE_URL || 'postgresql://packuser:packpass@localhost:5432/packdb'
	}
} satisfies Config;
