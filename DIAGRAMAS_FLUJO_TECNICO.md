# 📊 DIAGRAMAS TÉCNICOS DEL FLUJO

## 1. DIAGRAMA DE SECUENCIA: CREAR ATENCIÓN

```
Usuario                 Frontend             Backend                BD
  |                        |                   |                     |
  |--"Crear Atención"----->|                   |                     |
  |                        |                   |                     |
  |                        |--POST/atenciones--|                     |
  |                        |  /desde-cita      |                     |
  |                        |(form-urlencoded) |                     |
  |                        |                   |--INSERT atención--->|
  |                        |                   |                     |
  |                        |                   |<--Success-----------|
  |                        |<--JSON response---|                     |
  |                        |                   |                     |
  |                  [Wait 500ms]              |                     |
  |                        |                   |                     |
  |                        |--GET /atenciones--|                     |
  |                        |  /cola/1          |                     |
  |                        |                   |--SELECT atenciones->|
  |                        |                   |<--Data------------|
  |                        |<--JSON array------|                     |
  |                        |                   |                     |
  |                   [Search by idCita]       |                     |
  |                        |                   |                     |
  |<--Redirect to----------|                   |                     |
  | /atenciones/{id}/atender                   |                     |
  |                        |                   |                     |
```

---

## 2. DIAGRAMA DE FLUJO: CREAR ATENCIÓN (PSEUDOCÓDIGO)

```
function crearAtencion() {
  
  // VALIDACIÓN
  if (!formulario.valido()) {
    mostrarError("Completa todos los campos");
    return;
  }
  
  // RECOPILACIÓN DE DATOS
  params = {
    idCita: formulario.idCita,
    idGroomer: formulario.idGroomer,
    idSucursal: formulario.idSucursal,
    turnoNum: formulario.turnoNum,
    tiempoEstimadoInicio: ahora(),
    tiempoEstimadoFin: ahora() + 90min,
    prioridad: formulario.prioridad
  }
  
  // LLAMADA AL BACKEND
  try {
    respuesta = POST /atenciones/desde-cita(params)
      header: Content-Type: application/x-www-form-urlencoded
      body: idCita=15&idGroomer=1&...
    
    if (respuesta.exito) {
      mostrarMensaje("Atención creada");
    }
  } catch (error) {
    mostrarError("Error al crear");
    return;
  }
  
  // ESPERAR A QUE SE PERSISTA EN BD
  esperar(500ms)
  
  // BUSCAR LA ATENCIÓN CREADA
  try {
    cola = GET /atenciones/cola/sucursal
    
    // Buscar por idCita para asegurar que es la correcta
    atencion = cola.buscar(a => a.cita.idCita === params.idCita)
    
    if (!atencion) {
      atencion = cola[última]  // Fallback
    }
  } catch (error) {
    ir_a("/atenciones")
    return;
  }
  
  // REDIRECCIONAR
  ir_a("/atenciones/" + atencion.idAtencion + "/atender")
}
```

---

## 3. ESTRUCTURA DE DATOS: ATENCIÓN

```typescript
interface IAtencion {
  idAtencion: number;
  
  cita: {
    idCita: number;
    nombreMascota: string;
    nombreCliente: string;
    nombreServicio: string;
    fechaProgramada: string;
    estado: 'reservada' | 'confirmada' | 'atendido' | 'cancelada';
    modalidad: 'presencial' | 'virtual';
  };
  
  mascota: {
    idMascota: number;
    nombre: string;
    especie: 'perro' | 'gato' | 'otro';
    raza: string;
    sexo: 'macho' | 'hembra';
    fechaNacimiento: string;
  };
  
  cliente: {
    idCliente: number;
    nombre: string;
    apellido: string;
    dniRuc: string;
    email: string;
    telefono: string;
    direccion: string;
  };
  
  groomer: {
    idGroomer: number;
    nombre: string;
    especialidades: string[];
  };
  
  sucursal: {
    idSucursal: number;
    nombre: string;
  };
  
  estado: 'en_espera' | 'en_servicio' | 'terminado';
  turnoNum: number;
  tiempoEstimadoInicio: string;  // ISO 8601
  tiempoEstimadoFin: string;     // ISO 8601
  tiempoRealInicio: string | null;
  tiempoRealFin: string | null;
  prioridad: 1 | 2 | 3 | 4 | 5;
  observaciones: string;
  createdAt: string;
  updatedAt: string;
}

interface DetalleServicio {
  idDetalle: number;
  servicio: {
    idServicio: number;
    nombre: string;
    precioBase: number;
  };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;  // cantidad × precioUnitario
  observaciones: string;
  createdAt: string;
}
```

