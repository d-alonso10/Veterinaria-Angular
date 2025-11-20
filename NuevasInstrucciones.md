---
---

## 🛠️ PROMPT DETALLADO: PLAN DE ACCIÓN Y CONEXIÓN MASIVA

**Para:** Equipo de Desarrollo Frontend (Angular)
**Estado Actual:** Estructura completa. Autenticación y Cliente CRUD (List/Form) implementados con _mock data_.
**Objetivo Inmediato:** Implementar el flujo de JWT y poblar el Dashboard con datos reales.

### I. RECONOCIMIENTO Y CRÍTICA AL AVANCE (Fase 1: Estructura)

| Avance Clave            | Detalle y Estado                                                                        | Nota de Retroalimentación                                                                                          |
| :---------------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| **Arquitectura Base**   | `MainLayoutComponent`, `Sidebar`, `Header` y estilos (`src/styles.css`) correctos.      | **Excelente.** La estructura modular es moderna y está lista para el diseño de `plantilla_menu.html`.              |
| **Autenticación/Rutas** | `LoginComponent` y `AuthGuard` implementados. JWT se almacena en `localStorage`.        | **Logro Crítico.** El sistema está protegido. Ahora falta el mecanismo que usa ese token.                          |
| **Módulo Clientes**     | `ClientListComponent` y `ClientFormComponent` (incluyendo la edición por `:id`) listos. | **Listo para Integración.** Este módulo será la primera prueba de fuego del **CRUD** completo contra el _backend_. |

---

### II. PLAN DE ACCIÓN: PRIORIDAD MÁXIMA (CONEXIÓN SEGURA)

El informe del equipo **no menciona** el componente que envía el JWT de vuelta al servidor. Esta es la tarea **CRÍTICA** que bloquea el consumo de todos los _endpoints_ protegidos.

#### Tarea Bloqueante 1: Implementación del Interceptor JWT

El _backend_ de Spring Boot utiliza _Spring Security_ y JWT para proteger todas las rutas bajo `/api/`. Sin el `HttpInterceptor`, el _backend_ devolverá un error **401 (Unauthorized)** a todas las peticiones a `/api/clientes`, `/api/dashboard`, etc.

| Acción                             | Archivos Involucrados                          | Justificación                                                                                                                                                                 |
| :--------------------------------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Crear `JwtInterceptor`**      | `src/app/core/interceptors/jwt.interceptor.ts` | Este _interceptor_ debe tomar el token del `localStorage` y adjuntarlo automáticamente a **cada solicitud HTTP** que vaya al _backend_ (rutas que contengan `/api`).          |
| **2. Registro en `app.config.ts`** | `app.config.ts`                                | Registrar el `JwtInterceptor` en el arreglo de `providers` para que Angular lo ejecute en cada petición.                                                                      |
| **3. Mapeo en Sidebar**            | `AuthService`, `SidebarComponent`              | Asegurarse de que el `AuthService` (tras el login) decodifique el token para obtener el `Nombre` y `Rol` y lo exponga como un `Observable` para poblar el `SidebarComponent`. |

#### Tarea Bloqueante 2: Consumo de Clientes y Manejo de Errores

El módulo `Clientes` debe ser la primera integración completa (CRUD) para validar todo el flujo de JWT, el `ApiService` y la respuesta del servidor.

| Acción                        | Endpoint Backend             | Detalle de Implementación                                                                                                                                                                                                                                                                                                        |
| :---------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Listado Real**           | `GET /api/clientes`          | Implementar `ClientListComponent` para consumir esta ruta, reemplazando la data _mock_ de la tabla.                                                                                                                                                                                                                              |
| **2. Formulario Real (POST)** | `POST /api/clientes`         | Conectar `ClientFormComponent` para enviar objetos `Cliente` (o `ClienteDTO`) al _backend_.                                                                                                                                                                                                                                      |
| **3. Manejo de Errores**      | **`GlobalExceptionHandler`** | **CRÍTICO.** Implementar un **`ErrorInterceptor`** o modificar el `ApiService` para: **a.** Capturar el `401 Unauthorized` y redirigir al `/login`. **b.** Capturar `400/500` y extraer el mensaje de error de la estructura JSON del _backend_ (`ApiResponse.mensaje`) para mostrarlo en una _message-banner_ de tipo `.error`. |

---

### IV. PLAN DE DESARROLLO DE MÓDULOS (Roadmap Secuencial)

Una vez que el módulo `Clientes` sea estable y se confirme que el `JwtInterceptor` funciona, el desarrollo debe continuar con los módulos de valor:

#### FASE 3: Llenado del Dashboard y Modelado de Datos

| Módulo / Componente | Endpoint Backend                                 | Tarea a Implementar                                                                                                                                                                                                                                  |
| :------------------ | :----------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DASHBOARD**       | **`GET /api/dashboard/citas-hoy`**               | Población real de la tarjeta "Citas del Día".                                                                                                                                                                                                        |
| **DASHBOARD**       | **`GET /api/atenciones?estado=en_servicio`**     | Población real de la tarjeta "Atenciones en Curso".                                                                                                                                                                                                  |
| **DASHBOARD**       | **`GET /api/reportes/ingresos?fechaInicio=...`** | Población real de la tarjeta "Ingresos del Día". **ATENCIÓN:** El _backend_ devuelve `List<Object[]>` para reportes. El _frontend_ debe crear una interfaz TypeScript (`IReporteIngresosDTO`) para mapear manualmente este array antes de mostrarlo. |
| **MODELOS**         | **Tipado de Datos**                              | Crear las interfaces TypeScript (`IMascota`, `IAtencion`, `ICita`) para cada una de las entidades del _backend_ (revisar los DTOs de Java para mapear correctamente).                                                                                |

#### FASE 4: Flujo Principal de Gestión

| Módulo / Ruta  | Endpoint Backend                              | Detalle de la Tarea                                                                                                                                                                                                           |
| :------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MASCOTAS**   | `/api/mascotas` `/api/clientes/{id}/mascotas` | Crear `MascotasListComponent` y `MascotaFormComponent`. Implementar la funcionalidad donde el formulario de mascota permita seleccionar un cliente existente (usando un _autocomplete_ o _select_ que liste `/api/clientes`). |
| **ATENCIONES** | `/api/atenciones/cola/{idSucursal}`           | Crear el `AtencionColaComponent`. Implementar la **actualización continua** (usando el patrón _polling_ o _interval_) para mostrar la cola de atención en tiempo real.                                                        |
| **REPORTES**   | `/api/groomers/tiempos-promedio`              | Crear el componente de reportes. Implementar la captura de fechas (`LocalDate`) y el consumo del _endpoint_ de reporte (que devuelve `List<Object[]}`) para visualizarlo en una tabla.                                        |
