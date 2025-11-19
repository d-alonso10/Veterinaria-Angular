# 📘 Guía de Integración Frontend - TeranVet API

Esta guía detalla la estructura de la API, modelos de datos y flujos de trabajo para conectar el frontend (React/Angular/Vue) con el backend Spring Boot.

---

## 🌐 Configuración Base

**Base URL:** `http://localhost:8080/api`

### Headers Comunes
Todas las peticiones (excepto Login/Registro) deben incluir:

```http
Content-Type: application/json
Authorization: Bearer <token_jwt>
```

### Estructura de Respuesta Estándar
Toda respuesta del servidor sigue esta interfaz genérica:

```typescript
interface ApiResponse<T> {
  exito: boolean;
  mensaje: string;
  datos: T | null;
  error: string | null;
}
```

---

## 🔐 Autenticación (Auth)

El sistema usa JWT. El token debe guardarse (localStorage/cookie) y enviarse en cada request subsiguiente.

### Interfaces TypeScript

```typescript
interface LoginRequest {
  email: string;
  password: string; // Enviar en texto plano, el backend hace el hash
}

interface LoginResponse {
  idUsuario: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'recepcionista' | 'groomer' | 'veterinario';
  mensaje: string;
  token: string;     // <-- Guardar este token
  tokenType: string; // "Bearer"
}
```

### Endpoints

| Acción | Método | Endpoint | Body | Respuesta |
|--------|--------|----------|------|-----------|
| Login | `POST` | `/auth/login` | `LoginRequest` | `ApiResponse<LoginResponse>` |
| Logout | `POST` | `/auth/logout` | - | `ApiResponse<null>` |

---

## 👥 Módulo de Clientes

### Interfaces TypeScript

```typescript
interface Cliente {
  idCliente?: number; // Opcional al crear
  nombre: string;
  apellido: string;
  dniRuc: string;
  email: string;
  telefono: string;
  direccion: string;
  preferencias?: string; // JSON stringificado
}
```

### Endpoints

| Acción | Método | Endpoint | Body |
|--------|--------|----------|------|
| Listar Todos | `GET` | `/clientes` | - |
| Obtener Uno | `GET` | `/clientes/{id}` | - |
| Buscar | `GET` | `/clientes/buscar/{termino}` | - |
| Crear | `POST` | `/clientes` | `Cliente` |
| Actualizar | `PUT` | `/clientes/{id}` | `Cliente` |
| Eliminar | `DELETE` | `/clientes/{id}` | - |

---

## 🐾 Módulo de Mascotas

### Interfaces TypeScript

```typescript
interface Mascota {
  idMascota?: number;
  idCliente: number; // FK
  nombre: string;
  especie: 'perro' | 'gato' | 'otro';
  raza: string;
  sexo: 'macho' | 'hembra';
  fechaNacimiento: string; // Formato "YYYY-MM-DD"
  microchip?: string;
  observaciones?: string;
}
```

### Endpoints

| Acción | Método | Endpoint | Body |
|--------|--------|----------|------|
| Listar Todas | `GET` | `/mascotas` | - |
| Por Cliente | `GET` | `/mascotas/cliente/{idCliente}` | - |
| Crear | `POST` | `/mascotas` | `Mascota` |
| Actualizar | `PUT` | `/mascotas/{id}` | `Mascota` |
| Eliminar | `DELETE` | `/mascotas/{id}` | - |

---

## 📅 Módulo de Citas

### Interfaces TypeScript

```typescript
interface Cita {
  idCita?: number;
  idMascota: number;
  idCliente: number;
  idSucursal: number;
  idServicio: number;
  fechaProgramada: string; // ISO 8601 "YYYY-MM-DDTHH:mm:ss"
  modalidad: 'presencial' | 'virtual';
  estado?: 'reservada' | 'confirmada' | 'asistio' | 'cancelada' | 'no_show';
  notas?: string;
}
```

### Endpoints

| Acción | Método | Endpoint | Query Params |
|--------|--------|----------|--------------|
| Listar Todas | `GET` | `/citas` | - |
| Próximas (Cliente) | `GET` | `/citas/cliente/{id}/proximas` | - |
| Crear | `POST` | `/citas` | Body: `Cita` |
| Reprogramar | `PUT` | `/citas/{id}/reprogramar` | `?nuevaFecha=YYYY-MM-DDTHH:mm:ss` |
| Cancelar | `PUT` | `/citas/{id}/cancelar` | - |
| Confirmar | `PUT` | `/citas/{id}/confirmar-asistencia` | - |

---

## ⚡ Módulo de Atenciones (Flujo Operativo)

Este es el núcleo del negocio. Las atenciones pueden nacer de una cita o ser "Walk-in" (sin cita).

### Endpoints Clave

1. **Crear desde Cita:**
   `POST /atenciones/desde-cita`
   *Params:* `idCita`, `idGroomer`, `idSucursal`, `tiempoEstimadoInicio`, `tiempoEstimadoFin`

2. **Crear Walk-in:**
   `POST /atenciones/walk-in`
   *Params:* `idMascota`, `idCliente`, `idGroomer`, `idSucursal`, `tiempoEstimadoInicio`, `tiempoEstimadoFin`

3. **Ver Cola de Atención (Kanban):**
   `GET /atenciones/cola/{idSucursal}`
   *Retorna:* Lista de atenciones ordenadas por prioridad.

4. **Cambiar Estado (Drag & Drop):**
   `PUT /atenciones/{id}/estado?nuevoEstado={estado}`
   *Estados:* `en_espera` -> `en_servicio` -> `terminado`

---

## 💡 Observaciones para el Frontend

1. **Manejo de Fechas:**
   - El backend espera `LocalDate` ("YYYY-MM-DD") para nacimientos.
   - El backend espera `LocalDateTime` ("YYYY-MM-DDTHH:mm:ss") para citas.
   - Asegúrate de formatear correctamente antes de enviar.

2. **Validaciones:**
   - Aunque el backend valida, implementa validaciones en formularios (ej: DNI debe ser numérico, Email válido).
   - El campo `preferencias` en Cliente es un JSON string. Si usas un objeto en el frontend, haz `JSON.stringify()` antes de enviar.

3. **Errores:**
   - Si `exito: false`, muestra el campo `error` en un Toast/Alert.
   - Si el token expira (401 Unauthorized), redirige al Login.

4. **Estados de Carga:**
   - Usa indicadores de carga (spinners) mientras esperas la respuesta de la API, ya que algunos reportes o procesos almacenados pueden tomar unos milisegundos extra.

5. **Dashboard:**
   - El endpoint `/reportes/dashboard` agrega mucha data. Llama a este endpoint solo al cargar la vista principal, no en cada navegación.

---

**Contacto Backend:** Si recibes un error 500 con un mensaje de SQL "Procedure not found", notifica inmediatamente.
