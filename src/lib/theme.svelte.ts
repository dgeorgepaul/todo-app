// Theme state store for dark mode
const STORAGE_KEY = 'theme';

class ThemeState {
    darkMode = $state(false);

    init() {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            this.darkMode = stored === 'dark';
        } else {
            this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        this.apply();
    }

    toggle() {
        this.darkMode = !this.darkMode;
        this.apply();
    }

    private apply() {
        if (typeof document === 'undefined') return;
        const html = document.documentElement;
        if (this.darkMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEY, this.darkMode ? 'dark' : 'light');
    }
}

export const theme = new ThemeState();
