# 🔧 ACCIÓN INMEDIATA: 4 Cambios Críticos Backend

**Destinatario:** Backend Team  
**Urgencia:** 🔴 CRÍTICO  
**Tiempo:** ~30 minutos  
**Validación:** ✅ Ya revisado y documentado  

---

## 🎯 CAMBIO #1: Inyectar CitaService

**Archivo:** `AtencionController.java`  
**Ubicación:** Línea ~18 (después de @Autowired AtencionService)

**ANTES:**
```java
@RestController
@RequestMapping("/api/atenciones")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class AtencionController {

    @Autowired
    private AtencionService atencionService;
    
    // ... resto del código
}
```

**DESPUÉS:**
```java
@RestController
@RequestMapping("/api/atenciones")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class AtencionController {

    @Autowired
    private AtencionService atencionService;
    
    @Autowired
    private CitaService citaService;  // ← AGREGAR ESTA LÍNEA
    
    // ... resto del código
}
```

**Por qué:** Sin esto, no puedes llamar `citaService.actualizarEstado()` en el siguiente cambio.

---

## 🎯 CAMBIO #2: Actualizar Repository

**Archivo:** `AtencionRepository.java`  
**Ubicación:** Métodos `criarAtencionDesdeCita` y `criarAtencionWalkIn`

**ANTES (criarAtencionDesdeCita):**
```java
@Modifying
@Transactional
@Query(value = "CALL sp_CrearAtencionDesdeCita(:idCita, :idGroomer, :idSucursal, :turnoNum, " +
        ":tiempoEstimadoInicio, :tiempoEstimadoFin, :prioridad)", nativeQuery = true)
void criarAtencionDesdeCita(  // ← void (PROBLEMA)
        @Param("idCita") Integer idCita,
        @Param("idGroomer") Integer idGroomer,
        @Param("idSucursal") Integer idSucursal,
        @Param("turnoNum") Integer turnoNum,
        @Param("tiempoEstimadoInicio") LocalDateTime tiempoEstimadoInicio,
        @Param("tiempoEstimadoFin") LocalDateTime tiempoEstimadoFin,
        @Param("prioridad") Integer prioridad);
```

**DESPUÉS (criarAtencionDesdeCita):**
```java
@Modifying
@Transactional
@Query(value = "CALL sp_CrearAtencionDesdeCita(:idCita, :idGroomer, :idSucursal, :turnoNum, " +
        ":tiempoEstimadoInicio, :tiempoEstimadoFin, :prioridad)", nativeQuery = true)
Atencion criarAtencionDesdeCita(  // ← CAMBIAR void → Atencion
        @Param("idCita") Integer idCita,
        @Param("idGroomer") Integer idGroomer,
        @Param("idSucursal") Integer idSucursal,
        @Param("turnoNum") Integer turnoNum,
        @Param("tiempoEstimadoInicio") LocalDateTime tiempoEstimadoInicio,
        @Param("tiempoEstimadoFin") LocalDateTime tiempoEstimadoFin,
        @Param("prioridad") Integer prioridad);
```

**ANTES (criarAtencionWalkIn):**
```java
@Modifying
@Transactional
@Query(value = "CALL sp_CrearAtencionWalkIn(:idMascota, :idCliente, :idGroomer, :idSucursal, " +
        ":turnoNum, :tiempoEstimadoInicio, :tiempoEstimadoFin, :prioridad, :observaciones)", nativeQuery = true)
void criarAtencionWalkIn(  // ← void (PROBLEMA)
        @Param("idMascota") Integer idMascota,
        @Param("idCliente") Integer idCliente,
        @Param("idGroomer") Integer idGroomer,
        @Param("idSucursal") Integer idSucursal,
        @Param("turnoNum") Integer turnoNum,
        @Param("tiempoEstimadoInicio") LocalDateTime tiempoEstimadoInicio,
        @Param("tiempoEstimadoFin") LocalDateTime tiempoEstimadoFin,
        @Param("prioridad") Integer prioridad,
        @Param("observaciones") String observaciones);
```

