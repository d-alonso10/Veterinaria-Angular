# 🎨 Referencia de Plantilla Frontend

Este documento contiene el código fuente completo de `plantilla_menu.html`. 
Esta plantilla sirve como referencia visual y estructural para la implementación de la interfaz de usuario en el framework frontend seleccionado (Angular).

## Código Completo (HTML + CSS)

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema TeranVet</title>
    <style>
        :root {
            --primary-color: #abcbd5;
            --primary-dark: #8fb6c1;
            --primary-light: #c5dce3;
            --secondary-color: #d5c4ad;
            --accent-color: #d5adc7;
            --success-color: #4CAF50;
            --warning-color: #FFC107;
            --danger-color: #F44336;
            --info-color: #2196F3;
            --text-dark: #2c3e50;
            --text-light: #5d6d7e;
            --bg-light: #f8f9fa;
            --white: #ffffff;
            --shadow: 0 8px 32px rgba(0,0,0,0.1);
            --radius: 16px;
            --gradient-primary: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
            --gradient-success: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            --gradient-warning: linear-gradient(135deg, #FFC107 0%, #ffb300 100%);
            --gradient-danger: linear-gradient(135deg, #F44336 0%, #d32f2f 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: linear-gradient(135deg, #f5f7fa 0%, var(--primary-light) 100%);
            color: var(--text-dark);
            line-height: 1.5;
            min-height: 100vh;
            overflow-x: hidden;
            font-size: 14px;
        }

        .container {
            display: flex;
            min-height: 100vh;
            overflow: hidden;
        }

        /* Sidebar Styles */
        .sidebar {
            width: 260px;
            background: var(--gradient-primary);
            color: var(--white);
            padding: 0;
            box-shadow: var(--shadow);
            position: relative;
            z-index: 10;
        }

        .logo {
            padding: 25px 20px;
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logo h1 {
            font-size: 1.6em;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .logo-icon {
            font-size: 1.8em;
        }

        .user-info {
            padding: 20px 18px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
        }

        .user-avatar {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.1em;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .user-details h3 {
            font-size: 1em;
            margin-bottom: 4px;
            font-weight: 600;
        }

        .user-details p {
            font-size: 0.8em;
            opacity: 0.9;
        }

        .menu {
            list-style: none;
            padding: 20px 0;
        }

        .menu-section {
            padding: 12px 22px;
            font-size: 0.7em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.7);
            letter-spacing: 1.2px;
            margin-top: 12px;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.05);
        }

        .menu-item {
            padding: 14px 26px;
            border-left: 4px solid transparent;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            overflow: hidden;
        }

        .menu-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.6s;
        }

        .menu-item:hover::before {
            left: 100%;
        }

        .menu-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
            border-left-color: var(--white);
            transform: translateX(5px);
        }

        .menu-item.active {
            background-color: rgba(255, 255, 255, 0.15);
            border-left-color: var(--white);
        }

        .menu-item a {
            color: var(--white);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            font-size: 0.9em;
            font-weight: 500;
        }

        .menu-icon {
            font-size: 1.2em;
            width: 22px;
            text-align: center;
        }

        /* Main Content Styles */
        .content {
            flex: 1;
            padding: 0;
            background: transparent;
            overflow-y: auto;
            min-width: 0;
        }

        .header {
            background: var(--white);
            padding: 22px 35px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--gradient-primary);
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .welcome h1 {
            font-size: 1.9em;
            color: var(--text-dark);
            margin-bottom: 6px;
            font-weight: 700;
        }

        .welcome p {
            color: var(--text-light);
            font-size: 1em;
            font-weight: 500;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .main-content {
            padding: 35px;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Botones */
        .btn {
            padding: 14px 24px;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.9em;
            position: relative;
            overflow: hidden;
            border: 1px solid transparent;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.6s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn-primary {
            background: var(--gradient-primary);
            color: var(--white);
            box-shadow: 0 6px 20px rgba(171, 203, 213, 0.25);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(171, 203, 213, 0.35);
        }

        .btn-success {
            background: var(--gradient-success);
            color: var(--white);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.25);
        }

        .btn-success:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(76, 175, 80, 0.35);
        }

        .btn-warning {
            background: var(--gradient-warning);
            color: var(--text-dark);
            box-shadow: 0 6px 20px rgba(255, 193, 7, 0.25);
        }

        .btn-warning:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 193, 7, 0.35);
        }
        
        /* Mensajes */
        .message-banner {
            padding: 12px 18px;
            border-radius: 10px;
            margin-bottom: 22px;
            font-size: 0.9em;
            font-weight: 500;
            text-align: center;
            border: 1px solid transparent;
            animation: fadeInUp 0.5s ease-out;
        }
        .message-banner.exito {
            background-color: #e6ffe6;
            border-color: #ccffcc;
            color: #006400;
        }
        .message-banner.error {
            background-color: #ffe6e6;
            border-color: #ffcccc;
            color: #c00;
        }
        .message-banner.info {
            background-color: #e6f3ff;
            border-color: #cce5ff;
            color: #0056b3;
        }

        /* Stats Container */
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 22px;
            margin: 25px 0;
        }

        .stat-card {
            background: var(--white);
            padding: 25px 22px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            text-align: center;
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--gradient-primary);
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }

        .stat-icon {
            font-size: 2.6em;
            margin-bottom: 12px;
            display: block;
        }

        .stat-number {
            font-size: 2.2em;
            font-weight: 800;
            margin: 8px 0;
            color: var(--primary-dark);
        }

        .stat-label {
            color: var(--text-light);
            font-size: 0.9em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        /* Quick Actions */
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 18px;
            margin: 25px 0;
        }

        .action-card {
            background: var(--white);
            padding: 22px;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            text-align: center;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .action-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }

        .action-icon {
            font-size: 2.2em;
            margin-bottom: 12px;
            display: block;
        }

        .action-title {
            font-size: 1em;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 8px;
        }

        .action-description {
            color: var(--text-light);
            font-size: 0.85em;
            margin-bottom: 12px;
        }
        
        .btn-small {
            padding: 10px 18px;
            font-size: 0.85em;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
            .container {
                flex-direction: column;
            }
            .sidebar {
                width: 100%;
                height: auto;
            }
            .menu {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                padding: 12px;
            }
            .menu-item {
                flex: 1 0 180px;
                justify-content: center;
            }
            .menu-section {
                display: none;
            }
        }

        @media (max-width: 768px) {
            .main-content {
                padding: 18px;
            }
            .header-top {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            .header-actions {
                width: 100%;
                justify-content: center;
            }
            .stats-container {
                grid-template-columns: repeat(2, 1fr);
            }
            .quick-actions {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 480px) {
            .header {
                padding: 18px;
            }
            .main-content {
                padding: 12px;
            }
            .btn {
                width: 100%;
                justify-content: center;
            }
            .stats-container {
                grid-template-columns: 1fr;
            }
            .quick-actions {
                grid-template-columns: 1fr;
            }
        }

        /* Animation Effects */
        .floating {
            animation: floating 3s ease-in-out infinite;
        }

        @keyframes floating {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="logo">
                <h1><span class="logo-icon">🐾</span> TeranVet</h1>
            </div>
            
            <div class="user-info">
                <div class="user-avatar">U</div>
                <div class="user-details">
                    <h3>Usuario Sistema</h3>
                    <p>Administrador</p>
                </div>
            </div>
            
            <ul class="menu">
                <div class="menu-section">Principal</div>
                <li class="menu-item active">
                    <a href="#">
                        <span class="menu-icon">📊</span>
                        <span>Dashboard</span>
                    </a>
                </li>
                
                <div class="menu-section">Gestionar</div>
                <li class="menu-item">
                    <a href="#">
                        <span class="menu-icon">👥</span>
                        <span>Clientes</span>
                    </a>
                </li>
                <li class="menu-item">
                    <a href="#">
                        <span class="menu-icon">🐾</span>
                        <span>Mascotas</span>
                    </a>
                </li>
                <li class="menu-item">
                    <a href="#">
                        <span class="menu-icon">📅</span>
                        <span>Citas</span>
                    </a>
                </li>
                <li class="menu-item">
                    <a href="#">
                        <span class="menu-icon">💳</span>
                        <span>Pagos</span>
                    </a>
                </li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="header">
                <div class="header-top">
                    <div class="welcome">
                        <h1>📊 Dashboard Principal</h1>
                        <p>Resumen completo del sistema - <span id="current-time-placeholder">Cargando fecha...</span></p>
                    </div>
                    <div class="header-actions">
                        <a href="#" class="btn btn-success">➕ Nueva Cita</a>
                        <a href="#" class="btn btn-primary">👤 Agregar Cliente</a>
                    </div>
                </div>
            </div>

            <div class="main-content">
                
                <!-- Mensajes -->
                <div class="message-banner exito">
                    Operación completada exitosamente
                </div>
                
                <!-- Estadísticas -->
                <div class="stats-container">
                    
                    <div class="stat-card floating">
                        <span class="stat-icon">📅</span>
                        <div class="stat-number">12</div>
                        <div class="stat-label">Citas del Día</div>
                    </div>
                    
                    <div class="stat-card floating" style="animation-delay: 0.2s;">
                        <span class="stat-icon">⚡</span>
                        <div class="stat-number">5</div>
                        <div class="stat-label">Atenciones en Curso</div>
                    </div>
                    
                    <div class="stat-card floating" style="animation-delay: 0.4s;">
                        <span class="stat-icon">💰</span>
                        <div class="stat-number">S/ 1,250.00</div>
                        <div class="stat-label">Ingresos del Día</div>
                    </div>
                    
                    <div class="stat-card floating" style="animation-delay: 0.6s;">
                        <span class="stat-icon">👥</span>
                        <div class="stat-number">156</div>
                        <div class="stat-label">Total Clientes</div>
                    </div>
                </div>

                <!-- Acciones Rápidas -->
                <div class="quick-actions">
                    <div class="action-card">
                        <span class="action-icon">📅</span>
                        <div class="action-title">Agendar Cita</div>
                        <div class="action-description">Programar nueva cita para cliente</div>
                        <a href="#" class="btn btn-primary btn-small">Acceder</a>
                    </div>
                    <div class="action-card">
                        <span class="action-icon">👤</span>
                        <div class="action-title">Nuevo Cliente</div>
                        <div class="action-description">Registrar nuevo cliente en el sistema</div>
                        <a href="#" class="btn btn-success btn-small">Registrar</a>
                    </div>
                    <div class="action-card">
                        <span class="action-icon">🐾</span>
                        <div class="action-title">Registrar Mascota</div>
                        <div class="action-description">Agregar mascota a cliente existente</div>
                        <a href="#" class="btn btn-info btn-small">Gestionar</a>
                    </div>
                    <div class="action-card">
                        <span class="action-icon">💳</span>
                        <div class="action-title">Registrar Pago</div>
                        <div class="action-description">Procesar pago de servicios</div>
                        <a href="#" class="btn btn-warning btn-small">Pagar</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Actualizar hora en tiempo real
            const timePlaceholder = document.getElementById('current-time-placeholder');
            function updateTime() {
                const now = new Date();
                const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                };
                let dateString = now.toLocaleDateString('es-ES', options);
                dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
                if(timePlaceholder) {
                    timePlaceholder.textContent = dateString;
                }
            }
            
            updateTime();
            setInterval(updateTime, 60000);
        });
    </script>
</body>
</html>
```
