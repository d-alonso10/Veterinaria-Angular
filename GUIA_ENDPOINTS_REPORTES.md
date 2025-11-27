# 📊 Guía de Endpoints de Reportes

**Proyecto:** Veterinaria SpringBoot  
**Módulo:** Reportes y Estadísticas  
**Base URL:** `http://localhost:8080`  
**Fecha:** 2025-11-27

---

## 📑 Índice

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints de Reportes](#endpoints-de-reportes)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Formato de Respuestas](#formato-de-respuestas)

---

## 🔍 Introducción

Este documento describe todos los endpoints disponibles para generar reportes y estadísticas del sistema. Todos los endpoints retornan datos en formato JSON y requieren autenticación JWT.

**Características:**
- ✅ Reportes de ingresos por período
- ✅ Análisis de clientes frecuentes
- ✅ Servicios más solicitados
- ✅ Historial de facturas y pagos
- ✅ Logs de auditoría del sistema
- ✅ Resumen general del negocio

---

## 🔐 Autenticación

Todos los endpoints requieren un token JWT válido en el header:

```http
Authorization: Bearer {tu_token_jwt}
```

Para obtener el token:
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "admin123"
}
```

---

## 📊 Endpoints de Reportes

### 1. Reporte de Ingresos

**Descripción:** Obtiene el reporte de ingresos por fecha para una sucursal específica.

**Endpoint:**
```http
GET {{baseUrl}}/api/reportes/ingresos
Authorization: Bearer {{token}}
```

**Parámetros Query (todos requeridos):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `fechaInicio` | Date | Fecha de inicio | `2025-11-01` |
| `fechaFin` | Date | Fecha de fin | `2025-11-30` |
| `idSucursal` | Integer | ID de la sucursal | `1` |

**Ejemplo Completo:**
```http
GET {{baseUrl}}/api/reportes/ingresos?fechaInicio=2025-11-01&fechaFin=2025-11-30&idSucursal=1
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Reporte de ingresos generado correctamente",
  "datos": [
    {
      "fecha": "2025-11-27",
      "total_facturado": 250.50,
      "total_pagado": 250.50,
      "cantidad_facturas": 5
    },
    {
      "fecha": "2025-11-26",
      "total_facturado": 180.00,
      "total_pagado": 120.00,
      "cantidad_facturas": 3
    }
  ],
  "error": null
}
```

**Validación SQL:**
```sql
SELECT DATE(f.fecha_emision) AS fecha,
       SUM(f.total) AS total_facturado,
       COUNT(f.id_factura) AS cantidad_facturas
FROM factura f
INNER JOIN atencion a ON f.id_atencion = a.id_atencion
WHERE f.estado IN ('emitida', 'pagada')
  AND DATE(f.fecha_emision) BETWEEN '2025-11-01' AND '2025-11-30'
  AND a.id_sucursal = 1
GROUP BY DATE(f.fecha_emision)
ORDER BY fecha;
```

---

### 2. Clientes Frecuentes

**Descripción:** Obtiene el top 10 de clientes más frecuentes con sus métricas.

**Endpoint:**
```http
GET {{baseUrl}}/api/reportes/clientes-frecuentes
Authorization: Bearer {{token}}
```

**Parámetros:** Ninguno

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Reporte de clientes frecuentes generado correctamente",
  "datos": [
    {
      "id_cliente": 1,
      "nombre": "Ricardo",
      "apellido": "Alvarez",
      "email": "ricardo.alvarez@mail.com",
      "telefono": "987654321",
      "total_atenciones": 15,
      "total_mascotas": 3,
      "total_gastado": 1250.00
    },
    {
      "id_cliente": 2,
      "nombre": "María",
      "apellido": "González",
      "email": "maria.gonzalez@mail.com",
      "telefono": "912345678",
      "total_atenciones": 12,
      "total_mascotas": 2,
      "total_gastado": 980.50
    }
  ],
  "error": null
}
```

**Uso:** Ideal para programas de fidelización o análisis de clientes VIP.

---

### 3. Servicios Más Solicitados

**Descripción:** Obtiene los servicios ordenados por popularidad y ingresos generados.

**Endpoint:**
```http
GET {{baseUrl}}/api/reportes/servicios-mas-solicitados
Authorization: Bearer {{token}}
```

**Parámetros Query (todos requeridos):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `fechaInicio` | Date | Fecha de inicio | `2025-11-01` |
| `fechaFin` | Date | Fecha de fin | `2025-11-30` |

**Ejemplo:**
```http
GET {{baseUrl}}/api/reportes/servicios-mas-solicitados?fechaInicio=2025-11-01&fechaFin=2025-11-30
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Reporte de servicios más solicitados generado correctamente",
  "datos": [
    {
      "nombre": "Baño Básico (Perro Pequeño)",
      "categoria": "baño",
      "veces_solicitado": 45,
      "cantidad_total": 48,
      "ingresos_generados": 1680.00
    },
    {
      "nombre": "Corte de Raza Estándar",
      "categoria": "corte",
      "veces_solicitado": 32,
      "cantidad_total": 32,
      "ingresos_generados": 1600.00
    },
    {
      "nombre": "Corte de Uñas",
      "categoria": "otro",
      "veces_solicitado": 28,
      "cantidad_total": 30,
      "ingresos_generados": 450.00
    }
  ],
  "error": null
}
```

