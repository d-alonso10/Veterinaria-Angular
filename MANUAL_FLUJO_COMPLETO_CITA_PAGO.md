# 📘 Manual Completo: Flujo de Negocio Cita → Atención → Factura → Pago

**Proyecto:** Veterinaria SpringBoot  
**Módulo:** Flujo Completo de Negocio  
**Base URL:** `http://localhost:8080`  
**Fecha:** 2025-11-27

---

## 📑 Índice

1. [Introducción al Flujo de Negocio](#introducción-al-flujo-de-negocio)
2. [Configuración Inicial](#configuración-inicial)
3. [Flujo Completo Paso a Paso](#flujo-completo-paso-a-paso)
4. [Escenarios de Prueba](#escenarios-de-prueba)
5. [Validaciones y Verificaciones](#validaciones-y-verificaciones)
6. [Casos de Error Comunes](#casos-de-error-comunes)
7. [Checklist de Prueba Completa](#checklist-de-prueba-completa)

---

## 🔄 Introducción al Flujo de Negocio

El sistema sigue este flujo para gestionar el servicio completo desde que un cliente agenda una cita hasta que paga:

```mermaid
graph TD
    A[1. Cliente Agenda Cita] --> B[2. Recepción Crea Atención]
    B --> C[3. Groomer Realiza Servicio]
    C --> D[4. Terminar Atención]
    D --> E[5. Generar Factura]
    E --> F[6. Registrar Pago]
    F --> G[✅ Proceso Completado]
```

### Estados y Transiciones

Cada entidad en el sistema tiene estados específicos con transiciones controladas:

| Entidad | Estados Posibles | Transiciones Permitidas | Endpoint |
|---------|-----------------|-------------------------|----------|
| **Cita** | `reservada`, `confirmada`, `atendido`, `cancelada`, `no_show` | `reservada` → `confirmada` → `atendido`<br>`reservada` → `cancelada`<br>`confirmada` → `no_show` | `PUT /api/citas/{id}/confirmar-asistencia`<br>`PUT /api/citas/{id}/cancelar`<br>`PUT /api/citas/{id}/no-show` |
| **Atención** | `en_espera`, `en_servicio`, `terminado` | `en_espera` → `en_servicio` → `terminado` | `PUT /api/atenciones/{id}/estado?nuevoEstado=`<br>`PUT /api/atenciones/{id}/terminar` |
| **Factura** | `emitida`, `pagada`, `anulada` | `emitida` → `pagada`<br>`emitida` → `anulada` | Automático al registrar pago<br>`DELETE /api/facturas/{id}` |
| **Pago** | `confirmado` | N/A (único estado) | N/A |

> [!IMPORTANT]
> Las transiciones de estado son validadas por el backend. Intentar una transición inválida resultará en un error 400 BAD REQUEST.

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno en Postman

```json
{
  "baseUrl": "http://localhost:8080",
  "token": "{{tu_jwt_token}}",
  "idCliente": "1",
  "idMascota": "1",
  "idServicio": "1",
  "idSucursal": "1",
  "idGroomer": "1",
  "idCita": "",
  "idAtencion": "",
  "idFactura": "",
  "idPago": ""
}
```

### 2. Obtener Token de Autenticación

```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "exito": true,
  "datos": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**💡 Acción:** Guarda el token en la variable `{{token}}`.

### 3. Headers para Todos los Requests

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 📋 Flujo Completo Paso a Paso

### PASO 1: Crear una Cita

**Objetivo:** El cliente agenda una cita para un servicio

**Endpoint:**
```http
POST {{baseUrl}}/api/citas
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "idMascota": 1,
  "idCliente": 1,
  "idSucursal": 1,
  "idServicio": 1,
  "fechaProgramada": "2025-11-26T10:00:00",
  "modalidad": "presencial",
  "notas": "Cliente solicita groomer María González"
}
```

**Respuesta Esperada:** HTTP 201 CREATED
```json
{
  "exito": true,
  "mensaje": "Cita creada exitosamente",
  "datos": "Registro creado en base de datos"
}
```

**✅ Validación:**
```sql
SELECT id_cita, estado, fecha_programada 
FROM cita 
ORDER BY id_cita DESC 
LIMIT 1;
```

**💡 Acción:** Guarda el `id_cita` en la variable `{{idCita}}` (ej: 15).

---

### PASO 2: Consultar la Cita Creada

**Endpoint:**
```http
GET {{baseUrl}}/api/citas
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Citas obtenidas exitosamente",
  "datos": [
    {
      "idCita": 12,
      "idMascota": 1,
      "idCliente": 1,
      "idSucursal": 1,
      "idServicio": 1,
      "fechaProgramada": "2025-11-27T10:00:00",
      "modalidad": "presencial",
      "estado": "reservada",
      "notas": "Cliente solicita groomer María González"
    },
    {
      "idCita": 10,
      "idMascota": 1,
      "idCliente": 1,
      "idSucursal": 1,
      "idServicio": 1,
      "fechaProgramada": "2025-11-26T10:00:00",
      "modalidad": "presencial",
      "estado": "atendido",
      "notas": "Cliente solicita groomer María González"
    }
  ],
  "error": null
}
```

> [!NOTE]
> El endpoint retorna solo los **IDs de las relaciones** (idMascota, idCliente, idSucursal, idServicio), no los objetos completos. Para obtener la información detallada de una cita con todos los objetos relacionados, usa `GET /api/citas/{id}`.

**✅ Validación:** Confirma que tu cita aparece en la lista con `estado = "reservada"`.


---

### PASO 3: Crear Atención desde la Cita

**Objetivo:** Cuando el cliente llega, crear la atención para iniciarel servicio

**Endpoint:**
```http
POST {{baseUrl}}/api/atenciones/desde-cita
Authorization: Bearer {{token}}
Content-Type: application/x-www-form-urlencoded

idCita=15
&idGroomer=1
&idSucursal=1
&turnoNum=1
&tiempoEstimadoInicio=2025-11-26T10:00:00
&tiempoEstimadoFin=2025-11-26T11:30:00
&prioridad=1
```

**⚠️ IMPORTANTE:** Los parámetros se envían como **form-urlencoded**, NO como JSON.

**En Postman:**
1. Método: POST
2. URL: `{{baseUrl}}/api/atenciones/desde-cita`
3. Headers: `Authorization: Bearer {{token}}`
4. Body: Selecciona **x-www-form-urlencoded**
5. Agrega cada parámetro como key-value

**Respuesta Esperada:** HTTP 201 CREATED
```json
{
  "exito": true,
  "mensaje": "Atención creada exitosamente desde la cita",
  "datos": null
}
```

**✅ Validación:**
```sql
SELECT id_atencion, estado, id_cita 
FROM atencion 
WHERE id_cita = 15;
```

**💡 Acción:** Guarda el `id_atencion` que obtuviste de la BD en `{{idAtencion}}` (ej: 20).

**Verificar Cambio de Estado de Cita:**
```sql
SELECT id_cita, estado 
FROM cita 
WHERE id_cita = 15;
```
Debería cambiar de `reservada` a `atendido`.

---

### PASO 4: Consultar la Atención Creada

**Endpoint:**
```http
GET {{baseUrl}}/api/atenciones/20
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Atención obtenida exitosamente",
  "datos": {
    "idAtencion": 20,
    "cita": {
      "idCita": 15,
      "mascota": {
        "idMascota": 1,
        "cliente": {
          "idCliente": 1,
          "nombre": "Juan",
          "apellido": "Pérez",
          "dniRuc": "12345678",
          "email": "juan.perez@mail.com",
          "telefono": "987654321",
          "direccion": "Av. Principal 123",
          "preferencias": null,
          "createdAt": "2025-11-15T10:00:00",
          "updatedAt": "2025-11-15T10:00:00"
        },
        "nombre": "Max",
        "especie": "perro",
        "raza": "Golden Retriever",
        "sexo": "macho",
        "fechaNacimiento": "2022-05-15",
        "microchip": null,
        "observaciones": null,
        "createdAt": "2025-11-15T10:00:00",
        "updatedAt": "2025-11-15T10:00:00"
      },
      "cliente": {
        "idCliente": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "dniRuc": "12345678",
        "email": "juan.perez@mail.com",
        "telefono": "987654321",
        "direccion": "Av. Principal 123",
        "preferencias": null,
        "createdAt": "2025-11-15T10:00:00",
        "updatedAt": "2025-11-15T10:00:00"
      },
      "sucursal": {
        "idSucursal": 1,
        "nombre": "Sucursal Central",
        "direccion": "Av. Principal 123, Lima",
        "telefono": "987654321",
        "createdAt": "2025-11-15T10:00:00",
        "updatedAt": "2025-11-15T10:00:00"
      },
      "servicio": {
        "idServicio": 1,
        "codigo": "B001",
        "nombre": "Baño Básico",
        "descripcion": "Limpieza básica, shampoo, secado",
        "duracionEstimadaMin": 45,
        "precioBase": 35.00,
        "categoria": "baño",
        "createdAt": "2025-11-15T10:00:00",
        "updatedAt": "2025-11-15T10:00:00"
      },
      "fechaProgramada": "2025-11-26T10:00:00",
      "modalidad": "presencial",
      "estado": "atendido",
      "notas": "Cliente solicita groomer María González",
      "createdAt": "2025-11-25T14:30:00",
      "updatedAt": "2025-11-26T10:00:00"
    },
    "mascota": {
      "idMascota": 1,
      "nombre": "Max",
      "especie": "perro",
      "raza": "Golden Retriever",
      ...
    },
    "cliente": {
      "idCliente": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      ...
    },
    "groomer": {
      "idGroomer": 1,
      "nombre": "María González",
      "especialidades": "{\"principales\":[\"corte_raza\",\"baño_premium\"]}",
      "disponibilidad": "{\"lunes\":{\"inicio\":\"09:00\",\"fin\":\"18:00\"}}",
      ...
    },
    "sucursal": {
      "idSucursal": 1,
      "nombre": "Sucursal Central",
      ...
    },
    "estado": "en_espera",
    "turnoNum": 1,
    "tiempoEstimadoInicio": "2025-11-26T10:00:00",
    "tiempoEstimadoFin": "2025-11-26T11:30:00",
    "tiempoRealInicio": null,
    "tiempoRealFin": null,
    "prioridad": 1,
    "observaciones": null,
    "createdAt": "2025-11-26T09:55:00",
    "updatedAt": "2025-11-26T09:55:00"
  },
  "error": null
}
```

**⚠️ NOTA IMPORTANTE:**

La respuesta incluye **TODA la información relacionada**:
- Cita completa con mascota, cliente, sucursal y servicio
- Mascota duplicada (aparece dentro de cita y como campo directo)
- Cliente duplicado (aparece dentro de cita y como campo directo)
- Groomer completo
- Sucursal completa

**Esto es porque las relaciones están configuradas como LAZY pero se cargan al serializar**. La respuesta es muy verbosa pero contiene toda la información necesaria.

**✅ Validación:** Confirma que `estado = "en_espera"`.

**Campos Clave a Verificar:**
- `idAtencion`: ID de la atención
- `estado`: `"en_espera"` (estado inicial)
- `cita.estado`: `"atendido"` (la cita cambió de estado)
- `tiempoRealInicio`: `null` (aún no inicia el servicio)
- `tiempoRealFin`: `null` (aún no termina el servicio)

---

### PASO 5: Iniciar el Servicio (Cambiar a "en_servicio")

**Endpoint:**
```http
PUT {{baseUrl}}/api/atenciones/20/estado?nuevoEstado=en_servicio
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Estado actualizado exitosamente",
  "datos": {
    "idAtencion": 13,
    "cita": {
      "idCita": 12,
      "mascota": {
        "idMascota": 1,
        "cliente": {
          "idCliente": 1,
          "nombre": "Ricardo",
          "apellido": "Alvarez",
          "dniRuc": "45678901",
          "email": "ricardo.alvarez@mail.com",
          ...
        },
        "nombre": "Ben 10",
        "especie": "perro",
        "raza": "Golden Retriever",
        ...
      },
      "cliente": { ... },
      "sucursal": {
        "idSucursal": 1,
        "nombre": "Sucursal Central",
        ...
      },
      "servicio": {
        "idServicio": 1,
        "codigo": "B001",
        "nombre": "Baño Básico (Perro Pequeño)",
        "precioBase": 35.00,
        ...
      },
      "fechaProgramada": "2025-11-27T10:00:00",
      "modalidad": "presencial",
      "estado": "atendido",
      "notas": "Cliente solicita groomer María González"
    },
    "mascota": {
      "idMascota": 1,
      "cliente": { ... },
      "nombre": "Ben 10",
      "especie": "perro",
      ...
    },
    "cliente": {
      "idCliente": 1,
      "nombre": "Ricardo",
      "apellido": "Alvarez",
      ...
    },
    "groomer": {
      "idGroomer": 1,
      "nombre": "Ana Torres",
      "especialidades": "[\"perros_grandes\", \"cortes_asiaticos\"]",
      ...
    },
    "sucursal": {
      "idSucursal": 1,
      "nombre": "Sucursal Central",
      ...
    },
    "estado": "en_servicio",
    "turnoNum": 1,
    "tiempoEstimadoInicio": "2025-11-27T10:00:00",
    "tiempoEstimadoFin": "2025-11-27T11:30:00",
    "tiempoRealInicio": "2025-11-27T10:37:35",
    "tiempoRealFin": null,
    "prioridad": 1,
    "observaciones": null,
    "createdAt": "2025-11-27T10:30:44",
    "updatedAt": "2025-11-27T10:37:35"
  },
  "error": null
}
```

> [!NOTE]
> La respuesta incluye **toda la atención completa** con todos los objetos relacionados anidados (cita completa con mascota, cliente, sucursal, servicio, groomer). Es una respuesta muy verbosa pero contiene toda la información del contexto.

**✅ Validaciones Clave:**
- `estado` = `"en_servicio"` ✅
- `tiempoRealInicio` = timestamp actual (se registró cuando inició el servicio) ✅
- `tiempoRealFin` = `null` (aún no termina) ✅


---

### PASO 6: Terminar la Atención

**Objetivo:** Cuando el servicio termina, marcar la atención como terminada

**Endpoint:**
```http
PUT {{baseUrl}}/api/atenciones/20/terminar
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Atención terminada exitosamente",
  "datos": {
    "idAtencion": 13,
    "cita": {
      "idCita": 12,
      "mascota": {
        "idMascota": 1,
        "cliente": {
          "idCliente": 1,
          "nombre": "Ricardo",
          "apellido": "Alvarez",
          ...
        },
        "nombre": "Ben 10",
        "especie": "perro",
        "raza": "Golden Retriever",
        ...
      },
      "cliente": { ... },
      "sucursal": {
        "idSucursal": 1,
        "nombre": "Sucursal Central",
        ...
      },
      "servicio": {
        "idServicio": 1,
        "codigo": "B001",
        "nombre": "Baño Básico (Perro Pequeño)",
        "precioBase": 35.00,
        ...
      },
      "fechaProgramada": "2025-11-27T10:00:00",
      "modalidad": "presencial",
      "estado": "atendido",
      "notas": "Cliente solicita groomer María González"
    },
    "mascota": {
      "idMascota": 1,
      "cliente": { ... },
      "nombre": "Ben 10",
      ...
    },
    "cliente": {
      "idCliente": 1,
      "nombre": "Ricardo",
      "apellido": "Alvarez",
      ...
    },
    "groomer": {
      "idGroomer": 1,
      "nombre": "Ana Torres",
      ...
    },
    "sucursal": {
      "idSucursal": 1,
      "nombre": "Sucursal Central",
      ...
    },
    "estado": "terminado",
    "turnoNum": 1,
    "tiempoEstimadoInicio": "2025-11-27T10:00:00",
    "tiempoEstimadoFin": "2025-11-27T11:30:00",
    "tiempoRealInicio": "2025-11-27T10:37:35",
    "tiempoRealFin": "2025-11-27T10:49:03",
    "prioridad": 1,
    "observaciones": null,
    "createdAt": "2025-11-27T10:30:44",
    "updatedAt": "2025-11-27T10:49:03"
  },
  "error": null
}
```

> [!NOTE]
> Al igual que en el PASO 5, la respuesta incluye **toda la atención completa** con todos los objetos relacionados anidados.

**✅ Validaciones Clave:**
- `estado` = `"terminado"` ✅
- `tiempoRealInicio` = timestamp de cuando inició ✅
- `tiempoRealFin` = timestamp actual (se registró al terminar) ✅
- `updatedAt` actualizado con la hora de finalización ✅


---

### PASO 6.5: Agregar Detalles de Servicio

**Objetivo:** Registrar los servicios realizados en la atención con sus precios

> [!CAUTION]
> **PASO CRUCIAL:** Sin este paso, la factura se generará con totales en 0.00. Los detalles de servicio son la base para calcular el subtotal, impuestos y total de la factura.

#### ¿Por qué es importante este paso?

La factura **NO** obtiene automáticamente los servicios de la cita. Debes registrar explícitamente cada servicio realizado durante la atención mediante los "detalles de servicio". Esto permite:
- Cobrar servicios adicionales no incluidos en la cita original
- Aplicar precios diferentes al precio base (descuentos, precios especiales)
- Registrar la cantidad exacta de cada servicio
- Agregar observaciones específicas sobre lo realizado

**Endpoint:**
```http
POST {{baseUrl}}/api/atenciones/20/detalles
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "servicio": {
    "idServicio": 1
  },
  "cantidad": 1,
  "precioUnitario": 35.00,
  "subtotal": 35.00,
  "observaciones": "Baño completo con champú especial"
}
```

> [!IMPORTANT]
> Este endpoint usa **JSON**, NO form-urlencoded. En Postman:
> 1. Método: POST
> 2. URL: `{{baseUrl}}/api/atenciones/20/detalles`
> 3. Headers: `Authorization: Bearer {{token}}` + `Content-Type: application/json`
> 4. Body: Selecciona **raw** y **JSON**, luego pega el JSON del ejemplo

**Campos del Request:**

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|----------|
| `servicio.idServicio` | Integer | ✅ Sí | ID del servicio realizado | `1` |
| `cantidad` | Integer | ✅ Sí | Cantidad de veces que se realizó | `1` |
| `precioUnitario` | Decimal | ✅ Sí | Precio por unidad (puede diferir del precio base) | `35.00` |
| `subtotal` | Decimal | ✅ Sí | Total del detalle: `cantidad × precioUnitario` | `35.00` |
| `observaciones` | String | ❌ No | Notas sobre el servicio realizado | `"Baño completo"` |

```json
{
  "exito": true,
  "mensaje": "Detalle creado correctamente",
  "datos": {
    "idDetalle": 8,
    "atencion": {
      "idAtencion": 13,
      "cita": {
        "idCita": 12,
        "mascota": {
          "idMascota": 1,
          "cliente": {
            "idCliente": 1,
            "nombre": "Ricardo",
            "apellido": "Alvarez",
            ...
          },
          "nombre": "Ben 10",
          "especie": "perro",
          "raza": "Golden Retriever",
          ...
        },
        "cliente": { ... },
        "sucursal": {
          "idSucursal": 1,
          "nombre": "Sucursal Central",
          ...
        },
        "servicio": {
          "idServicio": 1,
          "codigo": "B001",
          "nombre": "Baño Básico (Perro Pequeño)",
          "precioBase": 35.00,
          ...
        },
        "fechaProgramada": "2025-11-27T10:00:00",
        "modalidad": "presencial",
        "estado": "atendido",
        "notas": "Cliente solicita groomer María González"
      },
      "mascota": { ... },
      "cliente": { ... },
      "groomer": {
        "idGroomer": 1,
        "nombre": "Ana Torres",
        ...
      },
      "sucursal": { ... },
      "estado": "terminado",
      "turnoNum": 1,
      "tiempoEstimadoInicio": "2025-11-27T10:00:00",
      "tiempoEstimadoFin": "2025-11-27T11:30:00",
      "tiempoRealInicio": "2025-11-27T10:37:35",
      "tiempoRealFin": "2025-11-27T10:49:03",
      ...
    },
    "servicio": {
      "idServicio": 1,
      "codigo": "B001",
      "nombre": "Baño Básico (Perro Pequeño)",
      "descripcion": "Limpieza básica, shampoo, secado.",
      "duracionEstimadaMin": 45,
      "precioBase": 35.00,
      "categoria": "baño",
      "createdAt": "2025-11-18T16:06:45",
      "updatedAt": "2025-11-18T16:06:45"
    },
    "cantidad": 1,
    "precioUnitario": 35.00,
    "descuentoId": null,
    "subtotal": 35.00,
    "observaciones": "Baño completo con champú especial"
  },
  "error": null
}
```

> [!NOTE]
> La respuesta incluye el **detalle de servicio** con toda la **atención completa anidada** (igual que los pasos anteriores) más el **servicio completo**. Es una respuesta extremadamente verbosa.

**Campos clave del detalle:**
- `idDetalle`: ID del detalle creado
- `cantidad`: Cantidad del servicio
- `precioUnitario`: Precio por unidad
- `subtotal`: Total del detalle
- `descuentoId`: ID del descuento aplicado (si hay)
- `observaciones`: Notas sobre el servicio realizado


**✅ Validación en BD:**
```sql
SELECT id_detalle, id_servicio, cantidad, precio_unitario, subtotal 
FROM detalle_servicio 
WHERE id_atencion = 20;
```

#### Agregar Múltiples Servicios

**💡 Si se realizaron varios servicios, agrégalos todos:**

**Ejemplo - Agregar segundo servicio (corte de uñas):**
```http
POST {{baseUrl}}/api/atenciones/13/detalles
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "servicio": {
    "idServicio": 8
  },
  "cantidad": 1,
  "precioUnitario": 15.00,
  "subtotal": 15.00,
  "observaciones": "Corte y limado de uñas"
}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Detalle creado correctamente",
  "datos": {
    "idDetalle": 9,
    "atencion": {
      "idAtencion": 13,
      "cita": { ... },
      "mascota": { ... },
      "cliente": { ... },
      "groomer": { ... },
      "sucursal": { ... },
      "estado": "terminado",
      ...
    },
    "servicio": {
      "idServicio": 8,
      "codigo": "O002",
      "nombre": "Corte de Uñas",
      "descripcion": "Corte y limado de uñas.",
      "duracionEstimadaMin": 15,
      "precioBase": 15.00,
      "categoria": "otro",
      "createdAt": "2025-11-18T16:06:45",
      "updatedAt": "2025-11-18T16:06:45"
    },
    "cantidad": 1,
    "precioUnitario": 15.00,
    "descuentoId": null,
    "subtotal": 15.00,
    "observaciones": "Corte y limado de uñas"
  },
  "error": null
}
```


**Ejemplo - Servicio con cantidad mayor a 1:**
```http
POST {{baseUrl}}/api/atenciones/20/detalles
Content-Type: application/json

