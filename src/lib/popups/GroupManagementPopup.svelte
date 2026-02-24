<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchMyGroups,
		createGroup,
		inviteToGroup,
		removeMember,
		fetchGroupMembers,
		ApiError
	} from '$lib/api';
	import type { GroupResponse, GroupMemberResponse } from '$lib/types';
	import { Users, Plus, UserPlus, Trash2, ArrowLeft } from 'lucide-svelte';

	let { onClose }: { onClose: () => void } = $props();

	// State
	let groups = $state<GroupResponse[]>([]);
	let selectedGroup = $state<GroupResponse | null>(null);
	let members = $state<GroupMemberResponse[]>([]);
	let loading = $state(true);
	let membersLoading = $state(false);
	let error = $state('');
	let success = $state('');

	// Create group
	let showCreateGroup = $state(false);
	let newGroupName = $state('');
	let creatingGroup = $state(false);

	// Invite
	let showInvite = $state(false);
	let inviteUsername = $state('');
	let inviting = $state(false);

	onMount(async () => {
		await loadGroups();
	});

	async function loadGroups() {
		loading = true;
		error = '';
		try {
			groups = await fetchMyGroups();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load groups';
		} finally {
			loading = false;
		}
	}

	async function selectGroup(group: GroupResponse) {
		selectedGroup = group;
		membersLoading = true;
		error = '';
		try {
			members = await fetchGroupMembers(group.id);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load members';
		} finally {
			membersLoading = false;
		}
	}

	async function handleCreateGroup(e: Event) {
		e.preventDefault();
		if (!newGroupName.trim() || creatingGroup) return;

		creatingGroup = true;
		error = '';
		success = '';
		try {
			const newGroup = await createGroup(newGroupName.trim());
			groups = [...groups, newGroup];
			newGroupName = '';
			showCreateGroup = false;
			success = `Group "${newGroup.name}" created!`;
			setTimeout(() => (success = ''), 3000);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to create group';
		} finally {
			creatingGroup = false;
		}
	}

	async function handleInvite(e: Event) {
		e.preventDefault();
		if (!inviteUsername.trim() || inviting || !selectedGroup) return;

		inviting = true;
		error = '';
		success = '';
		try {
			const newMember = await inviteToGroup(selectedGroup.id, { username: inviteUsername.trim() });
			members = [...members, newMember];
			inviteUsername = '';
			showInvite = false;
			success = `Invited ${newMember.user.username} to the group!`;
			setTimeout(() => (success = ''), 3000);
		} catch (err) {
			if (err instanceof ApiError && err.status === 403) {
				error = 'Only the group admin can invite members';
			} else {
				error = err instanceof ApiError ? err.message : 'Failed to invite user';
			}
		} finally {
			inviting = false;
		}
	}

	async function handleRemoveMember(userId: string, username: string) {
		if (!selectedGroup) return;
		error = '';
		success = '';
		try {
			await removeMember(selectedGroup.id, userId);
			members = members.filter((m) => m.user.id !== userId);
			success = `Removed ${username} from the group`;
			setTimeout(() => (success = ''), 3000);
		} catch (err) {
			if (err instanceof ApiError && err.status === 403) {
				error = 'Only the group admin can remove members';
			} else {
				error = err instanceof ApiError ? err.message : 'Failed to remove member';
			}
		}
	}

	function goBack() {
		selectedGroup = null;
		members = [];
		showInvite = false;
		error = '';
		success = '';
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 flex items-center justify-center z-50"
	style="background-color: var(--todo-overlay-bg);"
	onclick={onClose}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="rounded-xl p-6 w-[28rem] relative max-h-[80vh] overflow-y-auto"
		style="background-color: var(--todo-card-bg); box-shadow: var(--todo-shadow-hover);"
		onclick={(e) => e.stopPropagation()}
	>
		<button
			class="cursor-pointer absolute top-5 right-5 transition-colors"
			style="color: var(--todo-text-secondary);"
			onclick={onClose}
		>
			✕
		</button>

		{#if error}
			<div
				class="mb-3 mr-6 p-2 rounded-lg text-sm"
				style="background-color: var(--todo-error-bg); border: 1px solid var(--todo-error-border); color: var(--todo-error-text);"
			>
				{error}
			</div>
		{/if}
		{#if success}
			<div
				class="mb-3 mr-6 p-2 rounded-lg text-sm"
				style="background-color: var(--todo-success-bg); border: 1px solid var(--todo-success-border); color: var(--todo-success-text);"
			>
				{success}
			</div>
		{/if}

		{#if !selectedGroup}
			<!-- Groups List View -->
			<div class="flex items-center gap-2 mb-4">
				<Users size={20} style="color: var(--todo-link-color);" />
				<h2 class="text-xl font-semibold" style="color: var(--todo-text-primary);">My Groups</h2>
			</div>

			{#if loading}
				<p class="text-sm py-4 text-center" style="color: var(--todo-text-secondary);">
					Loading groups...
				</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each groups as group (group.id)}
						<button
							onclick={() => selectGroup(group)}
							class="w-full text-left px-4 py-3 rounded-lg
							cursor-pointer transition-all duration-150 flex items-center justify-between"
							style="background-color: var(--todo-card-bg); border: 1px solid var(--todo-card-border);"
							onmouseenter={(e) => {
								e.currentTarget.style.boxShadow = 'var(--todo-shadow-hover)';
								e.currentTarget.style.transform = 'translateY(-2px)';
							}}
							onmouseleave={(e) => {
								e.currentTarget.style.boxShadow = 'none';
								e.currentTarget.style.transform = 'translateY(0)';
							}}
						>
							<div>
								<div class="font-medium" style="color: var(--todo-text-primary);">{group.name}</div>
								<div class="text-xs" style="color: var(--todo-text-secondary);">
									{group.members.length}
									{group.members.length === 1 ? 'member' : 'members'}
								</div>
							</div>
							<div style="color: var(--todo-text-secondary);">→</div>
						</button>
					{/each}

					{#if groups.length === 0}
						<p class="text-sm text-center py-4" style="color: var(--todo-text-secondary);">
							No groups yet
						</p>
					{/if}
				</div>

				<!-- Create Group -->
				{#if showCreateGroup}
					<form onsubmit={handleCreateGroup} class="mt-4 flex gap-2">
						<input
							placeholder="Group name"
							bind:value={newGroupName}
							class="flex-grow px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
							style="background-color: var(--todo-input-bg); border: 1px solid var(--todo-input-border); color: var(--todo-text-primary); --tw-ring-color: var(--color-primary-500);"
						/>
						<button
							type="submit"
							disabled={creatingGroup}
							class="px-4 py-2 rounded-lg text-sm cursor-pointer transition-all disabled:opacity-50"
							style="background-color: var(--todo-btn-primary-bg); color: var(--todo-btn-primary-text);"
							onmouseenter={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-hover)')}
							onmouseleave={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-bg)')}
						>
							{creatingGroup ? '...' : 'Create'}
						</button>
						<button
							type="button"
							onclick={() => (showCreateGroup = false)}
							class="px-3 py-2 rounded-lg text-sm cursor-pointer transition-all"
							style="color: var(--todo-text-secondary);"
							onmouseenter={(e) => (e.currentTarget.style.backgroundColor = 'var(--todo-hover-bg)')}
							onmouseleave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
						>
							Cancel
						</button>
					</form>
				{:else}
					<button
						onclick={() => (showCreateGroup = true)}
						class="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
						cursor-pointer transition-all text-sm"
						style="border: 1px dashed var(--todo-dashed-border); color: var(--todo-text-secondary);"
						onmouseenter={(e) => {
							e.currentTarget.style.borderColor = 'var(--todo-link-color)';
							e.currentTarget.style.color = 'var(--todo-link-color)';
						}}
						onmouseleave={(e) => {
							e.currentTarget.style.borderColor = 'var(--todo-dashed-border)';
							e.currentTarget.style.color = 'var(--todo-text-secondary)';
						}}
					>
						<Plus size={16} />
						<span>Create New Group</span>
					</button>
				{/if}
			{/if}
		{:else}
			<!-- Group Detail View -->
			<div class="flex items-center gap-3 mb-4">
				<button
					onclick={goBack}
					class="cursor-pointer transition-colors"
					style="color: var(--todo-text-secondary);"
					onmouseenter={(e) => (e.currentTarget.style.color = 'var(--todo-text-primary)')}
					onmouseleave={(e) => (e.currentTarget.style.color = 'var(--todo-text-secondary)')}
				>
					<ArrowLeft size={20} />
				</button>
				<div>
					<h2 class="text-xl font-semibold" style="color: var(--todo-text-primary);">
						{selectedGroup.name}
					</h2>
				</div>
			</div>

			<h3 class="text-sm font-medium mb-2" style="color: var(--todo-text-secondary);">Members</h3>

			{#if membersLoading}
				<p class="text-sm py-4 text-center" style="color: var(--todo-text-secondary);">
					Loading members...
				</p>
			{:else}
				<div class="flex flex-col gap-1">
					{#each members as member (member.id)}
						{@const isOwner = member.user.id === selectedGroup.admin_id}
						<div
							class="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
							style="background-color: {isOwner ? 'var(--todo-badge-owner-bg)' : 'transparent'};"
							onmouseenter={(e) => {
								if (!isOwner) e.currentTarget.style.backgroundColor = 'var(--todo-hover-bg)';
							}}
							onmouseleave={(e) => {
								if (!isOwner) e.currentTarget.style.backgroundColor = 'transparent';
							}}
						>
							<div class="flex items-center gap-3">
								<div
									class="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium"
									style="background-color: {isOwner
										? 'var(--todo-avatar-owner-bg)'
										: 'var(--todo-avatar-accent-bg)'};"
								>
									{#if isOwner}
										👑
									{:else}
										{member.user.username[0].toUpperCase()}
									{/if}
								</div>
								<div>
									<div class="text-sm font-medium" style="color: var(--todo-text-primary);">
										{member.user.full_name || member.user.username}
										{#if isOwner}
											<span
												class="ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full"
												style="color: var(--todo-badge-owner-text); background-color: var(--todo-badge-owner-bg);"
												>Owner</span
											>
										{/if}
									</div>
									<div class="text-xs" style="color: var(--todo-text-secondary);">
										@{member.user.username}
									</div>
								</div>
							</div>
							{#if !isOwner}
								<button
									onclick={() => handleRemoveMember(member.user.id, member.user.username)}
									class="cursor-pointer transition-colors p-1"
									title="Remove member"
									style="color: var(--todo-delete-color);"
									onmouseenter={(e) => (e.currentTarget.style.color = 'var(--todo-delete-hover)')}
									onmouseleave={(e) => (e.currentTarget.style.color = 'var(--todo-delete-color)')}
								>
									<Trash2 size={14} />
								</button>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Invite Member -->
				{#if showInvite}
					<form onsubmit={handleInvite} class="mt-3 flex gap-2">
						<input
							placeholder="Username to invite"
							bind:value={inviteUsername}
							class="flex-grow px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
							style="background-color: var(--todo-input-bg); border: 1px solid var(--todo-input-border); color: var(--todo-text-primary); --tw-ring-color: var(--color-primary-500);"
						/>
						<button
							type="submit"
							disabled={inviting}
							class="px-4 py-2 rounded-lg text-sm cursor-pointer transition-all disabled:opacity-50"
							style="background-color: var(--todo-btn-primary-bg); color: var(--todo-btn-primary-text);"
							onmouseenter={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-hover)')}
							onmouseleave={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-bg)')}
						>
							{inviting ? '...' : 'Invite'}
						</button>
						<button
							type="button"
							onclick={() => (showInvite = false)}
							class="px-3 py-2 rounded-lg text-sm cursor-pointer transition-all"
							style="color: var(--todo-text-secondary);"
							onmouseenter={(e) => (e.currentTarget.style.backgroundColor = 'var(--todo-hover-bg)')}
							onmouseleave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
						>
							Cancel
						</button>
					</form>
				{:else}
					<button
						onclick={() => (showInvite = true)}
						class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
						cursor-pointer transition-all text-sm"
						style="border: 1px dashed var(--todo-dashed-border); color: var(--todo-text-secondary);"
						onmouseenter={(e) => {
							e.currentTarget.style.borderColor = 'var(--todo-link-color)';
							e.currentTarget.style.color = 'var(--todo-link-color)';
						}}
						onmouseleave={(e) => {
							e.currentTarget.style.borderColor = 'var(--todo-dashed-border)';
							e.currentTarget.style.color = 'var(--todo-text-secondary)';
						}}
					>
						<UserPlus size={16} />
						<span>Invite Member</span>
					</button>
				{/if}
			{/if}
		{/if}
	</div>
</div>
