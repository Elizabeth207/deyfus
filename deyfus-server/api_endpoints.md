# API - Endpoints principales

Este archivo resume los endpoints principales del backend para que el equipo frontend comience a integrarse rápidamente. Todos los endpoints están prefijados con `/api`.

Variables globales:
- Host por defecto: `http://localhost:4000` (configurable con `PORT` y `HOST` en `.env`)
- Header de autorización: `Authorization: Bearer <token>` (JWT)

---

## Autenticación

- POST /api/auth/register
  - Crea un usuario
  - Body (JSON): { "name": "Nombre", "email": "user@example.com", "password": "pwd", "role": "admin|user" }
  - Respuesta: usuario creado (sin password)

- POST /api/auth/login
  - Inicia sesión
  - Body (JSON): { "email": "user@example.com", "password": "pwd" }
  - Respuesta: { token: "<jwt>", user: { id, name, email, role, branchId } }

---

## Sucursales (Branches)

- GET /api/branches
  - Lista sucursales

- POST /api/branches
  - Crea una sucursal
  - Body: { "name": "Sucursal A", "address": "..." }

---

## Categorías (Categories)

- GET /api/categories
- POST /api/categories
  - Body: { "name": "Ropa" }

---

## Productos (Products)

- GET /api/products
  - Query opcional: `?categoryId=...&branchId=...&q=texto`

- GET /api/products/:id

- POST /api/products
  - Crea producto
  - Body ejemplo:
    {
      "name": "Remera",
      "description": "Remera algodón",
      "price": 2500,
      "cost": 1500,
      "barcode": "123456789",
      "categoryId": "<uuid opcional>",
      "branchId": "<uuid opcional>",
      "sizes": ["S","M","L"]
    }

---

## Inventario (Inventory)

- GET /api/inventory?productId=&branchId=
  - Devuelve stock por tallas (si aplica)

- POST /api/inventory
  - Actualiza inventario (ajuste)
  - Body ejemplo (delta):
    {
      "productId": "<id>",
      "branchId": "<id>",
      "size": "M",
      "delta": -1,    // decremento/incremento relativo
      "note": "Venta POS"
    }

---

## Ventas (Sales)

- POST /api/sales
  - Crea una venta (transacción atómica): verifica stock, decrementa inventario, crea `Sale` y `SaleItem` y registra `FinancialTransaction`.
  - Body ejemplo:
    {
      "branchId": "<id>",
      "customerName": "Cliente X",
      "items": [
        { "productId": "<id>", "size": "M", "quantity": 1, "unitPrice": 2500 }
      ],
      "paymentMethod": "CASH|CARD",
      "paidAmount": 2500
    }

- GET /api/sales/:id
  - Obtener detalles de una venta

---

## Finanzas (Finances)

- GET /api/finances
  - Lista transacciones financieras

- POST /api/finances (opcional)
  - Crear una transacción manual
  - Body ejemplo: { "type": "INCOME|EXPENSE", "amount": 2500, "description": "Venta #123" }

---

## Headers y autenticación

- Para rutas protegidas incluir header:
  - Authorization: Bearer <token>
- Muchas rutas usan `req.user` para saber `user.id` y `user.branchId` (si el usuario está asignado a una sucursal).

---

## Cómo arrancar el servidor (rápido)

1. Copiar `.env.example` a `.env` y completar variables.
2. Instalar dependencias:

```powershell
cd C:\Users\pc\Downloads\deyfus\deyfus-server
npm install
```

3. Generar Prisma Client (si se cambia el schema):

```powershell
npx prisma generate
```

4. Aplicar migraciones (si es necesario):

```powershell
npx prisma migrate dev --name apply_changes
```

5. Levantar servidor en modo desarrollo:

```powershell
npm run dev
```

6. Ejecutar el script de prueba local (opcional):

```powershell
node scripts/test_flow.js
```

---

Si querés, genero una colección Postman/Insomnia más completa con ejemplos de request y variables de entorno.
