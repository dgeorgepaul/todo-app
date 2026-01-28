import type { TodoList } from './types';
import { getRandomIcon } from '$lib/icon_generator/random_icon';
import { v4 as uuidv4 } from 'uuid';

export const lists = $state<TodoList[]>([
	{
		id: uuidv4(),
		name: 'Personal',
		icon: getRandomIcon(),
		theme: 'blue',
		description: 'Personal tasks and reminders',
		todos: [
			{ id: uuidv4(), text: 'Buy milk', done: false }
		]
	}
]);