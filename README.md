# Ecommerce Backend (Express + Prisma + JWT + Roles + MercadoPago)

Backend de ecommerce con:
- Registro y login con **JWT**
- Roles **USER / ADMIN**
- **Categories** y **Products**
- **Cart** persistido
- **Orders** (checkout con transacción, descuenta stock y vacía carrito)
- **Admin Orders** (listar y cambiar estado)
- **MercadoPago Checkout Pro + Webhook**
- URLs de retorno “dummy” para pagos (`/payment/success`, etc.)

---

## URLs
- **Local:** `http://localhost:3000`
- **Render:** `https://ecommerce-e5u7.onrender.com`

En los ejemplos uso:

```bash
BASE_URL=http://localhost:3000
# o
BASE_URL=https://ecommerce-e5u7.onrender.com
```

---

## Setup local

### 1) Instalar dependencias
```bash
npm install
```

### 2) Variables de entorno
Copiá `.env.example` a `.env` y completá valores:

```bash
cp .env.example .env
```

### 3) Migraciones + Prisma Client
```bash
npx prisma migrate dev
npx prisma generate
```

### 4) Correr el server
```bash
npm run dev
```

---

## Cómo obtener un usuario ADMIN
1) Creá un usuario normal con `POST /users`
2) Abrí Prisma Studio:
```bash
npx prisma studio
```
3) En tabla **User**, cambiá `role` a `ADMIN`
4) Hacé login de ese usuario para obtener `ADMIN_TOKEN`

---

# Rutas disponibles (según `src/index.ts`)

## Healthcheck

### ✅ GET `/`
```bash
curl "$BASE_URL/"
```
Respuesta esperada: `API funcionando`

---

## Users

### ✅ POST `/users` (público) — crear usuario
```bash
curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}'
```

### ✅ GET `/users/me` (requiere token)
```bash
curl "$BASE_URL/users/me" -H "Authorization: Bearer $TOKEN"
```

---

## Auth

### ✅ POST `/auth/login` (público) — login y token
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}'
```

Respuesta esperada:
```json
{
  "token": "....",
  "user": { "id": 1, "email": "user@test.com", "role": "USER" }
}
```

### ✅ GET `/auth/me` (requiere token) — payload del JWT
```bash
curl "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN"
```

---

## 3) Roles (cómo obtener ADMIN)
1) Crear usuario (POST `/users`)
2) `npx prisma studio`
3) En tabla **User**, cambiar `role` a `ADMIN`
4) Volver a loguearse para obtener `$ADMIN_TOKEN`

---

## Categories

### ✅ GET `/categories` (público)
```bash
curl "$BASE_URL/categories"
```

### ✅ POST `/categories` (ADMIN)
```bash
curl -X POST "$BASE_URL/categories" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electrónica"}'
```

Errores comunes:
- `409` si ya existe (`name` unique)
- `403` si no sos admin

---

## Products

### ✅ GET `/products` (público)
```bash
curl "$BASE_URL/products"
```

### ✅ GET `/products?categoryId=1` (público)
```bash
curl "$BASE_URL/products?categoryId=1"
```

### ✅ GET `/products/:id` (público)
```bash
curl "$BASE_URL/products/1"
```

### ✅ POST `/products` (ADMIN)
> Importante: `price` mandarlo como **string** (Decimal).

```bash
curl -X POST "$BASE_URL/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mouse Gamer","description":"RGB","price":"19999.90","stock":10,"categoryId":1}'
```

### ✅ PATCH `/products/:id` (ADMIN) *(si lo tenés implementado)*
```bash
curl -X PATCH "$BASE_URL/products/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock":25,"price":"24999.00"}'
```

---

## Cart (carrito persistido)
> Todas las rutas requieren token de usuario.

### ✅ GET `/cart`
```bash
curl "$BASE_URL/cart" -H "Authorization: Bearer $TOKEN"
```

### ✅ POST `/cart` — agregar/incrementar
```bash
curl -X POST "$BASE_URL/cart" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### ✅ PATCH `/cart/:productId` — set cantidad (0 borra)
```bash
curl -X PATCH "$BASE_URL/cart/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}'
```

### ✅ DELETE `/cart/:productId` — borrar item
```bash
curl -X DELETE "$BASE_URL/cart/1" -H "Authorization: Bearer $TOKEN"
```

