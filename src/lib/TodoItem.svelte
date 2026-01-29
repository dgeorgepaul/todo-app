<script lang="ts">
	import type { Todo } from './types';
	import { fade } from 'svelte/transition';
	import { Check } from 'lucide-svelte';
	import { send, receive } from './animations/transition.js';
	import { lists } from './todolists.svelte';

	let {
		todo,
		list,
		onToggle,
		onDelete,
		completedAllTodos = () => {},
		movedATodo = () => {}
	}: {
		todo: Todo;
		list: any;
		onToggle: () => void;
		onDelete: (id: string) => void;
		completedAllTodos?: () => void;
		movedATodo?: () => void;
	} = $props();

	function handleToggle() {
		onToggle();
		lists.save(); // Save after toggle
	}

	function handleTextEdit() {
		lists.save(); // Save after text edit
	}
</script>

<li
 onoutrostart={() => movedATodo()} onoutroend={() => completedAllTodos()} class:done={todo.done} in:receive={{ key: todo.id }} out:send={{ key: todo.id }} class="flex gap-3 items-center py-2
 		    outline-none ring-1 ring-transparent
			transition
			${list.theme || 'border-gray-300'}
			${list.theme ? `${list.theme}-focus` : 'focus:border-gray-400'}
			${list.theme ? `${list.theme}-caret` : 'caret-gray-400'}
			${list.theme ? `${list.theme}-placeholder` : 'placeholder-gray-400'}">
	<!-- Circular checkbox -->
	<div
		class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all {todo.done ? '' : 'border-gray-300 hover:border-gray-400'}"
		style="
			{todo.done ? `background-color: ${list.theme}; border-color: ${list.theme};` : ''}
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
		style="
            {todo.done ? `color: ${list.theme};` : ''}
        "
		class="flex-grow px-4 py-1 
		{todo.done ? 'line-through text-gray-400' : 'text-gray-800'}"
	/>

	<button
		onclick={() => onDelete(todo.id)}
		class="cursor-pointer text-red-500 hover:text-red-700 font-bold transition-colors"
	>
		✕
	</button>
</li>