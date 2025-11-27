# 🧪 Guía de Pruebas Postman - Dashboard TeranVet

## 📋 Configuración Inicial

### 1. Autenticación

Primero necesitas obtener el token JWT:

**Request:**

```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@teranvet.com",
  "password": "tu_password"
}
```

**Response:**

```json
{
  "exito": true,
  "mensaje": "Login exitoso",
  "datos": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "rol": "admin",
    "nombre": "Admin",
    "email": "admin@teranvet.com"
  }
}
```

**⚠️ IMPORTANTE:** Copia el token y agrégalo a TODAS las siguientes peticiones:

- Header: `Authorization`
- Value: `Bearer [tu_token_aquí]`

---

## 📊 Endpoints del Dashboard

### 1️⃣ Métricas Generales

Obtiene métricas del sistema (citas, ingresos, atenciones, etc.)

**Request:**

```
GET http://localhost:8080/api/dashboard/metricas?fechaInicio=2025-01-01&fechaFin=2025-12-31
Authorization: Bearer [tu_token]
```

Muestra las atenciones en cola de una sucursal específica.

**Request:**

```
GET http://localhost:8080/api/dashboard/cola/1
Authorization: Bearer [tu_token]
```

**Path Param:**

- `idSucursal`: 1 (ID de la sucursal)

**Response esperado:**

```json
{
  "exito": true,
  "mensaje": "Cola obtenida correctamente",
  "datos": [
    {
      "idAtencion": 10,
      "mascota": "Firulais",
      "cliente": "Juan Pérez",
      "servicio": "Baño",
      "estado": "en_espera",
      "turno": 3
    }
  ]
}
```

---

### 3️⃣ Estadísticas Mensuales

Obtiene estadísticas de un mes específico.

**Request:**

```
GET http://localhost:8080/api/dashboard/estadisticas-mensuales?anio=2025&mes=11
Authorization: Bearer [tu_token]
```

**Parámetros Query:**

- `anio`: 2025
- `mes`: 11 (1-12)

**Response esperado:**

```json
{
  "exito": true,
  "mensaje": "Estadísticas obtenidas",
  "datos": [
    {
      "totalCitas": 45,
      "ingresosMes": 15000.0,
      "clientesNuevos": 8,
      "serviciosMasVendidos": "Baño"
    }
  ]
}
```

---

### 4️⃣ Próximas Citas de un Cliente

Obtiene las citas programadas de un cliente.

**Request:**

```
GET http://localhost:8080/api/dashboard/proximas-citas/5
Authorization: Bearer [tu_token]
```

**Path Param:**

- `idCliente`: 5 (ID del cliente)

**Response esperado:**

```json
{
  "exito": true,
  "mensaje": "Citas obtenidas",
  "datos": [
    {
      "idCita": 25,
      "fechaProgramada": "2025-11-25T10:00:00",
      "mascota": "Luna",
      "servicio": "Corte de Pelo",
      "estado": "confirmada"
    }
  ]
}
```

---

### 5️⃣ Historial de Mascota

Muestra el historial de atenciones de una mascota.

**Request:**

```
GET http://localhost:8080/api/dashboard/historial-mascota/3
Authorization: Bearer [tu_token]
```

**Path Param:**

- `idMascota`: 3 (ID de la mascota)

**Response esperado:**

```json
{
  "exito": true,
  "mensaje": "Historial obtenido",
  "datos": [
    {
      "fecha": "2025-11-10T14:00:00",
      "servicio": "Baño",
      "groomer": "Ana Torres",
      "costo": 50.0,
      "notas": "Todo bien"
    }
  ]
}
```

---

## 📈 Endpoints de Reportes (usados en Dashboard)

### 6️⃣ Reporte de Ingresos

**Request:**

```
GET http://localhost:8080/api/reportes/ingresos?fechaInicio=2025-11-01&fechaFin=2025-11-30&idSucursal=1
Authorization: Bearer [tu_token]
```

**Parámetros Query:**

- `fechaInicio`: 2025-11-01
- `fechaFin`: 2025-11-30
- `idSucursal`: 1 (opcional)

---

### 7️⃣ Clientes Frecuentes

**Request:**

```
GET http://localhost:8080/api/reportes/clientes-frecuentes?limit=10
Authorization: Bearer [tu_token]
```

**Parámetros Query:**

- `limit`: 10 (número de clientes a retornar)

---

### 8️⃣ Ocupación de Groomers

**Request:**

```
GET http://localhost:8080/api/groomers/ocupacion/2025-11-21
Authorization: Bearer [tu_token]
```

**Path Param:**

- `fecha`: 2025-11-21 (formato YYYY-MM-DD)

---

## 🧪 Plan de Pruebas Completo

### Orden sugerido:

1. ✅ **Login** → Obtener token
2. ✅ **Métricas Generales** → Verificar datos globales
3. ✅ **Cola de Atención** → Ver atenciones pendientes
4. ✅ **Estadísticas Mensuales** → Análisis del mes
5. ✅ **Próximas Citas** → Verificar agenda de cliente
6. ✅ **Historial Mascota** → Ver historial médico
7. ✅ **Reporte Ingresos** → Verificar finanzas
8. ✅ **Clientes Frecuentes** → Top clientes
9. ✅ **Ocupación Groomers** → Carga de trabajo

---

## ⚠️ Errores Comunes

### Error 401 Unauthorized

```json
{
  "exito": false,
  "mensaje": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

**Solución:** Vuelve a hacer login y actualiza el token.

### Error 404 Not Found

**Solución:** Verifica que la URL está correcta y que el backend está corriendo en `http://localhost:8080`

### Error 500 Internal Server Error

**Solución:** Revisa la consola del backend para ver el error específico.

---

## 💡 Tips

1. **Guarda las requests en una colección** de Postman llamada "TeranVet API"
2. **Crea una variable de entorno** `{{token}}` para no copiar/pegar el token cada vez
3. **Usa Pre-request Scripts** para renovar el token automáticamente
4. **Exporta la colección** para compartirla con el equipo

---

## 🔗 Variables de Entorno Sugeridas

Crea un Environment en Postman con:

```
baseUrl: http://localhost:8080
token: [se actualiza después del login]
idSucursal: 1
idCliente: 5
idMascota: 3
```

Luego usa `{{baseUrl}}/api/dashboard/metricas` en tus requests.

---

**¡Listo!** Con esta guía puedes probar todos los endpoints del dashboard. 🚀
