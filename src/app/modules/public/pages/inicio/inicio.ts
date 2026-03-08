import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
	selector: 'app-inicio',
	imports: [FormsModule],
	templateUrl: './inicio.html',
	styleUrls: ['./inicio.scss'],
})
export class Inicio {
	username = '';
	password = '';
	errorMessage = '';
	isSubmitting = false;

	private readonly router = inject(Router);
	private readonly authService = inject(AuthService);

	constructor() {
		if (this.authService.isAuthenticated()) {
			void this.router.navigateByUrl('/private/inicio');
		}
	}

	onSubmit(): void {
		this.errorMessage = '';
		this.isSubmitting = true;

		const isAuthenticated = this.authService.login(this.username.trim(), this.password);
		if (isAuthenticated) {
			void this.router.navigateByUrl('/private/inicio');
			return;
		}

		this.errorMessage = 'Usuario o contrasena invalida.';
		this.isSubmitting = false;
	}
}
