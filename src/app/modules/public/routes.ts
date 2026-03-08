import { Routes } from '@angular/router';

import { Layout } from './layout/layout';
import { Inicio } from './pages/inicio/inicio';

export const routes: Routes = [
	{
		path: '',
		component: Layout,
		children: [
			{ path: 'inicio', component: Inicio },
			{ path: '**', redirectTo: 'inicio' },
		],
	},
];
