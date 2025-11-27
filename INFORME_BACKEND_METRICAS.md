# 🔴 ISSUE CRÍTICO: Endpoint Dashboard Métricas - Informe para Backend

**Fecha:** 2025-11-21  
**Prioridad:** ALTA  
**Módulo:** Dashboard - Métricas  
**Endpoint:** `GET /api/dashboard/metricas`

---

## 📋 RESUMEN DEL PROBLEMA

El endpoint `/api/dashboard/metricas` solo está retornando **1 columna** (`total_clientes`) cuando el stored procedure actualizado debería retornar **5 columnas**.

### Comportamiento Actual (❌ INCORRECTO):

```json
{
  "exito": true,
  "mensaje": "Métricas obtenidas correctamente",
  "datos": [
    {
      "total_clientes": 9
    }
  ]
}
```

### Comportamiento Esperado (✅ CORRECTO):

```json
{
  "exito": true,
  "mensaje": "Métricas obtenidas correctamente",
  "datos": [
    {
      "total_clientes": 9,
      "total_mascotas": 15,
      "citas_hoy": 5,
      "ingresos_periodo": 2500.0,
      "atenciones_en_curso": 2
    }
  ]
}
```

---

## 🔍 DIAGNÓSTICO

### Stored Procedure YA Fue Actualizado ✅

El SP `sp_ObtenerMetricasDashboard` **YA está corregido** en la base de datos y retorna las 5 columnas en un solo result set:

```sql
CREATE PROCEDURE `sp_ObtenerMetricasDashboard` (
    IN `p_fecha_inicio` DATE,
    IN `p_fecha_fin` DATE
)
BEGIN
    SELECT
        (SELECT COUNT(*) FROM cliente) AS total_clientes,
        (SELECT COUNT(*) FROM mascota) AS total_mascotas,
        (SELECT COUNT(*) FROM cita ...) AS citas_hoy,
        (SELECT COALESCE(SUM(total), 0) FROM factura ...) AS ingresos_periodo,
        (SELECT COUNT(*) FROM atencion ...) AS atenciones_en_curso;
END
```

### Problema: El Backend NO está Leyendo Todas las Columnas ❌

**Causa más probable:** Spring JPA con `@Query(nativeQuery=true)` tiene problemas mapeando múltiples columnas de stored procedures a `List<Map>`.

---

## 🛠️ SOLUCIONES PARA BACKEND

### OPCIÓN 1: Verificar EntityManager (RECOMENDADO) ⭐

El `@Query(nativeQuery=true)` con `CALL` puede no mapear correctamente. Usar `EntityManager` directamente:

#### Modificar `ReporteRepository.java`:

**ANTES:**

```java
@Query(value = "CALL sp_ObtenerMetricasDashboard(:fechaInicio, :fechaFin)", nativeQuery = true)
List<Map> metricasDashboard(
    @Param("fechaInicio") LocalDate fechaInicio,
    @Param("fechaFin") LocalDate fechaFin
);
```

**DESPUÉS:**

```java
// ELIMINAR el método de ReporteRepository
// Mover la lógica a DashboardService
```

#### Modificar `DashboardService.java`:

```java
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Map<String, Object>> obtenerMetricas(LocalDate fechaInicio, LocalDate fechaFin) {
        // Validaciones
        if (fechaInicio == null) {
            throw new IllegalArgumentException("Fecha inicio no puede ser nula");
        }
        if (fechaFin == null) {
            fechaFin = LocalDate.now();
        }
        if (fechaInicio.isAfter(fechaFin)) {
            throw new IllegalArgumentException("Fecha inicio debe ser anterior a fecha fin");
        }

        // Llamar al SP usando EntityManager
        Query query = entityManager.createNativeQuery(
            "CALL sp_ObtenerMetricasDashboard(:fechaInicio, :fechaFin)"
        );
        query.setParameter("fechaInicio", fechaInicio);
        query.setParameter("fechaFin", fechaFin);

        // Obtener resultado
        List<Object[]> resultList = query.getResultList();

        List<Map<String, Object>> metricas = new ArrayList<>();

        if (!resultList.isEmpty()) {
            Object[] row = resultList.get(0);

            Map<String, Object> metrica = new HashMap<>();
            metrica.put("total_clientes", ((Number) row[0]).intValue());
            metrica.put("total_mascotas", ((Number) row[1]).intValue());
            metrica.put("citas_hoy", ((Number) row[2]).intValue());
            metrica.put("ingresos_periodo", ((BigDecimal) row[3]).doubleValue());
            metrica.put("atenciones_en_curso", ((Number) row[4]).intValue());

            metricas.add(metrica);
        }

        return metricas;
    }
}
```