{
  "servicio": {
    "idServicio": 12
  },
  "cantidad": 2,
  "precioUnitario": 5.00,
  "subtotal": 10.00,
  "observaciones": "Aplicación de pipeta antiparasitaria (2 dosis)"
}
```

#### Consultar Detalles Agregados

**Listar todos los detalles de la atención:**
```http
GET {{baseUrl}}/api/atenciones/20/detalles
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Detalles obtenidos correctamente",
  "datos": [
    {
      "idDetalle": 8,
      "atencion": {
        "idAtencion": 13,
        "cita": {
          "idCita": 12,
          "mascota": {
            "idMascota": 1,
            "cliente": {
              "idCliente": 1,
              "nombre": "Ricardo",
              "apellido": "Alvarez",
              ...
            },
            "nombre": "Ben 10",
            "especie": "perro",
            "raza": "Golden Retriever",
            ...
          },
          "cliente": { ... },
          "sucursal": { ... },
          "servicio": {
            "idServicio": 1,
            "codigo": "B001",
            "nombre": "Baño Básico (Perro Pequeño)",
            ...
          },
          "fechaProgramada": "2025-11-27T10:00:00",
          "modalidad": "presencial",
          "estado": "atendido",
          ...
        },
        "mascota": { ... },
        "cliente": { ... },
        "groomer": {
          "idGroomer": 1,
          "nombre": "Ana Torres",
          ...
        },
        "sucursal": { ... },
        "estado": "terminado",
        "tiempoEstimadoInicio": "2025-11-27T10:00:00",
        "tiempoEstimadoFin": "2025-11-27T11:30:00",
        "tiempoRealInicio": "2025-11-27T10:37:35",
        "tiempoRealFin": "2025-11-27T10:49:03",
        ...
      },
      "servicio": {
        "idServicio": 1,
        "codigo": "B001",
        "nombre": "Baño Básico (Perro Pequeño)",
        "descripcion": "Limpieza básica, shampoo, secado.",
        "precioBase": 35.00,
        "categoria": "baño",
        ...
      },
      "cantidad": 1,
      "precioUnitario": 35.00,
      "descuentoId": null,
      "subtotal": 35.00,
      "observaciones": "Baño completo con champú especial"
    }
  ],
  "error": null
}
```

> [!NOTE]
> Cada detalle en el array incluye **toda la atención completa anidada** más el **servicio completo**. Si tienes múltiples detalles, cada uno traerá la misma estructura verbosa.


**Verificar subtotal total:**
```http
GET {{baseUrl}}/api/atenciones/20/detalles/subtotal
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Subtotal calculado correctamente",
  "datos": 50.00,  // 35.00 + 15.00
  "error": null
}
```

> [!TIP]
> Verifica que el subtotal sea correcto antes de generar la factura. Este será la base para el cálculo del total con impuestos.

---

### PASO 7: Generar Factura

**Objetivo:** Crear la factura para cobrar los servicios

**Endpoint:**
```http
POST {{baseUrl}}/api/facturas
Authorization: Bearer {{token}}
Content-Type: application/x-www-form-urlencoded

