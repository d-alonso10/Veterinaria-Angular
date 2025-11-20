---
---

## 🛠️ INFORME DETALLADO DE RETROALIMENTACIÓN Y PLAN DE ACCIÓN

**Para:** Equipo de Desarrollo Frontend (Angular)
**Estado Actual:** Estructura completa. Autenticación y Cliente CRUD (List/Form) implementados y probados con _mock data_.
**Objetivo Inmediato:** Garantizar el flujo de JWT y poblar el Dashboard con datos reales.

### I. RECONOCIMIENTO DE AVANCE Y CRÍTICA

| Avance Clave                  | Observación                                                                          | Coherencia con Backend                                                                                                             |
| :---------------------------- | :----------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **Arquitectura Base**         | `MainLayoutComponent`, `Sidebar`, `Header` y `app.routes.ts` implementados.          | ✅ **Coherencia Total.** Base perfecta para el diseño de `plantilla_menu.html`.                                                    |
| **Módulo de Clientes (CRUD)** | `List`, `Form`, y rutas (`/new`, `/:id`) implementadas con _mock data_ y validación. | **Muy bien.** La estructura está lista para consumir `/api/clientes` (GET, POST, PUT, DELETE).                                     |
| **Autenticación (Guards)**    | `LoginComponent` y `AuthGuard` funcionan para proteger rutas y redirigir a `/login`. | **CRÍTICO LOGRADO.** La protección de rutas está en el lugar correcto, respetando la seguridad implementada con JWT en el backend. |

---

### II. PLAN DE ACCIÓN: PRIORIDAD MÁXIMA (CONEXIÓN Y SEGURIDAD)

El siguiente conjunto de tareas es el **Bloqueador Principal** y debe ejecutarse antes de que el resto de los módulos puedan consumir datos reales.

#### Tarea Bloqueante 1: Implementación del Interceptor JWT (La pieza final de seguridad)

El informe confirma que el JWT se almacena en `localStorage` tras el login, pero no menciona el componente que lo envía de vuelta al servidor. El backend de Spring Boot rechazará todas las peticiones protegidas.

| Acción                          | Archivos Involucrados | Justificación                                                                                                                                                               |
| :------------------------------ | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Crear `JwtInterceptor`**   | `jwt.interceptor.ts`  | **CRÍTICO.** Este _interceptor_ debe adjuntar el token del `localStorage` a cada solicitud a `/api/**` en el _header_ `Authorization: Bearer [token]`.                      |
| **2. Registrar el Interceptor** | `app.config.ts`       | Asegurarse de que el `JwtInterceptor` esté registrado como proveedor de interceptores para que se ejecute automáticamente.                                                  |
| **3. Mapeo de Usuario**         | `AuthService`         | Modificar el `AuthService` para **decodificar** el token JWT y almacenar el `Nombre` y `Rol` del usuario en un objeto observable. Esto es vital para el `SidebarComponent`. |

#### Tarea Bloqueante 2: Consumo de Clientes (Primera Prueba de Fuego)

El módulo de Clientes es el primero en pasar de _mock_ a _real_.

| Acción                 | Endpoint Backend                              | Detalle de Implementación                                                                                                                 |
| :--------------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Listado Real**    | `GET /api/clientes`                           | **Reemplazar la data _mock_** en `ClientListComponent` con la llamada real al `ApiService`.                                               |
| **2. Formulario Real** | `POST /api/clientes` `PUT /api/clientes/{id}` | En `ClientFormComponent`, implementar el envío de datos. Asegurarse de que los campos `dniRuc` y `telefono` estén mapeados correctamente. |
| **3. Botón Eliminar**  | `DELETE /api/clientes/{id}`                   | Implementar la funcionalidad de **Eliminar** en la lista con una confirmación de usuario, utilizando el `ApiService.delete()`.            |

---

### IV. PLAN DE DESARROLLO DE MÓDULOS (Roadmap)

Una vez que el módulo de `Clientes` esté 100% funcional y seguro, el equipo debe continuar con los módulos de valor.

| Fase          | Módulo / Ruta                             | Endpoint Backend                                    | Detalle de la Tarea                                                                                                                                                                                                                                              |
| :------------ | :---------------------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DASHBOARD** | **1. Llenar Dashboard Stats**             | `/api/dashboard/citas-hoy` `/api/reportes/ingresos` | **CRÍTICO.** Usar el `ApiService` para hacer las llamadas concurrentes. Llenar las 4 tarjetas de estadísticas con los datos reales del backend (sustituyendo los valores de `plantilla_menu.html`).                                                              |
| **INFRA**     | **2. Manejo de Errores y Notificaciones** | `GlobalExceptionHandler`                            | **CRÍTICO.** Crear un `ErrorInterceptor` que capture `401/403` (redirigir al login) y `400/500` (extraer el `mensaje` de `ApiResponse` y mostrarlo en la _message-banner_ usando el `NotificationService`).                                                      |
| **FUNCIONAL** | **3. Módulo Mascotas**                    | `/api/mascotas` `/api/clientes/{id}/mascotas`       | Crear `MascotasListComponent` y `MascotaFormComponent`. La creación de una mascota requiere obtener previamente el `id_cliente`.                                                                                                                                 |
| **FUNCIONAL** | **4. Cola de Atención**                   | `/api/atenciones/cola/{idSucursal}`                 | Crear el `AtencionColaComponent`. Debe implementar una **actualización en tiempo real** (o _polling_ recurrente con `setInterval` en Angular) para que la recepcionista vea los pacientes que entran en la cola.                                                 |
| **FUNCIONAL** | **5. Tiempos Promedio**                   | `/api/groomers/tiempos-promedio`                    | Crear `ReporteTiemposPromedioComponent`. Este _endpoint_ devuelve `List<Object[]>` (arrays de datos), por lo que el _frontend_ debe hacer el **mapeo manual** de `Object[]` a una interfaz TypeScript (`ITiempoPromedioDTO`) para su visualización en una tabla. |

---

### V. RESUMEN: PRÓXIMOS BLOQUEADORES

El proyecto está listo para pasar al consumo de datos. Los próximos bloqueadores son técnicos:

1.  **JWT Interceptor:** Debe estar implementado para que el backend no rechace las peticiones.
2.  **Modelos de Reportes:** Se deben crear las interfaces TypeScript para las respuestas de los reportes (ej. `IReporteIngresos`), ya que el backend devuelve `List<Object[]>` para reportes y el _frontend_ debe saber cómo mapear esas estructuras.
