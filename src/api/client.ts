const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "educonecta.api.token";

export type ApiUser = {
  id: number;
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  username?: string | null;
  activo?: boolean;
  ultimo_acceso_en?: string | null;
  roles?: Array<{ id?: number; rol_name: string; description?: string | null }>;
};

export type ApiRole = { id: number; rol_name: string; description?: string | null };
export type ApiModule = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado?: string;
  nivel?: { nombre: string } | null;
  lecciones?: Array<{ id: number; titulo: string; orden?: number }>;
};
export type ApiProgress = {
  modulo_id: number;
  modulo: string;
  nivel?: string;
  estado: string;
  porcentaje: number;
  lecciones_completadas: number;
  total_lecciones: number;
  nota_evaluacion: number | null;
  evaluacion_habilitada: boolean;
  lecciones?: Array<{ id: number; estado: string; porcentaje?: number }>;
};
export type ApiNotification = {
  id: number;
  titulo?: string;
  mensaje?: string;
  leida?: boolean;
  created_at?: string;
};

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>;

  constructor(message: string, status: number, fields?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function downloadFile(path: string, filename: string) {
  if (!API_BASE_URL) throw new ApiError("Configura VITE_API_BASE_URL para descargar informes.", 0);
  const headers = new Headers({ Accept: "text/csv, application/json" });
  const token = getApiToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) throw new ApiError("No fue posible descargar el archivo.", response.status);
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export const apiConfigured = Boolean(API_BASE_URL);

export function getApiToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token: string | null) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("Configura VITE_API_BASE_URL para conectar con el servidor.", 0);
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = getApiToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("No fue posible conectar con el servidor. Revisa la URL y tu conexión.", 0);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    throw new ApiError(
      payload?.mensaje || payload?.message || `Error del servidor (${response.status}).`,
      response.status,
      payload?.errores || payload?.errors,
    );
  }
  return payload as T;
}

const json = (method: string, data?: unknown): RequestInit => ({
  method,
  ...(data === undefined ? {} : { body: JSON.stringify(data) }),
});