idAtencion=20
&serie=F001
&numero=00015
&metodoPagoSugerido=efectivo
```

**⚠️ IMPORTANTE:** También se envía como **form-urlencoded**.

**En Postman:**
1. Método: POST
2. URL: `{{baseUrl}}/api/facturas`
3. Body: **x-www-form-urlencoded**
4. Parámetros:
   - `idAtencion`: 20
   - `serie`: F001
   - `numero`: 00015
   - `metodoPagoSugerido`: efectivo

**Respuesta Esperada:** HTTP 201 CREATED
```json
{
  "exito": true,
  "mensaje": "Factura creada exitosamente",
  "datos": "Factura registrada en la BD"
}
```

**✅ Validación:**
```sql
SELECT id_factura, serie, numero, total, estado 
FROM factura 
WHERE id_atencion = 20;
```

> [!NOTE]
> El campo `numero_completo` no existe en la tabla. La factura tiene `serie` y `numero` como campos separados.

**💡 Acción:** Guarda el `id_factura` en `{{idFactura}}` (ej: 12).


---

### PASO 8: Consultar la Factura Generada

**Endpoint:**
```http
GET {{baseUrl}}/api/facturas/12
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Factura obtenida exitosamente",
  "datos": {
    "idFactura": 12,
    "serie": "F001",
    "numero": "00015",
    "atencion": {
      "idAtencion": 20,
      "cita": {
        "idCita": 15,
        "mascota": {
          "idMascota": 1,
          "cliente": {
            "idCliente": 1,
            "nombre": "Juan",
            "apellido": "Pérez",
            "dniRuc": "12345678",
            "email": "juan.perez@mail.com",
            "telefono": "987654321",
            "direccion": "Av. Principal 123",
            "preferencias": null,
            "createdAt": "2025-11-15T10:00:00",
            "updatedAt": "2025-11-15T10:00:00"
          },
          "nombre": "Max",
          "especie": "perro",
          "raza": "Golden Retriever",
          "sexo": "macho",
          "fechaNacimiento": "2022-05-15",
          "microchip": null,
          "observaciones": null,
          "createdAt": "2025-11-15T10:00:00",
          "updatedAt": "2025-11-15T10:00:00"
        },
        "cliente": {
          "idCliente": 1,
          "nombre": "Juan",
          "apellido": "Pérez",
          ...
        },
        "sucursal": {
          "idSucursal": 1,
          "nombre": "Sucursal Central",
          "direccion": "Av. Principal 123, Lima",
          "telefono": "987654321",
          ...
        },
        "servicio": {
          "idServicio": 1,
          "codigo": "B001",
          "nombre": "Baño Básico",
          "descripcion": "Limpieza básica, shampoo, secado",
          "duracionEstimadaMin": 45,
          "precioBase": 35.00,
          "categoria": "baño",
          ...
        },
        "fechaProgramada": "2025-11-26T10:00:00",
        "modalidad": "presencial",
        "estado": "atendido",
        "notas": "Cliente solicita groomer María González",
        ...
      },
      "mascota": {
        "idMascota": 1,
        "cliente": { ... },
        "nombre": "Max",
        "especie": "perro",
        "raza": "Golden Retriever",
        ...
      },
      "cliente": {
        "idCliente": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        ...
      },
      "groomer": {
        "idGroomer": 1,
        "nombre": "María González",
        "especialidades": "[\"corte_raza\", \"baño_premium\"]",
        "disponibilidad": "{\"Lun\": \"9-17\", \"Mar\": \"9-17\"}",
        ...
      },
      "sucursal": {
        "idSucursal": 1,
        "nombre": "Sucursal Central",
        ...
      },
      "estado": "terminado",
      "turnoNum": 1,
      "tiempoEstimadoInicio": "2025-11-26T10:00:00",
      "tiempoEstimadoFin": "2025-11-26T11:30:00",
      "tiempoRealInicio": "2025-11-26T10:05:00",
      "tiempoRealFin": "2025-11-26T11:25:00",
      "prioridad": 1,
      "observaciones": null,
      ...
    },
    "cliente": {
      "idCliente": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dniRuc": "12345678",
      "email": "juan.perez@mail.com",
      "telefono": "987654321",
      "direccion": "Av. Principal 123",
      "preferencias": null,
      ...
    },
    "fechaEmision": "2025-11-26T11:30:00",
    "subtotal": 35.00,
    "impuesto": 6.30,
    "descuentoTotal": 0.00,
    "total": 41.30,
    "estado": "emitida",
    "metodoPagoSugerido": "efectivo",
    "createdAt": "2025-11-26T11:30:00",
    "updatedAt": "2025-11-26T11:30:00"
  },
  "error": null
}
```

**⚠️ NOTA IMPORTANTE:**

La respuesta incluye **TODA la información relacionada** en forma anidada:
- **Atención completa** con todos sus detalles
  - **Cita completa** dentro de atención
    - Mascota con su cliente
    - Cliente (duplicado)
    - Sucursal
    - Servicio
  - Mascota (duplicada como campo directo de atención)
  - Cliente (duplicado como campo directo de atención)
  - Groomer completo
  - Sucursal (duplicada)
- **Cliente** (tercera vez, como campo directo de factura)

**La respuesta es extremadamente verbosa** debido a que todas las relaciones LAZY se cargan al serializar. Contiene información duplicada múltiples veces pero es correcta.

**✅ Validaciones Clave:**

Enfócate en estos campos principales de la factura:
- `idFactura`: 12
- `serie`: "F001"
- `numero`: "00015"
- `fechaEmision`: Fecha y hora de generación
- `subtotal`: Suma de servicios sin impuesto
- `impuesto`: IGV u otro impuesto (18% en Perú)
- `descuentoTotal`: Descuentos aplicados
- `total`: Monto total a pagar (`subtotal + impuesto - descuentoTotal`)
- `estado`: `"emitida"` (inicial)
- `metodoPagoSugerido`: `"efectivo"`, `"tarjeta"`, etc.

**⚠️ Observación sobre los Totales:**

Si ves `subtotal: 0.00`, `impuesto: 0.00`, `total: 0.00`, significa que:
- El sistema no calculó automáticamente los totales
- Probablemente faltan detalles de servicio asociados a la atención
- O el stored procedure que crea la factura no está calculando correctamente

**Para verificar que los totales son correctos:**
```sql
SELECT subtotal, impuesto, descuento_total, total 
FROM factura 
WHERE id_factura = 12;
```

Si los totales están en 0, necesitarás ejecutar el endpoint de recalcular totales:
```http
POST {{baseUrl}}/api/facturas/recalcular
```

---

### PASO 9: Registrar Pago

**Objetivo:** Registrar el pago del cliente

**Endpoint:**
```http
POST {{baseUrl}}/api/pagos
Authorization: Bearer {{token}}
Content-Type: application/x-www-form-urlencoded

