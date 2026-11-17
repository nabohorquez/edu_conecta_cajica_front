import { request } from "./http";

export const dashboardApi = {
  dashboard: (role: "administrador" | "capacitador" | "docente" | "sistemas") =>
    request<Record<string, unknown>>(`/tableros/${role}${role === "sistemas" ? "?meses=2" : ""}`),
};
