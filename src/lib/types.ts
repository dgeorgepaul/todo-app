import type { IconName } from "$lib/icon_generator/icons";
import type { Icon } from "lucide-svelte";
import type { ComponentType } from "svelte";

export type Todo = {
	id: string;
	text: string;
	done: boolean;
};

export type TodoList = {
	id: string;
	theme: string;
	name: string;
	description: string;
	todos: Todo[];
    icon: ComponentType<Icon>;
};