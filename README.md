# Prueba Tecnica Angular - Facturacion

Aplicacion Angular para una prueba tecnica con autenticacion mock y modulo de gestion de facturas conectado a API externa.

## Stack

- Angular 20.3
- TypeScript 5.9
- SCSS
- Bootstrap 5 + Bootstrap Icons
- RxJS

## Requisitos

- Node.js 20.x o 22.x (LTS recomendado)
- npm 10+

## Instalacion y ejecucion

```bash
npm install
npm run start
```

Aplicacion en desarrollo:

- `http://localhost:4200`

Build de produccion:

```bash
npm run build
```

## Scripts

- `npm run start`: levanta el servidor de desarrollo.
- `npm run build`: genera build en `dist/PruebaTecnica`.
- `npm run fix`: ejecuta tareas de correccion/formato configuradas en el proyecto.

## Autenticacion (mock)

Credenciales actuales:

- Usuario: `Morpho`
- Contrasena: `Morpho01!`

Comportamiento:

- Sesion en memoria y persistencia en `localStorage`.
- Guard para proteger rutas privadas (`/private/**`).
- Logout limpia estado de autenticacion y retorna al login publico.

## Rutas principales

- Publico:
  - `/inicio` (login)
- Privado (protegido por guard):
  - `/private/inicio`
  - `/private/facturas`

## Modulo de Facturas

Pantalla: `src/app/modules/private/pages/facturas`

Funcionalidades implementadas:

- Listado de facturas.
- Orden descendente por numero de factura.
- Ver detalle en modal.
- Crear factura en modal:
  - numero de factura
  - fecha
  - agregar multiples detalles
- Seleccion de articulos en mini modal con tabla (no select).
- Edicion de factura:
  - agregar articulos
  - quitar articulos
- Guardado persistiendo ID en `localStorage` para recarga futura.
- Validacion de factura existente antes de crear:
  - se consulta API con `getInvoice(numero)`
  - si ya existe, no se vuelve a crear
  - si no estaba cargada en pantalla, se informa que fue creada por otro usuario y se agrega al listado local

Storage usado:

- Key: `created_invoice_ids`
- Valor esperado: arreglo JSON de numeros, por ejemplo:

```json
[1, 2, 3]
```

## Justificacion tecnica (limitaciones de API)

La API actual no expone:

- un metodo para listar facturas historicas
- un metodo para borrar facturas completas

Por esta razon, para poder reconstruir el listado al recargar la aplicacion se implemento
persistencia local de IDs de factura en `localStorage` (`created_invoice_ids`).

Flujo aplicado:

1. Se guardan los IDs de facturas creadas/editadas localmente.
2. Al cargar la pantalla de facturas, se leen esos IDs.
3. Con esos IDs se consulta el detalle al backend (`getInvoice`) y se arma la lista visible.

Validacion de duplicados al crear:

1. Antes de crear, se valida en backend si el numero ya existe (`getInvoice`).
2. Si existe, se evita crear duplicado.
3. Se muestra mensaje claro:
   - caso normal: la factura ya existe
   - caso no cargado previamente: la factura fue creada por otro usuario y ya se puede ver en la pantalla principal
4. Se sincroniza el ID en `localStorage` para que quede persistido en futuras cargas.

## Integracion API

Servicio: `src/app/core/services/facturas.service.ts`

Metodos expuestos:

- `createInvoice(invoiceNumber, date)`
- `addInvoiceDetail(invoiceNumber, productCode, quantity)`
- `removeInvoiceDetail(invoiceNumber, lineNumber)`
- `searchProducts(productName?)`
- `getInvoice(invoiceNumber)`

Configuracion de API en:

- `src/environment/enviroment.ts`

Variables relevantes:

- `facturasApiUrl`
- `facturasToken`

## Manejo de errores

La API no siempre responde con mensajes de error significativos o consistentes para UI.
Por eso, a nivel de pantalla se usan mensajes genericos por accion (por ejemplo: error al cargar,
error al guardar factura, error al cargar productos, etc.).

Esto permite una UX estable aunque el backend no entregue detalle tecnico suficiente en todos los casos.

## Buenas practicas aplicadas

- Guard de sesion para proteger rutas privadas (`canMatch`).
- Servicio de autenticacion centralizado con estado en memoria y persistencia en `localStorage`.
- Servicio HTTP tipado para facturas con metodos explicitos de dominio.
- Parametrizacion de API/token en `environment`.
- Ordenamiento deterministico de facturas (descendente por numero).
- Validaciones basicas de entrada antes de invocar API (numero, fecha, cantidad, seleccion de producto).
- Integracion con herramientas de calidad configuradas en el proyecto:
  - ESLint
  - Stylelint
  - Prettier

## Mini system design en estilos

Se uso el sistema de tokens definido en `src/styles` (variables semanticas y escalas de color), incluyendo:

- superficies (`--bg-*`)
- texto (`--fg-*`)
- bordes y radios (`--border-*`)
- sombras y efectos (`--shadow-*`, `--backdrop-*`)

Con esto se mantuvo consistencia visual sin introducir un design system externo.

## Limitaciones actuales y mejoras posibles

Esta entrega prioriza una implementacion funcional y clara dentro del tiempo de prueba.
El proyecto es mejorable, por ejemplo:

- extraer modales y tablas en componentes reutilizables
- fortalecer estrategia de testing (unit/integration)
- enriquecer estados de error/empty/loading por componente
- endurecer manejo de errores de red con mapeo mas fino por codigo backend

Se opto por una version mas directa para cumplir alcance en tiempo.

## Estructura resumida

```text
src/
  app/
    core/
      auth/
      guards/
      services/
    modules/
      public/
      private/
  environment/
    enviroment.ts
```

## Notas

- El proyecto usa Bootstrap para layout/utilidades.
- Los estilos de la pantalla de facturas usan tokens globales definidos en `src/styles`.
