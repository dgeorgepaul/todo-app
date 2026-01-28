<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { lists } from '$lib/todolists.svelte';
	import TodoListView from '$lib/TodoList.svelte';
	import type { TodoList } from '$lib/types';

	type Props = {
		params: {
			todoListId: string;
		};
	};

	let { params }: Props = $props();

	const list = $derived<TodoList | undefined>(
		lists.find(l => {
            console.log("this is a line", l.id, params.todoListId);
            return l.id === params.todoListId
        })
        // lists[0]
	);
    $inspect(list, 'list');
	if (!list) {
		throw error(404, 'Todo list not found');
	}
</script>

<TodoListView {list} />