---

## 4. FLUJO DE ESTADOS

```
ESTADO DE CITA
==============

   ┌─────────┐
   │Reservada│  ← Initial (User reserves)
   └────┬────┘
        │ User clicks "Crear Atención"
        ↓
   ┌─────────────┐
   │  Atendido   │  ← Changed after creating attention
   └─────────────┘


ESTADO DE ATENCIÓN
==================

   ┌──────────┐
   │En Espera │  ← Initial (Just created)
   └────┬─────┘
        │ User clicks "Iniciar Servicio"
        ↓
   ┌──────────────┐
   │  En Servicio │  ← Groomer is working
   └────┬─────────┘
        │ User clicks "Terminar Atención"
        ↓
   ┌──────────┐
   │Terminado │  ← Ready for billing
   └──────────┘


ESTADO DE FACTURA
=================

   ┌──────────┐
   │ Emitida  │  ← Initial (Just created)
   └────┬─────┘
        │ Payment registered
        ↓
   ┌──────────┐
   │  Pagada  │  ← Fully paid
   └──────────┘
        │
        ├─ OR (Partial)
        │
        └─ Partial payment → Check payment history
```

---

## 5. MAPEO DE COMPONENTES A RUTAS

```
┌─────────────────────────────────────────────────────────┐
│              ROUTER MAPPING                             │
└─────────────────────────────────────────────────────────┘

/appointments
    ↓
appointment-list.component.ts
    ├─ Muestra: Lista de citas
    ├─ Métodos: loadCitas(), crearAtencion()
    └─ Acción: Click "Crear Atención" → navigate(['/atenciones/nueva'])

/atenciones/nueva
    ↓
crear-atencion.component.ts
    ├─ Muestra: Formulario de creación
    ├─ Métodos: loadInitialData(), onSubmit()
    └─ Acción: Click "Crear" → createFromAppointment() 
                             → navigate(['/atenciones/{id}/atender'])

/atenciones/:id/atender
    ↓
atender.component.ts
    ├─ Muestra: Pantalla de servicios
    ├─ Métodos: cargarDatos(), agregarServicio(), terminarAtencion()
    └─ Acción: Click "Terminar" → finishAttention() 
                               → navigate(['/billing'])

/billing
    ↓
billing.component.ts
    ├─ Muestra: Facturación y totales
    ├─ Métodos: cargarFactura(), generarFactura()
    └─ Acción: Click "Siguiente" → navigate(['/payments/{id}'])

/payments/:id
    ↓
payment.component.ts
    ├─ Muestra: Formulario de pagos
    ├─ Métodos: registrarPago(), validarMonto()
    └─ Acción: Click "Pagar" → registrarPago() ✅
```

---

## 6. ARQUITECTURA: API CALLS

