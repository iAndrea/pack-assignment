<script>
	import { createEventDispatcher } from 'svelte';
	import { formatFileSize, formatDate } from '$lib/utils';
	import { LANGUAGES } from '$lib/constants';
	import Icon from './Icon.svelte';

	const dispatch = createEventDispatcher();

	export let uploads = [];
	export let loading = false;
	export let isArchiveView = false;

	let sortColumn = '';
	let sortDirection = 'asc'; // 'asc' or 'desc'
	let sortedUploads = [];
	let activeActionsMenu = null;

	// Update sorted uploads when uploads prop changes
	$: {
		sortedUploads = [...uploads];
		if (sortColumn && sortedUploads.length > 0) {
			applySorting();
		}
	}

	function getLanguageName(code) {
		const lang = LANGUAGES.find((l) => l.code === code);
		return lang ? lang.name : code;
	}

	function sortBy(column) {
		if (sortColumn === column) {
			// Toggle direction if same column
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Set new column and default to ascending
			sortColumn = column;
			sortDirection = 'asc';
		}
		applySorting();
	}

	function applySorting() {
		if (!sortColumn || !sortedUploads.length) return;

		sortedUploads = sortedUploads.sort((a, b) => {
			let aValue, bValue;

			switch (sortColumn) {
				case 'title':
					aValue = a.title?.toLowerCase() || '';
					bValue = b.title?.toLowerCase() || '';
					break;
				case 'path':
					aValue = getPath(a).toLowerCase();
					bValue = getPath(b).toLowerCase();
					break;
				case 'viewCount':
					aValue = parseInt(a.viewCount) || 0;
					bValue = parseInt(b.viewCount) || 0;
					break;
				case 'provider':
					aValue = a.provider?.toLowerCase() || '';
					bValue = b.provider?.toLowerCase() || '';
					break;
				case 'type':
					aValue = getFileType(a.mimeType).toLowerCase();
					bValue = getFileType(b.mimeType).toLowerCase();
					break;
				case 'createdAt':
					aValue = new Date(a.createdAt);
					bValue = new Date(b.createdAt);
					break;
				default:
					return 0;
			}

			let comparison = 0;
			if (aValue < bValue) {
				comparison = -1;
			} else if (aValue > bValue) {
				comparison = 1;
			}

			return sortDirection === 'desc' ? comparison * -1 : comparison;
		});
	}

	async function handleItemClick(upload) {
		// Close any open actions menu first
		activeActionsMenu = null;

		try {
			// First increment the view count
			const viewResponse = await fetch(`/api/uploads/${upload.id}/view`, {
				method: 'POST'
			});

			if (viewResponse.ok) {
				const viewResult = await viewResponse.json();
				// Update the local upload object with new view count
				const uploadIndex = uploads.findIndex((u) => u.id === upload.id);
				if (uploadIndex !== -1) {
					uploads[uploadIndex] = { ...uploads[uploadIndex], viewCount: viewResult.viewCount };

					// Also update the sortedUploads array to maintain sorting
					const sortedIndex = sortedUploads.findIndex((u) => u.id === upload.id);
					if (sortedIndex !== -1) {
						sortedUploads[sortedIndex] = {
							...sortedUploads[sortedIndex],
							viewCount: viewResult.viewCount
						};
						sortedUploads = [...sortedUploads]; // Trigger reactivity
					}

					uploads = [...uploads]; // Trigger reactivity
				}
			}

			// Then download the file
			await downloadFile(upload);
		} catch (error) {
			console.error('Error handling item click:', error);
			// Still try to download even if view count increment fails
			await downloadFile(upload);
		}
	}

	async function downloadFile(upload) {
		try {
			const response = await fetch(`/api/uploads/${upload.id}/download`);
			if (response.ok) {
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = upload.originalName;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} else {
				console.error('Download failed');
			}
		} catch (error) {
			console.error('Download error:', error);
		}
	}

	async function handleArchiveAction(upload) {
		try {
			const response = await fetch(`/api/uploads/${upload.id}/archive`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ archived: !upload.archived })
			});

			if (response.ok) {
				const result = await response.json();
				dispatch('archive', { id: upload.id, archived: result.archived });
			} else {
				console.error('Archive action failed');
			}
		} catch (error) {
			console.error('Archive action error:', error);
		} finally {
			activeActionsMenu = null;
		}
	}

	function toggleActionsMenu(uploadId, event) {
		event.stopPropagation();
		activeActionsMenu = activeActionsMenu === uploadId ? null : uploadId;
	}

	function closeActionsMenu() {
		activeActionsMenu = null;
	}

	function getFileType(mimeType) {
		if (mimeType.includes('pdf')) return 'PDF';
		if (mimeType.includes('video')) return 'Video';
		if (mimeType.includes('text')) return 'Text';
		if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Presentation';
		if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet';
		if (mimeType.includes('document') || mimeType.includes('word')) return 'Document';
		return 'File';
	}

	function getPath(upload) {
		// Generate a mock path based on category
		const pathMap = {
			Leadership: 'Leadership Path',
			'Managing Complexity': 'Management Path',
			Communication: 'Communication Path',
			'Problem Solving': 'Problem Solving Path',
			'Team Building': 'Team Building Path',
			Innovation: 'Innovation Path',
			'Decision Making': 'Decision Making Path',
			'Strategic Thinking': 'Strategy Path'
		};
		return pathMap[upload.category] || 'General Path';
	}

	function getSortIcon(column) {
		if (sortColumn !== column) {
			return 'chevron-up-down';
		}
		return sortDirection === 'asc' ? 'chevron-up' : 'chevron-down';
	}

	function getSortClass(column) {
		if (sortColumn === column) {
			return sortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
		}
		return '';
	}

	// Close actions menu when clicking outside
	function handleOutsideClick() {
		activeActionsMenu = null;
	}
