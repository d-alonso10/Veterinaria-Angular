# 📋 Guía de Pruebas - Módulo Mascotas

## BASE URL

```
http://localhost:8080/api/mascotas
```

---

## 1️⃣ Listar Todas las Mascotas

**Endpoint:** `GET /api/mascotas`

**Request:**

```http
GET http://localhost:8080/api/mascotas
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Mascotas obtenidas exitosamente",
  "datos": [
    {
      "idMascota": 1,
      "nombre": "Firulais",
      "especie": "perro",
      "raza": "Golden Retriever",
      "sexo": "macho",
      "fechaNacimiento": "2020-05-15",
      "cliente": {
        "idCliente": 1,
        "nombre": "Ricardo",
        "apellido": "Alvarez",
        "email": "ricardo.alvarez@mail.com",
        "telefono": "987654321"
      }
    }
  ]
}
```

---

## 2️⃣ Obtener Mascota por ID

**Endpoint:** `GET /api/mascotas/{id}`

**Request:**

```http
GET http://localhost:8080/api/mascotas/1
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Mascota encontrada",
  "datos": {
    "idMascota": 1,
    "nombre": "Firulais",
    "especie": "perro",
    "raza": "Golden Retriever",
    "sexo": "macho",
    "fechaNacimiento": "2020-05-15",
    "cliente": {
      "idCliente": 1,
      "nombre": "Ricardo",
      "apellido": "Alvarez"
    }
  }
}
```

---

## 3️⃣ Crear Nueva Mascota

**Endpoint:** `POST /api/mascotas`

**Request:**

```http
POST http://localhost:8080/api/mascotas
Content-Type: application/json

{
  "nombre": "Luna",
  "especie": "gato",
  "raza": "Persa",
  "sexo": "hembra",
  "fechaNacimiento": "2021-08-10",
  "idCliente": 1
}
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Mascota creada exitosamente",
  "datos": {
    "idMascota": 10,
    "nombre": "Luna",
    "especie": "gato",
    "raza": "Persa",
    "sexo": "hembra",
    "fechaNacimiento": "2021-08-10",
    "cliente": {
      "idCliente": 1,
      "nombre": "Ricardo",
      "apellido": "Alvarez"
    }
  }
}
```

---

## 4️⃣ Actualizar Mascota

**Endpoint:** `PUT /api/mascotas/{id}`

**Request:**

```http
PUT http://localhost:8080/api/mascotas/10
Content-Type: application/json

{
  "nombre": "Luna",
  "especie": "gato",
  "raza": "Persa Himalayo",
  "sexo": "hembra",
  "fechaNacimiento": "2021-08-10",
  "idCliente": 1
}
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Mascota actualizada exitosamente",
  "datos": {
    "idMascota": 10,
    "nombre": "Luna",
    "especie": "gato",
    "raza": "Persa Himalayo",
    "sexo": "hembra",
    "fechaNacimiento": "2021-08-10"
  }
}
```

---

## 5️⃣ Eliminar Mascota

**Endpoint:** `DELETE /api/mascotas/{id}`

**Request:**

```http
DELETE http://localhost:8080/api/mascotas/10
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Mascota eliminada exitosamente",
  "datos": null
}
```

---

## 6️⃣ Buscar Mascotas por Cliente

**Endpoint:** `GET /api/mascotas/cliente/{idCliente}`

**Request:**

```http
GET http://localhost:8080/api/mascotas/cliente/1
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Mascotas del cliente obtenidas",
  "datos": [
    {
      "idMascota": 1,
      "nombre": "Firulais",
      "especie": "perro",
      "raza": "Golden Retriever",
      "sexo": "macho",
      "fechaNacimiento": "2020-05-15"
    },
    {
      "idMascota": 2,
      "nombre": "Max",
      "especie": "perro",
      "raza": "Labrador",
      "sexo": "macho",
      "fechaNacimiento": "2019-03-20"
    }
  ]
}
```

---

## 7️⃣ Buscar Mascotas por Nombre

**Endpoint:** `GET /api/mascotas/buscar?nombre={nombre}`

**Request:**

```http
GET http://localhost:8080/api/mascotas/buscar?nombre=Firulais
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Mascotas encontradas",
  "datos": [
    {
      "idMascota": 1,
      "nombre": "Firulais",
      "especie": "perro",
      "raza": "Golden Retriever",
      "sexo": "macho",
      "fechaNacimiento": "2020-05-15",
      "cliente": {
        "idCliente": 1,
        "nombre": "Ricardo",
        "apellido": "Alvarez"
      }
    }
  ]
}
```

---

## 8️⃣ Obtener Historial de Mascota

**Endpoint:** `GET /api/dashboard/historial-mascota/{id}`

**Request:**