---

### OPCIÓN 2: Usar JdbcTemplate

Si prefieres usar JDBC directamente:

```java
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> obtenerMetricas(LocalDate fechaInicio, LocalDate fechaFin) {
        // Validaciones...

        String sql = "CALL sp_ObtenerMetricasDashboard(?, ?)";

        return jdbcTemplate.query(sql,
            new Object[]{fechaInicio, fechaFin},
            (rs, rowNum) -> {
                Map<String, Object> metrica = new HashMap<>();
                metrica.put("total_clientes", rs.getInt("total_clientes"));
                metrica.put("total_mascotas", rs.getInt("total_mascotas"));
                metrica.put("citas_hoy", rs.getInt("citas_hoy"));
                metrica.put("ingresos_periodo", rs.getBigDecimal("ingresos_periodo"));
                metrica.put("atenciones_en_curso", rs.getInt("atenciones_en_curso"));
                return metrica;
            }
        );
    }
}
```

---

### OPCIÓN 3: Crear un DTO (MEJOR PRÁCTICA) 🌟

#### Crear `MetricasDashboardDTO.java`:

```java
package com.teranvet.dto;

import java.math.BigDecimal;

public class MetricasDashboardDTO {
    private Integer totalClientes;
    private Integer totalMascotas;
    private Integer citasHoy;
    private BigDecimal ingresosPeriodo;
    private Integer atencionesEnCurso;

    // Constructor vacío
    public MetricasDashboardDTO() {}

    // Constructor con todos los campos
    public MetricasDashboardDTO(Integer totalClientes, Integer totalMascotas,
                                Integer citasHoy, BigDecimal ingresosPeriodo,
                                Integer atencionesEnCurso) {
        this.totalClientes = totalClientes;
        this.totalMascotas = totalMascotas;
        this.citasHoy = citasHoy;
        this.ingresosPeriodo = ingresosPeriodo;
        this.atencionesEnCurso = atencionesEnCurso;
    }

    // Getters y Setters
    public Integer getTotalClientes() { return totalClientes; }
    public void setTotalClientes(Integer totalClientes) { this.totalClientes = totalClientes; }

    public Integer getTotalMascotas() { return totalMascotas; }
    public void setTotalMascotas(Integer totalMascotas) { this.totalMascotas = totalMascotas; }

    public Integer getCitasHoy() { return citasHoy; }
    public void setCitasHoy(Integer citasHoy) { this.citasHoy = citasHoy; }

    public BigDecimal getIngresosPeriodo() { return ingresosPeriodo; }
    public void setIngresosPeriodo(BigDecimal ingresosPeriodo) { this.ingresosPeriodo = ingresosPeriodo; }

    public Integer getAtencionesEnCurso() { return atencionesEnCurso; }
    public void setAtencionesEnCurso(Integer atencionesEnCurso) { this.atencionesEnCurso = atencionesEnCurso; }
}
```

#### Actualizar `DashboardService.java`:

```java
public MetricasDashboardDTO obtenerMetricas(LocalDate fechaInicio, LocalDate fechaFin) {
    // Validaciones...

    String sql = "CALL sp_ObtenerMetricasDashboard(?, ?)";

    return jdbcTemplate.queryForObject(sql,
        new Object[]{fechaInicio, fechaFin},
        (rs, rowNum) -> new MetricasDashboardDTO(
            rs.getInt("total_clientes"),
            rs.getInt("total_mascotas"),
            rs.getInt("citas_hoy"),
            rs.getBigDecimal("ingresos_periodo"),
            rs.getInt("atenciones_en_curso")
        )
    );
}
```

#### Actualizar `DashboardController.java`:

```java
@GetMapping("/metricas")
public ResponseEntity<ApiResponse<MetricasDashboardDTO>> obtenerMetricas(
        @RequestParam(defaultValue = "2025-01-01") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
    try {
        LocalDate fin = fechaFin != null ? fechaFin : LocalDate.now();
        MetricasDashboardDTO metricas = dashboardService.obtenerMetricas(fechaInicio, fin);
        return ResponseEntity.ok(ApiResponse.exitoso("Métricas obtenidas correctamente", metricas));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al obtener métricas: " + e.getMessage()));
    }
}
```

