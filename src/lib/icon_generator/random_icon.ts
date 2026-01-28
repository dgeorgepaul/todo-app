import { ICON_NAMES, ICONS, type IconName } from '$lib/icon_generator/icons';
import type { Icon } from 'lucide-svelte';

export function getRandomIcon() {

	const index = Math.floor(Math.random() * ICON_NAMES.length);
	const icon = ICON_NAMES[index];
	return ICONS[icon];
}