```http
GET http://localhost:8080/api/dashboard/historial-mascota/3
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Historial obtenido correctamente",
  "datos": [
    {
      "id_atencion": 2,
      "servicios": "Corte Estilizado Asiático",
      "groomer": "Juan Pérez",
      "sucursal": "Sucursal Miraflores",
      "monto_facturado": 129.8,
      "tiempo_real_inicio": "2025-12-11T14:35:00.000-05:00",
      "tiempo_real_fin": "2025-12-11T16:25:00.000-05:00"
    }
  ]
}
```

---

## ✅ Checklist de Pruebas

- [ ] **GET** - Listar todas las mascotas retorna array
- [ ] **GET** - Obtener mascota por ID existente retorna datos correctos
- [ ] **GET** - Obtener mascota por ID inexistente retorna error 404
- [ ] **POST** - Crear mascota con datos válidos retorna código 201
- [ ] **POST** - Crear mascota sin campos requeridos retorna error 400
- [ ] **POST** - Crear mascota con idCliente inexistente retorna error
- [ ] **PUT** - Actualizar mascota existente retorna datos actualizados
- [ ] **PUT** - Actualizar mascota inexistente retorna error 404
- [ ] **DELETE** - Eliminar mascota sin atenciones retorna éxito
- [ ] **DELETE** - Eliminar mascota con atenciones activas retorna error (si aplica)
- [ ] **GET** - Buscar por cliente existente retorna mascotas correctas
- [ ] **GET** - Buscar por cliente sin mascotas retorna array vacío
- [ ] **GET** - Búsqueda por nombre retorna resultados coincidentes
- [ ] **GET** - Historial de mascota retorna atenciones realizadas

---

## 🔍 Casos de Prueba Adicionales

### Validaciones de Datos

**Especie Inválida:**

```json
{
  "nombre": "Test",
  "especie": "dragon", // Solo permite: perro, gato, otro
  "raza": "Ficticio",
  "sexo": "macho",
  "fechaNacimiento": "2020-01-01",
  "idCliente": 1
}
```

**Esperado:** Error de validación

**Sexo Inválido:**

```json
{
  "nombre": "Test",
  "especie": "perro",
  "raza": "Mestizo",
  "sexo": "indefinido", // Solo permite: macho, hembra, otro
  "fechaNacimiento": "2020-01-01",
  "idCliente": 1
}
```

**Esperado:** Error de validación

**Fecha de Nacimiento Futura:**

```json
{
  "nombre": "Test",
  "especie": "gato",
  "raza": "Siamés",
  "sexo": "hembra",
  "fechaNacimiento": "2030-01-01", // Fecha en el futuro
  "idCliente": 1
}
```

**Esperado:** Error de validación

**Cliente Inexistente:**

```json
{
  "nombre": "Huérfano",
  "especie": "perro",
  "raza": "Callejero",
  "sexo": "macho",
  "fechaNacimiento": "2020-01-01",
  "idCliente": 99999 // ID que no existe
}
```

**Esperado:** Error 404 - Cliente no encontrado

---

## 📊 Pruebas de Integración

### Flujo Completo: Cliente → Mascota → Atención

1. **Crear Cliente**

```http
POST /api/clientes
{
  "nombre": "Test",
  "apellido": "User",
  "dniRuc": "99999999",
  "email": "test@mail.com",
  "telefono": "999999999"
}
```

2. **Crear Mascota para ese Cliente**

```http
POST /api/mascotas
{
  "nombre": "TestPet",
  "especie": "perro",
  "raza": "Mestizo",
  "sexo": "macho",
  "fechaNacimiento": "2020-01-01",
  "idCliente": {ID_del_cliente_creado}
}
```

3. **Verificar Mascotas del Cliente**

```http
GET /api/mascotas/cliente/{ID_del_cliente_creado}
```

4. **Ver Historial de la Mascota**

```http
GET /api/dashboard/historial-mascota/{ID_de_la_mascota_creada}
```

---

## 📝 Notas

- Todos los endpoints requieren autenticación (excepto login)
- Usar header: `Authorization: Bearer {token}`
- `especie` valores válidos: `perro`, `gato`, `otro`
- `sexo` valores válidos: `macho`, `hembra`, `otro`
- `fechaNacimiento` formato: `YYYY-MM-DD`
- `idCliente` debe existir en la base de datos
- Una mascota debe tener un dueño (cliente) asignado

---

## 🎯 Filtros y Búsquedas

### Por Especie

```http
GET /api/mascotas?especie=perro
```

### Por Sexo

```http
GET /api/mascotas?sexo=hembra
```

### Por Raza

```http
GET /api/mascotas?raza=Golden
```

### Combinado

```http
GET /api/mascotas?especie=gato&sexo=macho
```

_(Nota: Verificar con backend si estos filtros están implementados)_
