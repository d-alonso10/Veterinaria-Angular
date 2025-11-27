# 🚀 REFERENCIA RÁPIDA: FLUJO DE ATENCIÓN

## ⚡ TL;DR (Too Long; Didn't Read)

**Lo que se arregló en una línea:**  
Redirigir correctamente después de crear atención + usar form-urlencoded en endpoints correctos + cargar servicios en dropdown.

---

## 🎯 LOS 5 CAMBIOS CRÍTICOS

### 1️⃣ Agregar postFormUrlEncoded() a ApiService

```typescript
postFormUrlEncoded<T>(endpoint: string, params: any): Observable<ApiResponse<T>> {
  let httpParams = new HttpParams();
  if (params) {
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key]);
    });
  }
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });
  return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, 
    httpParams.toString(), { headers }).pipe(catchError(this.handleError));
}
```

**Por qué:** Los endpoints del backend requieren form-urlencoded, no JSON.

---

### 2️⃣ Corregir Endpoints en AttentionService

```typescript
// ANTES: /api/atenciones/desde-cita (❌)
// DESPUÉS: /atenciones/desde-cita (✅)

createFromAppointment(params: any): Observable<IAtencion> {
  return this.apiService.postFormUrlEncoded<IAtencion>(
    '/atenciones/desde-cita',  // ← SIN /api
    params
  ).pipe(map(response => response.datos!));
}
```

**Por qué:** El backend devuelve estos endpoints sin `/api`.

---

### 3️⃣ Corregir Endpoint de Servicios

```typescript
// ANTES: /api/servicios (❌)
// DESPUÉS: /servicios (✅)

getServices(): Observable<IServicio[]> {
  return this.apiService.get<IServicio[]>('/servicios')
    .pipe(map(response => response.datos || []));
}
```

**Por qué:** El servidor devuelve servicios en `/servicios` sin `/api`.

---

### 4️⃣ Redirigir a Pantalla de Servicios Tras Crear Atención

```typescript
onSubmit() {
  // ... validaciones y envío ...
  
  this.attentionService.createFromAppointment(params).subscribe({
    next: () => {
      // Esperar a que se persista
      setTimeout(() => {
        // Buscar la atención creada
        this.attentionService.getCola(formValue.idSucursal).subscribe({
          next: (atenciones) => {
            // Buscar por idCita
            const atencion = atenciones.find(
              a => a.cita?.idCita === formValue.idCita
            );
            // REDIRECCIONAR A SERVICIOS
            this.router.navigate([
              `/atenciones/${atencion.idAtencion}/atender`
            ]);
          }
        });
      }, 500);
    }
  });
}
```

**Por qué:** Automáticamente lleva al usuario a donde puede agregar servicios.

---

### 5️⃣ Usar postFormUrlEncoded en BillingService y PaymentService

```typescript
// BillingService
createFactura(...): Observable<IFactura> {
  return this.apiService.postFormUrlEncoded<string>(
    '/api/facturas',  // ← form-urlencoded
    { idAtencion, serie, numero, metodoPagoSugerido }
  ).pipe(...);
}

// PaymentService
registrarPago(...): Observable<string> {
  return this.apiService.postFormUrlEncoded<string>(
    '/api/pagos',  // ← form-urlencoded
    { idFactura, monto, metodo, referencia }
  ).pipe(...);
}
```

**Por qué:** Estos endpoints también requieren form-urlencoded.

---

## 📋 FLUJO EN 10 PASOS

```
1. appointment-list: Click "Crear Atención"
   ↓
2. Navigation: /atenciones/nueva?idCita=15
   ↓
3. crear-atencion: Carga citas y groomers
   ↓
4. crear-atencion: Completa formulario y da click
   ↓
5. Backend: POST /atenciones/desde-cita
   ↓
6. Frontend: Espera 500ms para persistencia
   ↓
7. Frontend: GET /atenciones/cola/1 → Busca atención
   ↓
8. Navigation: /atenciones/{idAtencion}/atender
   ↓
9. atender: Carga servicios en dropdown
   ↓
10. Usuario: Puede agregar servicios ✅
```

---

## 🔧 SERVICIOS MODIFICADOS