### ✅ DELETE `/cart` — vaciar carrito
```bash
curl -X DELETE "$BASE_URL/cart" -H "Authorization: Bearer $TOKEN"
```

---

## Orders (checkout)
> Requiere token de usuario.

### ✅ POST `/orders` — crear orden desde carrito
Crea una orden:
- valida stock
- crea `Order + OrderItems`
- descuenta stock
- vacía carrito

```bash
curl -X POST "$BASE_URL/orders" -H "Authorization: Bearer $TOKEN"
```

Errores comunes:
- `400` carrito vacío
- `409` stock insuficiente

### ✅ GET `/orders` — mis órdenes
```bash
curl "$BASE_URL/orders" -H "Authorization: Bearer $TOKEN"
```

### ✅ GET `/orders/:id` — detalle (solo dueño)
```bash
curl "$BASE_URL/orders/1" -H "Authorization: Bearer $TOKEN"
```

---

## Admin Orders
> Requiere token ADMIN.

### ✅ GET `/admin/orders`
```bash
curl "$BASE_URL/admin/orders" -H "Authorization: Bearer $ADMIN_TOKEN"
```

### ✅ GET `/admin/orders?status=PENDING`
```bash
curl "$BASE_URL/admin/orders?status=PENDING" -H "Authorization: Bearer $ADMIN_TOKEN"
```

### ✅ GET `/admin/orders/:id`
```bash
curl "$BASE_URL/admin/orders/1" -H "Authorization: Bearer $ADMIN_TOKEN"
```

### ✅ PATCH `/admin/orders/:id/status`
Regla actual: solo permite:
- `PENDING -> PAID`
- `PENDING -> CANCELLED` (repone stock)

Marcar pagada:
```bash
curl -X PATCH "$BASE_URL/admin/orders/1/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"PAID"}'
```

Cancelar (repone stock):
```bash
curl -X PATCH "$BASE_URL/admin/orders/1/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"CANCELLED"}'
```

---

## Payments (MercadoPago Checkout Pro)
> Requiere token de usuario y una `Order` en estado `PENDING`.

### ✅ POST `/payments/mercadopago/checkout`
Body:
```json
{ "orderId": 123 }
```

```bash
curl -X POST "$BASE_URL/payments/mercadopago/checkout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":123}'
```

Respuesta esperada: `{ preferenceId, init_point, sandbox_init_point }`

---

## Webhooks (MercadoPago)
### ✅ POST `/webhooks/mercadopago` *(lo llama MercadoPago)*
Este endpoint lo llama MercadoPago automáticamente.

Webhook URL (Render):
```
https://ecommerce-e5u7.onrender.com/webhooks/mercadopago
```

### Cómo probar el webhook (flujo real)
1) Usuario:
   - Agregar al carrito (`POST /cart`)
   - Checkout (`POST /orders`) → guardar `orderId` (queda `PENDING`)
2) Usuario:
   - `POST /payments/mercadopago/checkout` → abrir `init_point` y pagar
3) Verificación:
   - `GET /orders/:id` (usuario) o `GET /admin/orders/:id` (admin)
   - la orden debería pasar a `PAID` si el pago fue aprobado

---

## URLs de retorno (sin frontend)

### ✅ GET `/payment/success`
```bash
curl "$BASE_URL/payment/success"
```

### ✅ GET `/payment/failure`
```bash
curl "$BASE_URL/payment/failure"
```

### ✅ GET `/payment/pending`
```bash
curl "$BASE_URL/payment/pending"
```

---

# Flujo end-to-end recomendado

## 1) Admin
1) Login admin → obtener `ADMIN_TOKEN`
2) Crear categoría: `POST /categories`
3) Crear producto: `POST /products`

## 2) Usuario
1) Crear user: `POST /users`
2) Login user → obtener `TOKEN`
3) Agregar al carrito: `POST /cart`
4) Checkout: `POST /orders` → `orderId` (PENDING)
5) Pago: `POST /payments/mercadopago/checkout` → abrir `init_point` y pagar

## 3) Verificación
- `GET /orders/:id` → debe cambiar a `PAID` por webhook

---

## Notas de Render
- Cargar env vars:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `MP_ACCESS_TOKEN`
  - `MP_WEBHOOK_SECRET`
  - `PUBLIC_BASE_URL=https://ecommerce-e5u7.onrender.com`
  - `FRONTEND_BASE_URL=https://ecommerce-e5u7.onrender.com`
