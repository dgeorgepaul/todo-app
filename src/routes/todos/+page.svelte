<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { lists } from '$lib/todolists.svelte';
	import type { TodoList } from '$lib/types';
	import { ChevronRight, Plus, Users } from 'lucide-svelte';
	import CreateTodoListPopup from '$lib/popups/CreateTodoListPopup.svelte';
	import GroupManagementPopup from '$lib/popups/GroupManagementPopup.svelte';

	onMount(() => {
		lists.load();
	});

	let showPopup = $state(false);
	let showGroupPopup = $state(false);

	function handleCreate(newList: TodoList) {
		showPopup = false;
	}

	function progress(list: TodoList): number {
		const total = list.todos.length;
		if (!total) return 0;
		const done = list.todos.filter((t) => t.done).length;
		return Math.round((done / total) * 100);
	}

	function counts(list: TodoList): { done: number; total: number } {
		const total = list.todos.length;
		const done = list.todos.filter((t) => t.done).length;
		return { done, total };
	}

	let completed = $derived(
		lists.filter((list) => list.todos.length > 0 && list.todos.every((todo) => todo.done)).length
	);
</script>

<div class="flex flex-col w-full">
	<nav
		style="border-bottom: 1px solid var(--todo-header-border); background-color: var(--todo-nav-bg);"
	>
		<div class="container mx-auto py-4 px-2 w-[50rem] flex items-center justify-between">
			<div>
				<h1 class="font-semibold text-lg" style="color: var(--todo-text-primary);">My Lists</h1>
				<p class="font-light text-base" style="color: var(--todo-text-secondary);">
					{completed} of {lists.length} lists completed
				</p>
			</div>
			<button
				onclick={() => (showGroupPopup = true)}
				class="flex items-center gap-2 text-sm cursor-pointer transition-colors px-3 py-2 rounded-lg"
				style="color: var(--todo-text-secondary);"
				onmouseenter={(e) => {
					e.currentTarget.style.color = 'var(--todo-link-color)';
					e.currentTarget.style.backgroundColor = 'var(--todo-hover-bg)';
				}}
				onmouseleave={(e) => {
					e.currentTarget.style.color = 'var(--todo-text-secondary)';
					e.currentTarget.style.backgroundColor = 'transparent';
				}}
			>
				<Users size={16} />
				<span>Groups</span>
			</button>
		</div>
	</nav>
	<div class="body-bottom h-full flex-grow container mx-auto py-4 px-2 w-[50rem]">
		{#if lists.loading}
			<div class="flex items-center justify-center py-12">
				<p style="color: var(--todo-text-secondary);">Loading your lists...</p>
			</div>
		{:else if lists.error}
			<div class="flex items-center justify-center py-12">
				<p style="color: var(--todo-error-text);">{lists.error}</p>
			</div>
		{:else}
			<div class="todoLists">
				<ul class="py-4 flex flex-col gap-2">
					{#each lists as list (list.id)}
						<div
							onclick={() => goto(`/todos/${list.id}`)}
							class="flex justify-between items-center w-full my-2 py-4 flex gap-2 items-center px-2 rounded-lg
							cursor-pointer transition-all duration-150
							p-4 rounded-lg active:scale-95"
							style="background-color: var(--todo-card-bg); border: 1px solid var(--todo-card-border); box-shadow: var(--todo-shadow);"
							onmouseenter={(e) => {
								e.currentTarget.style.boxShadow = 'var(--todo-shadow-hover)';
								e.currentTarget.style.transform = 'translateY(-2px)';
							}}
							onmouseleave={(e) => {
								e.currentTarget.style.boxShadow = 'var(--todo-shadow)';
								e.currentTarget.style.transform = 'translateY(0)';
							}}
						>
							<a class="w-full flex gap-2 items-center flex gap-8 mx-4">
								<svelte:component this={list.icon} style={`color: ${list.theme}`} />
								<div class="descriptions">
									<div class="name" style="color: var(--todo-text-primary);">
										{list.name}
									</div>
									<div class="description text-sm" style="color: var(--todo-text-secondary);">
										{list.description || ''}
									</div>
									<div class="w-[10rem] mt-2">
										<div
											class="h-2 rounded-full overflow-hidden w-full"
											style="background-color: var(--todo-progress-track);"
										>
											<div
												class="h-full rounded-full"
												style={`width: ${progress(list)}%; background-color: ${list.theme}`}
											/>
										</div>
										<div class="text-xs mt-1" style="color: var(--todo-text-secondary);">
											{counts(list).done}/{counts(list).total} todos
										</div>
									</div>
								</div>
							</a>
							<div style="color: var(--todo-text-secondary);">
								<ChevronRight />
							</div>
						</div>
					{/each}
				</ul>

				{#if lists.length === 0}
					<p style="color: var(--todo-text-secondary);">No lists yet 👀</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<button
	onclick={() => (showPopup = true)}
	class="
	cursor-pointer
	fixed
	bottom-6
	w-[3.5rem]
	h-[3.5rem]
	right-6
	z-50
	p-4
	text-white
	transition
	active:scale-95
	focus:outline-none
	rounded-md hover:scale-105 active:scale-95
"
	style="background-color: var(--todo-btn-primary-bg); box-shadow: var(--todo-shadow-hover);"
	onmouseenter={(e) => (e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-hover)')}
	onmouseleave={(e) => (e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-bg)')}
>
	<Plus />
</button>
{#if showPopup}
	<CreateTodoListPopup onClose={() => (showPopup = false)} onCreate={handleCreate} />
{/if}
{#if showGroupPopup}
	<GroupManagementPopup onClose={() => (showGroupPopup = false)} />
{/if}
