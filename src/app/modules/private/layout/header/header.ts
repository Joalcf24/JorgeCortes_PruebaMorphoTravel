import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
	selector: 'app-header',
	imports: [],
	templateUrl: './header.html',
	styleUrl: './header.scss',
})
export class Header {
	private readonly router = inject(Router);
	private readonly authService = inject(AuthService);

	get userDisplayName(): string {
		return this.authService.getLoggedUser() ?? 'Usuario';
	}

	logout(): void {
		this.authService.logout();
		void this.router.navigateByUrl('/inicio');
	}
}
