# Estado de implementación — EDUConecta Cajicá

Este documento resume el trabajo realizado en el frontend y en la integración con Laravel hasta la fecha. Describe el estado conocido del proyecto; no sustituye el contrato OpenAPI ni garantiza que un entorno remoto esté desplegado o disponible.

## Resumen

- El frontend React/TypeScript tiene un cliente centralizado para consumir la API Laravel bajo `/api/v1`.
- La aplicación puede funcionar conectada al backend o en modo de demostración cuando `VITE_API_BASE_URL` está vacío.
- Se conectaron las principales áreas de autenticación, usuarios, formación, diagnóstico, seguimiento, progreso, reportes y conectividad.
- Las páginas de diagnóstico, conectividad, roles/permisos, aprendizaje, seguimiento, perfil e informes están separadas en `src/features/`. `src/App.tsx` conserva la navegación, los dashboards y los datos de demostración.
- Se actualizaron el README y el contrato OpenAPI del frontend.

## Integración frontend–API

El cliente HTTP está en `src/api/client.ts`. Centraliza la URL base, la serialización JSON, el token Bearer, la lectura de errores y las funciones de cada recurso. El token de sesión se guarda en `sessionStorage` bajo `educonecta.api.token`.

La URL base se define en `VITE_API_BASE_URL`. La plantilla `.env.example` propone:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Si la variable no está configurada, `apiConfigured` es `false` y la interfaz usa los datos de demostración donde existe ese modo. Las variables con prefijo `VITE_` quedan expuestas en el código público generado; no deben contener secretos.

### Recursos conectados desde el cliente API

| Área | Rutas principales usadas |
|---|---|
| Salud y autenticación | `GET /salud`, `POST /autenticacion/iniciar-sesion`, `POST /autenticacion/cerrar-sesion`, `GET /autenticacion/usuario-actual`, `POST /autenticacion/solicitar-restablecimiento`, `POST /autenticacion/restablecer-contrasena` |
| Perfil | `GET /perfil`, `PUT /perfil` |
| Usuarios | `GET /usuarios`, `POST /usuarios`, `PUT /usuarios/{id}`, `PATCH /usuarios/{id}/estado`, `DELETE /usuarios/{id}` |
| Roles y permisos | `/roles`, `/roles/{id}`, `PUT /roles/{id}/permisos`, `GET /catalogos/permisos` |
| Formación | `/niveles-competencia`, `/competencias`, `/modulos-formativos`, `/lecciones`, `/recursos-formativos`, `/actividades-formativas` y sus operaciones CRUD |
| Progreso de lecciones | `POST /lecciones/{id}/progreso`, `GET /lecciones/{id}/recursos`, `GET /recursos-formativos/{id}/descarga` |
| Entregas de actividades | `POST /actividades-formativas/{id}/entregas`, `GET /actividades-formativas/{id}/entregas` |
| Diagnóstico | `/diagnosticos`, `/diagnosticos/disponible`, `/diagnosticos/{id}/intentos`, `/intentos-diagnostico/{id}/respuestas`, `/intentos-diagnostico/{id}/finalizar` |
| Evaluaciones | `/evaluaciones`, `/evaluaciones/{id}/intentos`, `/intentos-evaluacion/{id}/respuestas`, `/intentos-evaluacion/{id}/finalizar`, `/intentos-evaluacion/{id}/resultado` |
| Seguimiento y progreso | `/progreso/mi-progreso`, `/progreso/resumen`, `/seguimiento/docentes`, `/seguimiento/docentes/{id}` |
| Plazos | `/plazos-modulos` y `/plazos-modulos/{id}` |
| Informes | `/reportes/progreso`, `/reportes/progreso/exportar`, `/reportes/conectividad`, `/reportes/tecnicos` |
| Conectividad | `/conectividad/mediciones`, `/conectividad/ultima-medicion` |
| Notificaciones y tableros | `/notificaciones`, `/notificaciones/{id}/leida`, `/tableros/{rol}` |

Los nombres anteriores corresponden a las rutas en español del backend. Para parámetros, formatos de respuesta y errores, consultar [`openapi.yaml`](openapi.yaml). El catálogo [`endpoints-y-funcionalidades.md`](endpoints-y-funcionalidades.md) se originó como propuesta funcional y puede incluir rutas de referencia que no coincidan con la API implementada; validar siempre contra OpenAPI y las rutas actuales de Laravel.

## Funcionalidades integradas en la interfaz

