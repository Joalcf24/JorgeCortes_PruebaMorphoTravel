import { Routes } from '@angular/router';

import { Layout } from './layout/layout';
import { Inicio } from './pages/inicio/inicio';
import { Facturas } from './pages/facturas/facturas';

export const routes: Routes = [
	{
		path: '',
		component: Layout,
		children: [
			{ path: 'inicio', component: Inicio },
			{ path: 'facturas', component: Facturas },
			{ path: '**', redirectTo: 'inicio' },
		],
	},
];
