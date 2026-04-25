# Centro Médico Santo Domingo — Sitio Web

Sitio web completo para el **Centro Médico Santo Domingo** de Catriel, Río Negro.
Incluye página institucional con servicios médicos, catálogo de productos con carrito de compras, pagos online vía Mercado Pago, y sistema de usuarios con verificación de email.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Express 5 + TypeScript |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma |
| Autenticación | JWT + bcrypt |
| Pagos | Mercado Pago Checkout Pro |
| Email | Nodemailer (Gmail SMTP) |
| Deploy frontend | Render (Static Site) |
| Deploy backend | Render (Web Service) |

---

## Estructura del proyecto

```
Ecommerce/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/     # Login, Register, VerifyEmail, Home, Me, Products, Cart, Orders, etc.
│   │   ├── components/
│   │   ├── routes/    # ProtectedRoute, AdminRoute
│   │   ├── auth/      # AuthContext
│   │   ├── api/       # Axios client
│   │   └── constants/ # servicios.ts (servicios médicos + tratamientos)
│   └── public/
│       ├── iconos/    # Imágenes PNG de servicios y UI
│       └── videos/    # Videos MP4 de tratamientos
└── backend/
    ├── src/
    │   ├── routes/    # auth, users, products, categories, cart, orders, payments, webhooks
    │   ├── middleware/ # requireAuth, requireAdmin
    │   └── services/  # email.ts
    └── prisma/
        └── schema.prisma
```

---

## URLs de producción

- **Frontend:** `https://ecommerce-5bt9.onrender.com`
- **Backend:** `https://ecommerce-e5u7.onrender.com`

---

## Setup local

### Backend

```bash
cd backend
npm install
cp env.example .env   # completar con valores reales
npx prisma migrate dev
npx prisma generate
npm run dev           # corre en http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev           # corre en http://localhost:5173
```

---

## Variables de entorno — Backend (`.env`)

```env
# Base de datos (Supabase — usar URL directa para migraciones)
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

# JWT
JWT_SECRET=clave_larga_y_secreta

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-...
MP_WEBHOOK_SECRET=...

# URLs
PUBLIC_BASE_URL=https://ecommerce-e5u7.onrender.com
FRONTEND_BASE_URL=https://ecommerce-e5u7.onrender.com
FRONTEND_URL=https://ecommerce-5bt9.onrender.com

# Email (Gmail con contraseña de aplicación)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tucuenta@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

> **Nota Supabase:** Para migraciones locales usar la URL directa (`db.PROJECT.supabase.co:5432`). La URL del pooler (`pooler.supabase.com`) no acepta conexiones directas desde redes con puerto 5432 bloqueado. Si el puerto está bloqueado, ejecutar el SQL de migración directamente en el SQL Editor de Supabase.

> **Nota Gmail:** `SMTP_PASS` debe ser una **contraseña de aplicación** generada en Google Account → Seguridad → Contraseñas de aplicaciones (requiere verificación en 2 pasos activa).

---

## Modelo de datos (Prisma)

### User
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK autoincrement |
| email | String unique | Email del usuario |
| password | String | Hash bcrypt |
| role | USER / ADMIN | Rol del usuario |
| points | Int | Puntos de fidelidad |
| emailVerified | Boolean | Email confirmado |
| verificationToken | String? unique | Token de verificación |

### Otros modelos
- **Category** — categorías de productos
- **Product** — productos con precio, stock e imagen
- **CartItem** — carrito persistido por usuario
- **Order / OrderItem** — órdenes de compra
- **Payment** — registro de pagos Mercado Pago

---

## Flujo de autenticación

```
1. POST /auth/register  → crea usuario + envía email de verificación
2. Usuario hace click en el link del email
3. GET /auth/verify-email?token=xxx  → activa cuenta + devuelve JWT
4. POST /auth/login  → requiere emailVerified = true
```

> Los usuarios sin email verificado no pueden iniciar sesión.

---

## Rutas del backend

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Registra usuario y envía email |
| GET | `/auth/verify-email?token=` | — | Verifica email y devuelve JWT |
| POST | `/auth/login` | — | Login (requiere email verificado) |
| GET | `/auth/me` | JWT | Datos del usuario actual |

### Products
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/products` | — | Lista productos (filtro: `?categoryId=`) |
| GET | `/products/:id` | — | Detalle de producto |
| POST | `/products` | ADMIN | Crear producto |
| PATCH | `/products/:id` | ADMIN | Editar producto |
| DELETE | `/products/:id` | ADMIN | Eliminar producto |

