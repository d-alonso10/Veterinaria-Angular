# 📋 Guía de Pruebas - Módulo Clientes

## BASE URL

```
http://localhost:8080/api/clientes
```

---

## 1️⃣ Listar Todos los Clientes

**Endpoint:** `GET /api/clientes`

**Request:**

```http
GET http://localhost:8080/api/clientes
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Clientes obtenidos correctamente",
  "datos": [
    {
      "idCliente": 1,
      "nombre": "Ricardo",
      "apellido": "Alvarez",
      "dniRuc": "12345678",
      "telefono": "987654321",
      "email": "ricardo.alvarez@mail.com",
      "direccion": "Av. Principal 123"
    }
  ]
}
```

---

## 2️⃣ Obtener Cliente por ID

**Endpoint:** `GET /api/clientes/{id}`

**Request:**

```http
GET http://localhost:8080/api/clientes/1
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Cliente encontrado",
  "datos": {
    "idCliente": 1,
    "nombre": "Ricardo",
    "apellido": "Alvarez",
    "dniRuc": "12345678",
    "telefono": "987654321",
    "email": "ricardo.alvarez@mail.com",
    "direccion": "Av. Principal 123"
  }
}
```

---

## 3️⃣ Crear Nuevo Cliente

**Endpoint:** `POST /api/clientes`

**Request:**

```http
POST http://localhost:8080/api/clientes
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dniRuc": "87654321",
  "telefono": "999888777",
  "email": "juan.perez@mail.com",
  "direccion": "Calle Falsa 456"
}
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Cliente creado exitosamente",
  "datos": {
    "idCliente": 10,
    "nombre": "Juan",
    "apellido": "Pérez",
    "dniRuc": "87654321",
    "telefono": "999888777",
    "email": "juan.perez@mail.com",
    "direccion": "Calle Falsa 456"
  }
}
```

---

## 4️⃣ Actualizar Cliente

**Endpoint:** `PUT /api/clientes/{id}`

**Request:**

```http
PUT http://localhost:8080/api/clientes/10
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "apellido": "Pérez González",
  "dniRuc": "87654321",
  "telefono": "999888777",
  "email": "juancarlos.perez@mail.com",
  "direccion": "Av. Nueva 789"
}
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Cliente actualizado exitosamente",
  "datos": {
    "idCliente": 10,
    "nombre": "Juan Carlos",
    "apellido": "Pérez González",
    "dniRuc": "87654321",
    "telefono": "999888777",
    "email": "juancarlos.perez@mail.com",
    "direccion": "Av. Nueva 789"
  }
}
```

---

## 5️⃣ Eliminar Cliente

**Endpoint:** `DELETE /api/clientes/{id}`

**Request:**

```http
DELETE http://localhost:8080/api/clientes/10
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Cliente eliminado exitosamente",
  "datos": null
}
```

---

## 6️⃣ Búsqueda por DNI/RUC

**Endpoint:** `GET /api/clientes/buscar/dni/{dni}`

**Request:**

```http
GET http://localhost:8080/api/clientes/buscar/dni/12345678
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Cliente encontrado",
  "datos": {
    "idCliente": 1,
    "nombre": "Ricardo",
    "apellido": "Alvarez",
    "dniRuc": "12345678",
    "telefono": "987654321",
    "email": "ricardo.alvarez@mail.com",
    "direccion": "Av. Principal 123"
  }
}
```

---

## 7️⃣ Buscar Clientes por Nombre

**Endpoint:** `GET /api/clientes/buscar?nombre={nombre}`

**Request:**

```http
GET http://localhost:8080/api/clientes/buscar?nombre=Ricardo
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Clientes encontrados",
  "datos": [
    {
      "idCliente": 1,
      "nombre": "Ricardo",
      "apellido": "Alvarez",
      "dniRuc": "12345678",
      "telefono": "987654321",
      "email": "ricardo.alvarez@mail.com",
      "direccion": "Av. Principal 123"
    }
  ]
}
```

---

## 8️⃣ Obtener Mascotas del Cliente

**Endpoint:** `GET /api/clientes/{id}/mascotas`

**Request:**

```http
GET http://localhost:8080/api/clientes/1/mascotas
```

**Expected Response:**

```json
{
  "exito": true,
  "mensaje": "Mascotas obtenidas correctamente",
  "datos": [
    {
      "idMascota": 1,
      "nombre": "Firulais",
      "especie": "perro",
      "raza": "Golden Retriever",
      "sexo": "macho",
      "fechaNacimiento": "2020-05-15"
    }
  ]
}
```

---

## ✅ Checklist de Pruebas

- [ ] **GET** - Listar todos los clientes retorna array
- [ ] **GET** - Obtener cliente por ID existente retorna datos correctos
- [ ] **GET** - Obtener cliente por ID inexistente retorna error 404
- [ ] **POST** - Crear cliente con datos válidos retorna código 201
- [ ] **POST** - Crear cliente sin campos requeridos retorna error 400
- [ ] **POST** - Crear cliente con DNI duplicado retorna error
- [ ] **PUT** - Actualizar cliente existente retorna datos actualizados
- [ ] **PUT** - Actualizar cliente inexistente retorna error 404
- [ ] **DELETE** - Eliminar cliente sin mascotas retorna éxito
- [ ] **DELETE** - Eliminar cliente con mascotas retorna error (si aplica)
- [ ] **GET** - Buscar por DNI existente retorna cliente correcto
- [ ] **GET** - Buscar por DNI inexistente retorna error 404
- [ ] **GET** - Búsqueda por nombre retorna resultados coincidentes
- [ ] **GET** - Listar mascotas de cliente retorna array correcto

---

## 🔍 Casos de Prueba Adicionales

### Validaciones de Datos

**DNI Inválido:**

```json
{
  "nombre": "Test",
  "apellido": "User",
  "dniRuc": "123", // Muy corto
  "telefono": "999888777",
  "email": "test@mail.com"
}
```

**Esperado:** Error de validación

**Email Inválido:**

```json
{
  "nombre": "Test",
  "apellido": "User",
  "dniRuc": "12345678",
  "telefono": "999888777",
  "email": "email-invalido" // Sin @
}
```

**Esperado:** Error de validación

---

## 📝 Notas

- Todos los endpoints requieren autenticación (excepto login)
- Usar header: `Authorization: Bearer {token}`
- El DNI/RUC debe ser único en el sistema
- Email debe tener formato válido
- Teléfono debe tener al menos 9 dígitos
