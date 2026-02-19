import type { ComponentType } from 'svelte';
import type { Icon } from 'lucide-svelte';

// ── API Response Types ──────────────────────────────

export type UserResponse = {
	id: string;
	username: string;
	email: string;
	full_name: string | null;
	is_active: boolean;
	is_admin: boolean;
};

export type GroupMemberResponse = {
	id: string;
	user: UserResponse;
};

export type GroupResponse = {
	id: string;
	name: string;
	admin_id: string;
	members: GroupMemberResponse[];
};

export type AuthTokenResponse = {
	access_token: string;
	token_type: string;
};

// ── Todo Types ──────────────────────────────────────

export type Todo = {
	id: string;
	text: string;
	done: boolean;
};

export type TodoListResponse = {
	id: string;
	name: string;
	theme: string;
	icon: string | null;
	description: string | null;
	owner_id: string;
	group_id: string;
	todos: Todo[] | null;
};

// Client-side enriched type (adds icon for UI, guarantees todos is never null)
export type TodoList = Omit<TodoListResponse, 'todos' | 'icon'> & {
	todos: Todo[];
	icon: ComponentType<Icon>;
	iconName?: string;
};

// ── Request Types ───────────────────────────────────

export type RegisterRequest = {
	username: string;
	email: string;
	password: string;
	full_name?: string | null;
};

export type CreateListRequest = {
	name: string;
	theme: string;
	icon?: string;
	description?: string | null;
	todos?: { text: string }[];
	group_id?: string;
};

export type UpdateListRequest = {
	name?: string;
	theme?: string;
	icon?: string;
	description?: string | null;
};

export type CreateTodoRequest = {
	text: string;
};

export type UpdateTodoRequest = {
	text?: string;
	done?: boolean;
};

export type ShareTodolistRequest = {
	todolist_id: string;
	shared_with_username: string;
};

export type TodoListShareResponse = {
	id: string;
	shared_with_user: UserResponse;
	shared_by_user: UserResponse;
};

export type InviteRequest = {
	username: string;
};