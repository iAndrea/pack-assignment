import { json } from '@sveltejs/kit';
import { db, uploads } from '$lib/db';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const POST = async ({ params, request }: { params: { id: string }; request: Request }) => {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			throw error(400, 'Invalid upload ID');
		}

		const { archived } = await request.json();
		if (typeof archived !== 'boolean') {
			throw error(400, 'Invalid archived value');
		}

		// Update the archived status
		const [updatedUpload] = await db
			.update(uploads)
			.set({
				archived,
				updatedAt: new Date()
			})
			.where(eq(uploads.id, id))
			.returning();

		if (!updatedUpload) {
			throw error(404, 'Upload not found');
		}

		return json({
			success: true,
			archived: updatedUpload.archived,
			message: archived ? 'Item archived successfully' : 'Item unarchived successfully'
		});
	} catch (err) {
		console.error('Archive operation error:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Internal server error');
	}
};