idFactura=12
&monto=59.00
&metodo=efectivo
&referencia=PAGO-EFECTIVO-001
```

**⚠️ IMPORTANTE:** También **form-urlencoded**.

**Parámetros:**
- `idFactura`: 12 (obligatorio)
- `monto`: 59.00 (obligatorio)
- `metodo`: efectivo / tarjeta / yape / plin (obligatorio)
- `referencia`: Número de operación (opcional)

**Respuesta Esperada:** HTTP 201 CREATED
```json
{
  "exito": true,
  "mensaje": "Pago registrado exitosamente",
  "datos": "Pago confirmado"
}
```

**✅ Validación:**
```sql
SELECT id_pago, monto, metodo, estado 
FROM pago 
WHERE id_factura = 12;
```

**💡 Acción:** Guarda el `id_pago` en `{{idPago}}` (ej: 8).

---

### PASO 10: Verificar Estado de la Factura

**Endpoint:**
```http
GET {{baseUrl}}/api/facturas/12
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Factura obtenida exitosamente",
  "datos": {
    "idFactura": 12,
    "serie": "F001",
    "numero": "00015",
    "atencion": {
      "idAtencion": 20,
      "cita": {
        "idCita": 15,
        "mascota": {
          "idMascota": 1,
          "cliente": {
            "idCliente": 1,
            "nombre": "Juan",
            "apellido": "Pérez",
            "dniRuc": "12345678",
            "email": "juan.perez@mail.com",
            "telefono": "987654321",
            "direccion": "Av. Principal 123",
            "preferencias": null,
            "createdAt": "2025-11-15T10:00:00",
            "updatedAt": "2025-11-15T10:00:00"
          },
          "nombre": "Max",
          "especie": "perro",
          "raza": "Golden Retriever",
          "sexo": "macho",
          "fechaNacimiento": "2022-05-15",
          "microchip": null,
          "observaciones": null,
          "createdAt": "2025-11-15T10:00:00",
          "updatedAt": "2025-11-15T10:00:00"
        },
        "cliente": {
          "idCliente": 1,
          "nombre": "Juan",
          "apellido": "Pérez",
          ...
        },
        "sucursal": {
          "idSucursal": 1,
          "nombre": "Sucursal Central",
          "direccion": "Av. Principal 123, Lima",
          "telefono": "987654321",
          ...
        },
        "servicio": {
          "idServicio": 1,
          "codigo": "B001",
          "nombre": "Baño Básico",
          "descripcion": "Limpieza básica, shampoo, secado",
          "duracionEstimadaMin": 45,
          "precioBase": 35.00,
          "categoria": "baño",
          ...
        },
        "fechaProgramada": "2025-11-26T10:00:00",
        "modalidad": "presencial",
        "estado": "atendido",
        "notas": "Cliente solicita groomer María González",
        ...
      },
      "mascota": {
        "idMascota": 1,
        "cliente": { ... },
        "nombre": "Max",
        "especie": "perro",
        "raza": "Golden Retriever",
        ...
      },
      "cliente": {
        "idCliente": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        ...
      },
      "groomer": {
        "idGroomer": 1,
        "nombre": "María González",
        "especialidades": "[\"corte_raza\", \"baño_premium\"]",
        "disponibilidad": "{\"Lun\": \"9-17\", \"Mar\": \"9-17\"}",
        ...
      },
      "sucursal": {
        "idSucursal": 1,
        "nombre": "Sucursal Central",
        ...
      },
      "estado": "terminado",
      "turnoNum": 1,
      "tiempoEstimadoInicio": "2025-11-26T10:00:00",
      "tiempoEstimadoFin": "2025-11-26T11:30:00",
      "tiempoRealInicio": "2025-11-26T10:05:00",
      "tiempoRealFin": "2025-11-26T11:25:00",
      "prioridad": 1,
      "observaciones": null,
      ...
    },
    "cliente": {
      "idCliente": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dniRuc": "12345678",
      "email": "juan.perez@mail.com",
      "telefono": "987654321",
      "direccion": "Av. Principal 123",
      "preferencias": null,
      ...
    },
    "fechaEmision": "2025-11-26T11:30:00",
    "subtotal": 35.00,
    "impuesto": 6.30,
    "descuentoTotal": 0.00,
    "total": 41.30,
    "estado": "pagada",  // ✅ Cambió de "emitida" a "pagada"
    "metodoPagoSugerido": "efectivo",
    "createdAt": "2025-11-26T11:30:00",
    "updatedAt": "2025-11-26T11:35:00"  // ✅ Fecha actualizada tras el pago
  },
  "error": null
}
```

**⚠️ NOTA:** La respuesta incluye toda la información anidada (atención completa con cita, mascota, cliente, groomer, sucursal).

**✅ Validación Principal:** 

**Campo clave:** `estado` cambió a `"pagada"`

**Antes del pago (PASO 8):**
```json
"estado": "emitida"
```

**Después del pago (PASO 10):**
```json
"estado": "pagada"  // ✅ Estado actualizado
```

**Otros campos importantes:**
- `updatedAt`: Se actualizó con la fecha del pago
- `total`: 41.30 (35.00 subtotal + 6.30 impuesto)
- `subtotal`: 35.00 (suma de detalles de servicio)
- `impuesto`: 6.30 (18% del subtotal)

**Validación en BD:**
```sql
SELECT estado, subtotal, impuesto, total, updated_at
FROM factura 
WHERE id_factura = 12;
```

Debería mostrar:
```
estado: pagada
subtotal: 35.00
impuesto: 6.30
total: 41.30
updated_at: 2025-11-26 11:35:00
```

---

### PASO 11: Consultar el Pago Registrado

**Endpoint:**
```http
GET {{baseUrl}}/api/pagos/8
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Pago obtenido exitosamente",
  "datos": {
    "idPago": 8,
    "factura": {
      "idFactura": 12,
      "serie": "F001",
      "numero": "00015",
      "atencion": {
        "idAtencion": 20,
        "cita": {
          "idCita": 15,
          "mascota": {
            "idMascota": 1,
            "cliente": {
              "idCliente": 1,
              "nombre": "Juan",
              "apellido": "Pérez",
              "dniRuc": "12345678",
              "email": "juan.perez@mail.com",
              "telefono": "987654321",
              "direccion": "Av. Principal 123",
              "preferencias": null,
              ...
            },
            "nombre": "Max",
            "especie": "perro",
            "raza": "Golden Retriever",
            "sexo": "macho",
            "fechaNacimiento": "2022-05-15",
            ...
          },
          "cliente": { ... },
          "sucursal": {
            "idSucursal": 1,
            "nombre": "Sucursal Central",
            "direccion": "Av. Principal 123, Lima",
            "telefono": "987654321",
            ...
          },
          "servicio": {
            "idServicio": 1,
            "codigo": "B001",
            "nombre": "Baño Básico",
            "descripcion": "Limpieza básica, shampoo, secado",
            "duracionEstimadaMin": 45,
            "precioBase": 35.00,
            "categoria": "baño",
            ...
          },
          "fechaProgramada": "2025-11-26T10:00:00",
          "modalidad": "presencial",
          "estado": "atendido",
          "notas": "Cliente solicita groomer María González",
          ...
        },
        "mascota": { ... },
        "cliente": { ... },
        "groomer": {
          "idGroomer": 1,
          "nombre": "María González",
          "especialidades": "[\"corte_raza\", \"baño_premium\"]",
          "disponibilidad": "{\"Lun\": \"9-17\", \"Mar\": \"9-17\"}",
          ...
        },
        "sucursal": { ... },
        "estado": "terminado",
        "turnoNum": 1,
        "tiempoEstimadoInicio": "2025-11-26T10:00:00",
        "tiempoEstimadoFin": "2025-11-26T11:30:00",
        "tiempoRealInicio": "2025-11-26T10:05:00",
        "tiempoRealFin": "2025-11-26T11:25:00",
        "prioridad": 1,
        "observaciones": null,
        ...
      },
      "cliente": {
        "idCliente": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "dniRuc": "12345678",
        "email": "juan.perez@mail.com",
        "telefono": "987654321",
        "direccion": "Av. Principal 123",
        "preferencias": null,
        ...
      },
      "fechaEmision": "2025-11-26T11:30:00",
      "subtotal": 35.00,
      "impuesto": 6.30,
      "descuentoTotal": 0.00,
      "total": 41.30,
      "estado": "pagada",
      "metodoPagoSugerido": "efectivo",
      ...
    },
    "fechaPago": "2025-11-26T11:35:00",
    "monto": 41.30,
    "metodo": "efectivo",
    "referencia": "PAGO-EFECTIVO-001",
    "estado": "confirmado",
    "createdAt": "2025-11-26T11:35:00",
    "updatedAt": "2025-11-26T11:35:00"
  },
  "error": null
}
```

**⚠️ NOTA IMPORTANTE:**

La respuesta incluye **el pago completo con TODA la factura anidada**, que a su vez contiene:
- Atención completa
  - Cita completa con mascota, cliente, sucursal, servicio
  - Mascota (duplicada)
  - Cliente (duplicado)
  - Groomer
  - Sucursal (duplicada)
- Cliente (tercera vez, como campo directo de factura)

**La respuesta es extremadamente verbosa** pero contiene toda la información del contexto del pago.

**✅ Validaciones Clave del Pago:**

Enfócate en estos campos principales:
- `idPago`: 8
- `fechaPago`: Fecha y hora del pago
- `monto`: 41.30 (debe coincidir con `factura.total`)
- `metodo`: "efectivo" (o "tarjeta", "yape", "plin", "transfer")
- `referencia`: "PAGO-EFECTIVO-001" (número de operación)
- `estado`: "confirmado"

**Validación de Coherencia:**
- `pago.monto` = `factura.total` ✅ (41.30 = 41.30)
- `pago.estado` = "confirmado" ✅
- `factura.estado` = "pagada" ✅

**Validación en BD:**
```sql
SELECT 
    p.id_pago,
    p.monto,
    p.metodo,
    p.referencia,
    p.estado as pago_estado,
    f.total as factura_total,
    f.estado as factura_estado