export const api = {
  health: () => request<{ estado: string }>("/salud"),
  login: async (email: string, password: string) => {
    const result = await request<{ token: string; usuario: ApiUser; mensaje: string }>(
      "/autenticacion/iniciar-sesion",
      { ...json("POST", { email, password }) },
    );
    setApiToken(result.token);
    return result.usuario;
  },
  logout: async () => {
    try {
      await request("/autenticacion/cerrar-sesion", json("POST"));
    } finally {
      setApiToken(null);
    }
  },
  currentUser: () => request<{ usuario: ApiUser }>("/autenticacion/usuario-actual"),
  requestPasswordReset: (email: string) =>
    request<{ mensaje: string }>("/autenticacion/solicitar-restablecimiento", json("POST", { email })),
  resetPassword: (data: {
    token: string;
    email: string;
    contrasena: string;
    contrasena_confirmation: string;
  }) => request<{ mensaje: string }>("/autenticacion/restablecer-contrasena", json("POST", data)),
  profile: () => request<{ perfil: ApiUser }>("/perfil"),
  updateProfile: (data: Partial<ApiUser>) => request("/perfil", json("PUT", data)),
  users: (params: { buscar?: string; rol?: string; activo?: boolean; por_pagina?: number; page?: number } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]),
    );
    return request<{ data: ApiUser[]; total?: number; current_page?: number; last_page?: number }>(
      `/usuarios${query.size ? `?${query}` : ""}`,
    );
  },
  createUser: (data: {
    first_name: string;
    last_name: string;
    email: string;
    username?: string;
    contrasena: string;
    rol_id: number;
  }) => request<{ usuario?: ApiUser; mensaje?: string }>("/usuarios", json("POST", data)),
  updateUser: (id: number, data: Partial<ApiUser> & { rol_id?: number }) =>
    request(`/usuarios/${id}`, json("PUT", data)),
  setUserActive: (id: number, activo: boolean) =>
    request(`/usuarios/${id}/estado`, json("PATCH", { activo })),
  deleteUser: (id: number) => request(`/usuarios/${id}`, json("DELETE")),
  roles: () => request<{ roles: ApiRole[] }>("/roles"),
  role: (id: number) => request(`/roles/${id}`),
  createRole: (data: { rol_name: string; description?: string }) =>
    request("/roles", json("POST", data)),
  updateRole: (id: number, data: Partial<ApiRole>) => request(`/roles/${id}`, json("PUT", data)),
  deleteRole: (id: number) => request(`/roles/${id}`, json("DELETE")),
  updateRolePermissions: (id: number, permisos: Array<{ pagina_id: number; permiso_id: number }>) =>
    request(`/roles/${id}/permisos`, json("PUT", { permisos })),
  permissionCatalog: () => request("/catalogos/permisos"),
  levels: () => request("/niveles-competencia"),
  competencies: () => request("/competencias"),
  modules: (nivelId?: number) =>
    request<{ data: ApiModule[] }>(`/modulos-formativos?por_pagina=100${nivelId ? `&nivel_id=${nivelId}` : ""}`),
  module: (id: number) => request<{ modulo: ApiModule }>(`/modulos-formativos/${id}`),
  createModule: (data: Record<string, unknown>) => request("/modulos-formativos", json("POST", data)),
  updateModule: (id: number, data: Record<string, unknown>) =>
    request(`/modulos-formativos/${id}`, json("PUT", data)),
  deactivateModule: (id: number) => request(`/modulos-formativos/${id}`, json("DELETE")),
  lessons: (moduloId?: number) =>
    request<{ data: Array<Record<string, unknown>> }>(
      `/lecciones${moduloId ? `?modulo_id=${moduloId}` : ""}`,
    ),
  createLesson: (data: Record<string, unknown>) => request("/lecciones", json("POST", data)),
  updateLesson: (id: number, data: Record<string, unknown>) => request(`/lecciones/${id}`, json("PUT", data)),
  deleteLesson: (id: number) => request(`/lecciones/${id}`, json("DELETE")),
  lesson: (id: number) => request(`/lecciones/${id}`),
  saveLessonProgress: (id: number, data: { porcentaje: number; estado?: string }) =>
    request(`/lecciones/${id}/progreso`, json("POST", data)),
  lessonResources: (id: number) => request(`/lecciones/${id}/recursos`),
  resources: (params: { modulo_id?: number; leccion_id?: number } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]),
    );
    return request(`/recursos-formativos${query.size ? `?${query}` : ""}`);
  },
  createResource: (data: FormData) => request("/recursos-formativos", { method: "POST", body: data }),
  updateResource: (id: number, data: Record<string, unknown>) => request(`/recursos-formativos/${id}`, json("PUT", data)),
  deleteResource: (id: number) => request(`/recursos-formativos/${id}`, json("DELETE")),
  resource: (id: number) => request(`/recursos-formativos/${id}`),
  downloadResource: (id: number, filename = `recurso-${id}`) => downloadFile(`/recursos-formativos/${id}/descarga`, filename),
  activities: (moduloId?: number) =>
    request<{ data: Array<Record<string, unknown>> }>(
      `/actividades-formativas${moduloId ? `?modulo_id=${moduloId}` : ""}`,
    ),
  createActivity: (data: Record<string, unknown>) => request("/actividades-formativas", json("POST", data)),
  updateActivity: (id: number, data: Record<string, unknown>) => request(`/actividades-formativas/${id}`, json("PUT", data)),
  deleteActivity: (id: number) => request(`/actividades-formativas/${id}`, json("DELETE")),
  activity: (id: number) => request(`/actividades-formativas/${id}`),
  submitActivity: (id: number, data: Record<string, unknown>) =>
    request(`/actividades-formativas/${id}/entregas`, json("POST", data)),
  activitySubmissions: (id: number) => request(`/actividades-formativas/${id}/entregas`),
  diagnostics: () => request("/diagnosticos"),
  availableDiagnostic: () => request("/diagnosticos/disponible"),
  diagnostic: (id: number) => request(`/diagnosticos/${id}`),
  startDiagnostic: (id: number) => request(`/diagnosticos/${id}/intentos`, json("POST")),
  saveDiagnosticAnswers: (id: number, respuestas: unknown[]) =>
    request(`/intentos-diagnostico/${id}/respuestas`, json("PUT", { respuestas })),
  finishDiagnostic: (id: number) => request(`/intentos-diagnostico/${id}/finalizar`, json("POST")),
  latestDiagnosticAttempt: () => request("/diagnosticos/mi-ultimo-intento"),
  evaluations: (moduloId?: number) =>
    request<{ data: Array<Record<string, unknown>> }>(
      `/evaluaciones${moduloId ? `?modulo_id=${moduloId}` : ""}`,
    ),
  createEvaluation: (data: Record<string, unknown>) => request("/evaluaciones", json("POST", data)),
  updateEvaluation: (id: number, data: Record<string, unknown>) => request(`/evaluaciones/${id}`, json("PUT", data)),
  deleteEvaluation: (id: number) => request(`/evaluaciones/${id}`, json("DELETE")),
  evaluation: (id: number) => request(`/evaluaciones/${id}`),
  startEvaluation: (id: number) => request(`/evaluaciones/${id}/intentos`, json("POST")),
  saveEvaluationAnswers: (id: number, respuestas: unknown[]) =>
    request(`/intentos-evaluacion/${id}/respuestas`, json("PUT", { respuestas })),
  finishEvaluation: (id: number) => request(`/intentos-evaluacion/${id}/finalizar`, json("POST")),
  evaluationResult: (id: number) => request(`/intentos-evaluacion/${id}/resultado`),
  myProgress: () => request<{ progreso: ApiProgress[] }>("/progreso/mi-progreso"),
  myProgressSummary: () => request<{ progreso: ApiProgress[] }>("/progreso/resumen"),
  teacherProgress: (id: number) => request(`/seguimiento/docentes/${id}`),
  teachersTracking: (buscar?: string) => request<{ data: Array<{ id: number; name: string; email: string; ultimo_acceso_en?: string | null; progreso: ApiProgress[] }>; current_page?: number; last_page?: number }>(`/seguimiento/docentes${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ""}`),
  deadlines: () => request("/plazos-modulos"),
  createDeadline: (data: Record<string, unknown>) => request("/plazos-modulos", json("POST", data)),
  updateDeadline: (id: number, data: Record<string, unknown>) =>
    request(`/plazos-modulos/${id}`, json("PUT", data)),
  deleteDeadline: (id: number) => request(`/plazos-modulos/${id}`, json("DELETE")),
  progressReport: (params: { usuario_id?: number; desde?: string; hasta?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
    );
    return request(`/reportes/progreso${query.size ? `?${query}` : ""}`);
  },
  progressReportCsvUrl: () => `${API_BASE_URL}/reportes/progreso/exportar`,
  downloadProgressReport: () => downloadFile("/reportes/progreso/exportar", "informe-progreso.csv"),
  recordConnectivity: (data: Record<string, unknown>) =>
    request("/conectividad/mediciones", json("POST", data)),
  latestConnectivity: () => request("/conectividad/ultima-medicion"),
  connectivityReport: (params: { usuario_id?: number; desde?: string; hasta?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
    );
    return request(`/reportes/conectividad${query.size ? `?${query}` : ""}`);
  },
  technicalHistory: (params: { desde?: string; hasta?: string; metodo?: string; codigo_estado?: number; tipo?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
    );
    return request<{ data: Array<{ fecha: string; ruta: string; metodo: string; codigo_estado: number; solicitudes: number; tiempo_promedio_ms: number }> }>(`/reportes/tecnicos${query.size ? `?${query}` : ""}`);
  },
  notifications: (noLeidas = false) =>
    request<{ no_leidas: number; notificaciones: { data: ApiNotification[] } }>(
      `/notificaciones?no_leidas=${noLeidas ? "true" : "false"}`,
    ),
  markNotificationRead: (id: number) => request(`/notificaciones/${id}/leida`, json("PATCH")),
  dashboard: (role: "administrador" | "capacitador" | "docente" | "sistemas") =>
    request<Record<string, unknown>>(`/tableros/${role}${role === "sistemas" ? "?meses=2" : ""}`),
};

export function roleFromApiUser(user: ApiUser): "admin" | "trainer" | "teacher" | "technical" | null {
  const roles = user.roles?.map((role) => role.rol_name.toLocaleLowerCase("es")) || [];
  if (roles.some((role) => role.includes("superadministrador") || role.includes("administrador"))) return "admin";
  if (roles.some((role) => role.includes("capacitador"))) return "trainer";
  if (roles.some((role) => role.includes("docente"))) return "teacher";
  if (roles.some((role) => role.includes("sistemas"))) return "technical";
  return null;
}
