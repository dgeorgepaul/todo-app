<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { ApiError } from '$lib/api';
	import { onMount } from 'svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let fullName = $state('');
	let error = $state('');
	let submitting = $state(false);

	onMount(() => {
		if (auth.isAuthenticated) {
			goto('/todos');
		}
	});

	async function handleRegister(e: Event) {
		e.preventDefault();
		error = '';
		submitting = true;

		try {
			await auth.register(username, email, password, fullName || undefined);
			goto('/todos');
		} catch (err) {
			if (err instanceof ApiError) {
				error = err.status === 400 ? 'Username or email already taken' : err.message;
			} else {
				error = 'Something went wrong. Please try again.';
			}
		} finally {
			submitting = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-[#fcfaf8]">
	<div class="w-full max-w-md">
		<div class="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-[#2c2421]">Create account</h1>
				<p class="text-[#8c7b73] mt-2">Get started with your todo lists</p>
			</div>

			{#if error}
				<div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
					{error}
				</div>
			{/if}

			<form onsubmit={handleRegister} class="flex flex-col gap-4">
				<div class="flex flex-col gap-1">
					<label for="username" class="text-sm font-medium text-[#2c2421]">Username</label>
					<input
						id="username"
						type="text"
						placeholder="Choose a username"
						bind:value={username}
						required
						class="border border-stone-300 px-4 py-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e76e50] focus:border-transparent transition-all"
					/>
				</div>

				<div class="flex flex-col gap-1">
					<label for="email" class="text-sm font-medium text-[#2c2421]">Email</label>
					<input
						id="email"
						type="email"
						placeholder="you@example.com"
						bind:value={email}
						required
						class="border border-stone-300 px-4 py-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e76e50] focus:border-transparent transition-all"
					/>
				</div>

				<div class="flex flex-col gap-1">
					<label for="fullname" class="text-sm font-medium text-[#2c2421]"
						>Full Name <span class="text-[#8c7b73] font-normal">(optional)</span></label
					>
					<input
						id="fullname"
						type="text"
						placeholder="Alice Smith"
						bind:value={fullName}
						class="border border-stone-300 px-4 py-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e76e50] focus:border-transparent transition-all"
					/>
				</div>

				<div class="flex flex-col gap-1">
					<label for="password" class="text-sm font-medium text-[#2c2421]">Password</label>
					<input
						id="password"
						type="password"
						placeholder="Create a password"
						bind:value={password}
						required
						minlength="6"
						class="border border-stone-300 px-4 py-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e76e50] focus:border-transparent transition-all"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="mt-2 w-full py-3 bg-[#e76e50] text-white font-medium rounded-lg cursor-pointer
					hover:bg-[#d45d40] active:scale-[0.98] transition-all duration-150
					disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
				>
					{submitting ? 'Creating account...' : 'Create Account'}
				</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-[#8c7b73] text-sm">
					Already have an account?
					<a href="/login" class="text-[#e76e50] font-medium hover:underline">Sign in</a>
				</p>
			</div>
		</div>
	</div>
</div>
