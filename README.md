# EDUConecta Cajicá — frontend

Aplicación web para conectar a docentes, capacitadores, administradores y soporte técnico con los procesos de formación y seguimiento de la comunidad educativa de Cajicá.

El frontend está construido con React y TypeScript sobre Vite. Consume una API Laravel versionada bajo `/api/v1` cuando se configura `VITE_API_BASE_URL`; sin esa variable, la aplicación conserva el modo de demostración disponible para el prototipo.

## Funcionalidades

- Inicio de sesión, recuperación de contraseña y sesión autenticada con la API.
- Vistas por rol para administración, capacitación, docencia y soporte técnico.
- Gestión de usuarios y roles.
- Consulta y administración de módulos, lecciones, recursos, actividades y evaluaciones.
- Diagnóstico, entregas, seguimiento y consulta de progreso.
- Plazos, reportes, conectividad y métricas técnicas.
- Documentación de rutas y contratos de la API.

La disponibilidad de cada operación depende de que el backend Laravel tenga configurada la ruta y los permisos correspondientes. Algunas vistas conservan contenido de demostración cuando la API no está configurada.

## Tecnologías

- React 19 y React DOM
- TypeScript
- Vite 8
- Tailwind CSS 4
- Chart.js
- OpenAPI (YAML) para describir el contrato HTTP

## Requisitos

- Node.js compatible con Vite 8.
- pnpm o npm.
- Backend Laravel ejecutándose si se desea usar la integración real con la API.

## Instalación y ejecución local

Instala las dependencias con uno de estos gestores:

```bash
pnpm install
```

o:

```bash
npm install
```

Crea el archivo local de variables de entorno a partir de la plantilla:

```powershell
Copy-Item .env.example .env.local
```

Configura `VITE_API_BASE_URL` en `.env.local` con la URL completa de la API, incluido el prefijo `/api/v1`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Si el frontend y el backend se ejecutan en orígenes distintos, configura CORS en Laravel para permitir el origen local de Vite. No incluyas contraseñas, tokens ni secretos del backend en variables `VITE_*`: Vite las incorpora en el bundle público.

Inicia Vite:

```bash
pnpm dev
```

o:

```bash
npm run dev
```

El servidor de desarrollo usa el puerto `8443` por defecto, salvo que se defina `PORT`.

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` / `npm run dev` | Inicia el servidor de desarrollo. |
| `pnpm build` / `npm run build` | Genera la aplicación de producción en `dist/`. |
| `pnpm preview` / `npm run preview` | Sirve localmente el último build. |
| `pnpm format` / `npm run format` | Formatea el código con oxfmt. |
| `npm run deploy` | Ejecuta el build y publica `dist/` con el paquete `gh-pages`. |

## Estructura del proyecto

```text
src/
├── api/
│   └── client.ts             # Cliente HTTP, token y operaciones de la API
├── components/               # Componentes compartidos de interfaz, gráficos y paneles
├── features/
│   ├── auth/                 # Acceso y autenticación
│   ├── common/               # Vistas genéricas compartidas
│   ├── connectivity/         # Diagnóstico de conectividad
│   ├── diagnostic/           # Diagnóstico de competencias
│   ├── learning/             # Actividades, evaluaciones, progreso y plazos
│   ├── modules/              # Módulos y administración de contenidos
│   ├── reports/              # Informes y registros técnicos
│   ├── roles/                # Gestión de roles y permisos
│   ├── tracking/             # Seguimiento de docentes
│   └── users/                # Gestión de usuarios
├── types/                    # Tipos compartidos de la aplicación
├── App.tsx                   # Composición, navegación, dashboards y páginas restantes
├── index.css                 # Estilos globales y Tailwind
└── main.tsx                  # Punto de entrada de React

docs/
├── endpoints-y-funcionalidades.md  # Funcionalidades por página y referencia de endpoints
├── estado-implementacion.md        # Resumen del trabajo realizado y estado actual
└── openapi.yaml                    # Contrato de la API en formato OpenAPI
```

Las funcionalidades nuevas deberían ubicarse dentro de `src/features/<nombre>/`, con sus componentes, hooks y tipos propios cuando aplique. Los elementos reutilizados por varias funcionalidades van en `src/components/`; las llamadas HTTP deben centralizarse en `src/api/client.ts` y no repetirse directamente en las páginas.

## API y documentación

- URL base local esperada: `http://127.0.0.1:8000/api/v1`.
- Variable de configuración: `VITE_API_BASE_URL`.
- Contrato OpenAPI: [`docs/openapi.yaml`](docs/openapi.yaml).
- Descripción funcional por página y endpoints: [`docs/endpoints-y-funcionalidades.md`](docs/endpoints-y-funcionalidades.md).
- Estado actual de implementación: [`docs/estado-implementacion.md`](docs/estado-implementacion.md).

Al agregar o modificar una llamada, actualiza el cliente API y el contrato OpenAPI. La autorización por rol debe validarse en Laravel; ocultar controles en el frontend no reemplaza los permisos del backend.

## Publicación en GitHub Pages

Vite está configurado para compilar el sitio con la base `/edu_conecta_cajica_front/`, correspondiente al despliegue de este repositorio como proyecto de GitHub Pages. Para publicar con `gh-pages`:

1. Asegúrate de tener configurado el remoto de GitHub y permisos para publicar.
2. Ejecuta `npm run deploy` desde la rama que quieras publicar. El comando construye la aplicación y publica el contenido de `dist/` en la rama `gh-pages`.
3. En la configuración del repositorio, selecciona GitHub Pages desde la rama `gh-pages` y la carpeta raíz.

GitHub Pages solo sirve el frontend estático. Para usar endpoints reales en producción, configura `VITE_API_BASE_URL` antes del build con la URL pública del backend y asegúrate de que Laravel permita por CORS el dominio de GitHub Pages. Una dirección local como `127.0.0.1` solo sirve durante el desarrollo y no estará disponible para los visitantes. No publiques secretos en el bundle del frontend.

## Flujo recomendado de desarrollo

1. Confirma el comportamiento y los permisos esperados en el contrato OpenAPI y en la documentación funcional.
2. Implementa o actualiza la operación en `src/api/client.ts`.
3. Organiza la vista y su lógica en el directorio de la funcionalidad correspondiente.
4. Maneja estados de carga, errores, validación y resultados vacíos en la interfaz.
5. Actualiza OpenAPI cuando cambie el contrato del backend.
6. Ejecuta `pnpm build` o `npm run build` antes de publicar.
