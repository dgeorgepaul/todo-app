<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import TodoItem from './TodoItem.svelte';
	import type { TodoList, Todo } from './types';
	import { ArrowLeft, Share2 } from 'lucide-svelte';
	import { addTodoApi, ApiError } from './api';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import ShareTodolistPopup from './popups/ShareTodolistPopup.svelte';

	let { list }: { list: TodoList } = $props();

	let newTodo = $state<string>('');
	let all_todos_completed = $state(true);
	let showSharePopup = $state(false);
	let addingTodo = $state(false);

	const remaining = $derived<number>(list.todos.filter((t) => !t.done).length);

	async function addTodo(): Promise<void> {
		if (!newTodo.trim() || addingTodo) return;

		addingTodo = true;
		try {
			const created = await addTodoApi(list.id, { text: newTodo.trim() });
			list.todos.push(created);
			newTodo = '';
		} catch (error) {
			console.error('Failed to add todo:', error);
			if (error instanceof ApiError && error.status === 403) {
				goto('/unauthorized');
			}
		} finally {
			addingTodo = false;
		}
	}

	function removeTodo(id: string): void {
		list.todos = list.todos.filter((t) => t.id !== id);
	}

	function completedTodos(): void {
		all_todos_completed = true;
	}

	function movedATodo(): void {
		all_todos_completed = false;
	}
</script>

<div class="flex flex-col w-full">
	<nav class="border-b-stone-200 border-b-1 bg-[#fcfaf8cc]">
		<div
			class="container mx-auto py-4 px-2 w-[50rem] container mx-auto py-4 px-2 flex items-center gap-4 flex-row justify-between"
		>
			<div class="flex items-center gap-4">
				<ArrowLeft
					class="cursor-pointer hover:bg-[#f0f0f0] rounded-lg p-2 h-10 w-10"
					onclick={() => history.back()}
				/>
				<div>
					<h1 style="color: {list.theme}" class="font-semibold text-[#2c2421] text-lg">
						{list.name}
					</h1>
					<p class="font-light text-[#8c7b73] text-base">
						{list.todos.length - remaining} of {list.todos.length} tasks completed
					</p>
				</div>
			</div>
			<button
				onclick={() => (showSharePopup = true)}
				class="flex items-center gap-2 text-sm text-[#8c7b73] hover:text-[#e76e50] cursor-pointer transition-colors px-3 py-2 rounded-lg hover:bg-stone-100"
			>
				<Share2 size={16} />
				<span>Share</span>
			</button>
		</div>
	</nav>
	<div class="body-bottom h-full gap-4 flex flex-col container mx-auto py-4 px-2 w-[50rem]">
		<div class="flex flex-col gap-2">
			<label class="text-sm">Create New To-Do</label>

			<input
				placeholder="Enter To-Do"
				bind:value={newTodo}
				class="border px-3 py-2 rounded bg-white"
				disabled={addingTodo}
				onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && addTodo()}
			/>
		</div>

		<!-- Active todos -->
		<div>
			<h2 class="text-lg font-semibold mb-3 text-gray-500">TO DO</h2>
			<ul
				class="space-y-2 bg-white py-2 px-4 rounded-lg border border-gray-200 flex flex-col gap-2"
			>
				{#each list.todos.filter((t) => !t.done) as todo, index (todo.id)}
					<div
						class={index < list.todos.filter((t) => !t.done).length - 1
							? 'border-b-2 border-b-stone-200 pb-0 m-0'
							: ''}
						animate:flip={{ duration: 250, easing: cubicOut }}
					>
						<TodoItem
							{todo}
							{list}
							onDelete={removeTodo}
							completedAllTodos={completedTodos}
							{movedATodo}
						/>
					</div>
				{/each}
				{#if list.todos.filter((t) => !t.done).length === 0 && list.todos.length > 0 && all_todos_completed}
					<p in:fade={{ duration: 200 }} class="text-gray-400 text-sm">All todos completed!</p>
				{/if}
				{#if list.todos.length === 0}
					<p class="text-gray-400 text-sm">No todos yet 👀</p>
				{/if}
			</ul>
		</div>

		<!-- Completed todos -->
		<div>
			<h2 class="text-lg font-semibold mb-3 text-gray-500">
				Completed ({list.todos.filter((t) => t.done).length})
			</h2>
			<ul
				class="space-y-2 bg-white py-2 px-4 rounded-lg border border-gray-200 flex flex-col gap-2"
			>
				{#each list.todos.filter((t) => t.done) as todo, index (todo.id)}
					<div
						animate:flip={{ duration: 250, easing: cubicOut }}
						class={index < list.todos.filter((t) => t.done).length - 1
							? 'border-b-2 border-b-stone-200'
							: ''}
					>
						<TodoItem
							{todo}
							{list}
							onDelete={removeTodo}
							completedAllTodos={completedTodos}
							{movedATodo}
						/>
					</div>
				{/each}
				{#if list.todos.filter((t) => t.done).length === 0 && list.todos.length > 0 && all_todos_completed}
					<p in:fade={{ duration: 200 }} class="text-gray-400 text-sm">Better Get To Work!</p>
				{/if}
				{#if list.todos.length === 0}
					<p class="text-gray-400 text-sm">No todos yet 👀</p>
				{/if}
			</ul>
		</div>
	</div>
</div>

{#if showSharePopup}
	<ShareTodolistPopup listId={list.id} onClose={() => (showSharePopup = false)} />
{/if}
