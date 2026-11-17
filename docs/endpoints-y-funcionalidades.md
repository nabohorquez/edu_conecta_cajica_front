# Endpoints y funcionalidades — EDUConecta Cajicá

## Alcance del documento

Este contrato describe el backend Laravel de la plataforma de formación docente. La interfaz se construye en un proyecto frontend independiente; este repositorio expone una API REST JSON en español, versionada bajo `/api/v1`.

El contrato OpenAPI 3 completo está en [`openapi.yaml`](./openapi.yaml). Úsalo con Swagger Editor o Swagger UI para consultar esquemas, parámetros, ejemplos y respuestas.

El repositorio heredaba un prototipo Laravel para administración escolar. Sus rutas, controladores, modelos no compartidos, vistas Blade, activos JavaScript y seeders de estudiantes se retiraron. Sus migraciones históricas y sus tablas/datos no se eliminan. La autenticación, los usuarios, los roles y el perfil laboral compartidos se conservan.

## Convenciones comunes

- Las rutas protegidas requieren `Authorization: Bearer <token>` de Sanctum.
- El JSON utiliza UTF-8 y nombres en español para los recursos nuevos.
- Los errores incluyen `mensaje`; validaciones devuelven `422` con `errores`.
- Los listados paginados usan la estructura de paginación de Laravel.
- Las funciones de administración están protegidas por rol en el backend. `SuperAdministrador` conserva acceso administrativo.
- El recurso propio de un docente (perfil, intentos, progreso, entregas, notificaciones y conectividad) se limita al usuario autenticado.
- Los controles de rol complementan las relaciones históricas `roles`, `permissions` y páginas; ocultar opciones en el frontend no sustituye autorización.

## Endpoints por área

Los métodos HTTP, campos obligatorios/opcionales y esquemas de respuesta se especifican en Swagger.

| Área | Endpoints principales | Acceso |
|---|---|---|
| Salud | `GET /salud` | Público |
| Autenticación | `POST /autenticacion/iniciar-sesion`; `POST /autenticacion/cerrar-sesion`; `GET /autenticacion/usuario-actual`; `POST /autenticacion/solicitar-restablecimiento`; `POST /autenticacion/restablecer-contrasena` | Inicio y restablecimiento públicos; restantes con token |
| Perfil | `GET/PUT /perfil`; `PUT /perfil/contrasena` | Usuario autenticado; datos propios |
| Usuarios | CRUD `/usuarios`; `PATCH /usuarios/{id}/estado` | Administrador, sistemas o superadministrador |
| Instituciones | CRUD `/instituciones`; `POST/PUT /instituciones/{id}/usuarios`; `DELETE /instituciones/{id}/usuarios/{usuarioId}` | Administrador, sistemas o superadministrador |
| Roles y permisos | CRUD `/roles`; `PUT /roles/{id}/permisos`; `GET /catalogos/permisos` | Administrador, sistemas o superadministrador |
| Niveles y competencias | `GET/POST /niveles-competencia`; `GET/POST /competencias` | Administrador o sistemas |
| Módulos | CRUD `/modulos-formativos` | Consulta para roles formativos; escritura, administrador o sistemas |
| Lecciones | CRUD `/lecciones`; `POST /lecciones/{id}/progreso`; `GET /lecciones/{id}/recursos` | Consulta formativa; administración de contenidos; progreso propio de docente |
| Recursos | CRUD `/recursos-formativos`; `GET /recursos-formativos/{id}/descarga` | Consulta formativa; escritura, administrador o sistemas |
| Actividades | CRUD `/actividades-formativas`; `POST /actividades-formativas/{id}/entregas`; `GET /actividades-formativas/{id}/entregas` | Consulta para roles formativos; entregas propias del docente y consulta de seguimiento autorizada |
| Diagnóstico | `/diagnosticos`, `/diagnosticos/{id}/preguntas`, `/preguntas-diagnostico/{id}`, `/diagnosticos/{id}/intentos`, `/intentos-diagnostico/{id}/respuestas`, `/intentos-diagnostico/{id}/finalizar`, `/diagnosticos/disponible`, `/diagnosticos/mi-ultimo-intento` | Administración de banco: administrador/sistemas; intentos del docente autenticado. Las preguntas con respuestas registradas no se pueden editar o borrar. |
| Evaluaciones | `/evaluaciones`, `/evaluaciones/{id}/preguntas`, `/preguntas-evaluacion/{id}`, `/evaluaciones/{id}/intentos`, `/intentos-evaluacion/{id}/respuestas`, `/intentos-evaluacion/{id}/finalizar`, `/intentos-evaluacion/{id}/resultado` | Administración de evaluación: administrador/sistemas; intento y resultado propio del docente. Las preguntas con respuestas registradas no se pueden editar o borrar. |
| Progreso y plazos | `GET /progreso/mi-progreso`; `GET /progreso/resumen`; CRUD `/plazos-modulos`; `GET /seguimiento/docentes/{usuarioId}` | Docente consulta datos propios; seguimiento para capacitador, administrador y sistemas |
| Informes | `GET /reportes/progreso`; `GET /reportes/progreso/exportar`; `GET /reportes/conectividad` | Capacitador, administrador y sistemas |
| Conectividad | `POST /conectividad/mediciones`; `GET /conectividad/ultima-medicion` | Docente autenticado, datos propios |
| Notificaciones | `GET /notificaciones`; `PATCH /notificaciones/{id}/leida` | Usuario autenticado, datos propios |
| Tableros | `GET /tableros/administrador`; `GET /tableros/capacitador`; `GET /tableros/docente`; `GET /tableros/sistemas` | Según rol |

