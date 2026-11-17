import { downloadFile, json, request } from "./http";
import type { ApiModule } from "./types";

export const learningApi = {
  levels: () => request("/niveles-competencia"),
  competencies: () => request("/competencias"),
  modules: (nivelId?: number) =>
    request<{ data: ApiModule[] }>(
      `/modulos-formativos?por_pagina=100${nivelId ? `&nivel_id=${nivelId}` : ""}`,
    ),
  module: (id: number) => request<{ modulo: ApiModule }>(`/modulos-formativos/${id}`),
  createModule: (data: Record<string, unknown>) =>
    request("/modulos-formativos", json("POST", data)),
  updateModule: (id: number, data: Record<string, unknown>) =>
    request(`/modulos-formativos/${id}`, json("PUT", data)),
  deactivateModule: (id: number) => request(`/modulos-formativos/${id}`, json("DELETE")),
  lessons: (moduloId?: number) =>
    request<{ data: Array<Record<string, unknown>> }>(
      `/lecciones${moduloId ? `?modulo_id=${moduloId}` : ""}`,
    ),
  createLesson: (data: Record<string, unknown>) => request("/lecciones", json("POST", data)),
  updateLesson: (id: number, data: Record<string, unknown>) =>
    request(`/lecciones/${id}`, json("PUT", data)),
  deleteLesson: (id: number) => request(`/lecciones/${id}`, json("DELETE")),
  lesson: (id: number) => request(`/lecciones/${id}`),
  saveLessonProgress: (id: number, data: { porcentaje: number; estado?: string }) =>
    request(`/lecciones/${id}/progreso`, json("POST", data)),
  lessonResources: (id: number) => request(`/lecciones/${id}/recursos`),
  resources: (params: { modulo_id?: number; leccion_id?: number } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    return request(`/recursos-formativos${query.size ? `?${query}` : ""}`);
  },
  createResource: (data: FormData) =>
    request("/recursos-formativos", { method: "POST", body: data }),
  updateResource: (id: number, data: Record<string, unknown>) =>
    request(`/recursos-formativos/${id}`, json("PUT", data)),
  deleteResource: (id: number) => request(`/recursos-formativos/${id}`, json("DELETE")),
  resource: (id: number) => request(`/recursos-formativos/${id}`),
  downloadResource: (id: number, filename = `recurso-${id}`) =>
    downloadFile(`/recursos-formativos/${id}/descarga`, filename),
  activities: (moduloId?: number) =>
    request<{ data: Array<Record<string, unknown>> }>(
      `/actividades-formativas${moduloId ? `?modulo_id=${moduloId}` : ""}`,
    ),
  createActivity: (data: Record<string, unknown>) =>
    request("/actividades-formativas", json("POST", data)),
  updateActivity: (id: number, data: Record<string, unknown>) =>
    request(`/actividades-formativas/${id}`, json("PUT", data)),
  deleteActivity: (id: number) => request(`/actividades-formativas/${id}`, json("DELETE")),
  activity: (id: number) => request(`/actividades-formativas/${id}`),
  submitActivity: (id: number, data: Record<string, unknown>) =>
    request(`/actividades-formativas/${id}/entregas`, json("POST", data)),
  activitySubmissions: (id: number) => request(`/actividades-formativas/${id}/entregas`),
  evaluations: (moduloId?: number) =>
    request<{ data: Array<Record<string, unknown>> }>(
      `/evaluaciones${moduloId ? `?modulo_id=${moduloId}` : ""}`,
    ),
  createEvaluation: (data: Record<string, unknown>) => request("/evaluaciones", json("POST", data)),
  updateEvaluation: (id: number, data: Record<string, unknown>) =>
    request(`/evaluaciones/${id}`, json("PUT", data)),
  deleteEvaluation: (id: number) => request(`/evaluaciones/${id}`, json("DELETE")),
  evaluation: (id: number) => request(`/evaluaciones/${id}`),
  startEvaluation: (id: number) => request(`/evaluaciones/${id}/intentos`, json("POST")),
  saveEvaluationAnswers: (id: number, respuestas: unknown[]) =>
    request(`/intentos-evaluacion/${id}/respuestas`, json("PUT", { respuestas })),
  finishEvaluation: (id: number) => request(`/intentos-evaluacion/${id}/finalizar`, json("POST")),
  evaluationResult: (id: number) => request(`/intentos-evaluacion/${id}/resultado`),
};
