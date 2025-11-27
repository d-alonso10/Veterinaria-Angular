# 🧪 GUÍA DE TESTING: Verificar que Todo Funciona

**Objetivo:** Validar que los cambios funcionan correctamente  
**Duración:** ~15 minutos  
**Herramientas Necesarias:** Postman / Thunder Client + Browser DevTools  

---

## ✅ TEST CASE 1: Frontend Recibe Null (Scenario Actual)

**Objetivo:** Verificar que el frontend maneja null del backend gracefully

### Paso 1: Abrir DevTools

```
1. En el navegador, abrir Developer Tools (F12)
2. Ir a pestaña "Console"
3. Ir a pestaña "Network"
```

### Paso 2: Crear Atención

```
1. Navegar a: http://localhost:4200/atenciones/nueva?idCita=15
2. Llenar el formulario:
   - idCita: 15
   - idGroomer: 2
   - idSucursal: 1
   - turnoNum: 100
   - tiempoEstimadoInicio: 2025-11-26T14:00:00
   - tiempoEstimadoFin: 2025-11-26T14:30:00
   - prioridad: 3
3. Click "Crear Atención"
```

### Paso 3: Observar Console

**ESPERADO - Ver estos logs (EN ORDEN):**
```
📡 Backend response: null
⚠️ Backend devolvió null, iniciando polling...
🔄 Polling... intentando #1
🔄 Polling... intentando #2
🔄 Polling... intentando #3
✅ Atención encontrada en cola: 45
```

**SI VES ESTO → ✅ FUNCIONANDO CORRECTAMENTE**

### Paso 4: Verificar Network Tab

**En Network tab:**
```
POST /api/atenciones/desde-cita
Status: 201 (Created)
Response: {
  "exito": true,
  "datos": null,  ← Devuelve null
  "mensaje": "..."
}
```

**SI VES ESTO → ✅ BACKEND DEVUELVE NULL (ESPERADO)**

### Paso 5: Verificar Navegación

```
Después de ~5-10 segundos:
✅ Página debe cambiar a /atenciones/detail/45
✅ Debe mostrar detalles de la atención creada
```

**SI LLEGA AQUÍ → ✅ POLLING FUNCIONANDO**

---

## ✅ TEST CASE 2: Frontend Recibe Datos (Scenario Futuro)

**Objetivo:** Verificar que el frontend navega DIRECTO cuando backend devuelve datos

**Precondición:** Backend debe estar modificado para devolver `{datos: {...}}`

### Paso 1: Modificar Backend (Temporalmente para Test)

En `AtencionController.crearDesdeCita()`:

```java
// ACTUAL
return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.exitoso("Éxito", null));

// CAMBIAR TEMPORALMENTE A (para test)
Atencion atencionTest = new Atencion();
atencionTest.setIdAtencion(999);
atencionTest.setIdCita(idCita);
// ... otros campos
return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.exitoso("Éxito", atencionTest));
```

### Paso 2: Crear Atención

```
1. Navegar a: http://localhost:4200/atenciones/nueva?idCita=15
2. Llenar formulario (como antes)
3. Click "Crear Atención"
```

### Paso 3: Observar Console

**ESPERADO - Ver estos logs (EN ORDEN):**
```
📡 Backend response: {
  "idAtencion": 999,
  "idCita": 15,
  ...
}
✅ Backend devolvió la atención: 999
```

**IMPORTANTE:** NO debe ver mensajes de polling como "⚠️ Backend devolvió null"

**SI VES ESTO → ✅ DETECCIÓN DE DATOS FUNCIONANDO**

### Paso 4: Verificar Velocidad

```
Tiempo desde click a navegación: < 500ms (INSTANTÁNEO)
```

**ANTES:** 3-10 segundos (polling)  
**DESPUÉS:** <500ms (directo)  

**SI ES RÁPIDO → ✅ NAVEGACIÓN DIRECTA FUNCIONANDO**

### Paso 5: Verificar Network Tab

```
POST /api/atenciones/desde-cita
Status: 201 (Created)
Response: {
  "exito": true,
  "datos": { "idAtencion": 999, ... },  ← Devuelve datos
  "mensaje": "..."
}
```

**SI VES DATOS NO NULL → ✅ BACKEND DEVUELVE DATOS**

---

## ✅ TEST CASE 3: Verificar Error Handling

**Objetivo:** Verificar que frontend maneja errores gracefully

### Paso 1: Simular Error en Backend

En `AtencionController.crearDesdeCita()`:

```java
// Agregar temporalmente
throw new RuntimeException("Test error");
```

### Paso 2: Intentar Crear Atención

```
1. Navegar a: http://localhost:4200/atenciones/nueva?idCita=15
2. Llenar formulario
3. Click "Crear Atención"
```

### Paso 3: Observar Console

**ESPERADO - Ver estos logs:**
```
❌ Error creando atención: 500 Internal Server Error
⚠️ Backend devolvió null, iniciando polling...
(luego polling normal)
```

**IMPORTANTE:** No debe crashear la aplicación

**SI CONTINÚA SIN CRASH → ✅ ERROR HANDLING FUNCIONANDO**

---

## ✅ TEST CASE 4: Verificar Estado de Cita (Backend Fix)

**Objetivo:** Verificar que cita estado cambió (requiere backend fix)

