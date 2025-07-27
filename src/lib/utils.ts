export function formatFileSize(bytes: number): string {
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	if (bytes === 0) return '0 Bytes';
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(date: string | Date): string {
	const d = new Date(date);
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function getFileExtension(filename: string): string {
	return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
}

export function generateUniqueFilename(originalName: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const extension = originalName.split('.').pop();
	const nameWithoutExtension = originalName.split('.').slice(0, -1).join('.');
	const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '_');
	return `${sanitizedName}_${timestamp}_${random}.${extension}`;
}

export function generateFileName(originalName: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const extension = originalName.split('.').pop();
	const nameWithoutExtension = originalName.split('.').slice(0, -1).join('.');
	const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '_');
	return `${sanitizedName}_${timestamp}_${random}.${extension}`;
}
