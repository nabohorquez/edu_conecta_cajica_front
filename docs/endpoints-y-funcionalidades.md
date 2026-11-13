# Funcionalidades y endpoints propuestos — EDUConecta Cajicá

## Alcance y fuente

Este documento responde a la solicitud de identificar las funcionalidades y endpoints para las páginas que aparecen en `src/App.tsx`, contrastándolas con `Copia de 04 SRS Proyecto.docx.md` y `Tareas a desarrollar.md`.

Los MD describen requisitos y alcance; no son instrucciones para cambiar el comportamiento del prototipo. Las rutas de API de abajo son una propuesta REST para implementarse en Laravel: el frontend actual no tiene integración con API y usa datos de demostración/estado local. Base sugerida: `/api/v1`. Convención: `{id}` es el identificador del recurso; endpoints autenticados requieren sesión/token y autorización por rol.

## Estado general del prototipo

- La página actual es un prototipo navegable por rol: login de demostración, menús y vistas de ejemplo.
- Varios componentes tienen datos fijos o acciones visuales sin persistencia. `GenericPage` cubre páginas que todavía no tienen vista propia; las páginas técnicas comparten una plantilla.
- El SRS pide login, registro, perfil, diagnóstico, módulos/contenidos, actividades, evaluaciones/resultados, progreso, reportes y notificaciones. `Tareas a desarrollar.md` agrega conectividad, tiempos de entrega y métricas técnicas.
- Arquitectura prevista: frontend React, API Laravel/PHP y MySQL. Las rutas HTTP/JSON propuestas pueden implementarse mediante controladores y middleware de Laravel.

## Endpoints transversales

| Método y ruta | Funcionalidad | Requisito |
|---|---|---|
| `POST /auth/login` | Validar credenciales y devolver token/sesión y usuario/rol. | RF-02, RIC-02 |
| `POST /auth/logout` | Invalidar sesión/token. | RNF-SEG-06 |
| `GET /auth/me` | Obtener identidad, rol y permisos de la sesión. | RF-03, RNF-SEG-02 |
| `POST /auth/forgot-password` | Solicitar enlace de recuperación por correo. | Soporte de acceso mostrado por el prototipo; no está detallado en RF |
| `POST /auth/reset-password` | Cambiar contraseña con token de recuperación. | Completa recuperación de acceso |
| `GET /notifications` | Listar notificaciones del usuario, con paginación/filtro de leídas. | RF-15 |
| `PATCH /notifications/{id}/read` | Marcar notificación como leída. | RF-15 |

`POST /auth/register` puede habilitarse si el registro será público; en el alcance actual el registro de usuarios está asignado al administrador. Para alta administrativa usar `POST /users`.

## Páginas y endpoints por rol

Los nombres de página son los valores `page` del menú en `src/App.tsx`. Cuando varias páginas consumen la misma entidad, reutilizan endpoints.

### Acceso y páginas comunes

| Página | Roles | Funcionalidad prevista / estado del ejemplo | Endpoints propuestos |
|---|---|---|---|
| Login (sin `page`) | Todos | Ingresar con credenciales; el prototipo valida cuentas locales de demostración. | `POST /auth/login`, `GET /auth/me` |
| Recuperar contraseña (vista de Login) | Todos | Solicitar y completar recuperación; el prototipo solo simula el envío. | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Centro de ayuda | Todos | Abrir ayuda/soporte; el control actual no tiene acción conectada. | `GET /help/articles`, `POST /support/requests` (si se implementa soporte dentro de la plataforma) |
| Notificaciones (campana) | Todos | Consultar novedades y marcar como leídas; hoy solo muestra un mensaje fijo. | `GET /notifications`, `PATCH /notifications/{id}/read` |

### Administrador

