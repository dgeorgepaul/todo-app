<script lang="ts">
	import { goto } from '$app/navigation';
	import { lists } from '$lib/todolists.svelte';
	import TodoListView from '$lib/TodoList.svelte';
	import type { TodoList } from '$lib/types';
	import { ApiError } from '$lib/api';

	type Props = {
		params: {
			todoListId: string;
		};
	};

	let { params }: Props = $props();

	let loading = $state(true);
	let errorState = $state<string | null>(null);

	$effect(() => {
		loadList();
	});

	async function loadList() {
		loading = true;
		errorState = null;
		try {
			await lists.loadDetails(params.todoListId);
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.status === 403) {
					goto('/unauthorized');
					return;
				}
				if (error.status === 404) {
					errorState = 'not_found';
				} else if (error.status === 401) {
					goto('/login');
					return;
				} else {
					errorState = error.message;
				}
			}
		} finally {
			loading = false;
		}
	}

	const list = $derived<TodoList | undefined>(lists.find((l) => l.id === params.todoListId));
</script>

{#if loading}
	<div class="flex items-center justify-center h-full min-h-[50vh]">
		<p class="text-[#8c7b73]">Loading list...</p>
	</div>
{:else if errorState === 'not_found'}
	<div class="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
		<h2 class="text-2xl font-bold text-[#2c2421]">List Not Found</h2>
		<p class="text-[#8c7b73]">This list doesn't exist or you don't have access to it.</p>
		<a
			href="/todos"
			class="px-6 py-3 bg-[#e76e50] text-white font-medium rounded-lg hover:bg-[#d45d40] transition-all"
		>
			Go to My Lists
		</a>
	</div>
{:else if errorState}
	<div class="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
		<h2 class="text-2xl font-bold text-[#2c2421]">Error</h2>
		<p class="text-red-500">{errorState}</p>
		<a
			href="/todos"
			class="px-6 py-3 bg-[#e76e50] text-white font-medium rounded-lg hover:bg-[#d45d40] transition-all"
		>
			Go to My Lists
		</a>
	</div>
{:else if list}
	<TodoListView {list} />
{:else}
	<div class="flex items-center justify-center h-full min-h-[50vh]">
		<p class="text-[#8c7b73]">List not found</p>
	</div>
{/if}
