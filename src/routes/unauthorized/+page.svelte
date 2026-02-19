<script lang="ts">
	import { ShieldAlert } from 'lucide-svelte';
</script>

<div class="min-h-screen flex items-center justify-center bg-[#fcfaf8]">
	<div class="text-center">
		<div class="flex justify-center mb-4">
			<ShieldAlert size={64} class="text-[#e76e50]" />
		</div>
		<h1 class="text-3xl font-bold text-[#2c2421] mb-2">Access Denied</h1>
		<p class="text-[#8c7b73] mb-6 max-w-sm">
			You don't have permission to view this resource. It may belong to another user or group.
		</p>
		<a
			href="/todos"
			class="inline-block px-6 py-3 bg-[#e76e50] text-white font-medium rounded-lg
			hover:bg-[#d45d40] active:scale-[0.98] transition-all duration-150 shadow-sm hover:shadow-md"
		>
			Go to My Lists
		</a>
	</div>
</div>