### Categories
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/categories` | — | Lista categorías |
| POST | `/categories` | ADMIN | Crear categoría |

### Cart
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/cart` | JWT | Ver carrito |
| POST | `/cart` | JWT | Agregar item |
| PATCH | `/cart/:productId` | JWT | Cambiar cantidad (0 = eliminar) |
| DELETE | `/cart/:productId` | JWT | Eliminar item |
| DELETE | `/cart` | JWT | Vaciar carrito |

### Orders
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/orders` | JWT | Crear orden desde carrito |
| GET | `/orders` | JWT | Mis órdenes |
| GET | `/orders/:id` | JWT | Detalle de orden |

### Admin
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/admin/orders` | ADMIN | Todas las órdenes |
| GET | `/admin/orders/:id` | ADMIN | Detalle de orden |
| PATCH | `/admin/orders/:id/status` | ADMIN | Cambiar estado |

### Payments
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/payments/mercadopago/checkout` | JWT | Generar preferencia MP |
| POST | `/webhooks/mercadopago` | — | Webhook automático de MP |

---

## Flujo de pago (Mercado Pago)

```
1. Usuario agrega productos al carrito
2. POST /orders  → crea orden PENDING, descuenta stock, vacía carrito
3. POST /payments/mercadopago/checkout  → devuelve init_point
4. Usuario paga en Mercado Pago
5. MP llama al webhook  → orden pasa a PAID
```

---

## Cómo crear un usuario ADMIN

1. Registrar usuario normalmente desde el frontend
2. Verificar el email
3. Ir a Supabase → Table Editor → tabla `User`
4. Cambiar el campo `role` de `USER` a `ADMIN`
5. Volver a iniciar sesión

---

## Páginas del frontend

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Home — servicios y CTA WhatsApp | Público |
| `/servicios/:slug` | Detalle de servicio con tratamientos y videos | Público |
| `/products` | Catálogo de productos | Público |
| `/products/:id` | Detalle de producto | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro + verificación email | Público |
| `/verify-email` | Confirmación de cuenta | Público |
| `/me` | Perfil del usuario | Autenticado |
| `/cart` | Carrito de compras | Autenticado |
| `/orders` | Mis órdenes | Autenticado |
| `/orders/:id` | Detalle de orden | Autenticado |
| `/admin/products` | Gestión de productos | ADMIN |
| `/admin/products/:id` | Editar producto | ADMIN |

---

## Servicios médicos incluidos

- Estética Facial (con videos de tratamientos)
- Estética Corporal (con videos de tratamientos)
- Depilación Definitiva Láser
- Ginecología y Estética Médica
- Quiropraxia
- Odontología
- Kinesiología y Rehabilitación
- Medicina General

Cada servicio tiene: descripción, tratamientos, beneficios, sesiones, FAQ y botón de turno por WhatsApp.

---

## Notas de deploy (Render)

- El backend en el plan gratuito **se duerme** tras 15 minutos de inactividad. La primera request puede tardar ~30 segundos en responder.
- Las 750 horas/mes del plan gratuito son compartidas entre todos los servicios web.
- El frontend es un **Static Site** — siempre disponible, sin límite de horas.
- El webhook de Mercado Pago debe apuntar a la URL del backend en Render.
