<script lang="ts">
	import { ShieldAlert } from 'lucide-svelte';
</script>

<div
	class="min-h-screen flex items-center justify-center"
	style="background-color: var(--todo-body-bg);"
>
	<div class="text-center">
		<div class="flex justify-center mb-4">
			<ShieldAlert size={64} style="color: var(--todo-link-color);" />
		</div>
		<h1 class="text-3xl font-bold mb-2" style="color: var(--todo-text-primary);">Access Denied</h1>
		<p class="mb-6 max-w-sm" style="color: var(--todo-text-secondary);">
			You don't have permission to view this resource. It may belong to another user or group.
		</p>
		<a
			href="/todos"
			class="inline-block px-6 py-3 font-medium rounded-lg
			active:scale-[0.98] transition-all duration-150"
			style="background-color: var(--todo-btn-primary-bg); color: var(--todo-btn-primary-text); box-shadow: var(--todo-shadow);"
			onmouseenter={(e) =>
				(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-hover)')}
			onmouseleave={(e) => (e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-bg)')}
		>
			Go to My Lists
		</a>
	</div>
</div>
