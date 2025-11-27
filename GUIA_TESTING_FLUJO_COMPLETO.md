# 🧪 GUÍA DE TESTING - Flujo Completo Frontend

**Objetivo:** Validar que el flujo Cita → Atención → Factura → Pago funciona correctamente

**Fecha:** 26 de Noviembre 2025  
**Duración estimada:** 15-20 minutos  
**Requisitos:** Backend running en `http://localhost:8080`, Frontend en `http://localhost:4200`

---

## ✅ Pre-requisitos

Antes de comenzar, asegúrate de que:

- [ ] Backend está corriendo (`http://localhost:8080`)
- [ ] Frontend está corriendo (`http://localhost:4200`)
- [ ] Tienes credenciales de login (admin/admin123)
- [ ] Datos de prueba están disponibles:
  - Al menos 1 cliente
  - Al menos 1 mascota asociada al cliente
  - Al menos 1 servicio disponible
  - Al menos 1 groomer registrado
  - Al menos 1 sucursal

---

## 🎯 Flujo de Testing Completo

### FASE 1: Preparación

#### Paso 1.1: Login
```
Ruta: http://localhost:4200/login
Acción:
  1. Usuario: admin
  2. Contraseña: admin123
  3. Click "Iniciar Sesión"
  
Verificar:
  ✅ Redirección a /dashboard
  ✅ Token se guarda en localStorage
  ✅ Header muestra "Bienvenido"
```

#### Paso 1.2: Acceder al módulo de citas
```
Ruta: http://localhost:4200/appointments
Verificar:
  ✅ Se carga lista de citas (si existen)
  ✅ Botón "Nueva Cita" está disponible
```

---

### FASE 2: Crear Cita

#### Paso 2.1: Acceder a formulario de cita
```
Ruta: http://localhost:4200/appointments/new
Verificar:
  ✅ Se cargan clientes en dropdown
  ✅ Campos: cliente, mascota, servicio, fecha, modalidad
  ✅ Botón "Guardar" está habilitado
```

#### Paso 2.2: Llenar formulario
```
Datos:
  Cliente: [Seleccionar del dropdown]
  Mascota: [Seleccionar del dropdown - debe cargar después de seleccionar cliente]
  Servicio: [Seleccionar del dropdown]
  Fecha: [Seleccionar fecha futura - ej: 2025-11-28 a las 10:00]
  Modalidad: Presencial (default)
  Notas: "Testing flujo completo"

Verificar:
  ✅ Mascota dropdown se habilita después de seleccionar cliente
  ✅ Mascota solo muestra mascotas del cliente seleccionado
```

#### Paso 2.3: Guardar cita
```
Acción: Click "Guardar"

Verificar:
  ✅ Notificación: "Cita creada exitosamente"
  ✅ Redirección a /appointments
  ✅ Cita aparece en la lista
  ✅ Estado de cita = "reservada"

En la BD ejecutar:
SELECT id_cita, estado, fecha_programada FROM cita ORDER BY id_cita DESC LIMIT 1;
  ✅ Debe mostrar la cita con estado "reservada"
```

**GUARDA EL ID DE CITA:** (ej: 15)

---

### FASE 3: Crear Atención desde Cita

#### Paso 3.1: Acceder a crear atención
```
Ruta: http://localhost:4200/atenciones/nueva
Verificar:
  ✅ Se cargan citas disponibles (estado reservada/confirmada)
  ✅ Se cargan groomers en dropdown
  ✅ La cita creada en FASE 2 aparece en la lista
```

#### Paso 3.2: Seleccionar cita
```
Acción:
  1. Seleccionar la cita que creamos en FASE 2
  
Verificar:
  ✅ Se auto-pueblan detalles de la cita (cliente, mascota, servicio)
  ✅ Sucursal se pre-completa (default 1)
```

