import { Routes } from '@angular/router';

import { authSessionGuard } from './guards/auth-session.guard';

export const routes: Routes = [
	{
		path: 'private',
		canMatch: [authSessionGuard],
		loadChildren: () => import('../modules/private/routes').then((x) => x.routes),
	},
	{
		path: '',
		loadChildren: () => import('../modules/public/routes').then((x) => x.routes),
	},
	{ path: '**', redirectTo: '' },
];
