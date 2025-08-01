import { json } from '@sveltejs/kit';
import { db, uploads } from '$lib/db';
import { eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const POST = async ({ params }: { params: { id: string } }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			throw error(400, 'Invalid upload ID');
		}

		// Increment the view count
		const [updatedUpload] = await db
			.update(uploads)
			.set({
				viewCount: sql`${uploads.viewCount} + 1`,
				updatedAt: new Date()
			})
			.where(eq(uploads.id, id))
			.returning();

		if (!updatedUpload) {
			throw error(404, 'Upload not found');
		}

		return json({ success: true, viewCount: updatedUpload.viewCount });
	} catch (err) {
		console.error('View count increment error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