FROM pago p
INNER JOIN factura f ON p.id_factura = f.id_factura
WHERE p.id_pago = 8;
```

Debería mostrar:
```
id_pago: 8
monto: 41.30
metodo: efectivo
referencia: PAGO-EFECTIVO-001
pago_estado: confirmado
factura_total: 41.30
factura_estado: pagada
```

---

## ✅ Resumen del Flujo Completado

| Paso | Acción | Endpoint | Estado Resultante |
|------|--------|----------|-------------------|
| 1 | Crear cita | `POST /api/citas` | Cita: `reservada` |
| 2 | Crear atención | `POST /api/atenciones/desde-cita` | Atención: `en_espera`, Cita: `atendido` |
| 3 | Iniciar servicio | `PUT /atenciones/{id}/estado` | Atención: `en_servicio` |
| 4 | Terminar servicio | `PUT /atenciones/{id}/terminar` | Atención: `terminado` |
| 5 | Generar factura | `POST /api/facturas` | Factura: `pendiente` |
| 6 | Registrar pago | `POST /api/pagos` | Factura: `pagada`, Pago: `confirmado` |

---

## 🧪 Escenarios de Prueba

### Escenario 1: Flujo Completo Happy Path

**Descripción:** Todo sale bien, el cliente paga el monto completo.

**Pasos:** Seguir PASO 1 al PASO 11.

**Resultado Esperado:**
- ✅ Cita creada
- ✅ Atención creada y terminada
- ✅ Factura generada
- ✅ Pago confirmado
- ✅ Factura marcada como pagada

---

### Escenario 2: Pago Parcial

**Descripción:** Cliente paga solo una parte.

**PASO 9 (Modificado):**
```http
POST {{baseUrl}}/api/pagos

