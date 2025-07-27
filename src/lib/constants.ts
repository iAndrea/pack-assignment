export const CATEGORIES = [
	'Leadership',
	'Managing Complexity',
	'Communication',
	'Problem Solving',
	'Team Building',
	'Innovation',
	'Decision Making',
	'Strategic Thinking'
] as const;

export const LANGUAGES = [
	{ code: 'en', name: 'English' },
	{ code: 'it', name: 'Italian' },
	{ code: 'es', name: 'Spanish' },
	{ code: 'fr', name: 'French' },
	{ code: 'de', name: 'German' },
	{ code: 'pt', name: 'Portuguese' }
] as const;

export const PROVIDERS = [
	'Skilla',
	'LinkedIn',
	'Pack',
	'Mentor',
	'Internal',
	'External Partner'
] as const;

export const ROLES = [
	'Mentor/Coach',
	'Mentee/Coachee',
	'Manager',
	'Individual Contributor',
	'Team Lead',
	'Executive'
] as const;

export const ACCEPTED_FILE_TYPES = [
	'application/pdf',
	'text/plain',
	'video/mp4',
	'video/webm',
	'video/ogg',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
