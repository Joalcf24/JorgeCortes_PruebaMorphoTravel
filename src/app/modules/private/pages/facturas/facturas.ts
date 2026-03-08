import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { EMPTY, Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import {
	FacturaDetalle,
	FacturaResumen,
	FacturasService,
	ObtieneFacturaResponse,
	Producto,
} from '../../../../core/services/facturas.service';

const INVOICE_STORAGE_KEYS = ['created_invoice_ids'];

interface InvoiceListItem {
	invoice: FacturaResumen;
	details: FacturaDetalle[];
}

interface DraftInvoiceDetail {
	productCode: string;
	productDescription: string;
	quantity: number;
	unitPrice: number;
}

interface EditableInvoiceDetail extends DraftInvoiceDetail {
	lineNumber: number | null;
}

type DetailModalTarget = 'create' | 'edit';

@Component({
	selector: 'app-facturas',
	imports: [CommonModule],
	templateUrl: './facturas.html',
	styleUrl: './facturas.scss',
})
export class Facturas implements OnInit {
	invoices: InvoiceListItem[] = [];
	selectedInvoice: InvoiceListItem | null = null;
	isLoading = false;
	isSavingInvoice = false;
	isLoadingProducts = false;
	isSavingEditInvoice = false;
	error: string | null = null;
	createInvoiceError: string | null = null;
	createInvoiceNotice: string | null = null;
	editInvoiceError: string | null = null;
	productPickerError: string | null = null;
	isCreateModalOpen = false;
	isEditModalOpen = false;
	isProductModalOpen = false;
	detailModalTarget: DetailModalTarget = 'create';
	newInvoiceNumber = '';
	newInvoiceDate = '';
	draftInvoiceDetails: DraftInvoiceDetail[] = [];
	editInvoiceNumber = 0;
	editInvoiceDate = '';
	editInvoiceUser = '';
	editInvoiceDetails: EditableInvoiceDetail[] = [];
	editRemovedLineNumbers: number[] = [];
	availableProducts: Producto[] = [];
	filteredProducts: Producto[] = [];
	productSearchTerm = '';
	selectedProductCode = '';
	selectedProductQuantity = '1';

	private readonly facturasService = inject(FacturasService);
	private readonly cdr = inject(ChangeDetectorRef);

	ngOnInit(): void {
		this.loadInvoices();
	}

	private loadInvoices(): void {
		const invoiceIds = this.getStoredInvoiceIds();
		if (invoiceIds.length === 0) {
			this.cdr.markForCheck();
			return;
		}

		this.isLoading = true;
		this.error = null;

		const requests = invoiceIds.map((invoiceId) =>
			this.facturasService.getInvoice(invoiceId).pipe(
				map((response) => ({ invoiceId, response })),
				catchError(() => of({ invoiceId, response: null as ObtieneFacturaResponse | null }))
			)
		);

		forkJoin(requests)
			.pipe(
				finalize(() => {
					this.isLoading = false;
					this.cdr.markForCheck();
				})
			)
			.subscribe({
				next: (results) => {
					const loadedInvoices = results
						.filter((result) => result.response?.FACTURA)
						.map((result) => ({
							invoice: result.response!.FACTURA,
							details: result.response!.DETALLES ?? [],
						}));

					this.invoices = this.sortInvoicesDescByNumber(loadedInvoices);

					if (loadedInvoices.length !== invoiceIds.length) {
						this.error = 'Algunas facturas no pudieron cargarse.';
					}

					this.cdr.markForCheck();
				},
				error: () => {
					this.error = 'No fue posible cargar las facturas.';
					this.cdr.markForCheck();
				},
			});
	}

	openInvoiceDetails(item: InvoiceListItem): void {
		this.selectedInvoice = item;
	}

	closeInvoiceDetails(): void {
		this.selectedInvoice = null;
	}

	openCreateInvoiceModal(): void {
		this.isCreateModalOpen = true;
		this.createInvoiceError = null;
		this.createInvoiceNotice = null;
		this.newInvoiceNumber = '';
		this.newInvoiceDate = this.getTodayDate();
		this.draftInvoiceDetails = [];
	}

	closeCreateInvoiceModal(): void {
		if (this.isSavingInvoice) {
			return;
		}

		this.isCreateModalOpen = false;
	}

	openEditInvoiceModal(item: InvoiceListItem): void {
		this.isEditModalOpen = true;
		this.editInvoiceError = null;
		this.editInvoiceNumber = item.invoice.NUMERO_FACTURA;
		this.editInvoiceDate = item.invoice.FECHA;
		this.editInvoiceUser = item.invoice.USUARIO;
		this.editRemovedLineNumbers = [];
		this.editInvoiceDetails = item.details.map((detail) => ({
			lineNumber: detail.LINEA,
			productCode: detail.CODIGO_ARTICULO,
			productDescription: detail.ARTICULO,
			quantity: detail.CANTIDAD,
			unitPrice: detail.PRECIO,
		}));
	}

	closeEditInvoiceModal(): void {
		if (this.isSavingEditInvoice) {
			return;
		}

		this.isEditModalOpen = false;
	}

	openAddDetailModal(target: DetailModalTarget): void {
		this.detailModalTarget = target;
		this.isProductModalOpen = true;
		this.productPickerError = null;
		this.productSearchTerm = '';
		this.selectedProductCode = '';
		this.selectedProductQuantity = '1';
		this.loadProductsForPicker();
	}

	closeAddDetailModal(): void {
		this.isProductModalOpen = false;
	}

	onProductSearchInput(value: string): void {
		this.productSearchTerm = value;
		this.applyProductFilter();
	}

	onSelectedProductChange(value: string): void {
		this.selectedProductCode = value;
	}

	selectProduct(productCode: string): void {
		this.selectedProductCode = productCode;
	}

	onSelectedProductQuantityChange(value: string): void {
		this.selectedProductQuantity = value;
	}

	addSelectedDetail(): void {
		this.productPickerError = null;
		const selectedProduct = this.availableProducts.find(
			(product) => product.CODIGO_ARTICULO === this.selectedProductCode
		);
		const quantity = Number(this.selectedProductQuantity);

		if (!selectedProduct) {
			this.productPickerError = 'Selecciona un articulo.';
			return;
		}

		if (!Number.isInteger(quantity) || quantity <= 0) {
			this.productPickerError = 'La cantidad debe ser un entero mayor a cero.';
			return;
		}

		const nextDetail: EditableInvoiceDetail = {
			lineNumber: null,
			productCode: selectedProduct.CODIGO_ARTICULO,
			productDescription: selectedProduct.DESCRIPCION,
			quantity,
			unitPrice: Number(selectedProduct.PRECIO),
		};

		if (this.detailModalTarget === 'create') {
			this.draftInvoiceDetails = [...this.draftInvoiceDetails, nextDetail];
		} else {
			this.editInvoiceDetails = [...this.editInvoiceDetails, nextDetail];
		}

		this.isProductModalOpen = false;
	}

	removeDraftDetail(index: number): void {
		this.draftInvoiceDetails = this.draftInvoiceDetails.filter(
			(_, detailIndex) => detailIndex !== index
		);
	}

	removeEditDetail(index: number): void {
		const detail = this.editInvoiceDetails[index];
		if (!detail) {
			return;
		}

		if (detail.lineNumber !== null) {
			this.editRemovedLineNumbers = [...this.editRemovedLineNumbers, detail.lineNumber];
		}

		this.editInvoiceDetails = this.editInvoiceDetails.filter(
			(_, detailIndex) => detailIndex !== index
		);
	}

	saveInvoice(): void {
		const invoiceNumber = Number(this.newInvoiceNumber);
		const hasValidDate = Boolean(this.newInvoiceDate);
		if (!Number.isInteger(invoiceNumber) || invoiceNumber <= 0) {
			this.createInvoiceError = 'Ingresa un numero de factura valido.';
			return;
		}

		if (!hasValidDate) {
			this.createInvoiceError = 'Selecciona una fecha valida.';
			return;
		}

		if (this.draftInvoiceDetails.length === 0) {
			this.createInvoiceError = 'Agrega al menos un detalle.';
			return;
		}

		this.isSavingInvoice = true;
		this.createInvoiceError = null;
		this.createInvoiceNotice = null;

		this.validateInvoiceNotExists(invoiceNumber)
			.pipe(
				switchMap((existingInvoiceResponse) => {
					if (existingInvoiceResponse) {
						const wasLoaded = this.invoices.some(
							(item) => item.invoice.NUMERO_FACTURA === invoiceNumber
						);
						this.persistInvoiceId(invoiceNumber);
						this.syncInvoiceInList({
							invoice: existingInvoiceResponse.FACTURA,
							details: existingInvoiceResponse.DETALLES ?? [],
						});

						this.createInvoiceNotice = wasLoaded
							? `La factura #${invoiceNumber} ya existe y no se puede crear nuevamente.`
							: `La factura #${invoiceNumber} ya había sido creada por otro usuario. Ya puedes verla en la pantalla principal.`;

						return EMPTY;
					}

					return this.facturasService.createInvoice(invoiceNumber, this.newInvoiceDate);
				}),
				switchMap(() => {
					const detailRequests = this.draftInvoiceDetails.map((detail) =>
						this.facturasService.addInvoiceDetail(
							invoiceNumber,
							detail.productCode,
							detail.quantity
						)
					);

					return forkJoin(detailRequests);
				}),
				switchMap(() => this.facturasService.getInvoice(invoiceNumber)),
				finalize(() => {
					this.isSavingInvoice = false;
					this.cdr.markForCheck();
				})
			)
			.subscribe({
				next: (response) => {
					this.persistInvoiceId(invoiceNumber);
					this.syncInvoiceInList({
						invoice: response.FACTURA,
						details: response.DETALLES ?? [],
					});
					this.isCreateModalOpen = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.createInvoiceError = 'Error al validar o guardar la factura.';
					this.cdr.markForCheck();
				},
			});
	}

	saveEditedInvoice(): void {
		const invoiceNumber = this.editInvoiceNumber;
		const addRequests = this.editInvoiceDetails
			.filter((detail) => detail.lineNumber === null)
			.map((detail) =>
				this.facturasService.addInvoiceDetail(invoiceNumber, detail.productCode, detail.quantity)
			);
		const removeRequests = this.editRemovedLineNumbers.map((lineNumber) =>
			this.facturasService.removeInvoiceDetail(invoiceNumber, lineNumber)
		);

		this.isSavingEditInvoice = true;
		this.editInvoiceError = null;

		this.runRequests(removeRequests)
			.pipe(
				switchMap(() => this.runRequests(addRequests)),
				switchMap(() => this.facturasService.getInvoice(invoiceNumber)),
				finalize(() => {
					this.isSavingEditInvoice = false;
					this.cdr.markForCheck();
				})
			)
			.subscribe({
				next: (response) => {
					this.syncInvoiceInList({
						invoice: response.FACTURA,
						details: response.DETALLES ?? [],
					});
					this.isEditModalOpen = false;
					this.cdr.markForCheck();
				},
				error: () => {
					this.editInvoiceError = 'No fue posible guardar los cambios de la factura.';
					this.cdr.markForCheck();
				},
			});
	}

	private getStoredInvoiceIds(): number[] {
		for (const key of INVOICE_STORAGE_KEYS) {
			const raw = localStorage.getItem(key);
			if (!raw) {
				continue;
			}

			try {
				const parsed = JSON.parse(raw) as unknown;
				if (!Array.isArray(parsed)) {
					continue;
				}

				const ids = parsed
					.map((value) => Number(value))
					.filter((value) => Number.isInteger(value) && value > 0);

				return Array.from(new Set(ids));
			} catch {
				continue;
			}
		}

		return [];
	}

	private loadProductsForPicker(): void {
		this.isLoadingProducts = true;
		this.facturasService
			.searchProducts()
			.pipe(
				finalize(() => {
					this.isLoadingProducts = false;
					this.cdr.markForCheck();
				})
			)
			.subscribe({
				next: (response) => {
					this.availableProducts = response.PRODUCTOS ?? [];
					this.applyProductFilter();
					this.cdr.markForCheck();
				},
				error: () => {
					this.productPickerError = 'No fue posible cargar los productos.';
					this.cdr.markForCheck();
				},
			});
	}

	private applyProductFilter(): void {
		const searchTerm = this.productSearchTerm.trim().toLowerCase();
		if (!searchTerm) {
			this.filteredProducts = [...this.availableProducts];
			return;
		}

		this.filteredProducts = this.availableProducts.filter(
			(product) =>
				product.DESCRIPCION.toLowerCase().includes(searchTerm) ||
				product.CODIGO_ARTICULO.toLowerCase().includes(searchTerm)
		);
	}

	private persistInvoiceId(invoiceNumber: number): void {
		const storedIds = this.getStoredInvoiceIds();
		const nextIds = Array.from(new Set([...storedIds, invoiceNumber]));
		localStorage.setItem(INVOICE_STORAGE_KEYS[0], JSON.stringify(nextIds));
	}

	private getTodayDate(): string {
		return new Date().toISOString().slice(0, 10);
	}

	private runRequests<T>(requests: Observable<T>[]): Observable<T[]> {
		if (requests.length === 0) {
			return of([]);
		}

		return forkJoin(requests);
	}

	private syncInvoiceInList(invoiceItem: InvoiceListItem): void {
		this.invoices = this.sortInvoicesDescByNumber([
			invoiceItem,
			...this.invoices.filter(
				(item) => item.invoice.NUMERO_FACTURA !== invoiceItem.invoice.NUMERO_FACTURA
			),
		]);
	}

	private sortInvoicesDescByNumber(items: InvoiceListItem[]): InvoiceListItem[] {
		return [...items].sort((a, b) => b.invoice.NUMERO_FACTURA - a.invoice.NUMERO_FACTURA);
	}

private validateInvoiceNotExists(
	invoiceNumber: number
): Observable<ObtieneFacturaResponse | null> {
	return this.facturasService.getInvoice(invoiceNumber).pipe(
		map((response) => {
			if (response?.FACTURA && Number(response.FACTURA.NUMERO_FACTURA) > 0) {
				return response;
			}

			return null;
		}),
		catchError((error: unknown) => {
			if (
				error instanceof HttpErrorResponse &&
				(error.status === 404 || error.status === 400)
			) {
				return of(null);
			}

			return throwError(() => error);
		})
	);
}
}
