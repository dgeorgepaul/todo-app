<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchMyGroups,
		fetchGroupMembers,
		fetchTodolistShares,
		shareTodolist,
		ApiError
	} from '$lib/api';
	import type { GroupResponse, GroupMemberResponse, TodoListShareResponse } from '$lib/types';
	import { Share2, Check } from 'lucide-svelte';

	let { listId, onClose }: { listId: string; onClose: () => void } = $props();

	let groups = $state<GroupResponse[]>([]);
	let selectedGroup = $state<GroupResponse | null>(null);
	let members = $state<GroupMemberResponse[]>([]);
	let shares = $state<TodoListShareResponse[]>([]);
	let loading = $state(true);
	let membersLoading = $state(false);
	let sharing = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(async () => {
		try {
			groups = await fetchMyGroups();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load groups';
		} finally {
			loading = false;
		}
	});

	function hasAccess(userId: string): boolean {
		return shares.some((s) => s.shared_with_user.id === userId);
	}

	async function selectGroup(group: GroupResponse) {
		selectedGroup = group;
		membersLoading = true;
		error = '';
		try {
			const [membersResult, sharesResult] = await Promise.all([
				fetchGroupMembers(group.id),
				fetchTodolistShares(group.id, listId)
			]);
			members = membersResult;
			shares = sharesResult;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to load members';
		} finally {
			membersLoading = false;
		}
	}

	async function handleShare(username: string) {
		if (!selectedGroup || sharing) return;
		sharing = true;
		error = '';
		success = '';
		try {
			await shareTodolist(selectedGroup.id, {
				todolist_id: listId,
				shared_with_username: username
			});
			// Refresh shares to update badges
			shares = await fetchTodolistShares(selectedGroup.id, listId);
			success = `Shared with ${username}!`;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Failed to share';
		} finally {
			sharing = false;
		}
	}
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
	<div class="bg-white rounded-xl p-6 w-[26rem] relative max-h-[70vh] overflow-y-auto">
		<button
			class="cursor-pointer absolute top-5 right-5 text-gray-500 hover:text-gray-700"
			onclick={onClose}
		>
			✕
		</button>

		<div class="flex items-center gap-2 mb-4">
			<Share2 size={20} class="text-[#e76e50]" />
			<h2 class="text-xl font-semibold text-[#2c2421]">Share List</h2>
		</div>

		{#if error}
			<div class="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
				{error}
			</div>
		{/if}
		{#if success}
			<div class="mb-3 p-2 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
				{success}
			</div>
		{/if}

		{#if loading}
			<p class="text-[#8c7b73] text-sm py-4 text-center">Loading groups...</p>
		{:else if !selectedGroup}
			<!-- Step 1: Select a group -->
			<p class="text-sm text-[#8c7b73] mb-3">Select a group to share with:</p>
			<div class="flex flex-col gap-2">
				{#each groups as group (group.id)}
					<button
						onclick={() => selectGroup(group)}
						class="w-full text-left px-4 py-3 rounded-lg border border-stone-200 bg-white
						hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-150"
					>
						<div class="font-medium text-[#2c2421]">{group.name}</div>
						<div class="text-xs text-[#8c7b73]">
							{group.members.length}
							{group.members.length === 1 ? 'member' : 'members'}
						</div>
					</button>
				{/each}
				{#if groups.length === 0}
					<p class="text-[#8c7b73] text-sm text-center py-4">No groups available</p>
				{/if}
			</div>
		{:else}
			<!-- Step 2: Select a member to share with -->
			<button
				onclick={() => {
					selectedGroup = null;
					error = '';
				}}
				class="text-sm text-[#8c7b73] hover:text-[#2c2421] cursor-pointer transition-colors mb-3"
			>
				← Back to groups
			</button>

			<p class="text-sm text-[#8c7b73] mb-3">
				Share with a member of <strong>{selectedGroup.name}</strong>:
			</p>

			{#if membersLoading}
				<p class="text-[#8c7b73] text-sm py-4 text-center">Loading members...</p>
			{:else}
				<div class="flex flex-col gap-1">
					{#each members as member (member.id)}
						{@const alreadyShared = hasAccess(member.user.id)}
						{@const isOwner = member.user.id === selectedGroup.admin_id}
						<button
							onclick={() => !alreadyShared && !isOwner && handleShare(member.user.username)}
							disabled={sharing || alreadyShared || isOwner}
							class="w-full flex items-center gap-3 px-3 py-2 rounded-lg
							{isOwner ? 'bg-amber-50' : alreadyShared ? 'bg-green-50' : 'hover:bg-stone-50'}
							cursor-pointer transition-colors text-left disabled:opacity-70 disabled:cursor-default"
						>
							<div
								class="w-8 h-8 rounded-full {isOwner
									? 'bg-amber-500'
									: alreadyShared
										? 'bg-emerald-500'
										: 'bg-[#e76e50]'} text-white flex items-center justify-center text-sm font-medium"
							>
								{#if isOwner}
									👑
								{:else if alreadyShared}
									<Check size={16} />
								{:else}
									{member.user.username[0].toUpperCase()}
								{/if}
							</div>
							<div class="flex-1">
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
								{#if member.user.email}
									<div class="text-xs text-[#a89890]">{member.user.email}</div>
								{/if}
							</div>
							{#if alreadyShared}
								<span
									class="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full"
								>
									Has access
								</span>
							{/if}
						</button>
					{/each}
					{#if members.length === 0}
						<p class="text-[#8c7b73] text-sm text-center py-4">No other members in this group</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
