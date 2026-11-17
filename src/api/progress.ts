import { json, request } from "./http";
import type { ApiProgress } from "./types";

export const progressApi = {
  myProgress: () => request<{ progreso: ApiProgress[] }>("/progreso/mi-progreso"),
  myProgressSummary: () => request<{ progreso: ApiProgress[] }>("/progreso/resumen"),
  teacherProgress: (id: number) => request(`/seguimiento/docentes/${id}`),
  teachersTracking: (buscar?: string) =>
    request<{
      data: Array<{
        id: number;
        name: string;
        email: string;
        ultimo_acceso_en?: string | null;
        progreso: ApiProgress[];
      }>;
      current_page?: number;
      last_page?: number;
    }>(`/seguimiento/docentes${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ""}`),
  deadlines: () => request("/plazos-modulos"),
  createDeadline: (data: Record<string, unknown>) => request("/plazos-modulos", json("POST", data)),
  updateDeadline: (id: number, data: Record<string, unknown>) =>
    request(`/plazos-modulos/${id}`, json("PUT", data)),
  deleteDeadline: (id: number) => request(`/plazos-modulos/${id}`, json("DELETE")),
};
