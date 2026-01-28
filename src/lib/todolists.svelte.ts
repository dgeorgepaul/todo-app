import type { TodoList } from './types';
import { getRandomIcon } from '$lib/icon_generator/random_icon';
// import type { IconName } from './icons';

export const lists = $state<TodoList[]>([
	{
		id: crypto.randomUUID(),
		name: 'Personal',
		icon: getRandomIcon(),
		theme: 'blue',
		description: 'Personal tasks and reminders',
		todos: [
			{ id: crypto.randomUUID(), text: 'Buy milk', done: false }
		]
	}
]);