## Comportamientos importantes

### Formación

- Cada módulo se asocia opcionalmente a un nivel y a una o varias competencias.
- Una institución puede asociarse con varios docentes y capacitadores; cada usuario puede pertenecer a varias instituciones. Solo se admiten usuarios con rol `Docente` o `Capacitador`.
- Las lecciones ordenadas pertenecen a un módulo; los recursos se asocian al módulo o a una lección.
- Una actividad se asocia exclusivamente a un módulo completo o a una o varias lecciones. Las entregas conservan los intentos de cada docente.
- El contenido desactivado o eliminado lógicamente no debe borrar resultados o entregas históricas.
- El progreso se almacena por docente y lección; el agregado del módulo se calcula desde sus lecciones y el resultado de evaluación.

### Diagnóstico y evaluación

- El docente puede iniciar un solo intento de diagnóstico inicial. La restricción está respaldada por una clave única en `intentos_diagnostico.usuario_id`.
- Las opciones correctas no se envían a los docentes antes de finalizar la evaluación.
- El backend valida que las respuestas correspondan a preguntas/opciones de ese intento.
- La evaluación del módulo se habilita en servidor cuando el docente completa todas sus lecciones activas.
- Puntajes de evaluación se expresan como porcentaje sobre 100. No se elimina el historial al desactivar un módulo o una evaluación.

### Conectividad y telemetría

- El docente registra velocidad, latencia, tipo y estado de conectividad; solo puede consultar sus propias mediciones.
- La API agrega solicitudes, tiempo de respuesta y respuestas HTTP 5xx por fecha, ruta, método y código de estado en `metricas_tecnicas_api`.
- Estas métricas solo describen solicitudes observadas por Laravel. No prueban disponibilidad del hosting, de DNS, del balanceador o de la red; el indicador de disponibilidad global requiere un monitor externo.
- La descarga anticipada de recursos offline no se implementa en este backend.

## Mapa de requisitos

| Requisito | Cobertura |
|---|---|
| RF-01/02/03 — registro, login y perfiles | Alta administrativa `/usuarios`, autenticación `/autenticacion/*` y `/perfil` |
| RF-04 — diagnóstico | `/diagnosticos/*` e intentos/respuestas |
| RF-05/06/14 — módulos y contenidos | `/niveles-competencia`, `/competencias`, `/modulos-formativos`, `/lecciones` y `/recursos-formativos` |
| RF-07 — actividades | `/actividades-formativas` y `/entregas` |
| RF-08/09 — evaluaciones y calificación | `/evaluaciones`, intentos, respuestas y resultados |
| RF-10/11/12 — progreso, necesidades e historial | `/progreso/*`, competencias, entregas e intentos persistidos |
| RF-13 — reportes | `/reportes/progreso` y exportación CSV |
| RF-15 — notificaciones | `/notificaciones` |
| Conectividad, plazos y tablero técnico | `/conectividad/*`, `/plazos-modulos`, `/tableros/sistemas` |
| RIU/RNF — menú adaptado, responsive y UX | El frontend independiente consume roles, estados, permisos, progreso y errores JSON; la interfaz se prueba en su repositorio |

## Funcionalidades deliberadamente fuera de alcance o pendientes de integración

- El frontend React/Flask no existe en este repositorio; aquí no se implementa ni se compilan páginas.
- Recuperación de contraseña requiere que el transporte `MAIL_*` se configure.
- Las notificaciones se consultan y marcan como leídas; sus eventos de generación automática deben integrarse con los casos de uso de negocio.
- La disponibilidad técnica global requiere una fuente de monitoreo externa; no se inventa una métrica cuando no hay datos.
- Los permisos heredados de página/acción se conservan como catálogo. Las rutas nuevas limitan acceso por rol; reglas de permisos granulares por acción requieren formalizar su matriz antes de sustituir la autorización por rol.