idFactura=12
&monto=30.00   // Solo paga 30, falta 29
&metodo=efectivo
&referencia=PAGO-PARCIAL-001
```

**Validación:**
```sql
SELECT total, monto_recibido, estado_pago 
FROM factura 
WHERE id_factura = 12;
```

**Resultado:**
- `total`: 59.00
- `monto_recibido`: 30.00
- `estado_pago`: Probablemente `"pendiente"` (verificar lógica del sistema)

**Segundo Pago:**
```http
POST {{baseUrl}}/api/pagos

idFactura=12
&monto=29.00   // Completa el pago
&metodo=tarjeta
&referencia=TARJETA-4532
```

**Validación Final:**
- `monto_recibido`: 59.00
- `estado_pago`: `"pagada"`

---

### Escenario 3: Atención Walk-In (Sin Cita)

**Descripción:** Cliente llega sin cita previa.

**PASO 1 (Reemplazar):** Saltar, no crear cita.

**PASO 3 (Modificado):**
```http
POST {{baseUrl}}/api/atenciones/walk-in
Authorization: Bearer {{token}}

idMascota=1
&idCliente=1
&idGroomer=1
&idSucursal=1
&turnoNum=2
&tiempoEstimadoInicio=2025-11-26T12:00:00
&tiempoEstimadoFin=2025-11-26T13:00:00
&prioridad=0
&observaciones=Cliente walk-in sin cita
```

**Continuar:** PASO 4 en adelante (igual que el flujo normal).

---

### Escenario 4: Cancelar/Anular Factura

**Descripción:** Se generó una factura por error.

**Endpoint:**
```http
DELETE {{baseUrl}}/api/facturas/12
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Factura anulada exitosamente",
  "datos": "Factura marcada como anulada"
}
```

**Validación:**
```sql
SELECT estado_pago 
FROM factura 
WHERE id_factura = 12;
```

**Resultado:** `estado_pago = "anulada"`

⚠️ **Nota:** Una vez anulada, NO se puede registrar un pago en esa factura.

---

## 🔍 Validaciones y Verificaciones

### Validación 1: Integridad de Datos

**Después de cada paso, verificar:**

```sql
-- Estado de la cita
SELECT id_cita, estado FROM cita WHERE id_cita = 15;

-- Estado de la atención
SELECT id_atencion, estado, id_cita FROM atencion WHERE id_atencion = 20;

-- Estado de la factura
SELECT id_factura, estado_pago, total FROM factura WHERE id_factura = 12;

-- Pagos registrados
SELECT SUM(monto) as total_pagado FROM pago WHERE id_factura = 12;
```

---

### Validación 2: Timestamps

**Verificar que las fechas sean lógicas:**

```sql
SELECT 
    c.fecha_programada as cita_fecha,
    a.tiempo_real_inicio,
    a.tiempo_real_fin,
    f.fecha_emision,
    p.fecha_pago
FROM cita c
LEFT JOIN atencion a ON c.id_cita = a.id_cita
LEFT JOIN factura f ON a.id_atencion = f.id_atencion
LEFT JOIN pago p ON f.id_factura = p.id_factura
WHERE c.id_cita = 15;
```

**Lógica esperada:**
```
fecha_programada <= tiempo_real_inicio <= tiempo_real_fin <= fecha_emision <= fecha_pago
```

---

### Validación 3: Totales y Montos

**Los totales deben cuadrar:**

```sql
SELECT 
    f.subtotal,
    f.igv,
    f.total,
    f.monto_recibido,
    (SELECT SUM(monto) FROM pago WHERE id_factura = f.id_factura) as suma_pagos
FROM factura f
WHERE f.id_factura = 12;
```

**Validaciones:**
- `total` = `subtotal` + `igv`
- `suma_pagos` = `monto_recibido`
- Si `monto_recibido` >= `total` → `estado_pago` = `"pagada"`

---

## 🔧 Troubleshooting y Problemas Comunes

Esta sección documenta los problemas más frecuentes y sus soluciones.

### Problema 1: Factura con Totales en 0.00

**Síntoma:**
```json
{
  "idFactura": 12,
  "subtotal": 0.00,
  "impuesto": 0.00,
  "total": 0.00
}
```

**Causa:** No se agregaron detalles de servicio a la atención antes de generar la factura.

**Solución:**

1. **Verificar si existen detalles:**
```http
GET {{baseUrl}}/api/atenciones/20/detalles
```

2. **Si la respuesta es vacía, agregar detalles:**
```http
POST {{baseUrl}}/api/atenciones/20/detalles
Content-Type: application/json

{
  "servicio": { "idServicio": 1 },
  "cantidad": 1,
  "precioUnitario": 35.00,
  "subtotal": 35.00
}
```

3. **Recalcular totales de la factura:**
```http
POST {{baseUrl}}/api/facturas/recalcular
```

4. **Verificar que la factura ahora tenga totales:**
```http
GET {{baseUrl}}/api/facturas/12
```

---

### Problema 2: Error "Content type 'application/x-www-form-urlencoded' not supported"

**Síntoma:**
```json
{
  "error": "Content type 'application/x-www-form-urlencoded;charset=UTF-8' not supported"
}
```

**Causa:** Usaste form-urlencoded en un endpoint que espera JSON (o viceversa).

**Endpoints que usan FORM-URLENCODED:**
- `POST /api/atenciones/desde-cita`
- `POST /api/atenciones/walk-in`
- `POST /api/facturas`
- `POST /api/pagos`

**Endpoints que usan JSON:**
- `POST /api/citas`
- `POST /api/atenciones/{id}/detalles`
- Todos los GET, PUT, DELETE

**Solución:**

En Postman:
- Para **form-urlencoded**: Body → x-www-form-urlencoded
- Para **JSON**: Body → raw → JSON

---

### Problema 3: Error 401 Unauthorized o 403 Forbidden

**Síntoma:**
```json
{
  "error": "Unauthorized",
  "message": "Full authentication is required"
}
```

**Causas posibles:**

1. **Token no enviado:**
   - Verifica que el header `Authorization: Bearer {{token}}` esté presente
   - En Postman: Headers → Key: `Authorization`, Value: `Bearer <tu_token>`

2. **Token expirado:**
   - Los tokens JWT expiran después de cierto tiempo (usualmente 24 horas)
   - Solución: Vuelve a hacer login para obtener un nuevo token

3. **Token malformado:**
   - Asegúrate de incluir `Bearer ` (con espacio) antes del token
   - ✅ Correcto: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - ❌ Incorrecto: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Solución:**
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "admin123"
}
```

Guarda el nuevo token en la variable `{{token}}`.

---

### Problema 4: Error de Formato de Fecha

**Síntoma:**
```json
{
  "error": "Failed to convert value of type 'java.lang.String' to required type 'java.time.LocalDateTime'"
}
```

