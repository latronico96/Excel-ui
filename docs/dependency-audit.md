# Auditoría de dependencias

Auditoría ejecutada el 10 de noviembre de 2026. La auditoría inicial (`npm audit --omit=dev`) informó cinco paquetes de producción afectados. Se actualizaron de forma dirigida `fast-uri` y `gaxios` en `package.json` mediante overrides dentro de rangos compatibles, y se regeneró el lockfile.

| Paquete y versión resuelta | Ruta | Aviso / impacto declarado | Evaluación para esta app |
| --- | --- | --- | --- |
| `fast-uri@3.1.8` → **3.1.9** | `prisma` → `@prisma/dev` → `@prisma/streams-local` → `ajv` → `fast-uri` | Manejo incorrecto de esquemas/hosts y normalización de URI; 4 avisos agrupados. | Transitiva del CLI/dev server, no de los adaptadores usados por el servidor Next.js. `prisma` está declarado en `dependencies`, por eso npm la contaba como producción aunque su uso principal sea de build/desarrollo. No vi evidencia de que la app pase URLs de usuarios a este parser. El lockfile ahora resuelve la versión corregida. |
| `glob@10.5.0` | `google-auth-library` → `gaxios@7.1.3` → `rimraf@5.0.10` → `glob` | Ignorar cancelación/AbortSignal puede continuar el recorrido del filesystem después de vencer; moderada. | Cadena indirecta de Google Auth. El código de la app no ofrece un endpoint de globbing. La actualización de `gaxios` quitó `rimraf`/`glob` de esta ruta del lockfile. |
| `minimatch@9.0.9` | `glob@10.5.0` → `minimatch` | Amplificación de patrones puede causar consumo de recursos; moderada. | Misma cadena de limpieza/tooling de Google Auth. El lockfile actualizado ya no tiene esta copia de producción. |
| `rimraf@5.0.10` | `gaxios@7.1.3` → `rimraf` | Afectado por el `glob` transitivo; no es un aviso independiente. | La actualización de `gaxios` quitó esta ruta del lockfile de producción. |
| `gaxios@7.1.3` → **7.3.1** | Dependencia transitiva de Google Auth / Google APIs | Heredaba los avisos transitivos de `rimraf`/`glob`; no era un aviso independiente. | El override limita el cambio a la rama 7.x y el lockfile resuelve `7.3.1`. |

La auditoría actual de producción (`npm audit --omit=dev`) informa **cero vulnerabilidades**. El árbol confirma `fast-uri@3.1.9` y `gaxios@7.3.1`; `rimraf`, `glob` y `minimatch@9` ya no están bajo esa rama de producción. La auditoría completa (`npm audit`) conserva un aviso moderado de `minimatch@10.2.6` bajo `@typescript-eslint/typescript-estree` / ESLint, que es herramienta de desarrollo y no se instala como runtime de producción. npm muestra seis paquetes afectados en la cadena de desarrollo; corresponde a un aviso GHSA de amplificación de patrones. No hay avisos altos ni críticos.

## Remediación prudente

- Tras resolver la sincronización pendiente, mover `prisma` a `devDependencies` si la configuración de build sigue ejecutando su CLI desde dependencias de desarrollo. Mantener `@prisma/client` y los adaptadores de base donde la app los necesita. Verificar CI/Vercel antes de aceptar el cambio.
- Mantener el aviso de minimatch acotado a tooling de desarrollo y revisar la ruta en cada actualización de ESLint/TypeScript-ESLint. Evitar forzar `minimatch@11` sobre consumidores que declaran rangos 10/9 sin verificar compatibilidad.

No se ejecutó `npm audit fix` general. Se aplicaron solo los dos overrides dirigidos, se instaló desde el lockfile actualizado y se repitieron pruebas, lint, TypeScript y auditoría de producción. La aplicación no contiene endpoints de exploración de filesystem identificados durante esta revisión, pero esto no sustituye un análisis dinámico de todas las dependencias.
