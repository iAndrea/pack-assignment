<script>
	export let name = '';
	export let size = 16;
	export let class_ = '';

	// Icon paths - using Heroicons and custom icons
	const icons = {
		// UI Icons
		'chevron-up': 'M6 3L4 5h4L6 3z',
		'chevron-down': 'M6 9l2-2H4l2 2z',
		'chevron-up-down': 'M6 3L4 5h4L6 3zM6 9l2-2H4l2 2z',
		'x-mark':
			'M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z',
		plus: 'M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z',
		refresh:
			'M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z',
		search:
			'M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z',
		'dots-vertical':
			'M8 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z',

		// Status Icons
		'check-circle':
			'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.73 10.48a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z',

		// Content Icons
		'chart-bar':
			'M2 3a1 1 0 011-1h2.5a1 1 0 011 1v3.5h6V3a1 1 0 011-1H16v2h-2.5v11.5H12V8.5H6V14.5H4.5V3z',
		document:
			'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14,2 14,8 20,8 M16,13 8,13 M16,17 8,17 M10,9 9,9 8,9'
	};

	$: iconPath = icons[name] || '';
	$: viewBox = getViewBox(name);

	function getViewBox(iconName) {
		// Different icons may need different viewBox dimensions
		if (['check-circle'].includes(iconName)) {
			return '0 0 20 20';
		}
		if (['document'].includes(iconName)) {
			return '0 0 24 24';
		}
		return '0 0 16 16';
	}
</script>

{#if iconPath}
	<svg
		width={size}
		height={size}
		{viewBox}
		fill="currentColor"
		class={class_}
		role="img"
		aria-hidden="true"
	>
		<path d={iconPath} fill-rule="evenodd" clip-rule="evenodd" />
	</svg>
{:else}
	<!-- Fallback for unknown icons -->
	<div
		style="width: {size}px; height: {size}px; background: #e5e7eb; border-radius: 2px;"
		class={class_}
		title="Icon not found: {name}"
	/>
{/if}
