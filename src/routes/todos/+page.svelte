<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { getRandomIcon } from '$lib/icon_generator/random_icon';
	import { lists } from '$lib/todolists.svelte';
	import type { TodoList } from '$lib/types';
	import { ChevronRight, Plus } from 'lucide-svelte';
	import CreateTodoListPopup from '$lib/popups/CreateTodoListPopup.svelte';
	import type { ICONS } from '$lib/icon_generator/icons';
	import { v4 as uuidv4 } from 'uuid';

	let newListName = $state<string>('');
	let showPopup = $state(false);

	function handleCreate(newList: TodoList) {
		lists.push(newList);
		showPopup = false;
	}

	function handleClick() {
		console.log('Button clicked');
		showPopup = true;
	}

	function addList(): void {
		if (!newListName.trim()) return;

		lists.push({
			id: uuidv4(),
			name: newListName,
			description: '',
			todos: [],
			theme: 'green',
			icon: getRandomIcon()
		} satisfies TodoList);

		newListName = '';
	}

	function progress(list: any): number {
		const total = list.todos.length;
		if (!total) return 0;
		const done = list.todos.filter((t: any) => t.done).length;
		return Math.round((done / total) * 100);
	}

	function counts(list: any): { done: number; total: number } {
		const total = list.todos.length;
		const done = list.todos.filter((t: any) => t.done).length;
		return { done, total };
	}
	let completed = $derived(lists.filter((list) => list.todos.every((todo) => todo.done)).length);



</script>

<div class="flex flex-col w-full">
	<nav class="border-b-stone-200 border-b-1 bg-[#fcfaf8cc]">
		<div class="container mx-auto py-4 px-2 w-[50rem] container mx-auto py-4 px-2">
			<h1 class="font-semibold text-[#2c2421] text-lg">My Lists</h1>
			<p class="font-light text-[#8c7b73] text-base">
				{completed} of {lists.length} tasks completed
			</p>
		</div>
	</nav>
	<div class="body-bottom h-full flex-grow container mx-auto py-4 px-2 w-[50rem]">
		<!-- <form>
			<input placeholder="New list name" bind:value={newListName} />

			<button onclick={addList}>Add List</button>
		</form> -->
		<div class="todoLists">
			<ul class="py-4 flex flex-col gap-2">
				{#each lists as list (list.id)}
					<!-- <list.icon />as -->
					<div
						onclick={() => goto(`/todos/${list.id}`)}
						class="flex justify-between items-center w-full my-2 py-4 flex gap-2 items-center px-2 border border-stone-200 rounded-lg
						hover:card-shadow-hover hover:-translate-y-0.5 cursor-pointer transition-all duration-150
						bg-white p-4 rounded-lg hover:shadow-md active:scale-95"
					>
						<a class="w-full flex gap-2 items-center flex gap-8 mx-4">
							<svelte:component this={list.icon} style={`color: ${list.theme}`} />
							<div class="descriptions">
								<div class="name">
									{list.name}
								</div>
								<div class="description text-sm text-gray-500">
									{list.description}
								</div>
								<div class="w-[10rem] mt-2">
									<div class="h-2 bg-gray-200 rounded-full overflow-hidden w-full">
										<div class="h-full rounded-full" style={`width: ${progress(list)}%; background-color: ${list.theme}`} />
									</div>
									<div class="text-xs text-gray-500 mt-1">{counts(list).done}/{counts(list).total} todos</div>
								</div>
							</div>

							<!-- progress bar -->
						</a>
						<div>
							<ChevronRight />
						</div>
					</div>
				{/each}
			</ul>

			{#if lists.length === 0}
				<p>No lists yet 👀</p>
			{/if}
		</div>
	</div>
</div>

<button
	onclick={handleClick}
	class="
		cursor-pointer

		fixed
		bottom-6
		w-[3.5rem]
		h-[3.5rem]
		right-6
		z-50
		c-white
		bg-[#e76e50]
		p-4
		text-white
		shadow-lg
		transition
		active:scale-95
		focus:outline-none
		rounded-md shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95
	"
>
	<Plus />
</button>
{#if showPopup}
	<CreateTodoListPopup onClose={() => (showPopup = false)} onCreate={handleCreate} />
{/if}