**Uso:** Para análisis de demanda, planificación de inventario y estrategias de marketing.

---

### 4. Facturas por Cliente

**Descripción:** Obtiene todas las facturas de un cliente específico.

**Endpoint:**
```http
GET {{baseUrl}}/api/reportes/facturas-cliente/{idCliente}
Authorization: Bearer {{token}}
```

**Parámetro de Ruta:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `idCliente` | Integer | ID del cliente | `1` |

**Ejemplo:**
```http
GET {{baseUrl}}/api/reportes/facturas-cliente/1
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Reporte de facturas generado correctamente",
  "datos": [
    {
      "id_factura": 12,
      "serie": "F001",
      "numero": "00015",
      "fecha_emision": "2025-11-27T10:30:00",
      "subtotal": 35.00,
      "impuesto": 6.30,
      "total": 41.30,
      "estado": "pagada",
      "metodo_pago_sugerido": "efectivo"
    },
    {
      "id_factura": 8,
      "serie": "F001",
      "numero": "00011",
      "fecha_emision": "2025-11-15T14:20:00",
      "subtotal": 75.00,
      "impuesto": 13.50,
      "total": 88.50,
      "estado": "emitida",
      "metodo_pago_sugerido": "tarjeta"
    }
  ],
  "error": null
}
```

**Uso:** Historial de facturación del cliente, análisis de morosidad.

---

### 5. Pagos por Factura

**Descripción:** Obtiene todos los pagos registrados para una factura.

**Endpoint:**
```http
GET {{baseUrl}}/api/reportes/pagos-factura/{idFactura}
Authorization: Bearer {{token}}
```

**Parámetro de Ruta:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `idFactura` | Integer | ID de la factura | `12` |

**Ejemplo:**
```http
GET {{baseUrl}}/api/reportes/pagos-factura/12
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Reporte de pagos generado correctamente",
  "datos": [
    {
      "id_pago": 8,
      "fecha_pago": "2025-11-27T11:35:00",
      "monto": 41.30,
      "metodo": "efectivo",
      "referencia": "PAGO-EFECTIVO-001",
      "estado": "confirmado"
    }
  ],
  "error": null
}
```

**Uso:** Verificación de pagos, conciliación de cuentas, pagos parciales.

---

### 6. Logs de Auditoría

**Descripción:** Obtiene los registros de auditoría del sistema con filtros opcionales.

**Endpoint:**
```http
GET {{baseUrl}}/api/reportes/auditoria
Authorization: Bearer {{token}}
```

**Parámetros Query (todos opcionales):**

| Parámetro | Tipo | Descripción | Default | Ejemplo |
|-----------|------|-------------|---------|---------|
| `limite` | Integer | Cantidad de registros | `100` | `50` |
| `entidad` | String | Filtrar por entidad | ninguno | `factura` |
| `accion` | String | Filtrar por acción | ninguno | `UPDATE` |

**Ejemplo:**
```http
GET {{baseUrl}}/api/reportes/auditoria?limite=20&entidad=factura&accion=UPDATE
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Reporte de auditoría generado correctamente",
  "datos": [
    {
      "entidad": "factura",
      "entidad_id": 12,
      "accion": "UPDATE",
      "usuario": "Admin Principal",
      "timestamp": "2025-11-27T11:35:00",
      "antes": "{\"estado\":\"emitida\"}",
      "despues": "{\"estado\":\"pagada\"}"
    }
  ],
  "error": null
}
```

**Valores válidos para `accion`:** `INSERT`, `UPDATE`, `DELETE`  
**Entidades comunes:** `factura`, `pago`, `cita`, `atencion`, `cliente`, `mascota`

**Uso:** Trazabilidad de cambios, seguridad, cumplimiento normativo.

---

### 7. Resumen General del Negocio

**Descripción:** Obtiene métricas generales del negocio para un período.

**Endpoint:**
```http
GET {{baseUrl}}/api/reportes/resumen-general
Authorization: Bearer {{token}}
```

**Parámetros Query (todos requeridos):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `fechaInicio` | Date | Fecha de inicio | `2025-11-01` |
| `fechaFin` | Date | Fecha de fin | `2025-11-30` |

**Ejemplo:**
```http
GET {{baseUrl}}/api/reportes/resumen-general?fechaInicio=2025-11-01&fechaFin=2025-11-30
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "exito": true,
  "mensaje": "Resumen general generado correctamente",
  "datos": {
    "total_facturado": 12500.50,
    "clientes_nuevos": 15,
    "total_atenciones": 85,
    "servicio_popular": "Baño Básico (Perro Pequeño)",
    "periodo": {
      "inicio": "2025-11-01",
      "fin": "2025-11-30"
    }
  },
  "error": null
}
```

