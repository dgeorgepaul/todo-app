<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { ApiError } from '$lib/api';
	import { onMount } from 'svelte';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let submitting = $state(false);

	onMount(() => {
		if (auth.isAuthenticated) {
			goto('/todos');
		}
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		submitting = true;

		try {
			await auth.login(username, password);
			goto('/todos');
		} catch (err) {
			if (err instanceof ApiError) {
				error = err.status === 401 ? 'Invalid username or password' : err.message;
			} else {
				error = 'Something went wrong. Please try again.';
			}
		} finally {
			submitting = false;
		}
	}
</script>

<div
	class="min-h-screen flex items-center justify-center"
	style="background-color: var(--todo-body-bg);"
>
	<div class="w-full max-w-md">
		<div
			class="rounded-2xl p-8"
			style="background-color: var(--todo-card-bg); border: 1px solid var(--todo-card-border); box-shadow: var(--todo-shadow-hover);"
		>
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold" style="color: var(--todo-text-primary);">Welcome back</h1>
				<p class="mt-2" style="color: var(--todo-text-secondary);">Sign in to manage your tasks</p>
			</div>

			{#if error}
				<div
					class="mb-4 p-3 rounded-lg text-sm"
					style="background-color: var(--todo-error-bg); border: 1px solid var(--todo-error-border); color: var(--todo-error-text);"
				>
					{error}
				</div>
			{/if}

			<form onsubmit={handleLogin} class="flex flex-col gap-4">
				<div class="flex flex-col gap-1">
					<label for="username" class="text-sm font-medium" style="color: var(--todo-text-primary);"
						>Username</label
					>
					<input
						id="username"
						type="text"
						placeholder="Enter your username"
						bind:value={username}
						required
						class="px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2"
						style="background-color: var(--todo-input-bg); border: 1px solid var(--todo-input-border); color: var(--todo-text-primary); --tw-ring-color: var(--color-primary-500);"
					/>
				</div>

				<div class="flex flex-col gap-1">
					<label for="password" class="text-sm font-medium" style="color: var(--todo-text-primary);"
						>Password</label
					>
					<input
						id="password"
						type="password"
						placeholder="Enter your password"
						bind:value={password}
						required
						class="px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2"
						style="background-color: var(--todo-input-bg); border: 1px solid var(--todo-input-border); color: var(--todo-text-primary); --tw-ring-color: var(--color-primary-500);"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="mt-2 w-full py-3 font-medium rounded-lg cursor-pointer
					active:scale-[0.98] transition-all duration-150
					disabled:opacity-50 disabled:cursor-not-allowed"
					style="background-color: var(--todo-btn-primary-bg); color: var(--todo-btn-primary-text); box-shadow: var(--todo-shadow);"
					onmouseenter={(e) =>
						(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-hover)')}
					onmouseleave={(e) =>
						(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-bg)')}
				>
					{submitting ? 'Signing in...' : 'Sign In'}
				</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm" style="color: var(--todo-text-secondary);">
					Don't have an account?
					<a
						href="/register"
						class="font-medium hover:underline"
						style="color: var(--todo-link-color);">Create one</a
					>
				</p>
			</div>
		</div>
	</div>
</div>
