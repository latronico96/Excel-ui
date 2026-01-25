# Excel-UI: Gestión de Comercio con Google Sheets

Este proyecto es una aplicación web full-stack construida con **Next.js 14** que utiliza **Google Sheets** como base de datos principal. Permite a pequeños comercios registrar sus movimientos diarios de forma profesional y segura.

## 🚀 Arquitectura
- **Frontend**: Next.js (App Router), React, TypeScript.
- **Backend**: API Routes de Next.js integradas.
- **Servicios**: Capa de abstracción enfocada en Google APIs (`Drive` y `Sheets`).
- **Autenticación**: NextAuth.js con Google Provider y scopes de Drive/Sheets.
- **Almacenamiento**: Google Drive (se crea un archivo ".Control Diario - Mi Comercio" automáticamente).

## 🛠️ Configuración Paso a Paso

### 1. Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto.
3. Habilita las siguientes APIs:
   - **Google Sheets API**
   - **Google Drive API**
4. Ve a **Pantalla de consentimiento de OAuth**:
   - Configura el nombre de la app y tu correo.
   - Añade los scopes: `.../auth/spreadsheets` y `.../auth/drive.file`.
   - Añade tu correo como usuario de prueba (si está en modo Testing).
5. Ve a **Credenciales**:
   - Crea un **ID de cliente de OAuth 2.0** (Tipo: Aplicación Web).
   - Orígenes de JavaScript autorizados: `http://localhost:3000`
   - URI de redireccionamiento autorizados: `http://localhost:3000/api/auth/callback/google`

### 2. Variables de Entorno
Crea un archivo `.env.local` en la raíz copiando el contenido de `.env.example` y completa tus credenciales:
```env
GOOGLE_CLIENT_ID=XXXX
GOOGLE_CLIENT_SECRET=XXXX
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=GeneraUnaClaveSegura
```

### 3. Instalación y Ejecución
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 📊 Funcionalidades
- **Login Seguro**: Acceso restringido con Google OAuth.
- **Gestión de Drive**: Creación automática del Sheet al primer login.
- **Carga de Movimientos**: Formulario inteligente con cálculo de comisiones.
- **Resumen Automático**: Sincronización de totales en tiempo real.
- **Diseño Premium**: Interfaz limpia, responsiva y con modo oscuro soportado.

## 📁 Estructura del Proyecto
- `/app`: Rutas, API y páginas (App Router).
- `/server`: Lógica de negocio y drivers de Google APIs.
- `/shared`: Tipos TypeScript y constantes globales.
- `/public`: Activos estáticos.
- `/components`: (Integrados en /app por simplicidad de estructura solicitada).