**Causa:** Formato de fecha incorrecto.

**Formato correcto:** `2025-11-27T10:30:00` (ISO 8601)

**Ejemplos:**
- ✅ `2025-11-27T10:30:00`
- ✅ `2025-12-01T14:00:00`
- ❌ `27/11/2025 10:30` (formato incorrecto)
- ❌ `2025-11-27 10:30:00` (falta la T)
- ❌ `2025-11-27` (falta la hora)

**Solución:**

Usa siempre el formato ISO 8601 con T entre fecha y hora:
```
YYYY-MM-DDTHH:MM:SS
```

---

### Problema 5: Error de Serialización JSON "hibernateLazyInitializer"

**Síntoma:**
```json
{
  "error": "No serializer found for class org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor"
}
```

**Causa:** Problema con lazy loading de Hibernate al serializar entidades.

**Nota:** Este error ya está **resuelto en el código actual** mediante `@JsonIgnoreProperties` en las entidades.

Si aparece, contacta al equipo de backend ya que indica una regresión.

---

### Problema 6: Estados Inconsistentes

**Síntoma:**
- Cita en estado `reservada` pero ya tiene una atención
- Factura en estado `emitida` pero tiene pagos registrados
- Atención en `en_espera` pero ya tiene `tiempoRealFin`

**Solución:**

Ejecuta las queries de validación para identificar inconsistencias:

```sql
-- Verificar estados
SELECT 
    c.id_cita,
    c.estado as cita_estado,
    a.estado as atencion_estado,
    f.estado as factura_estado
FROM cita c
LEFT JOIN atencion a ON c.id_cita = a.id_cita
LEFT JOIN factura f ON a.id_atencion = f.id_atencion
WHERE c.id_cita = 15;
```

Si hay inconsistencias, puede deberse a:
1. Actualización manual de la BD (no recomendado)
2. Error en stored procedures
3. Transacción no completada

**Contacta al administrador del sistema.**

---

### Problema 7: "MethodArgumentNotValidException" o Errores de Validación

**Síntoma:**
```json
{
  "error": "Validation failed",
  "details": ["precioUnitario: must not be null"]
}
```

**Causa:** Campos requeridos faltantes o valores inválidos.

**Solución:**

Verifica que todos los campos **requeridos** estén presentes:

**Para Citas:**
- `idMascota`, `idCliente`, `idSucursal`, `idServicio`, `fechaProgramada`

**Para Atenciones:**
- `idCita`, `idGroomer`, `idSucursal`, `tiempoEstimadoInicio`, `tiempoEstimadoFin`

**Para Detalles de Servicio:**
- `servicio.idServicio`, `cantidad`, `precioUnitario`, `subtotal`

**Para Facturas:**
- `idAtencion`, `serie`, `numero`, `metodoPagoSugerido`

**Para Pagos:**
- `idFactura`, `monto`, `metodo`

---

### Problema 8: Pago Registrado pero Factura sigue como "emitida"

**Síntoma:**
Registraste un pago exitosamente, pero al consultar la factura sigue mostrando `estado: "emitida"` en lugar de `"pagada"`.

**Posibles causas:**

1. **Pago parcial:** El monto pagado es menor al total de la factura
2. **Error en stored procedure:** El procedimiento que actualiza el estado no funcionó

**Solución:**

1. **Verificar suma de pagos vs total:**
```sql
SELECT 
    f.total,
    (SELECT SUM(monto) FROM pago WHERE id_factura = 12) as total_pagado,
    f.estado
FROM factura f
WHERE f.id_factura = 12;
```

2. **Si `total_pagado >= total` pero estado no es "pagada":**
Ejecuta manualmente:
```sql
UPDATE factura 
SET estado = 'pagada' 
WHERE id_factura = 12;
```

---

## ❌ Casos de Error Comunes


### Error 1: Crear Atención de Cita Inexistente

```http
POST {{baseUrl}}/api/atenciones/desde-cita

idCita=99999  // No existe
&idGroomer=1
&idSucursal=1
...
```

**Error Esperado:**
```json
{
  "exito": false,
  "mensaje": "Error al crear atención",
  "error": "Cita no encontrada"
}
```

---

### Error 2: Terminar Atención que ya está Terminada

```http
PUT {{baseUrl}}/api/atenciones/20/terminar
```
(Ejecutar dos veces)

**Comportamiento:** Debería ser idempotente (no causar error) o retornar mensaje de advertencia.

---

### Error 3: Generar Factura de Atención No Terminada

```http
POST {{baseUrl}}/api/facturas

idAtencion=20  // estado = "en_servicio" (no terminado)
&serie=F001
&numero=00016
&metodoPagoSugerido=efectivo
```

**Error Esperado:**
```json
{
  "exito": false,
  "mensaje": "Validación fallida",
  "error": "La atención debe estar terminada"
}
```

(Verificar si esta validación existe en el service)

---

### Error 4: Pagar Factura Anulada

```http
POST {{baseUrl}}/api/pagos

idFactura=12  // estado_pago = "anulada"
&monto=50.00
&metodo=efectivo
```

**Error Esperado:**
```json
{
  "exito": false,
  "mensaje": "Validación fallida",
  "error": "No se puede pagar una factura anulada"
}
```

---

### Error 5: Monto de Pago Negativo

```http
POST {{baseUrl}}/api/pagos

idFactura=12
&monto=-10.00  // Monto negativo
&metodo=efectivo
```

**Error Esperado:** HTTP 400 BAD REQUEST
```json
{
  "exito": false,
  "mensaje": "Validación fallida",
  "error": "El monto debe ser mayor a cero"
}
```

---

### Error 6: Agregar Detalle con Servicio Inexistente

```http
POST {{baseUrl}}/api/atenciones/20/detalles
Content-Type: application/json

{
  "servicio": {
    "idServicio": 99999  // No existe
  },
  "cantidad": 1,
  "precioUnitario": 35.00,
  "subtotal": 35.00
}
```

**Error Esperado:** HTTP 400 BAD REQUEST o 404 NOT FOUND
```json
{
  "exito": false,
  "mensaje": "Error al crear detalle",
  "error": "Servicio no encontrado"
}
```

---

### Error 7: JSON Malformado

```http
POST {{baseUrl}}/api/atenciones/20/detalles
Content-Type: application/json

{
  servicio: {  // Falta comillas en "servicio"
    idServicio: 1  // Falta comillas en "idServicio"
  },
  cantidad: 1,
  precioUnitario: 35.00
  // Falta coma aquí
  subtotal: 35.00
}
```

**Error Esperado:** HTTP 400 BAD REQUEST
```json
{
  "error": "JSON parse error: Unexpected character"
}
```