```
┌──────────────────────────────────────────┐
│     CLIENTE (Angular Component)          │
└──────────────────────────────────────────┘
                    │
                    ↓
┌──────────────────────────────────────────┐
│         Services Layer                   │
│                                          │
│  ├─ AttentionService                    │
│  │  ├─ createFromAppointment()          │
│  │  ├─ getCola()                        │
│  │  ├─ getById()                        │
│  │  ├─ finishAttention()                │
│  │  └─ addService()                     │
│  │                                      │
│  ├─ ServiceService                     │
│  │  └─ getServices()                   │
│  │                                      │
│  ├─ BillingService                     │
│  │  ├─ createFactura()                 │
│  │  └─ getById()                       │
│  │                                      │
│  └─ PaymentService                     │
│     └─ registrarPago()                 │
└──────────────────────────────────────────┘
                    │
                    ↓
┌──────────────────────────────────────────┐
│      ApiService (HTTP Layer)             │
│                                          │
│  ├─ get<T>(): Observable<ApiResponse>   │
│  ├─ post<T>(): Observable<ApiResponse>  │
│  ├─ postFormUrlEncoded<T>(): ⭐ NUEVO  │
│  ├─ put<T>(): Observable<ApiResponse>   │
│  └─ delete<T>(): Observable<ApiResponse>│
└──────────────────────────────────────────┘
                    │
                    ↓
┌──────────────────────────────────────────┐
│    HttpClient (Angular Built-in)        │
│                                          │
│  ├─ Headers (JSON, form-urlencoded)    │
│  ├─ HttpParams                         │
│  └─ Error Handling                     │
└──────────────────────────────────────────┘
                    │
                    ↓
         ┌──────────────────┐
         │  Backend (API)   │
         │  Port: 8080      │
         └──────────────────┘
```

---

## 7. FLUJO DE PARÁMETROS: POST Form-UrlEncoded

```
┌─────────────────────────────────────────────┐
│  JAVASCRIPT OBJECT (TypeScript)             │
├─────────────────────────────────────────────┤
│ {                                           │
│   idCita: 15,                              │
│   idGroomer: 1,                            │
│   idSucursal: 1,                           │
│   turnoNum: 847,                           │
│   tiempoEstimadoInicio: "2025-11-26T...",  │
│   tiempoEstimadoFin: "2025-11-26T...",     │
│   prioridad: 3                             │
│ }                                           │
└────────────────┬────────────────────────────┘
                 │ HttpParams.set()
                 ↓
┌─────────────────────────────────────────────┐
│  ANGULAR HttpParams                         │
├─────────────────────────────────────────────┤
│ HttpParams {                                │
│   "idCita" → "15",                         │
│   "idGroomer" → "1",                       │
│   "idSucursal" → "1",                      │
│   "turnoNum" → "847",                      │
│   "tiempoEstimadoInicio" → "2025-11-...",  │
│   "tiempoEstimadoFin" → "2025-11-...",     │
│   "prioridad" → "3"                        │
│ }                                           │
└────────────────┬────────────────────────────┘
                 │ .toString()
                 ↓
┌─────────────────────────────────────────────┐
│  FORM-URLENCODED STRING                     │
├─────────────────────────────────────────────┤
│ idCita=15&idGroomer=1&idSucursal=1&         │
│ turnoNum=847&                              │
│ tiempoEstimadoInicio=2025-11-26T14:30:00Z& │
│ tiempoEstimadoFin=2025-11-26T16:00:00Z&    │
│ prioridad=3                                 │
└────────────────┬────────────────────────────┘
                 │ HTTP POST Body
                 ↓
         ┌──────────────────┐
         │  Backend API     │
         │  Recibe parámetros
         │  en Query String │
         └──────────────────┘
```

---

## 8. TABLA COMPARATIVA: ANTES vs DESPUÉS

