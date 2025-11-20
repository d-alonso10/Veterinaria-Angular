---
---

# 📘 Guía de Integración Backend - TeranVet API

## 1\. Configuración General

### Base URL

```text
http://localhost:8080
```

### Autenticación (JWT)

El sistema utiliza **Bearer Token**.

1.  El Frontend debe hacer login en `/api/auth/login`.
2.  Al recibir la respuesta, guardar el `token` (localStorage/cookie).
3.  **Todas** las peticiones subsiguientes deben incluir el header:
    ```http
    Authorization: Bearer <tu_token_jwt>
    Content-Type: application/json
    ```

### Manejo de CORS

El backend está configurado para aceptar peticiones de cualquier origen (`*`), métodos (`GET, POST, PUT, DELETE, OPTIONS`) y credenciales. No deberían tener problemas de bloqueo de CORS en desarrollo.

### Formato de Fechas

El backend utiliza Java 8 `LocalDateTime` y `LocalDate`.

- **Formato esperado:** ISO-8601 standard.
- **Ejemplo:** `"2025-11-20T14:30:00"` (Fecha y hora) o `"2025-11-20"` (Solo fecha).

---

## 2\. Estructura de Respuesta Estándar (`ApiResponse`)

Todas las respuestas (éxito o error) tienen la misma estructura JSON. El frontend debe crear un interceptor o wrapper para manejar esto uniformemente.

```json
{
  "exito": true,              // Booleano: true si todo salió bien
  "mensaje": "Texto descriptivo", // Mensaje para mostrar al usuario (Toast/Alerta)
  "datos": { ... },           // El objeto o lista solicitada (puede ser null en errores)
  "error": null               // Detalle técnico del error si exito es false
}
```

**Manejo de Errores HTTP:**

- `200 OK`: Éxito.
- `201 Created`: Registro creado.
- `400 Bad Request`: Validación fallida (ej. faltan campos).
- `401 Unauthorized`: Token inválido o expirado.
- `404 Not Found`: ID no encontrado.
- `500 Internal Server Error`: Error de lógica o base de datos.

---

## 3\. Diccionario de Enums (Para Dropdowns/Selects)

Estos son los valores exactos (Case Sensitive) que el backend espera y devuelve. Úsalos para poblar tus `<select>`.

| Entidad      | Campo       | Valores Permitidos (Strings)                                             |
| :----------- | :---------- | :----------------------------------------------------------------------- |
| **Mascota**  | `especie`   | `"perro"`, `"gato"`, `"otro"`                                            |
| **Mascota**  | `sexo`      | `"macho"`, `"hembra"`, `"otro"`                                          |
| **Cita**     | `modalidad` | `"presencial"`, `"virtual"`                                              |
| **Cita**     | `estado`    | `"reservada"`, `"confirmada"`, `"asistio"`, `"cancelada"`, `"no_show"`   |
| **Atención** | `estado`    | `"en_espera"`, `"en_servicio"`, `"pausado"`, `"terminado"`               |
| **Servicio** | `categoria` | `"baño"`, `"corte"`, `"dental"`, `"paquete"`, `"otro"`                   |
| **Factura**  | `estado`    | `"pendiente"`, `"confirmado"`, `"anulado"`                               |
| **Pago**     | `metodo`    | `"efectivo"`, `"tarjeta"`, `"transfer"`, `"otro"`                        |
| **Usuario**  | `rol`       | `"recepcionista"`, `"admin"`, `"groomer"`, `"contador"`, `"veterinario"` |

---

## 4\. Endpoints Principales y Payloads

### 🔐 Autenticación (`/auth`)

- **Login:** `POST /auth/login`
  - Body: `{ "email": "admin@vet.com", "password": "123" }`
  - _Nota:_ Retorna el token y los datos del usuario.
- **Cambiar Password:** `POST /auth/cambiar-contraseña?idUsuario=1`
  - Body: `{ "nuevaContraseña": "newPass" }`

### 👥 Clientes (`/clientes`)

- **Listar:** `GET /clientes`
- **Buscar:** `GET /clientes/buscar/{termino}` (Busca por nombre, apellido o DNI).
- **Crear:** `POST /clientes`
  ```json
  {
    "nombre": "Juan",
    "apellido": "Perez",
    "dniRuc": "12345678",
    "email": "juan@mail.com",
    "telefono": "999888777",
    "direccion": "Av. Lima 123",
    "preferencias": "{}" // JSON string opcional
  }
  ```

### 🐾 Mascotas (`/mascotas`)

- **Por Cliente:** `GET /mascotas/cliente/{idCliente}` (Vital para la ficha del cliente).
- **Crear:** `POST /mascotas`
  - Requiere `idCliente` (Integer).
  - Fechas formato: `"YYYY-MM-DD"`.

### 📅 Citas (`/citas`)

- **Dashboard Citas:** `GET /citas`
- **Próximas por cliente:** `GET /citas/cliente/{idCliente}/proximas`
- **Crear:** `POST /citas`
  ```json
  {
    "idMascota": 1,
    "idCliente": 1,
    "idSucursal": 1,
    "idServicio": 1,
    "fechaProgramada": "2025-11-20T10:30:00",
    "modalidad": "presencial",
    "notas": "Nota opcional"
  }
  ```