#### Paso 3.3: Seleccionar groomer
```
Acción:
  1. Seleccionar un groomer del dropdown
  2. Prioridad: 2 (default está bien)
  3. Click "Crear Atención"

Verificar:
  ✅ Notificación: "Atención creada exitosamente desde la cita"
  ✅ Redirección a /atenciones
```

**GUARDA EL ID DE ATENCIÓN:** (Debe buscarlo en la cola de atenciones)

En la BD:
```sql
SELECT id_atencion, estado FROM atencion 
WHERE id_cita = [ID_CITA] 
ORDER BY id_atencion DESC LIMIT 1;
```
Estado debe ser: "en_espera"

---

### FASE 4: Cola de Atenciones

#### Paso 4.1: Ver cola
```
Ruta: http://localhost:4200/atenciones (o /queue)

Verificar:
  ✅ Se agrupan por estado (en_espera, en_servicio, terminado)
  ✅ La atención creada aparece en "En Espera"
  ✅ Muestra: cliente, mascota, groomer, turno, prioridad
```

#### Paso 4.2: Iniciar servicio
```
Acción:
  1. Buscar la atención creada en "En Espera"
  2. Click botón "Iniciar Servicio" (primer botón)

Verificar:
  ✅ Notificación: "Servicio iniciado"
  ✅ Atención se mueve a "En Servicio"
  ✅ Hora de inicio se registra

En la BD:
SELECT estado, tiempo_real_inicio FROM atencion WHERE id_atencion = [ID];
  ✅ estado = "en_servicio"
  ✅ tiempo_real_inicio NOT NULL
```

---

### FASE 5: Realizar Servicios

#### Paso 5.1: Acceder a atender
```
Ruta: http://localhost:4200/atenciones/[ID_ATENCION]/atender
  (O click "Continuar Atención" desde cola)

Verificar:
  ✅ Se carga información de atención
  ✅ Cliente, mascota, groomer se muestran
  ✅ Formulario para agregar servicios
  ✅ Lista vacía de servicios realizados
  ✅ Timer muestra tiempo transcurrido
```

#### Paso 5.2: Agregar primer servicio
```
Acción:
  1. Dropdown "Servicio": Seleccionar un servicio
  2. Cantidad: 1
  3. Precio Unit.: Debe auto-complarse desde el servicio
  4. Click "Agregar Servicio"

Verificar:
  ✅ Notificación: "Servicio agregado correctamente"
  ✅ El servicio aparece en "Servicios Realizados"
  ✅ Subtotal se calcula correctamente

En la BD:
SELECT * FROM detalle_servicio WHERE id_atencion = [ID] ORDER BY id_detalle DESC LIMIT 1;
  ✅ Se guardó el servicio
  ✅ precio_unitario != 0
  ✅ subtotal != 0
  ✅ servicio: { idServicio: X } (estructura correcta)
```

#### Paso 5.3: Agregar segundo servicio (opcional)
```
Acción:
  1. Seleccionar otro servicio
  2. Cantidad: 1
  3. Click "Agregar"

Verificar:
  ✅ Dos servicios en lista
  ✅ Total actualizado correctamente
```

#### Paso 5.4: Terminar atención
```
Acción:
  1. Click "Terminar Atención"

Verificar:
  ✅ Modal de confirmación muestra:
    - Número de servicios
    - Subtotal
    - IGV (18%)
    - Total
  ✅ Click "Aceptar"

Verificar:
  ✅ Notificación: "Atención terminada exitosamente"
  ✅ Notificación: "Redirigiendo a facturación..."
  ✅ Redirección automática a /billing con query param idAtencion

En la BD:
SELECT estado, tiempo_real_fin FROM atencion WHERE id_atencion = [ID];
  ✅ estado = "terminado"
  ✅ tiempo_real_fin NOT NULL
```

---

### FASE 6: Generar Factura

#### Paso 6.1: Formulario de factura
```
Ya debe estar en: http://localhost:4200/billing?idAtencion=[ID]

Verificar:
  ✅ Se cargó la atención
  ✅ Muestra cliente, mascota, servicios
  ✅ Número de factura auto-generado
  ✅ Serie: F001 (default)
  ✅ Método pago: efectivo (default)
```

