<script lang="ts">
	import { goto } from '$app/navigation';
	import TodoItem from './TodoItem.svelte';
	import { lists } from './todolists.svelte';
	import type { TodoList, Todo } from './types';
    import { ArrowLeft } from 'lucide-svelte';

	let { list }: { list: TodoList } = $props();

	let newTodo = $state<string>('');

	const remaining = $derived<number>(
		list.todos.filter(t => !t.done).length
	);

	function addTodo(): void {
		if (!newTodo.trim()) return;

		list.todos.push({
			id: crypto.randomUUID(),
			text: newTodo,
			done: false
		} satisfies Todo);

		newTodo = '';
		lists.save(); // Save after adding todo
	}

	function removeTodo(id: string): void {
		list.todos = list.todos.filter(t => t.id !== id);
		lists.save(); // Save after removing todo
	}
</script>


<div class="flex flex-col w-full">
	<nav class="border-b-stone-200 border-b-1 bg-[#fcfaf8cc]">
		<div class="container mx-auto py-4 px-2 w-[50rem] container mx-auto py-4 px-2 flex items-center gap-4 flex-row">
            <ArrowLeft class="cursor-pointer hover:bg-[#f0f0f0] rounded-lg p-2 h-10 w-10" onclick={() => history.back()} />
            <div>
                <h1 style="color: {list.theme}" class="font-semibold text-[#2c2421] text-lg">{list.name}</h1>
                <p class="font-light text-[#8c7b73] text-base">
                    {list.todos.length - remaining} of {list.todos.length} tasks completed
                </p>
            </div>
			
		</div>
	</nav>
	<div class="body-bottom h-full gap-4 flex flex-col container mx-auto py-4 px-2 w-[50rem]">
        <div class="flex flex-col gap-2">

			<label class="text-sm">Create New To-Do</label>

			<input placeholder="Enter To-Do" bind:value={newTodo} class="border px-3 py-2 rounded bg-white"  
            onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && addTodo()}/>
        </div>
        <!-- <input
            placeholder="New todo"
            bind:value={newTodo}
            onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && addTodo()}
        /> -->

        <!-- Active todos -->
        <div>
            <h2 class="text-lg font-semibold mb-3 text-gray-500">TO DO</h2>
            <ul class="space-y-2 bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-2">
                {#each list.todos.filter(t => !t.done) as todo (todo.id)}
                    <TodoItem
                        {todo}
                        onToggle={() => (todo.done = !todo.done)}
                        onDelete={removeTodo}
                    />
                {/each}
                {#if list.todos.filter(t => !t.done).length === 0 && list.todos.length > 0}
                    <p class="text-gray-400 text-sm">All todos completed!</p>
                {/if}
                {#if list.todos.length === 0}
                    <p>No todos yet 👀</p>
                {/if}
            </ul>

        </div>

        <!-- Completed todos -->
        {#if list.todos.filter(t => t.done).length > 0}
            <div>
                <h2 class="text-lg font-semibold mb-3 text-gray-500">Completed ({list.todos.filter(t => t.done).length})</h2>
                <ul class="space-y-2 bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-2">
                    {#each list.todos.filter(t => t.done) as todo (todo.id)}
                        <TodoItem
                            {todo}
                            onToggle={() => (todo.done = !todo.done)}
                            onDelete={removeTodo}
                        />
                    {/each}
                </ul>
            </div>
        {/if}


    </div>
</div>