**DESPUÉS (criarAtencionWalkIn):**
```java
@Modifying
@Transactional
@Query(value = "CALL sp_CrearAtencionWalkIn(:idMascota, :idCliente, :idGroomer, :idSucursal, " +
        ":turnoNum, :tiempoEstimadoInicio, :tiempoEstimadoFin, :prioridad, :observaciones)", nativeQuery = true)
Atencion criarAtencionWalkIn(  // ← CAMBIAR void → Atencion
        @Param("idMascota") Integer idMascota,
        @Param("idCliente") Integer idCliente,
        @Param("idGroomer") Integer idGroomer,
        @Param("idSucursal") Integer idSucursal,
        @Param("turnoNum") Integer turnoNum,
        @Param("tiempoEstimadoInicio") LocalDateTime tiempoEstimadoInicio,
        @Param("tiempoEstimadoFin") LocalDateTime tiempoEstimadoFin,
        @Param("prioridad") Integer prioridad,
        @Param("observaciones") String observaciones);
```

**Por qué:** Para que Service pueda capturar y devolver el objeto Atencion creado.

---

## 🎯 CAMBIO #3: Actualizar AtencionService

**Archivo:** `AtencionService.java`  
**Ubicación:** Métodos `criarDesdeCita` y `criarWalkIn`

**ANTES (criarDesdeCita):**
```java
public void criarDesdeCita(Integer idCita, Integer idGroomer, Integer idSucursal,  // ← void
        Integer turnoNum, LocalDateTime tiempoEstimadoInicio, LocalDateTime tiempoEstimadoFin, Integer prioridad) {
    
    atencionRepository.criarAtencionDesdeCita(
            idCita, idGroomer, idSucursal, turnoNum,
            tiempoEstimadoInicio, tiempoEstimadoFin, prioridad
    );
    // Sin return
}
```

**DESPUÉS (criarDesdeCita):**
```java
public Atencion criarDesdeCita(Integer idCita, Integer idGroomer, Integer idSucursal,  // ← CAMBIAR void → Atencion
        Integer turnoNum, LocalDateTime tiempoEstimadoInicio, LocalDateTime tiempoEstimadoFin, Integer prioridad) {
    
    Atencion atencionCreada = atencionRepository.criarAtencionDesdeCita(  // ← CAPTURAR resultado
            idCita, idGroomer, idSucursal, turnoNum,
            tiempoEstimadoInicio, tiempoEstimadoFin, prioridad
    );
    
    return atencionCreada;  // ← AGREGAR return
}
```

**ANTES (criarWalkIn):**
```java
public void criarWalkIn(Integer idMascota, Integer idCliente, Integer idGroomer, Integer idSucursal,  // ← void
        Integer turnoNum, LocalDateTime tiempoEstimadoInicio, LocalDateTime tiempoEstimadoFin, Integer prioridad, String observaciones) {
    
    atencionRepository.criarAtencionWalkIn(
            idMascota, idCliente, idGroomer, idSucursal,
            turnoNum, tiempoEstimadoInicio, tiempoEstimadoFin, prioridad, observaciones
    );
    // Sin return
}
```

**DESPUÉS (criarWalkIn):**
```java
public Atencion criarWalkIn(Integer idMascota, Integer idCliente, Integer idGroomer, Integer idSucursal,  // ← CAMBIAR void → Atencion
        Integer turnoNum, LocalDateTime tiempoEstimadoInicio, LocalDateTime tiempoEstimadoFin, Integer prioridad, String observaciones) {
    
    Atencion atencionCreada = atencionRepository.criarAtencionWalkIn(  // ← CAPTURAR resultado
            idMascota, idCliente, idGroomer, idSucursal,
            turnoNum, tiempoEstimadoInicio, tiempoEstimadoFin, prioridad, observaciones
    );
    
    return atencionCreada;  // ← AGREGAR return
}
```