#### Paso 6.2: Generar factura
```
Acción:
  1. Número puede modificarse si se desea
  2. Click "Generar Factura"

Verificar:
  ✅ Notificación: "Factura generada. Redirigiendo..."
  ✅ Redirección a /payments/new/[ID_FACTURA]

En la BD:
SELECT id_factura, numero_completo, subtotal, impuesto, total, estado 
FROM factura 
WHERE id_atencion = [ID_ATENCION];
  ✅ Factura creada
  ✅ Número generado
  ✅ subtotal > 0 (suma de servicios)
  ✅ impuesto > 0 (18% del subtotal)
  ✅ total = subtotal + impuesto
  ✅ estado = "emitida"
  
IMPORTANTE: Si subtotal = 0, hubo problema con servicios
```

**GUARDA EL ID DE FACTURA:** (ej: 12)

---

### FASE 7: Registrar Pago

#### Paso 7.1: Pantalla de pago
```
Debe estar en: http://localhost:4200/payments/new/[ID_FACTURA]

Verificar:
  ✅ Se cargó la factura
  ✅ Muestra série-número
  ✅ Muestra subtotal, IGV, total
  ✅ Campo "Monto Recibido" = total (default)
  ✅ Campo "Cambio" = 0
  ✅ Dropdown "Método": efectivo (default)
  ✅ Campo "Referencia" vacío
```

#### Paso 7.2: Monto exacto
```
Acción:
  1. El monto debe ser igual al total
  2. Click "Monto Exacto" (si hay botón) o dejar como está
  3. Cambio debe ser 0

Verificar:
  ✅ Monto Recibido = Total
  ✅ Cambio = 0
```

#### Paso 7.3: Cambio (opcional)
```
Acción:
  1. Cambiar Monto Recibido a un valor mayor (ej: 100)
  2. Tab o blur para actualizar cambio

Verificar:
  ✅ Cambio se calcula: Monto - Total
  ✅ Cambio > 0
```

#### Paso 7.4: Registrar pago
```
Acción:
  1. Método: efectivo
  2. Referencia: PRUEBA-001 (opcional)
  3. Click "Registrar Pago"

Verificar:
  ✅ Modal de confirmación muestra resumen
  ✅ Click "Aceptar"
  ✅ Alert si hay cambio: "Entregar cambio al cliente: S/ X.XX"
  ✅ Notificación: "Pago registrado exitosamente"
  ✅ Redirección a /dashboard

En la BD:
SELECT id_pago, monto, metodo, estado FROM pago 
WHERE id_factura = [ID_FACTURA];
  ✅ Pago registrado
  ✅ monto = factura.total
  ✅ metodo = "efectivo"
  ✅ estado = "confirmado"

SELECT estado FROM factura WHERE id_factura = [ID_FACTURA];
  ✅ estado = "pagada"
```

---

### FASE 8: Validación Final

#### Paso 8.1: Dashboard
```
Ruta: http://localhost:4200/dashboard

Verificar:
  ✅ Se muestra información general
  ✅ No hay errores en console
```

#### Paso 8.2: Revisar datos en BD
```sql
-- Verificar flujo completo
SELECT 
    c.id_cita,
    c.estado as cita_estado,
    a.id_atencion,
    a.estado as atencion_estado,
    f.id_factura,
    f.estado as factura_estado,
    f.total,
    p.id_pago,
    p.estado as pago_estado
FROM cita c
LEFT JOIN atencion a ON c.id_cita = a.id_cita
LEFT JOIN factura f ON a.id_atencion = f.id_atencion
LEFT JOIN pago p ON f.id_factura = p.id_factura
WHERE c.id_cita = [ID_CITA_CREADA];

Verificar:
  ✅ cita_estado = "atendido"
  ✅ atencion_estado = "terminado"
  ✅ factura_estado = "pagada"
  ✅ total > 0
  ✅ pago_estado = "confirmado"
```

