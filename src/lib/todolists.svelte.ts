import type { TodoList } from './types';
import { getRandomIcon } from '$lib/icon_generator/random_icon';
import { v4 as uuidv4 } from 'uuid';
import { browser } from '$app/environment';
import { ICONS } from '$lib/icon_generator/icons';

const STORAGE_KEY = 'todo-lists';

// Load from localStorage
function loadFromStorage(): TodoList[] {
	if (!browser) return [];
	
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		
		const parsed = JSON.parse(stored);
		
		// Restore icon components from icon names
		return parsed.map((list: any) => ({
			...list,
			icon: ICONS[list.iconName as keyof typeof ICONS] || getRandomIcon()
		}));
	} catch (error) {
		console.error('Failed to load from localStorage:', error);
		return [];
	}
}

// Save to localStorage
export function saveToStorage(lists: TodoList[]): void {
	if (!browser) return;
	
	try {
		// Convert icon components to icon names for storage
		const toStore = lists.map((list) => {
			const iconName = Object.keys(ICONS).find(
				key => ICONS[key as keyof typeof ICONS] === list.icon
			);
			return {
				...list,
				iconName
			};
		});
		
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
	} catch (error) {
		console.error('Failed to save to localStorage:', error);
	}
}

// Initialize with stored data or default data
const initialLists: TodoList[] = loadFromStorage();
if (initialLists.length === 0) {
	initialLists.push({
		id: uuidv4(),
		name: 'Personal',
		icon: getRandomIcon(),
		theme: 'blue',
		description: 'Personal tasks and reminders',
		todos: [
			{ id: uuidv4(), text: 'Buy milk', done: false }
		]
	});
}

// Create a reactive state array
class ListsState {
	#lists = $state<TodoList[]>(initialLists);

	get value() {
		return this.#lists;
	}

	push(item: TodoList) {
		this.#lists.push(item);
		saveToStorage(this.#lists);
	}

	// Enable array access and iteration
	[Symbol.iterator]() {
		return this.#lists[Symbol.iterator]();
	}

	get length() {
		return this.#lists.length;
	}

	filter(fn: (list: TodoList) => boolean) {
		return this.#lists.filter(fn);
	}

	find(fn: (list: TodoList) => boolean) {
		return this.#lists.find(fn);
	}

	map<T>(fn: (list: TodoList, index: number) => T) {
		return this.#lists.map(fn);
	}

	save() {
		saveToStorage(this.#lists);
	}
}

export const lists = new ListsState();