</script>

<svelte:window on:click={handleOutsideClick} />

<div class="table-container">
	{#if loading}
		<div class="loading-state">
			<div class="loading-spinner" />
			<p>Loading resources...</p>
		</div>
	{:else if uploads.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<Icon name="document" size={48} />
			</div>
			<h3>{isArchiveView ? 'No archived items' : 'No resources yet'}</h3>
			<p>
				{isArchiveView
					? 'Items you archive will appear here'
					: 'Click "Upload" to add your first resource'}
			</p>
		</div>
	{:else}
		<table class="data-table">
			<thead>
				<tr>
					<th class="content-title-header">
						<button class="sort-header {getSortClass('title')}" on:click={() => sortBy('title')}>
							Content Title
							<Icon name={getSortIcon('title')} size={12} class_="sort-icon" />
						</button>
					</th>
					<th>
						<button class="sort-header {getSortClass('path')}" on:click={() => sortBy('path')}>
							Path
							<Icon name={getSortIcon('path')} size={12} class_="sort-icon" />
						</button>
					</th>
					<th>
						<button
							class="sort-header {getSortClass('viewCount')}"
							on:click={() => sortBy('viewCount')}
						>
							View Count
							<Icon name={getSortIcon('viewCount')} size={12} class_="sort-icon" />
						</button>
					</th>
					<th>Uploaded By</th>
					<th>
						<button
							class="sort-header {getSortClass('provider')}"
							on:click={() => sortBy('provider')}
						>
							Provider
							<Icon name={getSortIcon('provider')} size={12} class_="sort-icon" />
						</button>
					</th>
					<th>
						<button class="sort-header {getSortClass('type')}" on:click={() => sortBy('type')}>
							Type
							<Icon name={getSortIcon('type')} size={12} class_="sort-icon" />
						</button>
					</th>
					<th class="actions-header">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each sortedUploads as upload (upload.id)}
					<tr class="table-row" on:click={() => handleItemClick(upload)}>
						<td class="content-title-cell">
							<div class="title-content">
								<h4 class="title-text">{upload.title}</h4>
								{#if upload.description}
									<p class="description-text">{upload.description}</p>
								{/if}
							</div>
						</td>
						<td class="path-cell">
							<span class="path-text">{getPath(upload)}</span>
						</td>
						<td class="view-count-cell">
							<span class="count-text">{upload.viewCount || 0}</span>
						</td>
						<td class="uploaded-by-cell">
							<span class="user-text">System User</span>
						</td>
						<td class="provider-cell">
							<span class="provider-text">{upload.provider}</span>
						</td>
						<td class="type-cell">
							<span class="type-badge">{getFileType(upload.mimeType)}</span>
						</td>
						<td class="actions-cell">
							<div class="actions-container">
								<button
									class="actions-menu"
									class:active={activeActionsMenu === upload.id}
									on:click={(e) => toggleActionsMenu(upload.id, e)}
								>
									<Icon name="dots-vertical" size={16} />
								</button>

								{#if activeActionsMenu === upload.id}
									<div class="actions-dropdown">
										<button class="action-item" on:click={() => handleArchiveAction(upload)}>
											{upload.archived ? 'Unarchive' : 'Archive'}
										</button>
									</div>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.table-container {
		width: 100%;
		background: white;
	}

	.loading-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64px 32px;
		text-align: center;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #f3f4f6;
		border-radius: 50%;
		border-top-color: #f97316;
		animation: spin 1s ease-in-out infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty-icon {
		color: #d1d5db;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		margin: 0 0 8px 0;
		color: #374151;
		font-size: 18px;
		font-weight: 600;
	}

	.empty-state p {
		margin: 0;
		color: #6b7280;
		font-size: 14px;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.data-table thead {
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.data-table th {
		padding: 12px 16px;
		text-align: left;
		font-weight: 600;
		color: #374151;
		white-space: nowrap;
	}

	.content-title-header {
		width: 25%;
	}

	.actions-header {
		width: 80px;
	}

	.sort-header {
		display: flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		font-weight: 600;
		color: #374151;
		cursor: pointer;
		padding: 0;
		transition: color 0.2s ease;
	}

	.sort-header:hover {
		color: #f97316;
	}

	.sort-header.sort-asc,
	.sort-header.sort-desc {
		color: #f97316;
	}

	.sort-header :global(.sort-icon) {
		color: #9ca3af;
		transition: color 0.2s ease;
	}

	.sort-header:hover :global(.sort-icon),
	.sort-header.sort-asc :global(.sort-icon),
	.sort-header.sort-desc :global(.sort-icon) {
		color: #f97316;
	}

	.table-row {
		border-bottom: 1px solid #f3f4f6;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.table-row:hover {
		background: #f9fafb;
	}

	.data-table td {
		padding: 16px;
		vertical-align: top;
	}

	.content-title-cell {
		max-width: 300px;
	}

	.title-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.title-text {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: #1f2937;
		line-height: 1.4;
	}

	.description-text {
		margin: 0;
		font-size: 13px;
		color: #6b7280;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.path-text,
	.user-text,
	.provider-text {
		color: #374151;
		font-size: 14px;
	}

	.count-text {
		color: #6b7280;
		font-size: 14px;
		font-weight: 500;
	}

	.type-badge {
		display: inline-flex;
		align-items: center;
		padding: 4px 8px;
		background: #f3f4f6;
		color: #374151;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
	}

	.actions-container {
		position: relative;
	}

	.actions-menu {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: none;
		border: none;
		border-radius: 6px;
		color: #9ca3af;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.actions-menu:hover,
	.actions-menu.active {
		background: #f3f4f6;
		color: #374151;
	}

	.actions-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		z-index: 10;
		min-width: 120px;
		margin-top: 4px;
	}

	.action-item {
		display: block;
		width: 100%;
		padding: 8px 12px;
		background: none;
		border: none;
		text-align: left;
		font-size: 14px;
		color: #374151;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.action-item:first-child {
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
	}

	.action-item:last-child {
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}

	.action-item:hover {
		background: #f9fafb;
	}

	@media (max-width: 768px) {
		.data-table {
			font-size: 12px;
		}

		.data-table th,
		.data-table td {
			padding: 8px 12px;
		}

		.content-title-cell {
			max-width: 200px;
		}

		.title-text {
			font-size: 13px;
		}

		.description-text {
			font-size: 12px;
		}

		.actions-header {
			width: 60px;
		}
	}
</style>
