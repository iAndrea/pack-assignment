<script>
	import { createEventDispatcher } from 'svelte';
	import {
		CATEGORIES,
		LANGUAGES,
		PROVIDERS,
		ROLES,
		ACCEPTED_FILE_TYPES,
		MAX_FILE_SIZE
	} from '$lib/constants';
	import { formatFileSize } from '$lib/utils';
	import Icon from './Icon.svelte';

	const dispatch = createEventDispatcher();

	export let isOpen = false;

	let formData = {
		title: '',
		description: '',
		category: '',
		language: '',
		provider: '',
		roles: [],
		file: null
	};

	let errors = {};
	let isSubmitting = false;
	let showRoleDropdown = false;

	function validateForm() {
		errors = {};

		if (!formData.title.trim()) {
			errors.title = 'Title is required';
		} else if (formData.title.length > 200) {
			errors.title = 'Title must be 200 characters or less';
		}

		if (!formData.description.trim()) {
			errors.description = 'Description is required';
		} else if (formData.description.length > 1000) {
			errors.description = 'Description must be 1000 characters or less';
		}

		if (!formData.category) {
			errors.category = 'Category is required';
		}

		if (!formData.language) {
			errors.language = 'Language is required';
		}

		if (!formData.provider) {
			errors.provider = 'Provider is required';
		}

		if (formData.roles.length === 0) {
			errors.roles = 'At least one role must be selected';
		}

		if (!formData.file) {
			errors.file = 'File is required';
		} else if (formData.file.size > MAX_FILE_SIZE) {
			errors.file = `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		isSubmitting = true;

		try {
			const formDataToSend = new FormData();
			formDataToSend.append('title', formData.title);
			formDataToSend.append('description', formData.description);
			formDataToSend.append('category', formData.category);
			formDataToSend.append('language', formData.language);
			formDataToSend.append('provider', formData.provider);
			formDataToSend.append('roles', JSON.stringify(formData.roles));
			formDataToSend.append('file', formData.file);

			const response = await fetch('/api/uploads', {
				method: 'POST',
				body: formDataToSend
			});

			const result = await response.json();

			if (response.ok) {
				dispatch('upload', result);
				closeModal();
			} else {
				errors.submit = result.error || 'Upload failed';
			}
		} catch (error) {
			errors.submit = 'Network error occurred';
		} finally {
			isSubmitting = false;
		}
	}

	function handleFileSelect(event) {
		const target = event.target;
		if (target.files && target.files[0]) {
			formData.file = target.files[0];
		}
	}

	function closeModal() {
		formData = {
			title: '',
			description: '',
			category: '',
			language: '',
			provider: '',
			roles: [],
			file: null
		};
		errors = {};
		isSubmitting = false;
		showRoleDropdown = false;
		dispatch('close');
	}

	function toggleRole(role) {
		if (formData.roles.includes(role)) {
			formData.roles = formData.roles.filter((r) => r !== role);
		} else {
			formData.roles = [...formData.roles, role];
		}
	}

	function toggleRoleDropdown() {
		showRoleDropdown = !showRoleDropdown;
	}

	function openFileDialog() {
		document.getElementById('file-input')?.click();
	}

	function getRoleDisplayText() {
		if (formData.roles.length === 0) return 'Role';
		if (formData.roles.length === 1) return formData.roles[0];
		return `${formData.roles.length} roles selected`;
	}

	function getLanguageDisplayName(code) {
		const lang = LANGUAGES.find((l) => l.code === code);
		return lang ? lang.name : code;
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={closeModal} role="dialog" tabindex="-1">
		<div class="modal-content" on:click|stopPropagation role="document">
			<div class="modal-header">
				<h2 class="modal-title">Upload Resource</h2>
				<button class="modal-close" on:click={closeModal} type="button">
					<Icon name="x-mark" size={20} />
				</button>
			</div>

			<form on:submit|preventDefault={handleSubmit} class="upload-form">
				<div class="form-row">
					<div class="form-group full-width">
						<input
							type="text"
							class="form-input"
							bind:value={formData.title}
							placeholder="Title*"
							maxlength="200"
						/>
						{#if errors.title}
							<div class="form-error">{errors.title}</div>
						{/if}
					</div>
				</div>

				<div class="form-row">
					<div class="form-group full-width">
						<textarea
							class="form-textarea"
							bind:value={formData.description}
							placeholder="Description*"
							maxlength="1000"
							rows="3"
						/>
						{#if errors.description}
							<div class="form-error">{errors.description}</div>
						{/if}
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<select class="form-select" bind:value={formData.category}>
							<option value="">Category*</option>
							{#each CATEGORIES as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
						{#if errors.category}
							<div class="form-error">{errors.category}</div>
						{/if}
					</div>

					<div class="form-group">
						<select class="form-select" bind:value={formData.language}>
							<option value="">Language*</option>
							{#each LANGUAGES as lang}
								<option value={lang.code}>{lang.name}</option>
							{/each}
						</select>
						{#if errors.language}
							<div class="form-error">{errors.language}</div>
						{/if}
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<select class="form-select" bind:value={formData.provider}>
							<option value="">Provider*</option>
							{#each PROVIDERS as provider}
								<option value={provider}>{provider}</option>
							{/each}
						</select>
						{#if errors.provider}
							<div class="form-error">{errors.provider}</div>
						{/if}
					</div>

					<div class="form-group">
						<div class="custom-dropdown">
							<button
								type="button"
								class="dropdown-trigger"
								on:click={toggleRoleDropdown}
								class:has-selection={formData.roles.length > 0}
							>
								{getRoleDisplayText()}
								<Icon name="chevron-down" size={16} class_="dropdown-arrow" />
							</button>

							{#if showRoleDropdown}
								<div class="dropdown-menu">
									{#each ROLES as role}
										<label class="dropdown-item">
											<input
												type="checkbox"
												checked={formData.roles.includes(role)}
												on:change={() => toggleRole(role)}
											/>
											{role}
										</label>
									{/each}
								</div>
							{/if}
						</div>
						{#if errors.roles}
							<div class="form-error">{errors.roles}</div>
						{/if}
					</div>
				</div>

				<div class="form-row">
					<div class="form-group file-group">
						<div class="file-input-container">
							<input
								type="file"
								accept={ACCEPTED_FILE_TYPES.join(',')}
								on:change={handleFileSelect}
								style="display: none;"
								id="file-input"
							/>

							<div class="file-display">
								<span class="file-text">
									{formData.file ? formData.file.name : 'No file selected*'}
								</span>
								<button type="button" class="file-select-btn" on:click={openFileDialog}>
									Select file
								</button>
							</div>
						</div>
						{#if errors.file}
							<div class="form-error">{errors.file}</div>
						{/if}
					</div>
				</div>

				{#if errors.submit}
					<div class="form-error submit-error">
						{errors.submit}
					</div>
				{/if}

				<div class="form-actions">
					<button type="submit" class="upload-btn" disabled={isSubmitting}>
						{isSubmitting ? 'Uploading...' : 'Upload'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.modal-header {
		padding: 24px 32px 0 32px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 24px;
	}

	.modal-title {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #1f2937;
		padding-bottom: 24px;
	}

	.modal-close {
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
		padding: 4px;
		margin-top: -24px;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.modal-close:hover {
		color: #374151;
		background: #f3f4f6;
	}

	.upload-form {
		padding: 0 32px 32px 32px;
	}

	.form-row {
		display: flex;
		gap: 16px;
		margin-bottom: 16px;
	}

	.form-group {
		flex: 1;
		position: relative;
	}

	.form-group.full-width {
		flex: none;
		width: 100%;
	}

	.form-group.file-group {
		flex: none;
		width: 100%;
	}

	.form-input,
	.form-textarea,
	.form-select {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 14px;
		background: white;
		transition: border-color 0.2s ease;
	}

	.form-input:focus,
	.form-textarea:focus,
	.form-select:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
	}

	.form-input::placeholder,
	.form-textarea::placeholder {
		color: #9ca3af;
	}

	.form-textarea {
		resize: vertical;
		min-height: 80px;
		font-family: inherit;
	}

	.form-select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 12px center;
		background-repeat: no-repeat;
		background-size: 16px;
		padding-right: 40px;
	}

	.custom-dropdown {
		position: relative;
	}

	.dropdown-trigger {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: white;
		text-align: left;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		color: #9ca3af;
		transition: border-color 0.2s ease;
	}

	.dropdown-trigger.has-selection {
		color: #374151;
	}

	.dropdown-trigger:hover,
	.dropdown-trigger:focus {
		border-color: #f97316;
		outline: none;
	}

	.dropdown-trigger :global(.dropdown-arrow) {
		transition: transform 0.2s ease;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		z-index: 10;
		max-height: 200px;
		overflow-y: auto;
		margin-top: 4px;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		cursor: pointer;
		font-size: 14px;
		gap: 8px;
		transition: background-color 0.2s ease;
	}

	.dropdown-item:hover {
		background: #f9fafb;
	}

	.dropdown-item input[type='checkbox'] {
		margin: 0;
		width: 16px;
		height: 16px;
	}

	.file-input-container {
		border: 1px solid #d1d5db;
		border-radius: 8px;
		overflow: hidden;
	}

	.file-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background: white;
	}

	.file-text {
		color: #9ca3af;
		font-size: 14px;
		flex: 1;
	}

	.file-select-btn {
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 14px;
		color: #374151;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s ease;
	}

	.file-select-btn:hover {
		background: #e5e7eb;
	}

	.form-error {
		color: #ef4444;
		font-size: 12px;
		margin-top: 4px;
	}

	.submit-error {
		text-align: center;
		margin-bottom: 16px;
		padding: 8px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 6px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid #e5e7eb;
	}

	.upload-btn {
		background: #f97316;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 12px 32px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.upload-btn:hover:not(:disabled) {
		background: #ea580c;
	}

	.upload-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.modal-content {
			margin: 20px;
			max-width: none;
		}

		.modal-header,
		.upload-form {
			padding-left: 20px;
			padding-right: 20px;
		}

		.form-row {
			flex-direction: column;
			gap: 12px;
		}
	}
</style>