| Página | Funcionalidad que debe ofrecer | Endpoints propuestos |
|---|---|---|
| `dashboard` | Resumen de usuarios, avance, módulos y docentes sin conexión reciente; accesos a seguimiento. La vista actual es demostrativa. | `GET /dashboard/admin`; `GET /reports/activity?since=&until=` |
| `users` | Listar, buscar/filtrar, ver, crear, editar, activar/desactivar usuarios y asignar rol/institución/área. El modal actual solo cierra y muestra toast. | `GET /users?search=&role=&status=&page=`; `POST /users`; `GET /users/{id}`; `PUT /users/{id}`; `PATCH /users/{id}/status`; `DELETE /users/{id}` (baja lógica recomendada); `GET /institutions`; `GET /roles` |
| `roles` | CRUD de roles y asociación de permisos. Vista debe persistir cambios. | `GET /roles`; `POST /roles`; `GET /roles/{id}`; `PUT /roles/{id}`; `DELETE /roles/{id}`; `PUT /roles/{id}/permissions` |
| `permissions` | Consultar/gestionar permisos. El menú llega a `GenericPage`, no hay pantalla específica. | `GET /permissions`; `POST /permissions`; `PUT /roles/{id}/permissions` |
| `modules` | CRUD de módulos formativos y niveles; consultar módulos y acceder a su contenido. | `GET /modules`; `POST /modules`; `GET /modules/{id}`; `PUT /modules/{id}`; `PATCH /modules/{id}/status`; `DELETE /modules/{id}` |
| `lessons` (subvista enlazada desde módulos, según navegación) | CRUD de lecciones, orden, materiales, video/enlaces y asociación a módulo. No aparece en menú admin; confirmar navegación desde `ModulesPage`. | `GET /modules/{moduleId}/lessons`; `POST /modules/{moduleId}/lessons`; `GET /lessons/{id}`; `PUT /lessons/{id}`; `DELETE /lessons/{id}` |
| `activities` | CRUD/consulta de actividades prácticas asociadas a una o más lecciones o a un módulo; para docentes, completar y registrar entrega. | `GET /activities?module_id=&lesson_id=`; `POST /activities`; `GET /activities/{id}`; `PUT /activities/{id}`; `DELETE /activities/{id}`; entregas: `POST /activities/{id}/submissions`, `GET /activities/{id}/submissions`, `GET /submissions/{id}` |
| `evaluations` | Administrar evaluaciones/preguntas/opciones; consultar resultados según permisos. | `GET /modules/{moduleId}/evaluations`; `POST /evaluations`; `GET /evaluations/{id}`; `PUT /evaluations/{id}`; `DELETE /evaluations/{id}`; preguntas: `POST /evaluations/{id}/questions`, `PUT /questions/{id}`, `DELETE /questions/{id}` |
| `diagnostic-admin` | CRUD del banco/módulo de diagnóstico, preguntas, opciones y competencias. | `GET /diagnostics`; `POST /diagnostics`; `GET /diagnostics/{id}`; `PUT /diagnostics/{id}`; `DELETE /diagnostics/{id}`; `POST /diagnostics/{id}/questions`; `PUT /questions/{id}`; `DELETE /questions/{id}` |
| `tracking` | Consultar avance consolidado por docente o módulo: módulo, estado y nota. Filtrar y abrir detalle. | `GET /tracking?teacher_id=&module_id=&status=`; `GET /tracking/teachers/{teacherId}`; `GET /tracking/modules/{moduleId}` |
| `deadlines` | CRUD de fechas de entrega/plazos por módulo y consultar fechas vigentes. | `GET /deadlines?module_id=`; `POST /deadlines`; `GET /deadlines/{id}`; `PUT /deadlines/{id}`; `DELETE /deadlines/{id}` |
| `connectivity-admin` | Consultar estado/conectividad agregada y reportes por docente/periodo. No equivale a administrar la red institucional. | `GET /connectivity/reports?teacher_id=&since=&until=`; `GET /connectivity/summary?since=&until=` |

### Capacitador

| Página | Funcionalidad que debe ofrecer | Endpoints propuestos |
|---|---|---|
| `dashboard` | Resumen de docentes con baja actividad, módulos y tareas pendientes. | `GET /dashboard/trainer`; `GET /tracking?inactive_days=` |
| `tracking` | Seguimiento por docente/módulo con módulo, estado y nota de evaluación. | `GET /tracking?teacher_id=&module_id=&status=`; `GET /tracking/teachers/{teacherId}` |
| `progress` | Avance consolidado y detalle por docente/módulo, con competencias por fortalecer. | `GET /progress?teacher_id=&module_id=`; `GET /progress/teachers/{teacherId}`; `GET /competency-gaps?teacher_id=` |
| `reports` | Informe detallado de progreso con docente, módulo, tarea, nota, fecha de inicio/fin; filtros y descarga. | `GET /reports/progress?teacher_id=&module_id=&since=&until=&format=json`; `GET /reports/progress/export?format=csv` |
| `connectivity-admin` | Informe de conectividad por docente/periodo. | `GET /connectivity/reports?teacher_id=&since=&until=`; `GET /connectivity/summary?since=&until=` |
| `modules` | Consultar módulos y contenidos; administrar tiempos de entrega según Tareas. | `GET /modules`; `GET /modules/{id}`; `GET /modules/{id}/lessons`; endpoints de `deadlines` descritos arriba |
| `deadlines` | Crear/editar plazos de módulos, si el permiso de capacitador se confirma. | Endpoints de `deadlines`; restringir escritura por permisos |

### Docente

