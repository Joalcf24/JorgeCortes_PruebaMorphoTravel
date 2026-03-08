import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environment/enviroment';

export interface CrearFacturaResponse {
	'NUMERO*FACTURA': string;
	ALERTA: string;
}

export interface AgregarDetalleResponse {
	ALERTA: string;
}

export interface BorrarDetalleResponse {
	ALERTA: string;
}

export interface Producto {
	PRECIO: number;
	CODIGO_ARTICULO: string;
	DESCRIPCION: string;
}

export interface BuscarProductoResponse {
	PRODUCTOS: Producto[];
	ALERTA: string;
}

export interface FacturaDetalle {
	PRECIO: number;
	CODIGO_ARTICULO: string;
	LINEA: number;
	ARTICULO: string;
	CANTIDAD: number;
	TOTAL_LINEA: number;
}

export interface FacturaResumen {
	TOTAL: number;
	FECHA: string;
	NUMERO_FACTURA: number;
	USUARIO: string;
}

export interface ObtieneFacturaResponse {
	DETALLES: FacturaDetalle[];
	FACTURA: FacturaResumen;
	ALERTA: string;
}

@Injectable({ providedIn: 'root' })
export class FacturasService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = environment.facturasApiUrl;
	private readonly token = environment.facturasToken;

	createInvoice(invoiceNumber: number | string, date: string): Observable<CrearFacturaResponse> {
		return this.http.post<CrearFacturaResponse>(this.apiUrl, null, {
			params: this.createParams({
				method: 'CreaFactura',
				token: this.token,
				numero_factura: invoiceNumber,
				fecha: date,
			}),
		});
	}

	addInvoiceDetail(
		invoiceNumber: number | string,
		productCode: number | string,
		quantity: number
	): Observable<AgregarDetalleResponse> {
		return this.http.post<AgregarDetalleResponse>(this.apiUrl, null, {
			params: this.createParams({
				method: 'AgregaDetalle',
				token: this.token,
				numero_factura: invoiceNumber,
				codigo_articulo: productCode,
				cantidad: quantity,
			}),
		});
	}

	removeInvoiceDetail(
		invoiceNumber: number | string,
		lineNumber: number | string
	): Observable<BorrarDetalleResponse> {
		return this.http.post<BorrarDetalleResponse>(this.apiUrl, null, {
			params: this.createParams({
				method: 'BorrarDetalle',
				token: this.token,
				numero_factura: invoiceNumber,
				linea: lineNumber,
			}),
		});
	}

	searchProducts(productName?: string): Observable<BuscarProductoResponse> {
		const cleanProductName = productName?.trim();

		return this.http.get<BuscarProductoResponse>(this.apiUrl, {
			params: this.createParams({
				method: 'BuscarProducto',
				token: this.token,
				producto: cleanProductName || undefined,
			}),
		});
	}

	getInvoice(invoiceNumber: number | string): Observable<ObtieneFacturaResponse> {
		return this.http.get<ObtieneFacturaResponse>(this.apiUrl, {
			params: this.createParams({
				method: 'ObtieneFactura',
				token: this.token,
				numero_factura: invoiceNumber,
			}),
		});
	}

	private createParams(params: Record<string, string | number | undefined>): HttpParams {
		let httpParams = new HttpParams();
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined) {
				continue;
			}

			httpParams = httpParams.set(key, String(value));
		}

		return httpParams;
	}
}