---

## 🧪 CÓMO VERIFICAR EL STORED PROCEDURE

### 1. Conectarse a MySQL:

```bash
mysql -u root -p veterinaria
```

### 2. Ver el código del SP:

```sql
SHOW CREATE PROCEDURE sp_ObtenerMetricasDashboard;
```

### 3. Ejecutar manualmente:

```sql
CALL sp_ObtenerMetricasDashboard('2025-01-01', '2025-12-31');
```

**Resultado esperado:** Una sola fila con 5 columnas:

```
+----------------+----------------+-----------+------------------+---------------------+
| total_clientes | total_mascotas | citas_hoy | ingresos_periodo | atenciones_en_curso |
+----------------+----------------+-----------+------------------+---------------------+
|              9 |             15 |         5 |          2500.00 |                   2 |
+----------------+----------------+-----------+------------------+---------------------+
```

**Si ves esto ✅**, el SP está correcto y el problema está en el código Java.

**Si NO ves esto ❌**, el SP no fue actualizado correctamente.

---

## 📝 PREGUNTAS PARA EL DESARROLLADOR BACKEND

Por favor responde estas preguntas para ayudar a diagnosticar:

### 1. ¿Qué retorna el SP cuando lo ejecutas directamente en MySQL?

```sql
CALL sp_ObtenerMetricasDashboard('2025-01-01', CURDATE());
```

- [ ] Una fila con 5 columnas ✅
- [ ] Una fila con 1 columna (solo total_clientes) ❌
- [ ] Múltiples filas separadas ❌

### 2. ¿Cuál es el código actual de `ReporteRepository.metricasDashboard()`?

```java
// Pegar aquí el código completo del método
```

### 3. ¿Cuál es el código actual de `DashboardService.obtenerMetricas()`?

```java
// Pegar aquí el código completo del método
```

### 4. ¿Qué aparece en los logs del backend cuando se llama al endpoint?

```
// Pegar logs del backend
```

### 5. ¿Qué versión de Spring Boot estás usando?

- [ ] Spring Boot 2.x
- [ ] Spring Boot 3.x

### 6. ¿Estás usando Hibernate como JPA provider?

- [ ] Sí
- [ ] No (¿Cuál?)

---

## 🎯 ACCIÓN RECOMENDADA

**⭐ RECOMENDACIÓN PRINCIPAL:**

Implementar **OPCIÓN 3 (DTO + JdbcTemplate)** porque:

- ✅ Más robusto que `List<Map>`
- ✅ Type-safe (fuertemente tipado)
- ✅ Fácil de debuggear
- ✅ Evita problemas de JPA con stored procedures
- ✅ Mejor rendimiento
- ✅ Más fácil de mantener

---

## 🔗 ARCHIVOS QUE NECESITAS MODIFICAR

1. `src/main/java/com/teranvet/dto/MetricasDashboardDTO.java` ← **CREAR**
2. `src/main/java/com/teranvet/service/DashboardService.java` ← **MODIFICAR**
3. `src/main/java/com/teranvet/controller/DashboardController.java` ← **MODIFICAR**
4. `src/main/java/com/teranvet/repository/ReporteRepository.java` ← **OPCIONAL (eliminar método)**

---

## ⏱️ TIEMPO ESTIMADO

- Implementar OPCIÓN 1 (EntityManager): 15-20 min
- Implementar OPCIÓN 2 (JdbcTemplate): 10-15 min
- Implementar OPCIÓN 3 (DTO): 20-30 min ⭐ RECOMENDADO

---

## 📞 SIGUIENTE PASO

**Por favor ejecuta el SP manualmente en MySQL y compárteme:**

1. El resultado que ves (¿cuántas columnas?)
2. El código actual de `DashboardService.obtenerMetricas()`
3. Los logs del backend cuando llamas al endpoint

Con esa información podré darte la solución exacta. 🎯

---

**Preparado por:** Frontend Developer  
**Para:** Backend Developer  
**Fecha:** 2025-11-21  
**Prioridad:** ALTA - Dashboard no funcional
