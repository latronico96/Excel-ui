# Migraciones PostgreSQL

El esquema PostgreSQL está en `prisma/schema.prisma`; Prisma 7 carga la conexión desde `prisma7.config.ts` y busca migraciones en `prisma/migrations`. Hasta esta revisión no había historial versionado de migraciones. El script antiguo `dbpush` permitía usar `prisma db push`, pero el repositorio por sí solo no demuestra qué comando se ejecutó contra cada base.

Se generó `prisma/migrations/20261110120000_init/migration.sql` desde un esquema vacío y `prisma/migrations/migration_lock.toml` declara PostgreSQL. La generación fue offline y no se conectó ni escribió en una base. Esta migración representa el esquema actual, no es un script para ejecutar sobre una base ya poblada.

## Base PostgreSQL nueva y vacía

1. Configura `DATABASE_URL` para una base de desarrollo vacía y confirma la URL antes de cada comando.
2. Valida el esquema y genera Prisma Client:

   ```bash
   npm run prisma:validate
   npm run prisma:generate
   ```

3. Aplica la historia versionada:

   ```bash
   npx prisma migrate deploy --config=prisma7.config.ts
   ```

4. Revisa el resultado con `npx prisma migrate status --config=prisma7.config.ts` y ejecuta la aplicación/pruebas.

`migrate deploy` aplica migraciones pendientes; no genera SQL ni detecta por sí solo drift. La primera ejecución en una base vacía crea las tablas descritas en `migration.sql`.

## Base existente, aunque sea volátil

La migración inicial contiene `CREATE TYPE` y `CREATE TABLE`. Aplicarla normalmente contra una base que ya tiene esas tablas fallará. Que la base sea descartable permite elegir una base vacía nueva, que es el camino más simple; no hace seguro asumir que una base existente coincide.

Si se quiere conservar una base existente:

1. Identifica el proveedor, esquema y URL exactos; toma un snapshot/export antes de cualquier operación que escriba.
2. Prueba con una copia temporal de esa base. Compara el estado real con el esquema con este diff, que consulta la base pero no la modifica:

   ```bash
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script --exit-code --config=prisma7.config.ts
   ```

   Revisa el SQL de salida. El código de salida `0` indica que Prisma no detecta diferencias; `2` indica diferencias. Un diff vacío es requisito para tratar esta migración inicial como equivalente; investiga también extensiones, índices, restricciones, triggers y objetos manuales que Prisma no modela.
3. Solo después de verificar equivalencia, registra la migración inicial como ya aplicada con `prisma migrate resolve --applied 20261110120000_init --config=prisma7.config.ts`. Esto no ejecuta el SQL de la migración, pero sí escribe el historial `_prisma_migrations`.
4. Ejecuta `migrate status`, confirma que no quedan migraciones pendientes y prueba el camino de una migración posterior en una copia.

No uses `migrate resolve` para silenciar un error ni para una base con drift. Si no coincide, conserva el snapshot, reconcilia el esquema con una migración revisada o crea una base realmente vacía y aplica allí la migración. No marques aplicada hasta poder explicar cada diferencia.

## Cambios futuros y producción

- En una base PostgreSQL local descartable, cambia `schema.prisma` y ejecuta `npx prisma migrate dev --name descripcion --config=prisma7.config.ts`. Prisma 7 requiere una shadow database para `migrate dev`; configura una URL local separada si el entorno lo necesita. Revisa y versiona el SQL generado junto con el cambio de esquema.
- Prueba siempre la historia completa sobre otra base vacía y sobre una copia que represente la base existente si se va a conservar.
- En staging/producción, usa solo `npx prisma migrate deploy --config=prisma7.config.ts`, como paso controlado de release con la URL protegida en el entorno. No uses `migrate dev`, `db push` ni `migrate reset` allí.
- Las migraciones aplicadas son inmutables. Para corregir o evolucionar el esquema, agrega otra migración hacia adelante.
- `prisma/schema.sqlite.prisma` es otro proveedor. Esta migración PostgreSQL no debe aplicarse a SQLite; mantén una historia SQLite separada si se decide administrar SQLite mediante migraciones.

El seed PostgreSQL actual reemplaza los datos de negocio del workspace demo. Ejecuta `npm run seed` únicamente sobre una base descartable cuyo contenido hayas revisado; no forma parte de la instalación de producción.
