<script lang="ts">
	import type { Todo } from './types';
	import { fade } from 'svelte/transition';
	import { Check } from 'lucide-svelte';
	import { send, receive } from './animations/transition.js';
	import { lists } from './todolists.svelte';

	let {
		todo,
		onToggle,
		onDelete
	}: {
		todo: Todo;
		onToggle: () => void;
		onDelete: (id: string) => void;
	} = $props();

	function handleToggle() {
		onToggle();
		lists.save(); // Save after toggle
	}

	function handleTextEdit() {
		lists.save(); // Save after text edit
	}
</script>

<li class:done={todo.done} in:receive={{ key: todo.id }} out:send={{ key: todo.id }} class="flex gap-3 items-center py-2">
	<!-- Circular checkbox -->
	<div
		class="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer transition-all {todo.done
			? 'bg-green-500 border-green-500'
			: 'hover:border-gray-400'}"
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
		class="flex-grow {todo.done ? 'line-through text-gray-400' : 'text-gray-800'}"
	/>

	<button
		onclick={() => onDelete(todo.id)}
		class="cursor-pointer text-red-500 hover:text-red-700 font-bold transition-colors"
	>
		✕
	</button>
</li>