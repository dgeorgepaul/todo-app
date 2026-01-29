import type { ComponentType } from 'svelte';
import type { Icon } from 'lucide-svelte';

export type Todo = {
	id: string;
	text: string;
	done: boolean;
};

export type TodoList = {
	id: string;
	name: string;
	description: string;
	todos: Todo[];
	theme: string;
	icon: ComponentType<Icon>;
	iconName?: string; // Optional, used for serialization
};