- **Acceso:** inicio y cierre de sesión, restauración de sesión al cargar, selección del espacio según el rol de la cuenta y solicitud de restablecimiento de contraseña.
- **Usuarios:** búsqueda, filtro por estado, paginación del servidor, alta de usuario, actualización de rol y activación/desactivación.
- **Roles:** consulta y cambios de roles y permisos.
- **Módulos y contenidos:** consulta de módulos para docentes; gestión de módulos, lecciones, recursos, actividades y evaluaciones para perfiles autorizados.
- **Aprendizaje:** consulta de contenidos, lectura de lecciones, recursos y registro de avance.
- **Diagnóstico y evaluaciones:** creación de intentos, guardado de respuestas y envío/finalización.
- **Actividades:** consulta, entrega y seguimiento de actividades.
- **Seguimiento y progreso:** consulta del progreso propio y del progreso docente permitido por la API.
- **Plazos y reportes:** operaciones de plazos, informes de progreso/conectividad y descarga CSV.
- **Conectividad y soporte:** envío de mediciones desde el navegador, consulta de informes y lectura de métricas técnicas del backend.
- **Perfil y notificaciones:** actualización del perfil y consulta/marcado de notificaciones.

La aplicación obtiene autorización de la API y asigna la vista a partir del rol retornado por Laravel. La autorización efectiva debe permanecer en el backend.

## Ajustes realizados en Laravel

Durante la integración se completaron o ajustaron estos puntos en el repositorio backend:

- Se agregó `GET /api/v1/seguimiento/docentes` para listar docentes con progreso paginado y filtro de búsqueda.
- Se agregó `GET /api/v1/reportes/tecnicos` con filtros de fechas, método, código de estado y tipo de reporte.
- Se expusieron los identificadores del catálogo de páginas y permisos en la respuesta usada para configurar la matriz de roles.
- El resumen de métricas técnicas considera respuestas HTTP desde `400` como errores.
- Se amplió la lista de orígenes de CORS en `.env.example` para desarrollo local y GitHub Pages.
- Se documentaron las rutas nuevas en el OpenAPI del backend.

Los cambios de configuración del ejemplo no sustituyen la configuración real del `.env` del entorno desplegado. El backend debe tener su origen de frontend permitido en CORS y las migraciones/configuración necesarias.

## Organización actual del código

```text
src/
├── api/client.ts
├── components/
│   ├── Logo.tsx
│   ├── Chart.tsx
│   └── ui.tsx
├── features/
│   ├── auth/
│   ├── common/GenericPage.tsx
│   ├── connectivity/ConnectivityPage.tsx
│   ├── diagnostic/
│   │   ├── DiagnosticPage.tsx
│   │   └── DiagnosticAdminPage.tsx
│   ├── learning/WorkPages.tsx
│   ├── modules/LearningPage.tsx
│   ├── modules/ContentManagementPage.tsx
│   ├── modules/ModulesPage.tsx
│   ├── reports/ReportsPages.tsx
│   ├── roles/RolesPage.tsx
│   ├── tracking/TrackingPage.tsx
│   └── users/
│       ├── ProfilePage.tsx
│       └── UsersPage.tsx
├── types/app.ts
├── App.tsx
├── index.css
└── main.tsx
```

`App.tsx` conserva la composición general, navegación, dashboards y datos de demostración; su tamaño bajó de 2.967 a aproximadamente 900 líneas al mover páginas a módulos por funcionalidad. Los elementos compartidos, como gráficos y encabezados de panel, se mantienen en `src/components/`.

## Documentación y ejecución

- [`README.md`](../README.md): instalación, configuración local, comandos y publicación.
- [`openapi.yaml`](openapi.yaml): contrato HTTP documentado.
- [`endpoints-y-funcionalidades.md`](endpoints-y-funcionalidades.md): mapeo funcional por página y endpoints de referencia.
- `.env.example`: URL local de ejemplo para la API.

Para desarrollo local, copia `.env.example` a `.env.local`, ajusta `VITE_API_BASE_URL` y ejecuta `pnpm dev` o `npm run dev`. Para GitHub Pages se necesita configurar la URL pública del backend antes del build; `localhost` o `127.0.0.1` no es accesible para los visitantes del sitio.

## Verificaciones realizadas

- `pnpm.cmd exec tsc --noEmit`: completó correctamente después de la modularización descrita.
- `git diff --check`: sin errores de espacios en los cambios revisados.
- No se ejecutó una suite de pruebas automatizadas.

