<script>
	import { onMount } from 'svelte';
	import FileUploadModal from '$lib/components/FileUploadModal.svelte';
	import UploadsTable from '$lib/components/UploadsTable.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let uploads = [];
	let loading = true;
	let showUploadModal = false;
	let showSuccessNotification = false;
	let activeTab = 'all';
	let isArchiveView = false;

	async function loadUploads() {
		loading = true;
		try {
			const params = new URLSearchParams({
				archived: isArchiveView.toString()
			});

			if (activeTab !== 'all') {
				params.append('filter', activeTab);
			}

			const response = await fetch(`/api/uploads?${params}`);
			if (response.ok) {
				uploads = await response.json();
			} else {
				console.error('Failed to load uploads');
			}
		} catch (error) {
			console.error('Error loading uploads:', error);
		} finally {
			loading = false;
		}
	}

	function handleUploadSuccess(event) {
		// Only add to current view if it's not archive view
		if (!isArchiveView) {
			uploads = [event.detail, ...uploads];
		}
		showUploadModal = false;
		showSuccessNotification = true;

		// Hide notification after 5 seconds
		setTimeout(() => {
			showSuccessNotification = false;
		}, 5000);
	}

	function handleArchiveChange(event) {
		const { id, archived } = event.detail;

		// Remove from current view
		uploads = uploads.filter((upload) => upload.id !== id);

		// Show notification
		showSuccessNotification = true;

		// Hide notification after 3 seconds
		setTimeout(() => {
			showSuccessNotification = false;
		}, 3000);
	}

	function openUploadModal() {
		showUploadModal = true;
	}

	function closeUploadModal() {
		showUploadModal = false;
	}

	function closeNotification() {
		showSuccessNotification = false;
	}

	function switchTab(tab) {
		if (tab === 'archive') {
			isArchiveView = true;
			activeTab = 'all'; // Archive shows all types
		} else {
			isArchiveView = false;
			activeTab = tab;
		}
		loadUploads();
	}

	function getTabClass(tab) {
		if (tab === 'archive') {
			return isArchiveView ? 'tab-button active archive' : 'tab-button archive';
		}
		return !isArchiveView && activeTab === tab ? 'tab-button active' : 'tab-button';
	}

	onMount(() => {
		loadUploads();
	});

	// Reactive statement to reload uploads when tab changes
	$: if (activeTab || isArchiveView !== undefined) {
		if (typeof window !== 'undefined') {
			loadUploads();
		}
	}
</script>

<svelte:head>
	<title>Pack Assignment - File Upload System</title>
	<meta name="description" content="A modern file upload system for managing content" />
</svelte:head>

<div class="page-wrapper">
	<div class="page-container">
		<!-- Navigation Tabs -->
		<div class="nav-tabs">
			<div class="tab-list">
				<button class={getTabClass('all')} on:click={() => switchTab('all')}> All </button>
				<button class={getTabClass('videos')} on:click={() => switchTab('videos')}>Videos</button>
				<button class={getTabClass('documents')} on:click={() => switchTab('documents')}
					>Documents</button
				>
				<button class={getTabClass('lessons')} on:click={() => switchTab('lessons')}>Lessons</button
				>
				<button class={getTabClass('archive')} on:click={() => switchTab('archive')}>Archive</button
				>
			</div>

			<div class="header-actions">
				<div class="search-container">
					<Icon name="search" size={16} class_="search-icon" />
					<input type="text" placeholder="Search" class="search-input" />
				</div>
				{#if !isArchiveView}
					<button class="upload-btn" on:click={openUploadModal}> Upload </button>
				{/if}
			</div>
		</div>

		<!-- Success Notification -->
		{#if showSuccessNotification}
			<div class="notification success">
				<div class="notification-content">
					<Icon name="check-circle" size={20} class_="notification-icon" />
					<span>
						{#if isArchiveView}
							Item unarchived successfully!
						{:else}
							{uploads.length > 0
								? 'Resource uploaded successfully!'
								: 'Item archived successfully!'}
						{/if}
					</span>
				</div>
				<button class="notification-close" on:click={closeNotification}>
					<Icon name="x-mark" size={16} />
				</button>
			</div>
		{/if}

		<!-- Table Section -->
		<div class="table-section">
			<UploadsTable {uploads} {loading} {isArchiveView} on:archive={handleArchiveChange} />
		</div>
	</div>
</div>

<FileUploadModal
	isOpen={showUploadModal}
	on:close={closeUploadModal}
	on:upload={handleUploadSuccess}
/>

<style>
	.page-wrapper {
		min-height: 100vh;
		background: #f8fafc;
	}

	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px;
	}

	.nav-tabs {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		background: white;
		border-radius: 12px;
		padding: 16px 24px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.tab-list {
		display: flex;
		gap: 8px;
	}

	.tab-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: #6b7280;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.2s ease;
	}

	.tab-button:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.tab-button.active {
		background: #1f2937;
		color: white;
	}

	.tab-button.archive {
		color: #9ca3af;
	}

	.tab-button.archive.active {
		background: #374151;
		color: white;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.search-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-container :global(.search-icon) {
		position: absolute;
		left: 12px;
		color: #9ca3af;
		z-index: 1;
	}

	.search-input {
		padding: 8px 12px 8px 36px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		width: 200px;
		background: white;
	}

	.search-input:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
	}

	.search-input::placeholder {
		color: #9ca3af;
	}

	.upload-btn {
		background: #f97316;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.upload-btn:hover {
		background: #ea580c;
	}

	.notification {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 24px;
		animation: slideDown 0.3s ease-out;
	}

	.notification.success {
		background: #d1fae5;
		border: 1px solid #a7f3d0;
		color: #065f46;
	}

	.notification-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.notification :global(.notification-icon) {
		color: #10b981;
	}

	.notification-close {
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.notification-close:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.table-section {
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.page-container {
			padding: 16px;
		}

		.nav-tabs {
			flex-direction: column;
			gap: 16px;
			align-items: stretch;
		}

		.header-actions {
			justify-content: space-between;
		}

		.search-input {
			width: 150px;
		}
	}
</style>
