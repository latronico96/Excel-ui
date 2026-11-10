# Excel-ui

Aplicación web para registrar y consultar las finanzas de un comercio. El proyecto usa Next.js App Router, React, TypeScript y Prisma 7. PostgreSQL (incluido Neon) es la opción prevista para producción; SQLite está configurado como alternativa local.

## Funcionalidades

- Inicio de sesión con Google mediante NextAuth.
- Espacios de trabajo y miembros con roles `OWNER`, `ADMIN` y `MEMBER`, además de invitaciones.
- Registro y edición de ingresos y egresos, incluidos ingresos distribuidos entre medios de pago y sus comisiones.
- Categorías de egresos, medios de pago y gastos recurrentes.
- Resúmenes financieros, configuración de inversión/diezmo y espacio demo.

Estas funciones corresponden a rutas y modelos presentes en el código. La documentación no implica que todos los flujos hayan sido validados en un entorno de producción.

## Requisitos

- Node.js 22 o superior y npm.
- Una base PostgreSQL para trabajar con PostgreSQL. Para desarrollo local también se puede usar el archivo SQLite `prisma/dev.db`.
- Credenciales OAuth de Google para probar el inicio de sesión.

## Instalación

```bash
npm ci
Copy-Item .env.example .env.local
```

Completa `.env.local` con valores locales. No guardes credenciales reales en Git. Para crear `NEXTAUTH_SECRET`, puedes usar `openssl rand -base64 32`.

### PostgreSQL / Neon

Configura `DATABASE_URL` con la URL de una base PostgreSQL de desarrollo. Valida el esquema y genera el cliente:

```bash
npm run prisma:validate
npm run prisma:generate
```

No hay migraciones versionadas todavía. `npm run db:push` está disponible para una base descartable/local, pero no debe ejecutarse contra una base con datos importantes. Antes de publicar, hace falta acordar y verificar un baseline de migraciones compatible con la base PostgreSQL existente.

### SQLite local

El esquema de SQLite es independiente. Configura en `.env.local`:

```env
USE_SQLITE=true
DATABASE_URL_SQLITE=file:./dev.db
```

Valida y genera su cliente, y crea/actualiza únicamente la base local:

```bash
npm run prisma:validate:sqlite
npm run prisma:generate:sqlite
npm run db:push:sqlite
```

No uses los comandos de SQLite para una base PostgreSQL.

## Desarrollo y verificación

```bash
npm run dev       # http://localhost:8080
npm test          # suite automatizada
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run build     # validación/generación Prisma PostgreSQL y build Next.js
```

Para ejecutar la aplicación en modo producción después de compilar:

```bash
npm start
```

La build requiere las variables de entorno configuradas. No es necesario cargar datos demo para iniciar la aplicación; `npm run seed` ejecuta un script de datos demo que borra y vuelve a crear los datos de negocio del workspace demo seleccionado. Úsalo solamente con una base descartable y revisa `prisma/seed.ts` antes de ejecutarlo.

## Variables de entorno

Consulta `.env.example` para la lista documentada. En resumen: `DATABASE_URL` para PostgreSQL, `DATABASE_URL_SQLITE` y `USE_SQLITE` para SQLite, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` para OAuth, `NEXTAUTH_URL` y `NEXTAUTH_SECRET` para NextAuth, y `NEXT_PUBLIC_APP_TITLE` para el título visible.

## CI

GitHub Actions instala dependencias, genera ambos clientes Prisma, ejecuta pruebas, lint, chequeo de tipos, build y auditoría de dependencias. La auditoría se configura para fallar ante vulnerabilidades altas o críticas; los hallazgos por debajo de ese umbral requieren seguimiento.
