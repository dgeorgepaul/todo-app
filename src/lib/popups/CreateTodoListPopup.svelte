<script lang="ts">
	import { getRandomIcon, getRandomIconName } from '$lib/icon_generator/random_icon';
	import type { TodoList } from '$lib/types';
	import { ICONS } from '$lib/icon_generator/icons';
	import type { IconName } from '$lib/icon_generator/icons';
	import { lists } from '$lib/todolists.svelte';
	import { ApiError } from '$lib/api';

	type IconName = keyof typeof ICONS;

	let { onClose, onCreate }: { onClose: () => void; onCreate: (list: TodoList) => void } = $props();

	const themes = [
		{ name: 'sky', class: 'bg-sky-400', hex: '#38BDF8' },
		{ name: 'indigo', class: 'bg-indigo-500', hex: '#6366F1' },
		{ name: 'emerald', class: 'bg-emerald-400', hex: '#34D399' },
		{ name: 'teal', class: 'bg-teal-400', hex: '#2DD4BF' },
		{ name: 'lavender', class: 'bg-violet-300', hex: '#C4B5FD' },
		{ name: 'rose', class: 'bg-rose-400', hex: '#FB7185' },
		{ name: 'amber', class: 'bg-amber-400', hex: '#FBBF24' },
		{ name: 'peach', class: 'bg-orange-300', hex: '#FDBA74' },
		{ name: 'slate', class: 'bg-slate-500', hex: '#64748B' },
		{ name: 'charcoal', class: 'bg-slate-700', hex: '#334155' }
	];

	let name: string = $state<string>('');
	let description: string = $state<string>('');
	let theme: string = $state<string>('#38BDF8');
	let selectedIconName = $state<IconName>(getRandomIconName());
	let selectedIcon = $derived(ICONS[selectedIconName]);
	let submitting = $state(false);
	let error = $state('');

	async function submit(e: Event) {
		e.preventDefault();
		if (!name.trim() || submitting) return;

		submitting = true;
		error = '';

		try {
			const created = await lists.createList({
				name: name.trim(),
				theme,
				icon: selectedIconName,
				description: description.trim() || null
			});

			if (created) {
				onCreate(created);
			}
			name = '';
			onClose();
		} catch (err) {
			if (err instanceof ApiError) {
				error = err.message;
			} else {
				error = 'Failed to create list. Please try again.';
			}
		} finally {
			submitting = false;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 flex items-center justify-center z-50"
	style="background-color: var(--todo-overlay-bg);"
	onclick={onClose}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="rounded-xl p-6 w-100 relative"
		style="background-color: var(--todo-card-bg); box-shadow: var(--todo-shadow-hover);"
		onclick={(e) => e.stopPropagation()}
	>
		<button
			class="cursor-pointer absolute top-5 right-5"
			style="color: var(--todo-text-secondary);"
			onclick={onClose}
		>
			✕
		</button>

		<h2 class="text-xl font-semibold mb-2" style="color: var(--todo-text-primary);">
			Create New List
		</h2>

		{#if error}
			<div
				class="mb-3 p-2 rounded-lg text-sm"
				style="background-color: var(--todo-error-bg); border: 1px solid var(--todo-error-border); color: var(--todo-error-text);"
			>
				{error}
			</div>
		{/if}

		<form onsubmit={submit} class="flex flex-col gap-3">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm" style="color: var(--todo-text-primary);">Name</label>

			<input
				placeholder="Enter list name"
				bind:value={name}
				class="px-3 py-2 rounded transition-all focus:outline-none focus:ring-2"
				style="background-color: var(--todo-input-bg); border: 1px solid var(--todo-input-border); color: var(--todo-text-primary); --tw-ring-color: var(--color-primary-500);"
			/>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm" style="color: var(--todo-text-primary);">Description (optional)</label>

			<input
				placeholder="Enter list description"
				bind:value={description}
				class="px-3 py-2 rounded transition-all focus:outline-none focus:ring-2"
				style="background-color: var(--todo-input-bg); border: 1px solid var(--todo-input-border); color: var(--todo-text-primary); --tw-ring-color: var(--color-primary-500);"
			/>

			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm" style="color: var(--todo-text-primary);">Theme</label>
			<div class="flex gap-3">
				{#each themes as t}
					<button
						type="button"
						aria-label={`Select ${t.name} theme`}
						class={`
        w-6 h-6 rounded-full cursor-pointer transition
        ${t.class}
        ${theme === t.hex ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}
      `}
						onclick={() => (theme = t.hex)}
					/>
				{/each}
			</div>

			<label class="text-sm" style="color: var(--todo-text-primary);">Icon</label>
			<div class="flex gap-3 w-full flex-wrap" style="color: {theme}">
				{#each Object.keys(ICONS) as icon}
					<div
						class={`
        w-6 h-6 {theme} flex items-center justify-center rounded-md cursor-pointer transition
        ${
					selectedIconName === (icon as IconName)
						? 'ring-2 ring-offset-2 ring-black scale-110'
						: 'hover:scale-105'
				}
      `}
					>
						<svelte:component
							this={ICONS[icon as IconName]}
							onclick={() => (selectedIconName = icon as IconName)}
							class="h-5 w-5"
							style="width: 20px; cursor: pointer; color: {theme}"
						/>
					</div>
				{/each}
			</div>

			<div class={'flex justify-end gap-2 mt-2'}>
				<button
					type="submit"
					disabled={submitting}
					class="px-3 py-3 rounded w-full cursor-pointer disabled:opacity-50 transition-all"
					style="background-color: var(--todo-btn-primary-bg); color: var(--todo-btn-primary-text);"
					onmouseenter={(e) =>
						(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-hover)')}
					onmouseleave={(e) =>
						(e.currentTarget.style.backgroundColor = 'var(--todo-btn-primary-bg)')}
				>
					{submitting ? 'Creating...' : 'Create List'}
				</button>
			</div>
		</form>
	</div>
</div>