```
╔════════════════════════════════════════════════════════════════╗
║              CAMBIOS REALIZADOS                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ ASPECTO              │ ANTES          │ DESPUÉS                ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Endpoint Atenciones  │ /api/...       │ /...                 ║
║                      │ ❌             │ ✅                   ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Endpoint Servicios   │ /api/servicios │ /servicios           ║
║                      │ ❌             │ ✅                   ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Format POST Atención │ JSON           │ form-urlencoded      ║
║                      │ ❌             │ ✅                   ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Format POST Factura  │ JSON           │ form-urlencoded      ║
║                      │ ❌             │ ✅                   ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Format POST Pago     │ JSON           │ form-urlencoded      ║
║                      │ ❌             │ ✅                   ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Redirección Post     │ /atenciones    │ /atenciones/{id}/    ║
║ Crear Atención       │ ❌             │ atender ✅           ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Método POST Formato  │ No existe      │ postFormUrlEncoded() ║
║ UrlEncoded           │ ❌             │ ✅                   ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Servicios Dropdown   │ Vacío          │ Cargado con 14       ║
║                      │ ❌             │ servicios ✅         ║
╠──────────────────────┼────────────────┼──────────────────────╣
║ Cola de Atenciones   │ Vacía          │ Con atenciones       ║
║                      │ ❌             │ creadas ✅           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 9. DIAGRAMA DE CLASES: RELACIONES

```
┌─────────────────────────────┐
│   AppointmentService        │
├─────────────────────────────┤
│ - getAll(): Observable      │
│ - confirm(id): Observable   │
│ - cancel(id): Observable    │
└────────────┬────────────────┘
             │
             └─→ Usa: ApiService
                        │
                        ├→ CrearAtencionComponent


┌─────────────────────────────┐
│   AttentionService          │
├─────────────────────────────┤
│ - createFromAppointment():  │
│ - getCola():                │
│ - getById():                │
│ - addService():             │
│ - finishAttention():        │
└────────────┬────────────────┘
             │
             └─→ Usa: ApiService
                        │
                        ├→ CrearAtencionComponent
                        ├→ AtenderComponent


┌─────────────────────────────┐
│   ServiceService            │
├─────────────────────────────┤
│ - getServices():            │
│ - getById(id):              │
│ - search(term):             │
└────────────┬────────────────┘
             │
             └─→ Usa: ApiService
                        │
                        └─→ AtenderComponent


┌─────────────────────────────┐
│   BillingService            │
├─────────────────────────────┤
│ - createFactura():          │
│ - getById(id):              │
│ - getByCliente(id):         │
└────────────┬────────────────┘
             │
             └─→ Usa: ApiService
                        │
                        └─→ BillingComponent


┌─────────────────────────────┐
│   PaymentService            │
├─────────────────────────────┤
│ - registrarPago():          │
│ - getById(id):              │
│ - getByFactura(id):         │
└────────────┬────────────────┘
             │
             └─→ Usa: ApiService
                        │
                        └─→ PaymentComponent
```

---

## 10. LÍNEA DE TIEMPO: EJECUCIÓN

```
T=0ms       Usuario hace click en "Crear Atención"
            ↓ LoadInitialData()
            
T=50ms      GET /citas → Cargando citas
            GET /groomers → Cargando groomers
            
T=200ms     ✅ Citas y groomers cargados
            ✅ Formulario visible
            
T=500ms     Usuario completa formulario
            Click en "Crear Atención"
            ↓ onSubmit()
            
T=550ms     POST /atenciones/desde-cita
            (enviando form-urlencoded)
            
T=600ms     Backend procesa
            Backend inserta en BD
            
T=650ms     Respuesta exitosa
            Mostrar notificación
            
T=700ms     setTimeout(500ms) iniciado
            
T=1200ms    ⏱️ 500ms pasaron
            Ejecutar callback
            ↓ GET /atenciones/cola/1
            
T=1250ms    Backend devuelve cola
            
T=1300ms    Frontend busca por idCita
            ✅ Encontrada: idAtencion=42
            
T=1350ms    router.navigate(['/atenciones/42/atender'])
            
T=1400ms    ✅ Angular renderiza AtenderComponent
            ↓ cargarDatos()
            
T=1450ms    GET /atenciones/42
            GET /servicios
            
T=1550ms    ✅ Datos de atención cargados
            ✅ Servicios cargados (14 servicios)
            
T=1600ms    ✅ PANTALLA DE SERVICIOS VISIBLE
            Usuario puede agregar servicios
```

---

**Documento de diagramas técnicos**  
**Complemento del: INFORME_FLUJO_ATENCION_COMPLETO.md**
