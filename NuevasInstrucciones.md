---
---

# 📋 Informe de Estado y Directivas de Desarrollo Frontend

## 1\. ✅ Confirmación de Autenticación (Login)

Se han realizado pruebas de integración exitosas con el Backend. El servicio de Login **está funcionando correctamente**.

**Importante:** Para desarrollo local, debes usar las credenciales tal cual están en la base de datos (el _hash_ simulado). No intentes usar "123" o "admin", usa la cadena literal.

**Credenciales de Prueba:**

- **Usuario:** `admin@vet.com`
- **Password:** `hash_admin123`

**Prueba Exitosa (Postman Evidence):**

- **Endpoint:** `POST http://localhost:8080/api/auth/login`
- **Response (200 OK):**
  ```json
  {
    "exito": true,
    "mensaje": "Autenticación exitosa",
    "datos": {
      "idUsuario": 1,
      "nombre": "Admin Principal",
      "email": "admin@vet.com",
      "rol": "admin",
      "token": "eyJhbGciOiJIUzUxMiJ9...", // Token JWT válido
      "tokenType": "Bearer"
    },
    "error": null
  }
  ```

> **Acción:** Asegúrate de que el `AuthService` capture este token y lo guarde en el LocalStorage para que el `JwtInterceptor` lo inyecte en las siguientes peticiones.

---

## 2\. 🚀 Prioridades de Desarrollo: Módulos Faltantes

Necesitamos finalizar la implementación de los flujos operativos principales.

### A. Módulo de Citas (Appointments)

El esqueleto existe, pero falta la integración completa del ciclo de vida.

1.  **Listado:** Consumir `GET /api/citas`.
    - _Ojo:_ El backend devuelve IDs (`idMascota`, `idCliente`). Por ahora, muestra los IDs o implementa una carga auxiliar de nombres, ya que el DTO no incluye los nombres expandidos.
2.  **Creación:** Consumir `POST /api/citas`.
    - Formato fecha: `YYYY-MM-DDTHH:mm:ss` (ISO-8601).
3.  **Acciones en tabla:** Agregar botones para cambiar estados:
    - Confirmar: `PUT /api/citas/{id}/confirmar-asistencia`.
    - Cancelar: `PUT /api/citas/{id}/cancelar`.
    - Reprogramar: `PUT /api/citas/{id}/reprogramar` (Requiere enviar `nuevaFecha` como query param).

### B. Módulo de Cola de Atención (Queue / Kanban)

Este es el módulo crítico para la operación diaria (Groomers/Veterinarios).

1.  **Vista de Cola:** Consumir `GET /api/atenciones/cola/{idSucursal}`.
    - Usa `idSucursal = 1` (o el que tenga el usuario logueado) para pruebas.
    - Debe refrescarse automáticamente cada 30-60 segundos.
2.  **Recepción (Check-in):**
    - Terminar la pantalla donde se busca una Cita y se convierte en Atención usando `POST /api/atenciones/desde-cita`.
    - Implementar la opción "Walk-In" (sin cita) usando `POST /api/atenciones/walk-in`.
3.  **Gestión de Estado:**
    - Permitir mover tarjetas/items de estado (ej. de "en_espera" a "en_servicio") usando `PUT /api/atenciones/{id}/estado`.

---

## 3\. 🔍 Revisión Técnica y Ajustes Necesarios (Code Review)

He revisado el repositorio `veterinaria-angular` y encontré estos puntos que deben ajustarse para evitar errores con el Backend actual:

### 1\. Manejo de Enums (Case Sensitivity)

El backend espera los valores de los Enums en **minúsculas**.

- **Archivo:** `src/app/features/pets/mascota-form/mascota-form.component.html`
- **Error:** Los `<option>` tienen valores capitalizados (ej: `value="Perro"`).
- **Corrección:** Cambiar a minúsculas para coincidir con la BD:
  ```html
  <option value="perro">Perro</option>
  <option value="gato">Gato</option>
  <option value="macho">Macho</option>
  ```

### 2\. Interfaz de Modelos (`models.ts`)

- **Archivo:** `src/app/core/models/models.ts`
- **Atención:** La interfaz `ICita` tiene campos opcionales como `nombreMascota` o `nombreCliente`.
- **Observación:** El endpoint `/api/citas` devuelve un `CitaDTO` que **solo contiene IDs** (`idMascota`, `idCliente`).
- **Solución:** En la lista de citas (`appointment-list`), no esperes ver los nombres automáticamente. O bien haces una petición extra para obtener el nombre del cliente por ID, o muestras el ID temporalmente hasta que actualicemos el Backend con un DTO proyectado.

### 3\. AuthService y Session

- **Archivo:** `src/app/core/services/auth.service.ts`
- **Estado:** El método `setSession` está guardando correctamente el `username` (como email) y el `rol`.
- **Mejora:** Asegúrate de que el _Sidebar_ o _Header_ use estos datos para ocultar opciones que el usuario no tiene permiso de ver (ej. Si es `groomer`, ocultar "Reportes" y "Usuarios").

### 4\. Manejo de Fechas

El backend usa Java 8 `LocalDateTime`.

- Asegúrate de que los formularios de Angular envíen el string completo (ej. `2025-11-20T15:30:00`). Si usas `<input type="datetime-local">`, asegúrate de que el valor se formatee correctamente antes de enviarlo al `ApiService`.

---

**Resumen para el Desarrollador:**

1.  Usa las credenciales `admin@vet.com` / `hash_admin123`.
2.  Corrige los `value` de los selects en los formularios a minúsculas.
3.  Prioriza terminar la integración de la **Cola de Atención** y el cambio de estados, ya que es el núcleo del flujo de trabajo.
