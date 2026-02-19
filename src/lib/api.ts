import type {
	AuthTokenResponse,
	UserResponse,
	GroupResponse,
	GroupMemberResponse,
	TodoListResponse,
	TodoListShareResponse,
	Todo,
	RegisterRequest,
	CreateListRequest,
	UpdateListRequest,
	CreateTodoRequest,
	UpdateTodoRequest,
	ShareTodolistRequest,
	InviteRequest
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── Error class ─────────────────────────────────────

export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

// ── Helpers ─────────────────────────────────────────

function getToken(): string | null {
	return localStorage.getItem('auth_token');
}

function authHeaders(): Record<string, string> {
	const token = getToken();
	if (!token) return {};
	return { Authorization: `Bearer ${token}` };
}

async function request<T>(
	path: string,
	options: RequestInit = {}
): Promise<T> {
	const headers: Record<string, string> = {
		...authHeaders(),
		...(options.headers as Record<string, string> || {})
	};

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers
	});

	if (!response.ok) {
		// On 401, clear stored token
		if (response.status === 401) {
			localStorage.removeItem('auth_token');
		}

		let message = `Request failed with status ${response.status}`;
		try {
			const body = await response.json();
			message = body.detail || body.message || message;
		} catch {
			// ignore parse errors
		}
		throw new ApiError(response.status, message);
	}

	// Some endpoints might return empty body
	const text = await response.text();
	if (!text) return {} as T;
	return JSON.parse(text);
}

// ── Auth ────────────────────────────────────────────

export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
	return request<UserResponse>('/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function loginUser(username: string, password: string): Promise<AuthTokenResponse> {
	const body = new URLSearchParams({ username, password });
	const response = await fetch(`${API_BASE_URL}/auth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});

	if (!response.ok) {
		let message = 'Login failed';
		try {
			const data = await response.json();
			message = data.detail || message;
		} catch {
			// ignore
		}
		throw new ApiError(response.status, message);
	}

	return response.json();
}

// ── Users ───────────────────────────────────────────

export async function fetchMyGroups(): Promise<GroupResponse[]> {
	return request<GroupResponse[]>('/users/me/groups');
}

// ── Groups ──────────────────────────────────────────

export async function createGroup(name: string): Promise<GroupResponse> {
	return request<GroupResponse>('/groups/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name })
	});
}

export async function inviteToGroup(groupId: string, data: InviteRequest): Promise<GroupMemberResponse> {
	return request<GroupMemberResponse>(`/groups/${groupId}/invite`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMemberResponse[]> {
	return request<GroupMemberResponse[]>(`/groups/${groupId}/members`);
}

export async function shareTodolist(groupId: string, data: ShareTodolistRequest): Promise<{ message: string }> {
	return request<{ message: string }>(`/groups/${groupId}/share-todolist`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function removeMember(groupId: string, userId: string): Promise<{ message: string }> {
	return request<{ message: string }>(`/groups/${groupId}/members/${userId}`, {
		method: 'DELETE'
	});
}

export async function fetchTodolistShares(groupId: string, todolistId: string): Promise<TodoListShareResponse[]> {
	return request<TodoListShareResponse[]>(`/groups/${groupId}/todolist-shares/${todolistId}`);
}

// ── Lists ───────────────────────────────────────────

export async function fetchLists(): Promise<TodoListResponse[]> {
	return request<TodoListResponse[]>('/lists/');
}

export async function fetchListById(id: string): Promise<TodoListResponse> {
	return request<TodoListResponse>(`/lists/${id}`);
}

export async function createList(data: CreateListRequest): Promise<TodoListResponse> {
	return request<TodoListResponse>('/lists/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function updateList(id: string, data: UpdateListRequest): Promise<TodoListResponse> {
	return request<TodoListResponse>(`/lists/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function deleteList(id: string): Promise<{ message: string }> {
	return request<{ message: string }>(`/lists/${id}`, {
		method: 'DELETE'
	});
}

// ── Todos ───────────────────────────────────────────

export async function addTodoApi(listId: string, data: CreateTodoRequest): Promise<Todo> {
	return request<Todo>(`/todos/${listId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function updateTodoApi(todoId: string, data: UpdateTodoRequest): Promise<Todo> {
	return request<Todo>(`/todos/${todoId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

export async function deleteTodoApi(todoId: string): Promise<{ message: string }> {
	return request<{ message: string }>(`/todos/${todoId}`, {
		method: 'DELETE'
	});
}
