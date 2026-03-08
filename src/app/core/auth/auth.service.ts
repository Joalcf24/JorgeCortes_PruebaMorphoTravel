import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'auth_session_active';
const STORAGE_USER_KEY = 'auth_logged_user';
const AUTH_USER = 'Morpho';
const AUTH_PASS = 'Morpho01!';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly sessionActive = signal<boolean>(this.getInitialSessionState());
	private readonly loggedUser = signal<string | null>(this.getInitialLoggedUser());

	login(username: string, password: string): boolean {
		const isValidUser = username === AUTH_USER && password === AUTH_PASS;

		this.sessionActive.set(isValidUser);
		this.persistSession(isValidUser);
		this.setLoggedUser(isValidUser ? AUTH_USER : null);

		return isValidUser;
	}

	logout(): void {
		this.sessionActive.set(false);
		this.persistSession(false);
		this.setLoggedUser(null);
	}

	isAuthenticated(): boolean {
		return this.sessionActive();
	}

	getLoggedUser(): string | null {
		return this.loggedUser();
	}

	private getInitialSessionState(): boolean {
		return localStorage.getItem(STORAGE_KEY) === 'true';
	}

	private getInitialLoggedUser(): string | null {
		if (!this.getInitialSessionState()) {
			return null;
		}

		return localStorage.getItem(STORAGE_USER_KEY);
	}

	private persistSession(isActive: boolean): void {
		localStorage.setItem(STORAGE_KEY, String(isActive));
	}

	private setLoggedUser(user: string | null): void {
		this.loggedUser.set(user);

		if (user) {
			localStorage.setItem(STORAGE_USER_KEY, user);
			return;
		}

		localStorage.removeItem(STORAGE_USER_KEY);
	}
}