**Uso:** Dashboard ejecutivo, KPIs del negocio, reportes mensuales.

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Análisis de Ingresos Mensual

```http
GET {{baseUrl}}/api/reportes/ingresos?fechaInicio=2025-11-01&fechaFin=2025-11-30&idSucursal=1
Authorization: Bearer {{token}}
```

**Caso de uso:** Generar reporte mensual de ingresos para la sucursal central.

---

### Ejemplo 2: Identificar Clientes VIP

```http
GET {{baseUrl}}/api/reportes/clientes-frecuentes
Authorization: Bearer {{token}}
```

**Caso de uso:** Crear programa de fidelización para los 10 mejores clientes.

---

### Ejemplo 3: Planificación de Inventario

```http
GET {{baseUrl}}/api/reportes/servicios-mas-solicitados?fechaInicio=2025-10-01&fechaFin=2025-11-30
Authorization: Bearer {{token}}
```

**Caso de uso:** Determinar qué productos/servicios necesitan más stock o personal.

---

### Ejemplo 4: Verificar Estado de Cuenta

```http
# 1. Obtener facturas del cliente
GET {{baseUrl}}/api/reportes/facturas-cliente/1
Authorization: Bearer {{token}}

# 2. Verificar pagos de factura específica
GET {{baseUrl}}/api/reportes/pagos-factura/12
Authorization: Bearer {{token}}
```

**Caso de uso:** Revisar el historial completo de un cliente antes de una llamada de cobranza.

---

### Ejemplo 5: Auditoría de Cambios en Facturas

```http
GET {{baseUrl}}/api/reportes/auditoria?limite=100&entidad=factura&accion=UPDATE
Authorization: Bearer {{token}}
```

**Caso de uso:** Investigar quién y cuándo modificó facturas en el último mes.

---

## 📊 Formato de Respuestas

Todos los endpoints siguen el mismo formato de respuesta:

### Respuesta Exitosa

```json
{
  "exito": true,
  "mensaje": "Descripción del resultado",
  "datos": [ ... ],  // Array o Object según el endpoint
  "error": null
}
```

### Respuesta de Error

```json
{
  "exito": false,
  "mensaje": "Descripción del error",
  "datos": null,
  "error": "Detalle técnico del error"
}
```

### Códigos HTTP

| Código | Significado | Cuándo Ocurre |
|--------|-------------|---------------|
| `200 OK` | Éxito | Reporte generado correctamente |
| `400 BAD REQUEST` | Error de validación | Parámetros inválidos o faltantes |
| `401 UNAUTHORIZED` | No autenticado | Token JWT inválido o expirado |
| `404 NOT FOUND` | No encontrado | Entidad no existe |
| `500 INTERNAL SERVER ERROR` | Error del servidor | Error al generar el reporte |

---

## 💡 Tips y Mejores Prácticas

### 1. Formato de Fechas

✅ **Correcto:** `2025-11-27` (ISO 8601: YYYY-MM-DD)  
❌ **Incorrecto:** `27/11/2025`, `11-27-2025`

### 2. Rangos de Fechas

Para reportes mensuales:
- Inicio: Primer día del mes (`2025-11-01`)
- Fin: Último día del mes (`2025-11-30`)

Para reportes anuales:
- Inicio: `2025-01-01`
- Fin: `2025-12-31`

### 3. Optimización

Para reportes grandes:
- Usa rangos de fechas específicos (evita períodos muy largos)
- Filtra por sucursal cuando sea posible
- Usa el parámetro `limite` en auditoría

### 4. Programación de Reportes

Recomendaciones para automatización:
- **Ingresos diarios:** Programar a las 23:59
- **Resumen semanal:** Los lunes a las 8:00
- **Reporte mensual:** El día 1 de cada mes
- **Clientes frecuentes:** Una vez al mes para programas de fidelización

---

## 🔍 Troubleshooting

### Error: "Parámetros faltantes"

**Causa:** No se enviaron todos los parámetros requeridos.

**Solución:** Verifica que todos los parámetros requeridos estén presentes en la URL.

---

### Error: "Formato de fecha inválido"

**Causa:** La fecha no está en formato ISO 8601.

**Solución:** Usa el formato `YYYY-MM-DD` (ej: `2025-11-27`).

---

### Error: "Token expirado"

**Causa:** El token JWT ha expirado.

**Solución:** Vuelve a hacer login para obtener un nuevo token.

---

### Reporte Vacío

**Causa:** No hay datos en el rango de fechas especificado.

**Solución:** Amplía el rango de fechas o verifica que existan datos en la BD.

---

## 📚 Recursos Adicionales

- [Manual de Flujo Completo Cita-Pago](./MANUAL_FLUJO_COMPLETO_CITA_PAGO.md)
- [Guía de Testing con Postman](./GUIA_TESTING_POSTMAN.md)
- [Documentación de API General](../01_Principal/README.md)

---

**Preparado por:** Backend Team  
**Fecha:** 2025-11-27  
**Versión:** 1.0  
**Para usar con:** Postman, Insomnia o cualquier cliente HTTP