| Página | Funcionalidad que debe ofrecer | Endpoints propuestos |
|---|---|---|
| `dashboard` | Resumen personal de módulos, estados, notas y tareas próximas. | `GET /dashboard/teacher`; `GET /progress/me` |
| `diagnostic` | Presentar diagnóstico una sola vez al primer ingreso, guardar respuestas y mostrar nivel/necesidades. | `GET /diagnostics/available`; `GET /diagnostics/{id}`; `POST /diagnostics/{id}/attempts`; `PUT /diagnostic-attempts/{id}/answers`; `POST /diagnostic-attempts/{id}/submit`; `GET /diagnostic-attempts/me/latest` |
| `learning` | Ver plan o ruta formativa recomendada según diagnóstico. La pantalla actual presenta contenido de muestra. | `GET /learning-path/me`; `GET /modules?recommended=true` |
| `modules` | Consultar módulos asignados, estado y progreso; abrir lecciones/actividades; evaluación habilitada al completar las lecciones requeridas. | `GET /modules?assigned_to=me`; `GET /modules/{id}`; `GET /modules/{id}/progress`; `GET /modules/{id}/lessons`; `GET /modules/{id}/activities`; `GET /modules/{id}/evaluations` |
| `lessons` | Ver contenido de lección, materiales/video; marcar completada y reanudar. Menú presente; vista dedicada puede ser genérica. | `GET /lessons/{id}`; `POST /lessons/{id}/progress`; `PATCH /lessons/{id}/complete`; `GET /lessons/{id}/resources` |
| `resources` | Buscar/consultar/descargar recursos de módulos y lecciones. Página del menú sin componente dedicado. | `GET /resources?module_id=&lesson_id=`; `GET /resources/{id}`; descarga mediante URL segura o `GET /resources/{id}/download` |
| `activities` | Ver actividades, guardar avance/respuestas y entregar; mostrar confirmación y estado. | `GET /activities?assigned_to=me&module_id=`; `GET /activities/{id}`; `POST /activities/{id}/submissions`; `PUT /submissions/{id}`; `POST /submissions/{id}/submit`; `GET /submissions/{id}` |
| `evaluations` | Presentar evaluación del módulo solo cuando se cumplan prerrequisitos; guardar intento y respuestas, enviar para calificar. | `GET /modules/{moduleId}/evaluations`; `POST /evaluations/{id}/attempts`; `PUT /evaluation-attempts/{id}/answers`; `POST /evaluation-attempts/{id}/submit`; `GET /evaluation-attempts/{id}/result` |
| `progress` | Ver progreso visual, módulos completados, notas, competencias fortalecidas/necesidades e historial. | `GET /progress/me`; `GET /history/me`; `GET /competency-gaps/me` |
| `connectivity` | Medir/registrar velocidad estimada, latencia, tipo y estado; sugerir descarga anticipada si la conexión es baja. | `POST /connectivity/checks`; `GET /connectivity/me/latest`; `GET /resources/offline?module_id=` (si se implementa descarga anticipada) |
| `profile` | Consultar y actualizar datos personales básicos. Página del menú puede ser genérica en el ejemplo. | `GET /profile`; `PUT /profile`; `PUT /profile/password` |

### Sistemas / soporte técnico

| Página | Funcionalidad que debe ofrecer | Endpoints propuestos |
|---|---|---|
| `dashboard` | Resumen de comunicaciones de los últimos dos meses: peticiones, tiempo promedio, errores y disponibilidad. | `GET /technical/summary?months=2`; `GET /technical/metrics?since=&until=&group_by=month` |
| `requests` | Consultar volumen de peticiones por periodo y filtros; vista actual es una plantilla. | `GET /technical/requests?since=&until=&status=&route=&page=` |
| `performance` | Consultar latencia/tiempo de respuesta promedio y distribución. | `GET /technical/performance?since=&until=&group_by=day` |
| `errors` | Consultar errores por periodo, ruta, tipo y código; restringir datos sensibles. | `GET /technical/errors?since=&until=&status_code=&page=` |
| `uptime` | Consultar disponibilidad por periodo y eventos de interrupción. | `GET /technical/availability?since=&until=`; `GET /technical/incidents?since=&until=` |
| páginas administrativas del rol sistemas | El menú concede las páginas de gestión administrativa; compartir las funciones/endpoints de Administrador, sujetas al permiso asignado. | Reutilizar endpoints administrativos con middleware de autorización |

## Correspondencia breve con los requisitos del SRS

