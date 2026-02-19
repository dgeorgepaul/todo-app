import { ICON_NAMES, ICONS, type IconName } from '$lib/icon_generator/icons';
import type { Icon } from 'lucide-svelte';

export function getRandomIconName(): IconName {
	const index = Math.floor(Math.random() * ICON_NAMES.length);
	return ICON_NAMES[index];
}

export function getRandomIcon() {
	return ICONS[getRandomIconName()];
}