### Prerequisito
Backend debe estar arreglado para actualizar estado de cita.

### Paso 1: Obtener Cita ANTES

```
Postman/Thunder Client:
GET /api/citas/15
Response: {
  "idCita": 15,
  "estado": "confirmada",  ← Anotar estado inicial
  ...
}
```

### Paso 2: Crear Atención desde Cita

```
En frontend:
1. Navegar a /atenciones/nueva?idCita=15
2. Click "Crear Atención"
3. Esperar a que complete
```

### Paso 3: Obtener Cita DESPUÉS

```
Postman/Thunder Client:
GET /api/citas/15
Response: {
  "idCita": 15,
  "estado": "atendido",  ← Debe haber CAMBIADO
  ...
}
```

### Paso 4: Verificar Cambio

```
ANTES: estado = "confirmada"
DESPUÉS: estado = "atendido"
CAMBIO: ✅ SÍ → Backend fix aplicado correctamente
CAMBIO: ❌ NO → Backend fix AÚN NO aplicado
```

---

## ✅ TEST CASE 5: Verificar Cola de Atención

**Objetivo:** Verificar que la atención aparece en la cola inmediatamente

### Paso 1: Obtener Cola ANTES

```
Postman/Thunder Client:
GET /api/atenciones/cola/1
Response: {
  "datos": [...]  ← Anotar IDs presentes
}
```

### Paso 2: Crear Atención

```
Frontend: Crear atención con idSucursal=1
```

### Paso 3: Obtener Cola DESPUÉS

```
Postman/Thunder Client:
GET /api/atenciones/cola/1
Response: {
  "datos": [
    { "idAtencion": 45, ... },  ← NUEVA atención
    ...
  ]
}
```

### Paso 4: Verificar Presencia

```
¿Aparece la nueva atención en la cola?
SÍ → ✅ Cola actualizada correctamente
NO → ❌ Hay problema en backend o sincronización
```

---

## 📋 CHECKLIST FINAL

### Frontend Funcionando
- [ ] Console muestra "📡 Backend response: null" sin crashes
- [ ] Console muestra "⚠️ Backend devolvió null, iniciando polling..." 
- [ ] Polling comienza automáticamente
- [ ] Navegación ocurre después de encontrar atención
- [ ] No hay errores en console (rojo)
- [ ] Error handling funciona (simular error no crash app)

### Navegación Correcta
- [ ] Click "Crear Atención" → Formulario abre
- [ ] Submit → Consola muestra logs
- [ ] Después de completar → Navega a /atenciones/detail/{id}
- [ ] Detalles de atención se cargan correctamente

### Backend Responsabilidad (Cuando esté listo)
- [ ] POST /api/atenciones/desde-cita devuelve {datos: {...}} NO null
- [ ] GET /api/citas/{id} muestra estado "atendido" (cambió)
- [ ] GET /api/atenciones/cola/{id} incluye nueva atención
- [ ] Sin cambios al estado de cita (cuando fix aplicado)

### Performance
- [ ] Scenario actual (null): ~5-10 segundos
- [ ] Scenario futuro (datos): <500ms
- [ ] Sin demoras o timeouts
- [ ] Sin memory leaks

### Logging
- [ ] Console logs son claros y útiles
- [ ] Hay suficiente info para debugging
- [ ] No hay logs innecesarios

---

## 🐛 DEBUGGING: Si Algo Falla

### Síntoma: App Crashea
```
Solución:
1. Verificar console.log hay catch del error
2. Verificar que catchError devuelve of(null)
3. Verificar que subscribe tiene error handler
```

### Síntoma: Polling No Termina
```
Solución:
1. Verificar que getCola() devuelve array
2. Verificar que find() busca idCita correcto
3. Verificar que take(1) detiene polling
4. Máximo 30 segundos (si falla, algo está mal)
```

### Síntoma: Navegación No Ocurre
```
Solución:
1. Verificar router.navigate() existe
2. Verificar que resultado es truthy
3. Verificar que atencion.idAtencion existe
4. Ver console.log de navegación
```

### Síntoma: Backend Devuelve Error
```
Solución:
1. Verificar parámetros en request
2. Verificar Content-Type: application/x-www-form-urlencoded
3. Verificar que idCita, idGroomer, idSucursal existen
4. Ver error exact en Network tab
```

---

## 📊 MÉTRICAS A REGISTRAR

Después de cada test, registra:

```
┌─────────────────────────────────────┐
│ TEST CASE: [nombre]                 │
│ FECHA: [hoy]                        │
│ BACKEND: [versión]                  │
├─────────────────────────────────────┤
│ Resultado: ✅ PASS / ❌ FAIL        │
│ Tiempo respuesta: [ms]              │
│ Errores en console: [sí/no]         │
│ Navegación: [sí/no]                 │
│ Observaciones: [notas]              │
└─────────────────────────────────────┘
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Ejecutar TEST CASE 1 & 2 (Frontend)
2. ✅ Ejecutar TEST CASE 3 (Error Handling)
3. ⏳ Esperar backend fixes
4. ✅ Ejecutar TEST CASE 4 & 5 (Con Backend Fix)
5. ✅ Validar performance completa
6. 🎉 Deploy a producción

---

**Preguntas? Revisar DIAGNOSTICO_PROBLEMA_ATENCIONES.md**

