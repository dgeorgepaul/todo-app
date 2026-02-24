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
	<nav
		style="border-bottom: 1px solid var(--todo-header-border); background-color: var(--todo-nav-bg);"
	>
		<div
			class="container mx-auto py-4 px-2 w-[50rem] container mx-auto py-4 px-2 flex items-center gap-4 flex-row justify-between"
		>
			<div class="flex items-center gap-4">
				<ArrowLeft
					class="cursor-pointer rounded-lg p-2 h-10 w-10 transition-colors"
					style="color: var(--todo-text-primary);"
					onclick={() => history.back()}
				/>
				<div>
					<h1 style="color: {list.theme}" class="font-semibold text-lg">
						{list.name}
					</h1>
					<p class="font-light text-base" style="color: var(--todo-text-secondary);">
						{list.todos.length - remaining} of {list.todos.length} tasks completed
					</p>
				</div>
			</div>
			<button
				onclick={() => (showSharePopup = true)}
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
				<Share2 size={16} />
				<span>Share</span>
			</button>
		</div>
	</nav>
	<div class="body-bottom h-full gap-4 flex flex-col container mx-auto py-4 px-2 w-[50rem]">
		<div class="flex flex-col gap-2">
			<label class="text-sm" style="color: var(--todo-text-primary);">Create New To-Do</label>

			<input
				placeholder="Enter To-Do"
				bind:value={newTodo}
				class="px-3 py-2 rounded transition-all focus:outline-none focus:ring-2"
				style="background-color: var(--todo-input-bg); border: 1px solid var(--todo-input-border); color: var(--todo-text-primary); --tw-ring-color: var(--color-primary-500);"
				disabled={addingTodo}
				onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && addTodo()}
			/>
		</div>

		<!-- Active todos -->
		<div>
			<h2 class="text-lg font-semibold mb-3" style="color: var(--todo-text-secondary);">TO DO</h2>
			<ul
				class="space-y-2 py-2 px-4 rounded-lg flex flex-col gap-2"
				style="background-color: var(--todo-card-bg); border: 1px solid var(--todo-card-border);"
			>
				{#each list.todos.filter((t) => !t.done) as todo, index (todo.id)}
					<div
						class={index < list.todos.filter((t) => !t.done).length - 1 ? 'pb-0 m-0' : ''}
						style={index < list.todos.filter((t) => !t.done).length - 1
							? 'border-bottom: 2px solid var(--todo-card-border);'
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
					<p in:fade={{ duration: 200 }} class="text-sm" style="color: var(--todo-text-muted);">
						All todos completed!
					</p>
				{/if}
				{#if list.todos.length === 0}
					<p class="text-sm" style="color: var(--todo-text-muted);">No todos yet 👀</p>
				{/if}
			</ul>
		</div>

		<!-- Completed todos -->
		<div>
			<h2 class="text-lg font-semibold mb-3" style="color: var(--todo-text-secondary);">
				Completed ({list.todos.filter((t) => t.done).length})
			</h2>
			<ul
				class="space-y-2 py-2 px-4 rounded-lg flex flex-col gap-2"
				style="background-color: var(--todo-card-bg); border: 1px solid var(--todo-card-border);"
			>
				{#each list.todos.filter((t) => t.done) as todo, index (todo.id)}
					<div
						animate:flip={{ duration: 250, easing: cubicOut }}
						style={index < list.todos.filter((t) => t.done).length - 1
							? 'border-bottom: 2px solid var(--todo-card-border);'
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
					<p in:fade={{ duration: 200 }} class="text-sm" style="color: var(--todo-text-muted);">
						Better Get To Work!
					</p>
				{/if}
				{#if list.todos.length === 0}
					<p class="text-sm" style="color: var(--todo-text-muted);">No todos yet 👀</p>
				{/if}
			</ul>
		</div>
	</div>
</div>

{#if showSharePopup}
	<ShareTodolistPopup listId={list.id} onClose={() => (showSharePopup = false)} />
{/if}