- **Acciones Rápidas (Botones):**
  - `PUT /citas/{id}/confirmar-asistencia`
  - `PUT /citas/{id}/cancelar`
  - `PUT /citas/{id}/reprogramar?nuevaFecha=2025-12-01T10:00:00`

### ⚡ Atenciones (Flujo Operativo) (`/atenciones`)

Este es el corazón operativo. Hay dos formas de iniciar una atención:

1.  **Desde Cita (Check-in):**

    - `POST /atenciones/desde-cita`
    - **Importante:** Usa `Params` (Query Parameters), no JSON body.
    - Params: `idCita`, `idGroomer`, `idSucursal`, `turnoNum`, `tiempoEstimadoInicio`, `tiempoEstimadoFin`, `prioridad`.

2.  **Walk-In (Sin Cita):**

    - `POST /atenciones/walk-in`
    - **Importante:** Usa `Params`.
    - Params: `idMascota`, `idCliente`, `idGroomer`, ... (mismos de arriba) + `observaciones`.

3.  **Kanban / Tablero:**

    - `GET /atenciones/cola/{idSucursal}`: Retorna atenciones en estado `en_espera` o `en_servicio`.
    - `PUT /atenciones/{id}/estado?nuevoEstado=en_servicio`: Mover tarjeta.
    - `PUT /atenciones/{id}/terminar`: Finalizar atención (Dispara posibilidad de facturar).

4.  **Detalles de Atención (Servicios realizados):**

    - Ruta: `/atenciones/{idAtencion}/detalles`
    - `GET`: Ver servicios de la atención.
    - `POST`: Agregar servicio extra a la atención en curso.
    - `GET /subtotal`: Calcula el dinero acumulado de la atención.

### 🛠️ Servicios y Paquetes

- **Catálogo:** `GET /servicios`
- **Por Categoría:** `GET /servicios/categoria/baño` (Útil para filtrar en el UI).
- **Paquetes:** `GET /servicios/paquetes` (Combos predefinidos).

### 💳 Facturación y Pagos

1.  **Crear Factura:** `POST /facturas`
    - Params: `idAtencion`, `serie` (ej: F001), `numero`, `metodoPagoSugerido`.
2.  **Registrar Pago:** `POST /pagos`
    - Params: `idFactura`, `monto`, `metodo` (ej: tarjeta), `referencia` (opcional).
    - Nota: Si el monto cubre el total, la factura pasa a estado `pagada` automáticamente.

### 📊 Dashboard y Reportes (`/dashboard`, `/reportes`)

Estos endpoints devuelven listas de mapas (`List<Map>`), ideales para librerías de gráficos como Chart.js o Recharts.

- `GET /dashboard/metricas`: Datos para las tarjetas superiores (Total clientes, Ingresos hoy, etc.).
- `GET /dashboard/estadisticas-mensuales?anio=2025&mes=11`: Para gráficos de barras.
- `GET /groomers/ocupacion/{fecha}`: Para ver carga de trabajo del personal.

### 🔔 Notificaciones (`/notificaciones`)

- `GET /notificaciones/cliente/{id}/no-leidas`: Para mostrar la "campanita" o alertas en el perfil del cliente.

---

## 5\. Flujos de Trabajo Comunes (Workflow)

### Flujo A: Recepción de Cliente con Cita

1.  Buscar Cita: `GET /citas/cliente/{id}/proximas`.
2.  Confirmar llegada: `PUT /citas/{id}/confirmar-asistencia`.
3.  Crear Atención (Pase a Grooming): `POST /atenciones/desde-cita`.

### Flujo B: Grooming (Tablet del Groomer)

1.  Ver Cola: `GET /atenciones/cola/{sucursal}`.
2.  Iniciar trabajo: `PUT /atenciones/{id}/estado` (enviar `en_servicio`).
3.  Agregar servicio adicional (si aplica): `POST /atenciones/{id}/detalles`.
4.  Terminar: `PUT /atenciones/{id}/terminar`.

### Flujo C: Caja (Cobro)

1.  Buscar Atención Terminada: `GET /atenciones/{id}` o listar terminadas.
2.  Generar Factura: `POST /facturas`.
3.  Cobrar: `POST /pagos`.

---

## 6\. Notas para el Desarrollador Frontend

1.  **Validaciones:** Aunque el backend valida, implementa validaciones en los formularios (campos requeridos, formatos de fecha) para mejor UX.
2.  **Groomers:** Al asignar una cita o atención, usa `GET /groomers/disponibilidad/{fecha}` para no asignar a alguien ocupado.
3.  **Manejo de Arrays:** Los campos `preferencias` (Cliente) y `especialidades` (Groomer) se envían como Strings JSON en la BD, pero el DTO los maneja como Strings. Asegúrate de hacer `JSON.parse()` al recibir y `JSON.stringify()` al enviar si necesitas manipular su estructura interna.
4.  **Tests:** Puedes usar la colección de Postman proporcionada (`Postman_Collection.json`) para probar los endpoints antes de codificar.
