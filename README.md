# Excel-ui

Aplicación web para administrar y consultar las finanzas de un comercio: registrar ingresos y egresos, organizar medios de pago y categorías, consultar resúmenes y trabajar con espacios compartidos. El proyecto usa Next.js App Router, React, TypeScript y Prisma 7. PostgreSQL (incluido Neon) es la opción prevista para producción; SQLite está configurado como alternativa local.

## Stack

- **Next.js 15** (App Router) y **React 18**
- **TypeScript**
- **NextAuth.js 4** para autenticación con Google y acceso demo
- **Prisma ORM 7** con adaptadores para PostgreSQL y SQLite
- **PostgreSQL** (compatible con Neon) o **SQLite** para desarrollo local
- **Vitest** para pruebas automatizadas

## Funcionalidades implementadas

- Inicio de sesión con Google mediante NextAuth y acceso demo.
- Espacios de trabajo y miembros con roles `OWNER`, `ADMIN` y `MEMBER`, además de invitaciones y cambio de espacio.
- Registro, edición, consulta y eliminación de movimientos (ingresos y egresos).
- Ingresos distribuidos entre varios medios de pago, con cálculo de comisiones e inversión.
- Egresos asociados a categorías y medios de pago.
- Resúmenes por día, semana, mes y año, configuración de inversión/diezmo y espacio demo.
- Categorías de gastos y medios de pago, con activación y desactivación.
- Gastos recurrentes y registro de sus pagos.
- Modo demo con una cuenta y un espacio de demostración.
- Páginas de privacidad y términos.

Los permisos y las operaciones de datos se validan en el backend y se limitan al espacio de trabajo activo del usuario. La documentación no implica que todos los flujos hayan sido validados en un entorno de producción.

## Requisitos

- Node.js **22 o superior** y **npm**.
- Credenciales OAuth de Google Cloud para probar el inicio de sesión.
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

Configurá las variables en `.env.local`:

| Variable | Uso |
|---|---|
| `GOOGLE_CLIENT_ID` | ID OAuth de Google |
| `GOOGLE_CLIENT_SECRET` | Secreto OAuth de Google |
| `NEXTAUTH_URL` | URL base de la aplicación; local: `http://localhost:8080` |
| `NEXTAUTH_SECRET` | Secreto de NextAuth; generá uno único y privado |
| `DATABASE_URL` | Conexión PostgreSQL usada por Prisma |
| `DATABASE_URL_SQLITE` | Ruta del archivo SQLite |
| `USE_SQLITE` | `true` para usar SQLite; `false` para PostgreSQL |
| `NEXT_PUBLIC_APP_TITLE` | Título visible de la aplicación |

Para generar un secreto seguro de NextAuth (`NEXTAUTH_SECRET`), puedes usar:

```bash
openssl rand -base64 32
```

No subas `.env.local`, credenciales ni secretos reales al repositorio.

## Base de datos y Prisma Client

### Opción A: SQLite local

Es la opción más simple para probar localmente sin instalar PostgreSQL. En `.env.local`:

```env
USE_SQLITE=true
DATABASE_URL_SQLITE=file:./dev.db
```

El esquema de SQLite está en `prisma/schema.sqlite.prisma` y su configuración CLI en `prisma.sqlite.config.ts`.

Valida y genera su cliente, y crea/actualiza únicamente la base local:

```bash
npm run prisma:validate:sqlite
npm run prisma:generate:sqlite
npm run db:push:sqlite
```

No uses los comandos de SQLite para una base PostgreSQL.

### Opción B: PostgreSQL / Neon

Configurá `DATABASE_URL` con la URL de una base PostgreSQL local o de desarrollo. Por ejemplo:

```env
USE_SQLITE=false
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/excel_ui?schema=public"
```

El esquema PostgreSQL está en `prisma/schema.prisma` y su configuración CLI en `prisma7.config.ts`.

Valida el esquema y genera el cliente con:

```bash
npm run prisma:validate
npm run prisma:generate
```

No hay migraciones versionadas todavía. `npm run db:push` está disponible para una base descartable/local, pero no debe ejecutarse contra una base con datos importantes. Antes de publicar, hace falta acordar y verificar un baseline de migraciones compatible con la base PostgreSQL existente.

**Seguridad:** no ejecutes comandos de sincronización o migración contra producción como parte de la configuración local. Verificá siempre a qué base apunta `DATABASE_URL` antes de ejecutar comandos que escriban en ella.

### Generación unificada

Para generar ambos clientes (PostgreSQL y SQLite) a la vez:

```bash
npm run prisma:generate
```

Validación manual opcional:

```bash
npx prisma validate --config=prisma7.config.ts
npx prisma validate --config=prisma.sqlite.config.ts
```

## Desarrollo y verificación

Servidor de desarrollo:

```bash
npm run dev      # http://localhost:8080
```

La aplicación queda disponible en [http://localhost:8080](http://localhost:8080).

Para iniciar sesión con Google, registrá la URL local y el callback `http://localhost:8080/api/auth/callback/google` en las credenciales OAuth. El acceso demo está disponible desde la pantalla de inicio.

### Pruebas y calidad de código

```bash
npm test              # Suite automatizada (Vitest)
npm run test:watch    # Modo watch para pruebas
npm run lint          # ESLint
npm run typecheck     # TypeScript (o npx tsc --noEmit)
npm run build         # Validación/generación Prisma y build Next.js
```

Para ejecutar la aplicación en modo producción después de compilar:

```bash
npm start
```

La build requiere las variables de entorno configuradas. No es necesario cargar datos demo para iniciar la aplicación; `npm run seed` ejecuta un script de datos demo que borra y vuelve a crear los datos de negocio del workspace demo seleccionado. Úsalo solamente con una base descartable y revisa `prisma/seed.ts` antes de ejecutarlo.

## Estructura principal

- `app/`: páginas, layouts y endpoints API (Next.js App Router).
- `prisma/`: esquemas, clientes generados y scripts de datos.
- `server/services/`: lógica de negocio y permisos.
- `server/utils/`: cálculos financieros y utilidades.
- `shared/`: tipos y utilidades compartidas.
- `tests/`: pruebas unitarias y de rutas.
- `.github/workflows/`: integración continua.

## Integración continua (CI)

GitHub Actions instala dependencias, genera ambos clientes Prisma, ejecuta pruebas Vitest, ESLint, chequeo de tipos, build y auditoría de dependencias según se define en `.github/workflows/ci.yml`. La auditoría se configura para fallar ante vulnerabilidades altas o críticas; los hallazgos por debajo de ese umbral requieren seguimiento.