# 🏪 Deyfus — Sistema de Gestión de Inventario y Ventas

Una aplicación full-stack para gestionar sucursales, inventario, productos, ventas y finanzas. Incluye autenticación JWT, panel de control, reportes y gestión de stock.

## 📋 Requisitos Previos

- **Node.js** v18+ ([Descargar](https://nodejs.org/))
- **PostgreSQL** 13+ ([Descargar](https://www.postgresql.org/)) o usar otra BD compatible con Prisma
- **Git** ([Descargar](https://git-scm.com/))
- **npm** (incluido en Node.js)

## 🚀 Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/Elizabeth207/deyfus.git
cd deyfus
```

### 2. Configurar el servidor (Backend)

```bash
cd deyfus-server

# Instalar dependencias
npm install

# Crear archivo .env con credenciales de tu base de datos
# Edita .env y reemplaza DATABASE_URL con tus credenciales:
```

**Archivo `.deyfus-server/.env`:**
```properties
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/deyfus_db"
JWT_SECRET="tu_clave_secreta_aqui"
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu@email.com
SMTP_PASS=tu_contraseña
PORT=4001
FRONTEND_URL=http://localhost:5173
HOST=0.0.0.0
```

**Nota:** Reemplaza `usuario`, `contraseña`, y `localhost:5432` con tus credenciales reales de PostgreSQL.

### 3. Crear base de datos e importar datos

```bash
# Crear tablas en la BD
npx prisma db push

# Importar todos tus datos guardados (370+ registros: sucursales, productos, ventas, etc.)
node scripts/import_data.cjs

# Verificar que todo se importó correctamente (opcional)
# npx prisma studio    # Abre interfaz web para revisar datos
```

### 4. Iniciar el servidor

```bash
npm run dev
```

Deberías ver: `Server running: http://localhost:4001`

### 5. Configurar el cliente (Frontend)

En otra terminal:

```bash
cd deyfus-client

# Instalar dependencias
npm install

# Crear archivo .env (opcional, por defecto apunta a http://localhost:4001)
echo "VITE_API_URL=http://localhost:4001" > .env

# Iniciar aplicación
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

## 🔑 Credenciales de Prueba

Después de importar datos, puedes usar las credenciales que registraste:

- **Email:** (one de los usuarios en `data_export.json`)
- **Password:** (la que registraste)

O crea un nuevo usuario usando el formulario de registro.

## 📁 Estructura del Proyecto

```
deyfus/
├── deyfus-server/          # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── routes/         # Endpoints de API
│   │   ├── middleware/     # Autenticación, validación, error handling
│   │   └── utils/          # Utilidades (upload, validación, etc.)
│   ├── prisma/             # Esquema BD, migraciones
│   ├── scripts/
│   │   ├── export_data.cjs # Exportar datos a JSON
│   │   └── import_data.cjs # Importar datos desde JSON ⭐
│   ├── uploads/            # Imágenes y archivos subidos
│   └── data_export.json    # Snapshots de tus datos guardados
│
├── deyfus-client/          # Frontend (React + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas (login, dashboard, productos, etc.)
│   │   ├── context/        # Context API (autenticación)
│   │   ├── lib/            # Utilidades (API client, tipos)
│   │   └── routes/         # Rutas y protección
│   └── public/             # Archivos estáticos
│
└── .gitignore             # Excluye node_modules, .env, etc. (pero incluye data_export.json y uploads/)
```

## 🎯 Características Principales

### ✅ Autenticación
- Login / Registro con JWT
- Recuperación de contraseña
- Rol de usuario (ADMIN, MANAGER, SELLER)

### 📊 Dashboard
- Resumen de ventas, inventario y finanzas
- Gráficos y análisis

### 🛍️ Gestión de Productos
- CRUD de productos
- Código de barras y QR
- Gestión de categorías
- Subida de imágenes

### 📦 Inventario
- Seguimiento de stock por sucursal
- Movimientos de inventario
- Alertas de bajo stock / overstock
- Ajustes manuales

### 💳 Ventas
- Punto de venta (POS)
- Historial de ventas
- Métodos de pago (efectivo, tarjeta, transferencia)

### 💰 Finanzas
- Registro de ingresos/gastos
- Reportes financieros por sucursal
- Seguimiento de transacciones

### 🏢 Sucursales
- Gestión multi-sucursal
- Estadísticas por sucursal
- Control de inventario distribuido

## 🛠️ Scripts Disponibles

### Backend (`deyfus-server/`)

```bash
npm run dev              # Iniciar con nodemon (desarrollo)
npm run build            # Compilar (si aplica)
npm test                 # Ejecutar tests
node scripts/export_data.cjs   # Exportar datos a JSON
node scripts/import_data.cjs   # Importar datos desde JSON
npx prisma studio       # Abrir editor visual de BD
npx prisma migrate dev  # Crear y ejecutar migraciones
```

### Frontend (`deyfus-client/`)

```bash
npm run dev              # Servidor de desarrollo (Vite)
npm run build            # Compilar para producción
npm run preview          # Preview de la build
npm run lint             # ESLint
```

## 🔄 Restaurar Datos en Otra Máquina

Si clonaste el repo en otra PC:

```bash
cd deyfus-server

# Crear el archivo .env con tus credenciales locales
# (mismas instrucciones que arriba)

# Crear tablas
npx prisma db push

# Importar tus datos guardados
node scripts/import_data.cjs

# ✅ Listo — todos tus datos estarán disponibles
```

## 📸 Imágenes y Uploads

Las imágenes que subiste están en `deyfus-server/uploads/` y se incluyen en el repositorio. Se sirven automáticamente cuando accedes a los productos.

Si necesitas agregar más imágenes después de la importación, usa la interfaz de carga en la app.

## 🔐 Seguridad

⚠️ **Recomendaciones:**

- `.env` contiene credenciales sensibles — **NO subir a GitHub** (ya está en `.gitignore`)
- JWT_SECRET — usa una clave fuerte y única
- Para producción, usa variables de entorno seguras (env. vault, servicios administrados)
- Considera usar HttpOnly cookies en lugar de localStorage para tokens (mejora seguridad)

## 🐛 Troubleshooting

### Error: `P1000: Authentication failed`
- Verifica que PostgreSQL está corriendo
- Revisa las credenciales en `.env` (usuario, contraseña, host, puerto)

### Error: `Port 4001 already in use`
- Cambia `PORT` en `.env` o mata el proceso que usa ese puerto:
  ```bash
  # Windows PowerShell
  netstat -ano | findstr :4001
  taskkill /PID <PID> /F
  ```

### Error: `Cannot find module '@prisma/client'`
- Ejecuta `npx prisma generate` en `deyfus-server/`

### Datos no aparecen después de importar
- Verifica que `npx prisma db push` completó sin errores
- Revisa que `data_export.json` existe en `deyfus-server/`
- Ejecuta `node scripts/import_data.cjs` de nuevo

## 📧 Contacto & Soporte

Para issues o preguntas, abre un [issue en GitHub](https://github.com/Elizabeth207/deyfus/issues).

## 📄 Licencia

MIT — libre para usar, modificar y distribuir.

---

**Made with ❤️ by Elizabeth207**
