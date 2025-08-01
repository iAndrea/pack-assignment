import type { RequestHandler } from './$types';
import { db, uploads } from '$lib/db';
import { eq } from 'drizzle-orm';
import { readFile } from 'fs/promises';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			throw error(400, 'Invalid upload ID');
		}

		// Find the upload record
		const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));

		if (!upload) {
			throw error(404, 'File not found');
		}

		// Read the file from disk
		const fileBuffer = await readFile(upload.filePath);

		// Return the file with appropriate headers
		// Encode filename properly for Content-Disposition header
		const encodedFilename = encodeURIComponent(upload.originalName);

		return new Response(fileBuffer, {
			headers: {
				'Content-Type': upload.mimeType,
				'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
				'Content-Length': upload.fileSize.toString()
			}
		});
	} catch (err) {
		console.error('Download error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