| Servicio | Método | Cambio |
|----------|--------|--------|
| ApiService | postFormUrlEncoded() | ➕ NUEVO |
| AttentionService | createFromAppointment() | ✏️ Endpoint |
| AttentionService | createWalkIn() | ✏️ Endpoint |
| ServiceService | getServices() | ✏️ Endpoint |
| BillingService | createFactura() | ✏️ Método POST |
| PaymentService | registrarPago() | ✏️ Método POST |

---

## 🔌 ENDPOINTS CRÍTICOS

```
GET     /servicios                    → Cargar dropdown
POST    /atenciones/desde-cita        → Crear atención (form-urlencoded)
GET     /atenciones/cola/1            → Buscar atención creada
POST    /api/facturas                 → Generar factura (form-urlencoded)
POST    /api/pagos                    → Registrar pago (form-urlencoded)
```

---

## 📦 ESTRUCTURA: QUÉ VA DÓNDE

```
/services/
  ├─ api.service.ts          ← postFormUrlEncoded() ✅
  ├─ attention.service.ts    ← /atenciones endpoints ✅
  ├─ service.service.ts      ← /servicios endpoint ✅
  ├─ billing.service.ts      ← postFormUrlEncoded() ✅
  └─ payment.service.ts      ← postFormUrlEncoded() ✅

/features/atenciones/
  ├─ crear-atencion/
  │  └─ component.ts         ← Redirección automática ✅
  └─ atender/
     └─ component.ts         ← Servicios visible ✅
```

---

## ❌ ERRORES COMUNES A EVITAR

```
❌ Usar POST en lugar de postFormUrlEncoded()
   Resultado: Header incorrecto, backend rechaza

❌ Usar /api/atenciones en lugar de /atenciones
   Resultado: 404 Not Found

❌ Redirigir a /atenciones en lugar de /atenciones/{id}/atender
   Resultado: Usuario ve cola vacía, confusión

❌ No esperar 500ms tras crear
   Resultado: Atención no encontrada en BD

❌ No validar servicios antes de terminar
   Resultado: Factura con totales 0
```

---

## ✅ VALIDACIÓN CHECKLIST

- [ ] Servicios cargan en dropdown (14 servicios)
- [ ] Se puede crear atención desde cita
- [ ] Redirige a pantalla de servicios automáticamente
- [ ] Se pueden agregar servicios
- [ ] Dropdown muestra precio correcto
- [ ] Tabla de servicios se actualiza
- [ ] Se puede terminar atención
- [ ] Redirige a facturación
- [ ] Factura se genera con totales
- [ ] Pago se registra correctamente

---

## 🧪 TEST RÁPIDO (30 segundos)

1. Citas → Botón "Crear Atención"
2. Llena el formulario → "Crear Atención"
3. **¿Ves "Agregar Servicio Realizado"?** ✅ Todo bien
4. Selecciona servicio del dropdown
5. Agrega servicio → Debe aparecer en tabla
6. Click "Terminar Atención"
7. **¿Ves página de facturación?** ✅ Todo bien

---

## 📞 DEBUGGING

**Si servicios no cargan:**
```javascript
// En consola del navegador (F12)
console.log('Servicios:', serviciosDisponibles());
// Debe mostrar array de 14 servicios
```

**Si no redirige tras crear:**
```javascript
// Ver en Network tab (F12)
// Debe haber:
// 1. POST /atenciones/desde-cita → 200 OK
// 2. GET /atenciones/cola/1 → 200 OK con datos
```

**Si endpoints devuelven error:**
```bash
# En Postman o Terminal
curl -X GET http://localhost:8080/servicios
# Debe devolver { "exito": true, "datos": [...] }
```

---

## 🎓 CONCEPTOS CLAVE

| Concepto | Explicación |
|----------|-------------|
| **form-urlencoded** | Formato: `key1=value1&key2=value2` |
| **HttpParams** | Angular convierte esto automáticamente |
| **setTimeout 500ms** | Espera para que BD persista datos |
| **Búsqueda por idCita** | Asegura obtener la atención correcta |
| **Redirección automática** | Mejora UX, usuario no se pierde |

---

## 📚 ARCHIVOS DE REFERENCIA

- `INFORME_FLUJO_ATENCION_COMPLETO.md` - Informe detallado con código
- `DIAGRAMAS_FLUJO_TECNICO.md` - Diagramas de secuencia y flujos
- `MANUAL_FLUJO_COMPLETO_CITA_PAGO.md` - Manual de pruebas

---

**Estado:** ✅ COMPLETADO  
**Última actualización:** 26 de Noviembre de 2025
