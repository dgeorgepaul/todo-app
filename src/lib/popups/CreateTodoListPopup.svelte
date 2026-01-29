<script lang="ts">
	import { getRandomIcon } from '$lib/icon_generator/random_icon';
	import type { TodoList } from '$lib/types';
	import { ICONS } from '$lib/icon_generator/icons';
	import type { ComponentType } from 'svelte';
	import type { Icon } from 'lucide-svelte';
	import { v4 as uuidv4 } from 'uuid';
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

	let theme: string = $state<string>('bg-sky-400');
	let selectedIcon = $state<ComponentType<Icon>>(getRandomIcon());
	function submit(e: Event) {
		e.preventDefault();
		if (!name.trim()) return;

		const newList: TodoList = {
			id: uuidv4(),
			name: name.trim(),
			todos: [],
			description: description.trim(),
			theme,
			icon: selectedIcon
		} as TodoList;

		onCreate(newList);
		name = '';
		onClose();
	}
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
	<div class="bg-white rounded-xl p-6 w-100 relative">
		<button class="cursor-pointer absolute top-5 right-5 text-gray-500" onclick={onClose}>
			✕
		</button>

		<h2 class="text-xl font-semibold mb-2">Create New List</h2>

		<form onsubmit={submit} class="flex flex-col gap-3">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm">Name</label>

			<input placeholder="Enter list name" bind:value={name} class="border px-3 py-2 rounded" />
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm">Description (optional)</label>

			<input
				placeholder="Enter list description"
				bind:value={description}
				class="border px-3 py-2 rounded"
			/>

			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm">Theme</label>
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

			<label class="text-sm">Icon</label>
			<div class="flex gap-3 w-full flex-wrap" style="color: {theme}">
				{#each Object.keys(ICONS) as icon}
					<!-- <div>this test</div> -->
					<div
						class={`
        w-6 h-6 {theme} flex items-center justify-center rounded-md cursor-pointer transition
        ${
					selectedIcon === ICONS[icon as IconName]
						? 'ring-2 ring-offset-2 ring-black scale-110'
						: 'hover:scale-105'
				}
      `}
					>
						<svelte:component
							this={ICONS[icon as IconName]}
							onclick={() => (selectedIcon = ICONS[icon as IconName])}
							class="h-5 w-5"
							style="width: 20px; cursor: pointer; color: {theme}"
						/>
					</div>
				{/each}
			</div>

			<div class={'flex justify-end gap-2 mt-2'}>
				<button type="submit" class="px-3 py-3 bg-blue-500 text-white rounded w-full cursor-pointer"
					>Create List</button
				>
			</div>
		</form>
	</div>
</div>
