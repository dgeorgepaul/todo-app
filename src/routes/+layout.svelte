<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { auth } from '$lib/auth.svelte';
	import { theme } from '$lib/theme.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { LogOut, Moon, Sun } from 'lucide-svelte';

	let { children } = $props();

	const publicRoutes = ['/login', '/register'];

	onMount(() => {
		auth.init();
		theme.init();

		if (!auth.isAuthenticated && !publicRoutes.includes(page.url.pathname)) {
			goto('/login');
		}
	});

	// Reactive redirect when auth state changes on non-public routes
	$effect(() => {
		if (!auth.loading && !auth.isAuthenticated && !publicRoutes.includes(page.url.pathname)) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if auth.loading}
	<div
		class="min-h-screen flex items-center justify-center"
		style="background-color: var(--todo-body-bg);"
	>
		<div style="color: var(--todo-text-secondary);">Loading...</div>
	</div>
{:else if auth.isAuthenticated && !publicRoutes.includes(page.url.pathname)}
	<!-- Authenticated layout with top nav -->
	<div class="min-h-screen flex flex-col" style="background-color: var(--todo-body-bg);">
		<header
			class="px-4 py-3 flex items-center justify-between"
			style="background-color: var(--todo-header-bg); border-bottom: 1px solid var(--todo-header-border);"
		>
			<a
				href="/todos"
				class="font-bold text-lg transition-colors"
				style="color: var(--todo-text-primary);"
				onmouseenter={(e) => (e.currentTarget.style.color = 'var(--todo-link-color)')}
				onmouseleave={(e) => (e.currentTarget.style.color = 'var(--todo-text-primary)')}
			>
				✅ Todo App
			</a>
			<div class="flex items-center gap-3">
				<button
					onclick={() => theme.toggle()}
					class="flex items-center justify-center cursor-pointer transition-colors p-1.5 rounded-lg"
					style="color: var(--todo-text-secondary);"
					onmouseenter={(e) => (e.currentTarget.style.color = 'var(--todo-link-color)')}
					onmouseleave={(e) => (e.currentTarget.style.color = 'var(--todo-text-secondary)')}
					title={theme.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if theme.darkMode}
						<Sun size={18} />
					{:else}
						<Moon size={18} />
					{/if}
				</button>
				{#if auth.username}
					<span class="text-sm font-medium" style="color: var(--todo-text-secondary);"
						>@{auth.username}</span
					>
				{/if}
				<button
					onclick={() => auth.logout()}
					class="flex items-center gap-1.5 text-sm cursor-pointer transition-colors"
					style="color: var(--todo-text-secondary);"
					onmouseenter={(e) => (e.currentTarget.style.color = 'var(--todo-link-color)')}
					onmouseleave={(e) => (e.currentTarget.style.color = 'var(--todo-text-secondary)')}
				>
					<LogOut size={16} />
				</button>
			</div>
		</header>
		<main class="flex-grow">
			{@render children()}
		</main>
	</div>
{:else}
	<!-- Public routes (login/register) -->
	{@render children()}
{/if}
