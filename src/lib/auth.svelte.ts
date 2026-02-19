import { loginUser, registerUser } from './api';
import { goto } from '$app/navigation';

class AuthState {
    #token = $state<string | null>(null);
    #username = $state<string | null>(null);
    #loading = $state(true);

    get token() {
        return this.#token;
    }

    get isAuthenticated() {
        return !!this.#token;
    }

    get loading() {
        return this.#loading;
    }

    get username() {
        return this.#username;
    }

    #extractUsername(token: string): string | null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub ?? null;
        } catch {
            return null;
        }
    }

    /** Restore token from localStorage on app start */
    init() {
        const stored = localStorage.getItem('auth_token');
        if (stored) {
            this.#token = stored;
            this.#username = this.#extractUsername(stored);
        }
        this.#loading = false;
    }

    async login(username: string, password: string): Promise<void> {
        const result = await loginUser(username, password);
        this.#token = result.access_token;
        this.#username = this.#extractUsername(result.access_token);
        localStorage.setItem('auth_token', result.access_token);
    }

    async register(
        username: string,
        email: string,
        password: string,
        fullName?: string
    ): Promise<void> {
        await registerUser({
            username,
            email,
            password,
            full_name: fullName || null
        });
        // Auto-login after registration
        await this.login(username, password);
    }

    logout() {
        this.#token = null;
        this.#username = null;
        localStorage.removeItem('auth_token');
        goto('/login');
    }
}

export const auth = new AuthState();
