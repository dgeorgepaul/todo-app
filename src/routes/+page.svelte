<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		// Wait for auth to finish loading then redirect
		const checkAuth = () => {
			if (!auth.loading) {
				goto(auth.isAuthenticated ? '/todos' : '/login');
			}
		};
		checkAuth();
	});

	$effect(() => {
		if (!auth.loading) {
			goto(auth.isAuthenticated ? '/todos' : '/login');
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center bg-[#fcfaf8]">
	<div class="text-[#8c7b73]">Redirecting...</div>
</div>
