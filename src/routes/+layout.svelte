<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { auth } from '$lib/auth.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { LogOut } from 'lucide-svelte';

	let { children } = $props();

	const publicRoutes = ['/login', '/register'];

	onMount(() => {
		auth.init();

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
	<div class="min-h-screen flex items-center justify-center bg-[#fcfaf8]">
		<div class="text-[#8c7b73]">Loading...</div>
	</div>
{:else if auth.isAuthenticated && !publicRoutes.includes(page.url.pathname)}
	<!-- Authenticated layout with top nav -->
	<div class="min-h-screen flex flex-col bg-[#fcfaf8]">
		<header class="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
			<a
				href="/todos"
				class="font-bold text-[#2c2421] text-lg hover:text-[#e76e50] transition-colors"
			>
				✅ Todo App
			</a>
			<div class="flex items-center gap-3">
				{#if auth.username}
					<span class="text-sm text-[#8c7b73] font-medium">@{auth.username}</span>
				{/if}
				<button
					onclick={() => auth.logout()}
					class="flex items-center gap-1.5 text-sm text-[#8c7b73] hover:text-[#e76e50] cursor-pointer transition-colors"
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