**Solución:** Valida tu JSON en [jsonlint.com](https://jsonlint.com/)

---

## ✅ Checklist de Prueba Completa

### Setup Inicial
- [ ] Token JWT obtenido
- [ ] Variables de Postman configuradas
- [ ] Headers de autorización configurados
- [ ] IDs de cliente, mascota, servicio, sucursal, groomer conocidos

### Flujo de Cita
- [ ] Se puede crear una cita
- [ ] Cita aparece con estado `"reservada"`
- [ ] Cita se puede consultar por ID
- [ ] Se pueden listar todas las citas

### Flujo de Atención
- [ ] Se puede crear atención desde cita
- [ ] Atención comienza con estado `"en_espera"`
- [ ] Estado de cita cambia a `"atendido"`
- [ ] Se puede cambiar estado a `"en_servicio"`
- [ ] Se puede terminar atención
- [ ] Al terminar, estado cambia a `"terminado"`
- [ ] `tiempoRealFin` se registra correctamente

### Flujo de Factura
- [ ] Se puede generar factura desde atención terminada
- [ ] Factura se crea con estado `"pendiente"`
- [ ] `numeroCompleto` se genera correctamente
- [ ] `total` = `subtotal` + `igv`
- [ ] Se puede consultar factura por ID
- [ ] Se pueden listar facturas de un cliente
- [ ] Se puede anular una factura

### Flujo de Pago
- [ ] Se puede registrar pago completo
- [ ] Estado de factura cambia a `"pagada"`
- [ ] `montoRecibido` se actualiza
- [ ] Se puede registrar pago parcial
- [ ] Se pueden hacer múltiples pagos a una factura
- [ ] Se puede consultar pago por ID
- [ ] Se pueden listar pagos de una factura

### Validaciones de Negocio
- [ ] No se puede crear atención de cita inexistente
- [ ] No se puede generar factura de atención no terminada
- [ ] No se puede pagar factura anulada
- [ ] No se pueden hacer pagos con montos negativos
- [ ] Timestamps son lógicos y coherentes
- [ ] Totales cuadran correctamente

### Casos Especiales
- [ ] Flujo walk-in funciona (sin cita previa)
- [ ] Pagos parciales suman correctamente
- [ ] Métodos de pago diferentes funcionan (efectivo, tarjeta, yape, plin)
- [ ] Referencias de pago se guardan correctamente

---

## 📚 Endpoints Adicionales Disponibles

Esta sección documenta endpoints útiles que no están en el flujo principal:

### Endpoints de Consulta de Citas

```http
# Obtener próximas citas de un cliente
GET {{baseUrl}}/api/citas/cliente/{idCliente}/proximas

# Obtener todas las citas de un cliente
GET {{baseUrl}}/api/citas/cliente/{idCliente}

# Obtener cita específica
GET {{baseUrl}}/api/citas/{id}

# Reprogramar una cita
PUT {{baseUrl}}/api/citas/{id}/reprogramar?nuevaFecha=2025-12-01T10:00:00

# Confirmar asistencia
PUT {{baseUrl}}/api/citas/{id}/confirmar-asistencia

# Marcar como no-show
PUT {{baseUrl}}/api/citas/{id}/no-show

# Cancelar cita
PUT {{baseUrl}}/api/citas/{id}/cancelar
```

### Endpoints de Consulta de Atenciones

```http
# Listar todas las atenciones
GET {{baseUrl}}/api/atenciones

# Obtener cola de atención de una sucursal
GET {{baseUrl}}/api/atenciones/cola/{idSucursal}

# Obtener atenciones de un cliente
GET {{baseUrl}}/api/atenciones/cliente/{idCliente}

# Obtener atención específica
GET {{baseUrl}}/api/atenciones/{id}
```

### Endpoints de Detalles de Servicio

```http
# Listar todos los detalles de una atención
GET {{baseUrl}}/api/atenciones/{idAtencion}/detalles

# Obtener detalle específico
GET {{baseUrl}}/api/atenciones/{idAtencion}/detalles/{idDetalle}

# Obtener subtotal total de la atención
GET {{baseUrl}}/api/atenciones/{idAtencion}/detalles/subtotal

# Actualizar detalle
PUT {{baseUrl}}/api/atenciones/{idAtencion}/detalles/{idDetalle}
Content-Type: application/json

{
  "cantidad": 2,
  "precioUnitario": 30.00,
  "subtotal": 60.00
}

# Eliminar detalle
DELETE {{baseUrl}}/api/atenciones/{idAtencion}/detalles/{idDetalle}
```

### Endpoints de Consulta de Facturas

```http
# Listar todas las facturas
GET {{baseUrl}}/api/facturas

# Obtener facturas de un cliente
GET {{baseUrl}}/api/facturas/cliente/{idCliente}

# Obtener factura específica
GET {{baseUrl}}/api/facturas/{id}

# Anular factura
DELETE {{baseUrl}}/api/facturas/{id}

# Recalcular totales de todas las facturas
POST {{baseUrl}}/api/facturas/recalcular
```

### Endpoints de Consulta de Pagos

```http
# Listar todos los pagos
GET {{baseUrl}}/api/pagos

# Obtener pagos de una factura
GET {{baseUrl}}/api/pagos/factura/{idFactura}

# Obtener solo pagos confirmados
GET {{baseUrl}}/api/pagos/confirmados

# Obtener pago específico
GET {{baseUrl}}/api/pagos/{id}
```

### Endpoints de Administración

```http
# Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "admin123"
}

# Obtener todos los servicios
GET {{baseUrl}}/api/servicios

# Obtener todos los clientes
GET {{baseUrl}}/api/clientes

# Obtener todas las mascotas
GET {{baseUrl}}/api/mascotas

# Obtener todos los groomers
GET {{baseUrl}}/api/groomers

# Obtener todas las sucursales
GET {{baseUrl}}/api/sucursales
```

---

## 📊 Tabla Resumen de Endpoints Usados en el Flujo Principal

| Paso | Método | Endpoint | Descripción |
|------|--------|----------|-------------|
| 1 | POST | `/api/citas` | Crear cita |
| 2 | GET | `/api/citas` | Listar citas |
| 3 | POST | `/api/atenciones/desde-cita` | Crear atención desde cita |
| 4 | GET | `/api/atenciones/{id}` | Consultar atención |
| 5 | PUT | `/api/atenciones/{id}/estado` | Cambiar estado |
| 6 | PUT | `/api/atenciones/{id}/terminar` | Terminar atención |
| 6.5 | POST | `/api/atenciones/{id}/detalles` | **Agregar detalles de servicio** |
| 6.5 | GET | `/api/atenciones/{id}/detalles/subtotal` | Verificar subtotal |
| 7 | POST | `/api/facturas` | Generar factura |
| 8 | GET | `/api/facturas/{id}` | Consultar factura |
| 9 | POST | `/api/pagos` | Registrar pago |
| 10 | GET | `/api/facturas/{id}` | Verificar estado de pago |
| 11 | GET | `/api/pagos/{id}` | Consultar pago |

---

## 💡 Tips para Pruebas Eficientes

### 1. Usar Variables de Postman

Después de cada creación, guarda el ID:

```javascript
// En el tab "Tests" de POST /api/citas
var response = pm.response.json();
// Como el endpoint no retorna el ID, debes buscarlo en la BD manualmente
// O agregar un GET después del POST para obtener el último creado
```

### 2. Crear una Colección Ordenada

Organiza los requests en folders:

```
📁 Flujo Completo Veterinaria
  📁 1. Setup
    - Login
    - Get Cliente/Mascota/Servicio
  📁 2. Citas
    - Crear Cita
    - Listar Citas
  📁 3. Atenciones
    - Crear desde Cita
    - Cambiar Estado
    - Terminar
  📁 4. Facturas
    - Generar Factura
    - Consultar Factura
  📁 5. Pagos
    - Registrar Pago
    - Consultar Pago
  📁 6. Validaciones SQL
    - (Queries de verificación)
```

### 3. Scripts de Post-Request

Automatiza validaciones:

```javascript
// En el tab "Tests" de PUT /atenciones/{id}/terminar
pm.test("Estado es 'terminado'", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.datos.estado).to.eql("terminado");
});

pm.test("tiempoRealFin no es null", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.datos.tiempoRealFin).to.not.be.null;
});
```

---

## 📝 Notas Importantes

### Formatos de Datos

**Form-urlencoded vs JSON:**

- ✅ **JSON:** `POST /api/citas`
- ✅ **Form-urlencoded:** 
  - `POST /api/atenciones/desde-cita`
  - `POST /api/facturas`
  - `POST /api/pagos`

### Métodos de Pago Válidos

```
efectivo
tarjeta
yape
plin
transferencia
```

(Verificar en la BD qué valores están permitidos)

### Series de Factura

El formato es: `{serie}-{numero}`

**Ejemplos:**
- `F001-00001`
- `F001-00015`
- `B001-00050`

---

## 🎯 Flujo Rápido de Prueba (7 minutos)

> [!WARNING]
> **NO omitas el PASO 4.** Sin agregar detalles de servicio, la factura tendrá totales en 0.00.

Para probar rápidamente todo el flujo:

1. **Login** → Obtener token
   ```http
   POST /api/auth/login
   ```

2. **Crear Cita** → Crea cita (guardar ID desde BD)
   ```http
   POST /api/citas
   ```

3. **Crear Atención** → Crea atención desde la cita
   ```http
   POST /api/atenciones/desde-cita
   ```

4. **⚠️ Agregar Detalles** → CRUCIAL: Agregar servicios realizados
   ```http
   POST /api/atenciones/{id}/detalles
   Content-Type: application/json
   {
     "servicio": { "idServicio": 1 },
     "cantidad": 1,
     "precioUnitario": 35.00,
     "subtotal": 35.00
   }
   ```

5. **Terminar Atención** → Marca el servicio como completado
   ```http
   PUT /api/atenciones/{id}/terminar
   ```

6. **Generar Factura** → Crea la factura (guardar ID desde BD)
   ```http
   POST /api/facturas
   ```

7. **Registrar Pago** → Registra el pago del cliente
   ```http
   POST /api/pagos
   ```

8. **Verificar** → Confirma que la factura está pagada
   ```http
   GET /api/facturas/{id}
   ```
   Debe mostrar: `estado: "pagada"`, `total > 0.00`

---

**Preparado por:** Backend Team  
**Fecha:** 2025-11-27  
**Versión:** 2.0  
**Para usar con:** Postman, Insomnia o cualquier cliente HTTP  
**Última actualización:** Mejorado con troubleshooting, endpoints adicionales, y detalles ampliados
