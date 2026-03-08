import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

export const authSessionGuard: CanMatchFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	if (authService.isAuthenticated()) {
		return true;
	}

	return router.createUrlTree(['/inicio']);
};
