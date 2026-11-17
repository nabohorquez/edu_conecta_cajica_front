import { json, request } from "./http";

export const diagnosticsApi = {
  diagnostics: () => request("/diagnosticos"),
  availableDiagnostic: () => request("/diagnosticos/disponible"),
  diagnostic: (id: number) => request(`/diagnosticos/${id}`),
  startDiagnostic: (id: number) => request(`/diagnosticos/${id}/intentos`, json("POST")),
  saveDiagnosticAnswers: (id: number, respuestas: unknown[]) =>
    request(`/intentos-diagnostico/${id}/respuestas`, json("PUT", { respuestas })),
  finishDiagnostic: (id: number) => request(`/intentos-diagnostico/${id}/finalizar`, json("POST")),
  latestDiagnosticAttempt: () => request("/diagnosticos/mi-ultimo-intento"),
};
