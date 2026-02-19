import type { TodoList, TodoListResponse } from './types';
import { getRandomIcon } from '$lib/icon_generator/random_icon';
import { ICONS } from '$lib/icon_generator/icons';
import {
	fetchLists,
	fetchListById,
	createList as createListApi,
	updateList as updateListApi,
	deleteList as deleteListApi,
	ApiError
} from './api';
import type { CreateListRequest, UpdateListRequest } from './types';

function enrichWithIcon(list: TodoListResponse): TodoList {
	const iconKey = list.icon || list.theme;
	return {
		...list,
		todos: list.todos ?? [],
		icon:
			iconKey && ICONS[iconKey as keyof typeof ICONS]
				? ICONS[iconKey as keyof typeof ICONS]
				: getRandomIcon()
	};
}

class ListsState {
	#lists = $state<TodoList[]>([]);
	#loading = $state(false);
	#error = $state<string | null>(null);

	get value() {
		return this.#lists;
	}

	get loading() {
		return this.#loading;
	}

	get error() {
		return this.#error;
	}

	async load() {
		this.#loading = true;
		this.#error = null;
		try {
			const fetched = await fetchLists();
			this.#lists = fetched.map(enrichWithIcon);
		} catch (error) {
			console.error('Failed to load lists:', error);
			if (error instanceof ApiError) {
				this.#error = error.message;
			}
		} finally {
			this.#loading = false;
		}
	}

	async loadDetails(id: string): Promise<TodoList | undefined> {
		try {
			const list = await fetchListById(id);
			const listWithIcon = enrichWithIcon(list);
			const index = this.#lists.findIndex((l) => l.id === id);
			if (index !== -1) {
				this.#lists[index] = listWithIcon;
			} else {
				this.#lists.push(listWithIcon);
			}
			return listWithIcon;
		} catch (error) {
			console.error(`Failed to load list details for ${id}:`, error);
			if (error instanceof ApiError) {
				throw error; // Re-throw so caller can handle 403/404
			}
			return undefined;
		}
	}

	async createList(data: CreateListRequest): Promise<TodoList | undefined> {
		try {
			const created = await createListApi(data);
			const listWithIcon = enrichWithIcon(created);
			this.#lists.push(listWithIcon);
			return listWithIcon;
		} catch (error) {
			console.error('Failed to create list:', error);
			throw error;
		}
	}

	async updateList(id: string, data: UpdateListRequest): Promise<TodoList | undefined> {
		try {
			const updated = await updateListApi(id, data);
			const listWithIcon = enrichWithIcon(updated);
			const index = this.#lists.findIndex((l) => l.id === id);
			if (index !== -1) {
				this.#lists[index] = listWithIcon;
			}
			return listWithIcon;
		} catch (error) {
			console.error('Failed to update list:', error);
			throw error;
		}
	}

	async deleteList(id: string): Promise<void> {
		try {
			await deleteListApi(id);
			this.#lists = this.#lists.filter((l) => l.id !== id);
		} catch (error) {
			console.error('Failed to delete list:', error);
			throw error;
		}
	}

	// Keep convenience methods for reactive templates
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
}

export const lists = new ListsState();