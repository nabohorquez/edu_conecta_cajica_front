import { API_BASE_URL, downloadFile, request } from "./http";

export const reportsApi = {
  progressReport: (params: { usuario_id?: number; desde?: string; hasta?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
    );
    return request(`/reportes/progreso${query.size ? `?${query}` : ""}`);
  },
  progressReportCsvUrl: () => `${API_BASE_URL}/reportes/progreso/exportar`,
  downloadProgressReport: () => downloadFile("/reportes/progreso/exportar", "informe-progreso.csv"),
  connectivityReport: (params: { usuario_id?: number; desde?: string; hasta?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
    );
    return request(`/reportes/conectividad${query.size ? `?${query}` : ""}`);
  },
  technicalHistory: (
    params: {
      desde?: string;
      hasta?: string;
      metodo?: string;
      codigo_estado?: number;
      tipo?: string;
    } = {},
  ) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined) as Array<[string, string]>,
    );
    return request<{
      data: Array<{
        fecha: string;
        ruta: string;
        metodo: string;
        codigo_estado: number;
        solicitudes: number;
        tiempo_promedio_ms: number;
      }>;
    }>(`/reportes/tecnicos${query.size ? `?${query}` : ""}`);
  },
};
