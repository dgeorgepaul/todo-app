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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 flex items-center justify-center z-50"
	style="background-color: var(--todo-overlay-bg);"
	onclick={onClose}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="rounded-xl p-6 w-[26rem] relative max-h-[70vh] overflow-y-auto"
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

		<div class="flex items-center gap-2 mb-4">
			<Share2 size={20} style="color: var(--todo-link-color);" />
			<h2 class="text-xl font-semibold" style="color: var(--todo-text-primary);">Share List</h2>
		</div>

		{#if error}
			<div
				class="mb-3 p-2 rounded-lg text-sm"
				style="background-color: var(--todo-error-bg); border: 1px solid var(--todo-error-border); color: var(--todo-error-text);"
			>
				{error}
			</div>
		{/if}
		{#if success}
			<div
				class="mb-3 p-2 rounded-lg text-sm"
				style="background-color: var(--todo-success-bg); border: 1px solid var(--todo-success-border); color: var(--todo-success-text);"
			>
				{success}
			</div>
		{/if}

		{#if loading}
			<p class="text-sm py-4 text-center" style="color: var(--todo-text-secondary);">
				Loading groups...
			</p>
		{:else if !selectedGroup}
			<!-- Step 1: Select a group -->
			<p class="text-sm mb-3" style="color: var(--todo-text-secondary);">
				Select a group to share with:
			</p>
			<div class="flex flex-col gap-2">
				{#each groups as group (group.id)}
					<button
						onclick={() => selectGroup(group)}
						class="w-full text-left px-4 py-3 rounded-lg
						cursor-pointer transition-all duration-150"
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
						<div class="font-medium" style="color: var(--todo-text-primary);">{group.name}</div>
						<div class="text-xs" style="color: var(--todo-text-secondary);">
							{group.members.length}
							{group.members.length === 1 ? 'member' : 'members'}
						</div>
					</button>
				{/each}
				{#if groups.length === 0}
					<p class="text-sm text-center py-4" style="color: var(--todo-text-secondary);">
						No groups available
					</p>
				{/if}
			</div>
		{:else}
			<!-- Step 2: Select a member to share with -->
			<button
				onclick={() => {
					selectedGroup = null;
					error = '';
				}}
				class="text-sm cursor-pointer transition-colors mb-3"
				style="color: var(--todo-text-secondary);"
				onmouseenter={(e) => (e.currentTarget.style.color = 'var(--todo-text-primary)')}
				onmouseleave={(e) => (e.currentTarget.style.color = 'var(--todo-text-secondary)')}
			>
				← Back to groups
			</button>

			<p class="text-sm mb-3" style="color: var(--todo-text-secondary);">
				Share with a member of <strong style="color: var(--todo-text-primary);"
					>{selectedGroup.name}</strong
				>:
			</p>

			{#if membersLoading}
				<p class="text-sm py-4 text-center" style="color: var(--todo-text-secondary);">
					Loading members...
				</p>
			{:else}
				<div class="flex flex-col gap-1">
					{#each members as member (member.id)}
						{@const alreadyShared = hasAccess(member.user.id)}
						{@const isOwner = member.user.id === selectedGroup.admin_id}
						<button
							onclick={() => !alreadyShared && !isOwner && handleShare(member.user.username)}
							disabled={sharing || alreadyShared || isOwner}
							class="w-full flex items-center gap-3 px-3 py-2 rounded-lg
							cursor-pointer transition-colors text-left disabled:opacity-70 disabled:cursor-default"
							style="background-color: {isOwner
								? 'var(--todo-badge-owner-bg)'
								: alreadyShared
									? 'var(--todo-success-bg)'
									: 'transparent'};"
							onmouseenter={(e) => {
								if (!isOwner && !alreadyShared)
									e.currentTarget.style.backgroundColor = 'var(--todo-hover-bg)';
							}}
							onmouseleave={(e) => {
								if (!isOwner && !alreadyShared)
									e.currentTarget.style.backgroundColor = 'transparent';
							}}
						>
							<div
								class="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium"
								style="background-color: {isOwner
									? 'var(--todo-avatar-owner-bg)'
									: alreadyShared
										? 'var(--todo-avatar-access-bg)'
										: 'var(--todo-avatar-accent-bg)'};"
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
								{#if member.user.email}
									<div class="text-xs" style="color: var(--todo-text-muted);">
										{member.user.email}
									</div>
								{/if}
							</div>
							{#if alreadyShared}
								<span
									class="text-xs font-medium px-2 py-0.5 rounded-full"
									style="color: var(--todo-badge-access-text); background-color: var(--todo-badge-access-bg);"
								>
									Has access
								</span>
							{/if}
						</button>
					{/each}
					{#if members.length === 0}
						<p class="text-sm text-center py-4" style="color: var(--todo-text-secondary);">
							No other members in this group
						</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
