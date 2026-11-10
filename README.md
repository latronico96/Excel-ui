# Excel-ui

Aplicación web para administrar las finanzas de un comercio: registrar ingresos y egresos, organizar medios de pago y categorías, consultar resúmenes y trabajar con espacios compartidos.

## Stack

- **Next.js 15** (App Router) y **React 18**
- **TypeScript**
- **NextAuth.js 4** para autenticación con Google y acceso demo
- **Prisma ORM 7** con adaptadores para PostgreSQL y SQLite
- **PostgreSQL** (compatible con Neon) o **SQLite** para desarrollo local
- **Vitest** para pruebas automatizadas

## Funcionalidades implementadas

- Registro, edición, consulta y eliminación de movimientos.
- Ingresos distribuidos entre varios medios de pago, con cálculo de comisiones e inversión.
- Egresos asociados a categorías y medios de pago.
- Resúmenes por día, semana, mes y año.
- Configuración del espacio de trabajo: porcentaje de inversión y reglas de diezmo.
- Categorías de gastos y medios de pago, con activación y desactivación.
- Gastos recurrentes y registro de sus pagos.
- Espacios de trabajo, cambio de espacio, miembros, roles e invitaciones.
- Modo demo con una cuenta y un espacio de demostración.
- Páginas de privacidad y términos.

Los permisos y las operaciones de datos se validan en el backend y se limitan al espacio de trabajo activo del usuario.

## Requisitos

- Node.js **22 o superior**.
- npm.
- Para iniciar sesión con Google: credenciales OAuth de Google Cloud.
- Una base PostgreSQL local/remota (por ejemplo Neon), o SQLite para desarrollo local.

## Instalación

```bash
npm ci
```

## Variables de entorno

Copiá el archivo de ejemplo:

```bash
cp .env.example .env.local
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Configurá las variables:

| Variable | Uso |
|---|---|
| `GOOGLE_CLIENT_ID` | ID OAuth de Google |
| `GOOGLE_CLIENT_SECRET` | Secreto OAuth de Google |
| `NEXTAUTH_URL` | URL base de la aplicación; local: `http://localhost:8080` |
| `NEXTAUTH_SECRET` | Secreto de NextAuth; generá uno único y privado |
| `DATABASE_URL` | Conexión PostgreSQL usada por Prisma |
| `DATABASE_URL_SQLITE` | Ruta del archivo SQLite |
| `USE_SQLITE` | `true` para usar SQLite; `false` para PostgreSQL |

Generá el secreto de NextAuth con:

```bash
openssl rand -base64 32
```

No subas `.env.local`, credenciales ni secretos al repositorio.

## Base de datos local

### Opción A: SQLite

Es la opción más simple para probar localmente sin instalar PostgreSQL. En `.env.local`:

```env
USE_SQLITE=true
DATABASE_URL_SQLITE="file:./dev.db"
```

El archivo SQLite se crea localmente. El esquema está en `prisma/schema.sqlite.prisma` y su configuración CLI en `prisma.sqlite.config.ts`.

### Opción B: PostgreSQL

Configurá `DATABASE_URL` con una base PostgreSQL local o de desarrollo. Por ejemplo, para una instancia local:

```env
USE_SQLITE=false
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/excel_ui?schema=public"
```

El esquema PostgreSQL está en `prisma/schema.prisma` y su configuración CLI en `prisma7.config.ts`.

**Seguridad:** no ejecutes comandos de sincronización o migración contra producción como parte de la configuración local. Verificá siempre a qué base apunta `DATABASE_URL` antes de ejecutar comandos que escriban en ella.

## Prisma Client

Generá ambos clientes (PostgreSQL y SQLite):

```bash
npm run prisma:generate
```

Validá los esquemas:

```bash
npx prisma validate --config=prisma7.config.ts
npx prisma validate --config=prisma.sqlite.config.ts
```

## Ejecutar la aplicación

Servidor de desarrollo:

```bash
npm run dev
```

La aplicación queda disponible en [http://localhost:8080](http://localhost:8080).

Para iniciar sesión con Google, registrá la URL local y el callback `http://localhost:8080/api/auth/callback/google` en las credenciales OAuth. El acceso demo está disponible desde la pantalla de inicio.

## Pruebas y verificaciones

Ejecutar las pruebas:

```bash
npm test
```

Modo watch:

```bash
npm run test:watch
```

Lint y chequeo de tipos:

```bash
npm run lint
npx tsc --noEmit
```

## Build de producción

```bash
npm run build
npm start
```

La build valida los esquemas y genera los clientes Prisma antes de compilar Next.js.

## Estructura principal

- `app/`: páginas, layouts y endpoints API.
- `prisma/`: esquemas, clientes generados y scripts de datos.
- `server/services/`: lógica de negocio y permisos.
- `server/utils/`: cálculos financieros y utilidades.
- `shared/`: tipos y utilidades compartidas.
- `tests/`: pruebas unitarias y de rutas.
- `.github/workflows/`: integración continua.

## Integración continua

GitHub Actions ejecuta instalación limpia, generación de Prisma Client, pruebas Vitest, ESLint, TypeScript, build y auditoría de dependencias en los eventos configurados en `.github/workflows/ci.yml`.
