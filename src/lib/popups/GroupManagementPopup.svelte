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

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
	<div class="bg-white rounded-xl p-6 w-[28rem] relative max-h-[80vh] overflow-y-auto">
		<button
			class="cursor-pointer absolute top-5 right-5 text-gray-500 hover:text-gray-700"
			onclick={onClose}
		>
			✕
		</button>

		{#if error}
			<div class="mb-3 mr-6 p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
				{error}
			</div>
		{/if}
		{#if success}
			<div
				class="mb-3 mr-6 p-2 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm"
			>
				{success}
			</div>
		{/if}

		{#if !selectedGroup}
			<!-- Groups List View -->
			<div class="flex items-center gap-2 mb-4">
				<Users size={20} class="text-[#e76e50]" />
				<h2 class="text-xl font-semibold text-[#2c2421]">My Groups</h2>
			</div>

			{#if loading}
				<p class="text-[#8c7b73] text-sm py-4 text-center">Loading groups...</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each groups as group (group.id)}
						<button
							onclick={() => selectGroup(group)}
							class="w-full text-left px-4 py-3 rounded-lg border border-stone-200 bg-white
							hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-150 flex items-center justify-between"
						>
							<div>
								<div class="font-medium text-[#2c2421]">{group.name}</div>
								<div class="text-xs text-[#8c7b73]">
									{group.members.length}
									{group.members.length === 1 ? 'member' : 'members'}
								</div>
							</div>
							<div class="text-[#8c7b73]">→</div>
						</button>
					{/each}

					{#if groups.length === 0}
						<p class="text-[#8c7b73] text-sm text-center py-4">No groups yet</p>
					{/if}
				</div>

				<!-- Create Group -->
				{#if showCreateGroup}
					<form onsubmit={handleCreateGroup} class="mt-4 flex gap-2">
						<input
							placeholder="Group name"
							bind:value={newGroupName}
							class="flex-grow border border-stone-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e76e50] focus:border-transparent"
						/>
						<button
							type="submit"
							disabled={creatingGroup}
							class="px-4 py-2 bg-[#e76e50] text-white rounded-lg text-sm cursor-pointer hover:bg-[#d45d40] transition-all disabled:opacity-50"
						>
							{creatingGroup ? '...' : 'Create'}
						</button>
						<button
							type="button"
							onclick={() => (showCreateGroup = false)}
							class="px-3 py-2 text-[#8c7b73] rounded-lg text-sm cursor-pointer hover:bg-stone-100 transition-all"
						>
							Cancel
						</button>
					</form>
				{:else}
					<button
						onclick={() => (showCreateGroup = true)}
						class="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-stone-300 text-[#8c7b73]
						hover:border-[#e76e50] hover:text-[#e76e50] cursor-pointer transition-all text-sm"
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
					class="cursor-pointer text-[#8c7b73] hover:text-[#2c2421] transition-colors"
				>
					<ArrowLeft size={20} />
				</button>
				<div>
					<h2 class="text-xl font-semibold text-[#2c2421]">{selectedGroup.name}</h2>
				</div>
			</div>

			<h3 class="text-sm font-medium text-[#8c7b73] mb-2">Members</h3>

			{#if membersLoading}
				<p class="text-[#8c7b73] text-sm py-4 text-center">Loading members...</p>
			{:else}
				<div class="flex flex-col gap-1">
					{#each members as member (member.id)}
						{@const isOwner = member.user.id === selectedGroup.admin_id}
						<div
							class="flex items-center justify-between px-3 py-2 rounded-lg {isOwner
								? 'bg-amber-50'
								: 'hover:bg-stone-50'} transition-colors"
						>
							<div class="flex items-center gap-3">
								<div
									class="w-8 h-8 rounded-full {isOwner
										? 'bg-amber-500'
										: 'bg-[#e76e50]'} text-white flex items-center justify-center text-sm font-medium"
								>
									{#if isOwner}
										👑
									{:else}
										{member.user.username[0].toUpperCase()}
									{/if}
								</div>
								<div>
									<div class="text-sm font-medium text-[#2c2421]">
										{member.user.full_name || member.user.username}
										{#if isOwner}
											<span
												class="ml-1.5 text-xs font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full"
												>Owner</span
											>
										{/if}
									</div>
									<div class="text-xs text-[#8c7b73]">@{member.user.username}</div>
								</div>
							</div>
							{#if !isOwner}
								<button
									onclick={() => handleRemoveMember(member.user.id, member.user.username)}
									class="text-red-400 hover:text-red-600 cursor-pointer transition-colors p-1"
									title="Remove member"
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
							class="flex-grow border border-stone-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e76e50] focus:border-transparent"
						/>
						<button
							type="submit"
							disabled={inviting}
							class="px-4 py-2 bg-[#e76e50] text-white rounded-lg text-sm cursor-pointer hover:bg-[#d45d40] transition-all disabled:opacity-50"
						>
							{inviting ? '...' : 'Invite'}
						</button>
						<button
							type="button"
							onclick={() => (showInvite = false)}
							class="px-3 py-2 text-[#8c7b73] rounded-lg text-sm cursor-pointer hover:bg-stone-100 transition-all"
						>
							Cancel
						</button>
					</form>
				{:else}
					<button
						onclick={() => (showInvite = true)}
						class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-stone-300 text-[#8c7b73]
						hover:border-[#e76e50] hover:text-[#e76e50] cursor-pointer transition-all text-sm"
					>
						<UserPlus size={16} />
						<span>Invite Member</span>
					</button>
				{/if}
			{/if}
		{/if}
	</div>
</div>
