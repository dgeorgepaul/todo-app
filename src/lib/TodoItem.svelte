<script lang="ts">
	import type { Todo } from './types';
	import { fade } from 'svelte/transition';
	import { Check } from 'lucide-svelte';
	import { send, receive } from './animations/transition.js';
	import { updateTodoApi, deleteTodoApi, ApiError } from './api';
	import { goto } from '$app/navigation';

	let {
		todo,
		list,
		onDelete,
		completedAllTodos = () => {},
		movedATodo = () => {}
	}: {
		todo: Todo;
		list: any;
		onDelete: (id: string) => void;
		completedAllTodos?: () => void;
		movedATodo?: () => void;
	} = $props();

	let toggling = $state(false);
	let deleting = $state(false);

	async function handleToggle() {
		if (toggling) return;
		toggling = true;
		try {
			const updated = await updateTodoApi(todo.id, { done: !todo.done });
			todo.done = updated.done;
		} catch (error) {
			console.error('Failed to toggle todo:', error);
			if (error instanceof ApiError && error.status === 403) {
				goto('/unauthorized');
			}
		} finally {
			toggling = false;
		}
	}

	async function handleTextEdit() {
		try {
			await updateTodoApi(todo.id, { text: todo.text });
		} catch (error) {
			console.error('Failed to update todo text:', error);
			if (error instanceof ApiError && error.status === 403) {
				goto('/unauthorized');
			}
		}
	}

	async function handleDelete() {
		if (deleting) return;
		deleting = true;
		try {
			await deleteTodoApi(todo.id);
			onDelete(todo.id);
		} catch (error) {
			console.error('Failed to delete todo:', error);
			if (error instanceof ApiError && error.status === 403) {
				goto('/unauthorized');
			}
		} finally {
			deleting = false;
		}
	}
</script>

<li
	onoutrostart={() => movedATodo()}
	onoutroend={() => completedAllTodos()}
	class:done={todo.done}
	in:receive={{ key: todo.id }}
	out:send={{ key: todo.id }}
	class="flex gap-3 items-center py-2 outline-none ring-1 ring-transparent"
>
	<!-- Circular checkbox -->
	<div
		class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all {toggling
			? 'opacity-50'
			: ''}"
		style="
		{todo.done
			? `background-color: ${list.theme}; border-color: ${list.theme};`
			: `border-color: var(--todo-checkbox-border);`}
	"
		onclick={handleToggle}
	>
		{#if todo.done}
			<Check size={16} class="text-white" />
		{/if}
	</div>

	<span
		contenteditable
		bind:innerText={todo.text}
		onblur={handleTextEdit}
		class="flex-grow px-4 py-1"
		style="color: {todo.done ? 'var(--todo-text-muted)' : 'var(--todo-text-primary)'}; {todo.done
			? 'text-decoration: line-through;'
			: ''}"
	/>

	<button
		onclick={handleDelete}
		disabled={deleting}
		class="cursor-pointer font-bold transition-colors disabled:opacity-50"
		style="color: var(--todo-delete-color);"
		onmouseenter={(e) => (e.currentTarget.style.color = 'var(--todo-delete-hover)')}
		onmouseleave={(e) => (e.currentTarget.style.color = 'var(--todo-delete-color)')}
	>
		✕
	</button>
</li>
