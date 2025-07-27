import {
	pgTable,
	serial,
	varchar,
	text,
	integer,
	timestamp,
	json,
	boolean
} from 'drizzle-orm/pg-core';

export const uploads = pgTable('uploads', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 200 }).notNull(),
	description: text('description').notNull(),
	category: varchar('category', { length: 100 }).notNull(),
	language: varchar('language', { length: 10 }).notNull(),
	provider: varchar('provider', { length: 100 }).notNull(),
	roles: json('roles').$type<string[]>().notNull(),
	fileName: varchar('file_name', { length: 255 }).notNull(),
	originalName: varchar('original_name', { length: 255 }).notNull(),
	mimeType: varchar('mime_type', { length: 100 }).notNull(),
	fileSize: integer('file_size').notNull(),
	filePath: varchar('file_path', { length: 500 }).notNull(),
	viewCount: integer('view_count').default(0).notNull(),
	archived: boolean('archived').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
