# Plan de pruebas previo a publicar

## Automatizadas

La suite actual cubre resúmenes, guardado/edición/eliminación de movimientos, rutas de movimientos y lógica de espacios/roles con mocks. Repetir `npm test`, `npm run lint`, `npm run typecheck` y `npm run build` sobre el commit final ya sincronizado. Las pruebas con mocks no validan OAuth real, cookies de producción ni límites de aislamiento en una base real.

## Entorno de prueba

Usa una base PostgreSQL temporal vacía creada desde la migración inicial y dos cuentas Google de prueba distintas. Crea dos espacios privados (A y B), un workspace compartido con OWNER, ADMIN y MEMBER, y datos identificables en cada espacio. No uses cuentas ni datos de producción.

## Recorridos

1. **Google OAuth:** iniciar sesión y cerrar sesión con ambas cuentas; comprobar persistencia/expiración de sesión, callback configurado para el host y rechazo de una sesión ausente.
2. **Movimientos:** crear, listar, editar y eliminar un ingreso y un egreso; verificar montos, medios de pago, comisiones, categoría y resumen después de cada operación.
3. **Invitaciones:** como OWNER/ADMIN crear enlace; abrirlo sin sesión; iniciar sesión con otra cuenta y aceptar; verificar membresía y uso único. Repetir con token inválido, vencido, revocado, usado y cuenta ya miembro.
4. **Roles:** probar cada operación permitida y denegada para OWNER, ADMIN y MEMBER (incluye editar/eliminar espacio, miembros, invitaciones, categorías y medios de pago). Confirmar códigos 401/403 apropiados.
5. **Aislamiento/IDOR:** autenticado como A, cambiar cookie de espacio activo, `workspaceId`, IDs de movimiento/categoría/medio, query parameters y payloads para apuntar a B. Esperar 403/404 y confirmar que el estado de B no cambió. Repetir GET/POST/PUT/DELETE para movimientos, resumen, gastos recurrentes, ajustes, miembros, categorías, medios e invitaciones. Hacer el caso inverso desde B.
6. **Rutas:** visitar páginas protegidas y llamar cada endpoint sin sesión; comprobar que no filtra datos y devuelve 401. Repetir con cookie de espacio desconocido o ajeno: debe volver al espacio autorizado del usuario o rechazar la petición.

## Evidencia a guardar

Para cada caso registra cuenta/rol, endpoint o pantalla, resultado esperado/real y estado HTTP; guarda logs sin tokens ni secretos. Antes de publicar, confirma que no hay peticiones con datos de B aceptadas desde A y que todas las comprobaciones de CI corresponden al commit final de la PR.