---

## 🔍 Checklist de Verificación

### Funcionalidad
- [ ] Cita creada con estado "reservada"
- [ ] Atención creada con estado "en_espera"
- [ ] Estado cambia a "en_servicio" cuando se inicia
- [ ] Servicios se guardan con formato correcto
- [ ] Atención termina con estado "terminado"
- [ ] Factura se crea con totales > 0
- [ ] Factura estado es "emitida"
- [ ] Pago se registra exitosamente
- [ ] Factura cambia a "pagada" después de pago

### Navegación
- [ ] De cita → atención (ruta correcta)
- [ ] De atención → cola (actualización visible)
- [ ] De cola → atender (carga datos correctamente)
- [ ] De atender → billing (query param correcto)
- [ ] De billing → pagos (ruta /payments/new/:id)
- [ ] De pagos → dashboard (después de pago)

### Datos
- [ ] Cliente se muestra correctamente en todo el flujo
- [ ] Mascota se muestra correctamente
- [ ] Servicios tienen precios correctos
- [ ] Subtotal = suma de servicios
- [ ] IGV = subtotal * 0.18
- [ ] Total = subtotal + IGV
- [ ] Monto de pago = total

### UI/UX
- [ ] Notificaciones aparecen para cada acción
- [ ] Redirecciones son automáticas
- [ ] Botones están habilitados/deshabilitados según corresponda
- [ ] Confirmaciones aparecen antes de acciones importantes
- [ ] No hay errores en console (F12)

---

## 🚨 Problemas Comunes y Soluciones

### Problema: Servicios no se guardan
```
Síntoma: detalle_servicio está vacío en BD
Causa: Formato incorrecto enviado al backend
Solución: Ya aplicado en FIX #1 y #2
Verificar: attention-detail.component.ts y atender.component.ts
```

### Problema: No navega a pagos después de crear factura
```
Síntoma: Notificación sale pero no redirige
Causa: Ruta incorrecta /payments en lugar de /payments/new/:id
Solución: Ya aplicado en FIX #3
Verificar: billing.component.ts
```

### Problema: Payment component no recibe factura ID
```
Síntoma: Error "No se especificó una factura"
Causa: El componente no recibía parámetro de ruta
Solución: Ya aplicado en FIX #4
Verificar: payment.component.ts
```

### Problema: Factura no se encuentra después de crear
```
Síntoma: Error "Factura creada pero no encontrada"
Causa: Timing issue, búsqueda demasiado rápida
Solución: Ya aplicado en FIX #5 (reintentos)
Verificar: billing.service.ts
```

---

## 📊 Resultados Esperados

Si todo funciona correctamente:

```
ANTES: ❌ Flujo roto en 3+ puntos
DESPUÉS: ✅ Flujo completo funcionando

CITA: 
  - Estado: reservada → atendido
  - ✅ Se guarda correctamente

ATENCIÓN:
  - Estado: en_espera → en_servicio → terminado
  - Servicios: Se guardan con precios correctos
  - ✅ Se guarda correctamente

FACTURA:
  - Estado: emitida → pagada
  - Totales: subtotal, IGV, total = correctos
  - ✅ Se guarda correctamente

PAGO:
  - Estado: confirmado
  - Monto: Correcto según factura
  - ✅ Se guarda correctamente

TOTAL: ✅ 100% FUNCIONAL
```

---

## 📝 Notas

1. **Datos de prueba:** Usa datos que existan en tu BD
2. **IDs:** Guarda los IDs para poder validar en la BD
3. **BD:** Las queries SQL provistas son para MySQL
4. **Backend:** Asegúrate que esté ejecutando correctamente
5. **Logs:** Revisa console de navegador (F12) para ver errores

---

**Revisado por:** Revisión Automatizada  
**Última actualización:** 26-11-2025  
**Status:** ✅ LISTO PARA TESTING