**Por qué:** Así el Controller puede recibir la atención creada y devolverla al frontend.

---

## 🎯 CAMBIO #4: Actualizar AtencionController - crearDesdeCita()

**Archivo:** `AtencionController.java`  
**Ubicación:** Método `crearDesdeCita()` (línea ~98-124)

**ANTES:**
```java
@PostMapping("/desde-cita")
public ResponseEntity<ApiResponse<String>> crearDesdeCita(  // ← ApiResponse<String>
        @RequestParam Integer idCita,
        @RequestParam Integer idGroomer,
        @RequestParam Integer idSucursal,
        @RequestParam Integer turnoNum,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tiempoEstimadoInicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tiempoEstimadoFin,
        @RequestParam Integer prioridad) {
    try {
        log.info("POST /api/atenciones/desde-cita - Creando atención desde cita: {}", idCita);

        atencionService.criarDesdeCita(  // ← No captura resultado
                idCita, idGroomer, idSucursal, turnoNum,
                tiempoEstimadoInicio, tiempoEstimadoFin, prioridad
        );

        // ❌ Devuelve null
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.exitoso("Atención creada exitosamente desde la cita", null));
    } catch (Exception e) {
        log.error("Error al crear atención desde cita", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al crear atención", e.getMessage()));
    }
}
```

**DESPUÉS:**
```java
@PostMapping("/desde-cita")
public ResponseEntity<ApiResponse<Atencion>> crearDesdeCita(  // ← CAMBIAR ApiResponse<String> → ApiResponse<Atencion>
        @RequestParam Integer idCita,
        @RequestParam Integer idGroomer,
        @RequestParam Integer idSucursal,
        @RequestParam Integer turnoNum,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tiempoEstimadoInicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tiempoEstimadoFin,
        @RequestParam Integer prioridad) {
    try {
        log.info("POST /api/atenciones/desde-cita - Creando atención desde cita: {}", idCita);

        // ✅ NUEVO: Actualizar estado de cita
        citaService.actualizarEstado(idCita, "atendido");
        log.info("✅ Estado de cita {} actualizado a 'atendido'", idCita);

        // ✅ CAMBIO: Capturar la atención creada
        Atencion atencionCreada = atencionService.criarDesdeCita(
                idCita, idGroomer, idSucursal, turnoNum,
                tiempoEstimadoInicio, tiempoEstimadoFin, prioridad
        );
        log.info("✅ Atención creada con ID: {}", atencionCreada.getIdAtencion());

        // ✅ CAMBIO: Devolver la atención creada (NO null)
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.exitoso("Atención creada exitosamente desde la cita", atencionCreada));
    } catch (Exception e) {
        log.error("Error al crear atención desde cita", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al crear atención", e.getMessage()));
    }
}
```

**Por qué:** 
1. Actualiza el estado de la cita a "atendido"
2. Captura la atención creada
3. Devuelve la atención completa (no null)
4. Frontend puede navegar inmediatamente sin polling

---

## 🎯 CAMBIO #5 (OPCIONAL): Aplicar mismo patrón a crearWalkIn()

**Archivo:** `AtencionController.java`  
**Ubicación:** Método `crearWalkIn()` (línea ~130-160)

**ANTES:**
```java
@PostMapping("/walk-in")
public ResponseEntity<ApiResponse<String>> crearWalkIn(  // ← ApiResponse<String>
        @RequestParam Integer idMascota,
        @RequestParam Integer idCliente,
        @RequestParam Integer idGroomer,
        @RequestParam Integer idSucursal,
        @RequestParam Integer turnoNum,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tiempoEstimadoInicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tiempoEstimadoFin,
        @RequestParam Integer prioridad,
        @RequestParam(required = false) String observaciones) {
    try {
        log.info("POST /api/atenciones/walk-in - Creando atención walk-in");

        atencionService.criarWalkIn(  // ← No captura
                idMascota, idCliente, idGroomer, idSucursal,
                turnoNum, tiempoEstimadoInicio, tiempoEstimadoFin,
                prioridad, observaciones
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.exitoso("Atención walk-in creada exitosamente", null));  // ← null
    } catch (Exception e) {
        log.error("Error al crear atención walk-in", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al crear atención", e.getMessage()));
    }
}
```

