import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { lookup } from 'mime-types';
import { db, uploads } from '$lib/db';
import { generateFileName } from '$lib/utils';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '$lib/constants';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const archived = url.searchParams.get('archived') === 'true';
		const filter = url.searchParams.get('filter'); // 'videos', 'documents', 'lessons', or null for all

		let query = db.select().from(uploads).where(eq(uploads.archived, archived));
		let allUploads = await query;

		// Apply MIME type filtering
		if (filter && filter !== 'all') {
			allUploads = allUploads.filter((upload) => {
				const mimeType = upload.mimeType.toLowerCase();

				switch (filter) {
					case 'videos':
						return (
							mimeType.includes('video/') || mimeType.includes('application/x-shockwave-flash')
						); // Flash videos

					case 'documents':
						return (
							mimeType.includes('pdf') ||
							mimeType.includes('document') ||
							mimeType.includes('word') ||
							mimeType.includes('text/') ||
							mimeType.includes('rtf') ||
							mimeType.includes('opendocument')
						);

					case 'lessons':
						return (
							mimeType.includes('presentation') ||
							mimeType.includes('powerpoint') ||
							mimeType.includes('slides') ||
							mimeType.includes('impress')
						);

					default:
						return true;
				}
			});
		}

		// Sort by creation date (newest first)
		allUploads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return json(allUploads);
	} catch (error) {
		console.error('Database error:', error);
		return json({ error: 'Failed to fetch uploads' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();

		// Extract and validate form fields
		const title = formData.get('title')?.toString().trim();
		const description = formData.get('description')?.toString().trim();
		const category = formData.get('category')?.toString();
		const language = formData.get('language')?.toString();
		const provider = formData.get('provider')?.toString();
		const rolesString = formData.get('roles')?.toString();
		const file = formData.get('file') as File;

		// Validation
		if (!title || title.length > 200) {
			return json(
				{ error: 'Title is required and must be 200 characters or less' },
				{ status: 400 }
			);
		}

		if (!description || description.length > 1000) {
			return json(
				{ error: 'Description is required and must be 1000 characters or less' },
				{ status: 400 }
			);
		}

		if (!category || !language || !provider) {
			return json({ error: 'Category, language, and provider are required' }, { status: 400 });
		}

		let roles;
		try {
			roles = JSON.parse(rolesString || '[]');
		} catch {
			return json({ error: 'Invalid roles format' }, { status: 400 });
		}

		if (!Array.isArray(roles) || roles.length === 0) {
			return json({ error: 'At least one role must be selected' }, { status: 400 });
		}

		if (!file || file.size === 0) {
			return json({ error: 'File is required' }, { status: 400 });
		}

		if (file.size > MAX_FILE_SIZE) {
			return json(
				{ error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
				{ status: 400 }
			);
		}

		// Get MIME type
		const mimeType = lookup(file.name) || file.type || 'application/octet-stream';

		// Validate file type
		const isValidType = ACCEPTED_FILE_TYPES.some((type) => {
			if (type.startsWith('.')) {
				return file.name.toLowerCase().endsWith(type.toLowerCase());
			}
			return mimeType.includes(type.replace('*', ''));
		});

		if (!isValidType) {
			return json({ error: 'File type not supported' }, { status: 400 });
		}

		// Create uploads directory if it doesn't exist
		const uploadsDir = 'uploads';
		if (!existsSync(uploadsDir)) {
			await mkdir(uploadsDir, { recursive: true });
		}

		// Generate unique filename
		const fileExtension = path.extname(file.name);
		const fileName = generateFileName(file.name);
		const filePath = path.join(uploadsDir, fileName);

		// Save file to disk
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filePath, buffer);

		// Save to database
		const [newUpload] = await db
			.insert(uploads)
			.values({
				title,
				description,
				category,
				language,
				provider,
				roles,
				fileName,
				originalName: file.name,
				mimeType,
				fileSize: file.size,
				filePath
			})
			.returning();

		return json(newUpload, { status: 201 });
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Upload failed' }, { status: 500 });
	}
};
