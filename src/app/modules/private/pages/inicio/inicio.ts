import { Component } from '@angular/core';

@Component({
	selector: 'app-inicio',
	imports: [],
	templateUrl: './inicio.html',
	styleUrls: ['./inicio.scss'],
})
export class Inicio {
	readonly greeting = this.getGreeting();
	readonly userDisplayName = this.getLoggedUserName();
	readonly mockInsights = [
		{
			icon: 'bi-graph-up-arrow',
			title: 'Tendencia de ventas',
			message: 'Próximamente verás la evolución semanal de tus facturas.',
		},
		{
			icon: 'bi-cash-coin',
			title: 'Ingresos estimados',
			message: 'Próximamente tendrás un resumen automático de ingresos del mes.',
		},
		{
			icon: 'bi-people',
			title: 'Clientes frecuentes',
			message: 'Próximamente se destacarán tus clientes más recurrentes.',
		},
		{
			icon: 'bi-bell',
			title: 'Alertas inteligentes',
			message: 'Próximamente recibirás recordatorios clave de cobros y vencimientos.',
		},
	];

	private getGreeting(): string {
		const currentHour = new Date().getHours();

		if (currentHour < 12) {
			return 'Buenos dias';
		}

		if (currentHour < 18) {
			return 'Buenas tardes';
		}

		return 'Buenas noches';
	}

	private getLoggedUserName(): string {
		const possibleKeys = ['user', 'usuario', 'username', 'email', 'name'];
		const storages = [localStorage, sessionStorage];

		for (const storage of storages) {
			for (const key of possibleKeys) {
				const rawValue = storage.getItem(key);
				if (!rawValue) {
					continue;
				}

				try {
					const parsedValue = JSON.parse(rawValue) as Record<string, unknown> | string;
					if (typeof parsedValue === 'string' && parsedValue.trim()) {
						return parsedValue.trim();
					}

					if (typeof parsedValue === 'object' && parsedValue !== null) {
						const candidates = ['name', 'nombre', 'username', 'userName', 'email'];
						for (const candidate of candidates) {
							const value = parsedValue[candidate];
							if (typeof value === 'string' && value.trim()) {
								return value.trim();
							}
						}
					}
				} catch {
					return rawValue.trim();
				}
			}
		}

		return 'Usuario';
	}
}