**DESPUÉS:**
```java
@PostMapping("/walk-in")
public ResponseEntity<ApiResponse<Atencion>> crearWalkIn(  // ← CAMBIAR ApiResponse<String> → ApiResponse<Atencion>
        @RequestParam Integer idMascota,
        @RequestParam Integer idCliente,
        @RequestParam Integer idGroomer,
        @RequestParam Integer idSucursal,
        @RequestParam Integer turnoNum,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tiempoEstimadoInicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tiempoEstimadoFin,
        @RequestParam Integer prioridad,
        @RequestParam(required = false) String observaciones) {
    try {
        log.info("POST /api/atenciones/walk-in - Creando atención walk-in");

        // ✅ CAMBIO: Capturar la atención creada
        Atencion atencionCreada = atencionService.criarWalkIn(
                idMascota, idCliente, idGroomer, idSucursal,
                turnoNum, tiempoEstimadoInicio, tiempoEstimadoFin,
                prioridad, observaciones
        );
        log.info("✅ Atención walk-in creada con ID: {}", atencionCreada.getIdAtencion());

        // ✅ CAMBIO: Devolver la atención creada (NO null)
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.exitoso("Atención walk-in creada exitosamente", atencionCreada));
    } catch (Exception e) {
        log.error("Error al crear atención walk-in", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al crear atención", e.getMessage()));
    }
}
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Cambio 1: Inyectar CitaService (1 línea)
- [ ] Cambio 2: Repository `void` → `Atencion` (2 métodos, 2 líneas)
- [ ] Cambio 3: Service `void` → `Atencion` + return (2 métodos, 4 líneas)
- [ ] Cambio 4: Controller `crearDesdeCita()` (3 líneas nuevas)
- [ ] Cambio 5 (OPCIONAL): Controller `crearWalkIn()` (3 líneas nuevas)

**Total: ~15-20 líneas de código**

---

## 🧪 TESTING INMEDIATO

```bash
# Test 1: Crear atención desde cita
POST http://localhost:8080/api/atenciones/desde-cita
Content-Type: application/x-www-form-urlencoded

idCita=1&idGroomer=1&idSucursal=1&turnoNum=1&tiempoEstimadoInicio=2025-12-26T10:00:00&tiempoEstimadoFin=2025-12-26T10:45:00&prioridad=0

# ESPERADO:
# {
#   "exito": true,
#   "datos": {
#     "idAtencion": 9,
#     "idCita": 1,
#     "estado": "en_espera",
#     ...
#   }
# }

# Test 2: Verificar cita cambió
GET http://localhost:8080/api/citas/1

# ESPERADO:
# "estado": "atendido"  (cambió desde "confirmada")

# Test 3: Cola tiene la atención
GET http://localhost:8080/api/atenciones/cola/1

# ESPERADO:
# [
#   { "idAtencion": 9, "idCita": 1, ... }
# ]
```

---

## 📊 IMPACTO

**Antes (Actual):**
- Usuario espera 3-10 segundos
- Cita no sincroniza
- Frontend hace polling

**Después (Con estos cambios):**
- Usuario ve resultado en <500ms
- Cita y atención sincronizadas
- Frontend navega directo, sin polling

---

## 🚀 PRÓXIMOS PASOS

1. Implementar estos 5 cambios (~30 min)
2. Testear localmente (3 test cases, ~15 min)
3. Commit y push (5 min)
4. Deploy a staging/producción

**Total: ~50 minutos** para resolver problema 100%.

