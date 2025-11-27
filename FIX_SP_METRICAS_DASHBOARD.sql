-- ============================================
-- FIX: sp_ObtenerMetricasDashboard
-- ============================================
-- PROBLEMA: El SP original retorna 5 result sets separados
-- SOLUCIÓN: Retornar un solo SELECT con todas las métricas
-- ============================================

DROP PROCEDURE IF EXISTS `sp_ObtenerMetricasDashboard`;

DELIMITER $$

CREATE PROCEDURE `sp_ObtenerMetricasDashboard` (
    IN `p_fecha_inicio` DATE,
    IN `p_fecha_fin` DATE
)
BEGIN
    -- Retornar TODAS las métricas en UN SOLO result set
    SELECT
        -- Total de clientes
        (SELECT COUNT(*) FROM cliente) AS total_clientes,

        -- Total de mascotas
        (SELECT COUNT(*) FROM mascota) AS total_mascotas,

        -- Citas del día (usa las fechas de parámetro o CURDATE)
        (SELECT COUNT(*)
         FROM cita
         WHERE DATE(fecha_programada) BETWEEN COALESCE(p_fecha_inicio, CURDATE())
                                          AND COALESCE(p_fecha_fin, CURDATE())
         AND estado IN ('reservada','confirmada')) AS citas_hoy,

        -- Ingresos del período (usa las fechas de parámetro)
        (SELECT COALESCE(SUM(total), 0)
         FROM factura
         WHERE estado IN ('emitida', 'pagada')
         AND DATE(fecha_emision) BETWEEN COALESCE(p_fecha_inicio, DATE(DATE_SUB(NOW(), INTERVAL 30 DAY)))
                                    AND COALESCE(p_fecha_fin, CURDATE())) AS ingresos_periodo,

        -- Atenciones en curso
        (SELECT COUNT(*)
         FROM atencion
         WHERE estado IN ('en_espera','en_servicio')) AS atenciones_en_curso;
END$$

DELIMITER ;

-- ============================================
-- INSTRUCCIONES DE USO:
-- ============================================
-- 1. Ejecuta este script en tu base de datos MySQL
-- 2. Verifica que se creó correctamente:
--    SHOW CREATE PROCEDURE sp_ObtenerMetricasDashboard;
-- 3. Prueba el SP:
--    CALL sp_ObtenerMetricasDashboard('2025-01-01', '2025-12-31');
-- 4. Deberías ver UN SOLO result set con 5 columnas
-- ============================================

-- PRUEBA RÁPIDA:
-- CALL sp_ObtenerMetricasDashboard('2025-01-01', CURDATE());