| Requisito | Cobertura de API propuesta |
|---|---|
| RF-01 Registro | `POST /users` (administrativo); opcional `POST /auth/register` si se aprueba autorregistro |
| RF-02 Inicio de sesión | `/auth/login`, `/auth/logout`, `/auth/me` |
| RF-03 Perfiles | `/profile` y `/users/{id}` según rol |
| RF-04 Diagnóstico | `/diagnostics` y `/diagnostic-attempts` |
| RF-05 Gestión de módulos | `/modules` |
| RF-06 Consulta de contenidos | `/modules/{id}/lessons`, `/lessons/{id}`, `/resources` |
| RF-07 Actividades | `/activities`, `/submissions` |
| RF-08 y RF-09 Evaluaciones y calificación | `/evaluations`, `/evaluation-attempts`, resultados |
| RF-10 Progreso | `/progress` y `/tracking` |
| RF-11 Necesidades | `/competency-gaps`, ruta de aprendizaje |
| RF-12 Historial | `/history` |
| RF-13 Reportes | `/reports` |
| RF-14 Gestión de contenidos | CRUD de módulos, lecciones, recursos, actividades y evaluaciones |
| RF-15 Notificaciones | `/notifications` |
| Conectividad y métricas técnicas (Tareas) | `/connectivity/*`, `/technical/*` |

## Reglas de implementación importantes

1. Aplicar autorización por rol/permisos en backend; ocultar botones en React no es control de acceso. Aislar siempre los datos de un docente (`RNF-SEG-05`).
2. Las contraseñas nunca se devuelven ni almacenan en texto plano. Usar HTTPS y respuestas JSON; definir expiración/invalidez de sesión.
3. Validar en servidor los prerrequisitos: diagnóstico inicial único y evaluación habilitada solo tras completar las lecciones requeridas. El cliente solo refleja esos estados.
4. Guardar intentos, respuestas, notas, entregas, fechas e historial para que progreso y reportes sean calculables y persistentes.
5. Paginación, filtros y errores consistentes (por ejemplo, `401`, `403`, `404`, `422`, `500`) para tablas y formularios.
6. La telemetría técnica debe originarse en registros del backend/infraestructura; el frontend no puede determinar por sí solo disponibilidad global o porcentaje de errores del sistema.

## Buenas prácticas recomendadas para Laravel

1. **Separación por responsabilidades:** mantener rutas delgadas en `routes/api.php`; delegar validación a `FormRequest`, autorización a Policies/Gates y lógica de negocio a servicios o acciones. Evitar controladores monolíticos.
2. **API versionada y consistente:** publicar bajo `/api/v1`, usar nombres de recursos en plural, verbos HTTP adecuados, códigos de estado correctos y una estructura JSON uniforme para datos, errores y paginación.
3. **Validación y autorización en servidor:** validar cada entrada con `FormRequest`; proteger rutas con middleware de autenticación y permisos. Usar Policies para verificar acceso a cada recurso y evitar que un docente lea o modifique registros de otro.
4. **Autenticación segura:** usar Laravel Sanctum para tokens si el frontend React y el backend se despliegan por separado, o autenticación de SPA con cookies cuando compartan dominio y la arquitectura lo permita. No guardar contraseñas en texto plano; aplicar hash, HTTPS, expiración/revocación de sesiones y límites de intentos de login.
5. **Persistencia segura:** usar migraciones y seeders versionados; aplicar claves foráneas, índices y transacciones donde varias escrituras formen una sola operación. No exponer modelos completos: responder mediante API Resources/DTOs y ocultar campos sensibles.
6. **Rendimiento y mantenibilidad:** evitar consultas N+1 con eager loading, paginar listados, filtrar en base de datos, centralizar configuración en variables de entorno y mantener secretos fuera del repositorio. Registrar errores sin incluir contraseñas, tokens ni datos sensibles.
7. **Pruebas automatizadas:** añadir pruebas de feature para autenticación, permisos por rol, validaciones, flujos de diagnóstico/evaluación y aislamiento de datos entre docentes; usar factories y base de datos de pruebas.
8. **Documentación Swagger/OpenAPI:** mantener un contrato OpenAPI para `/api/v1`, con descripción, parámetros, esquemas JSON, respuestas y errores, paginación y ejemplos. Documentar los esquemas de autenticación y los permisos por endpoint. Generar/servir Swagger UI en desarrollo y en un entorno protegido; mantener el documento actualizado con los cambios de rutas y validar que la especificación sea válida en integración continua.

En Laravel se puede generar la especificación a partir de anotaciones/atributos o mantener un archivo OpenAPI (YAML/JSON) como fuente del contrato. Elegir una estrategia única para evitar que el código y Swagger queden desactualizados. Una opción común del ecosistema es `L5-Swagger`; antes de adoptarla, verificar compatibilidad con la versión de Laravel y PHP del proyecto.

## Siguiente paso de implementación

Definir el esquema MySQL/ERD y los modelos/migraciones de Laravel; implementar las rutas por módulos (autenticación, usuarios, formación, seguimiento y reportes), publicar el contrato Swagger/OpenAPI e integrar React mediante un cliente HTTP, reemplazando los datos fijos y las acciones de demostración por las rutas correspondientes. La API descrita es una propuesta derivada del alcance, no una afirmación de que ya exista.
