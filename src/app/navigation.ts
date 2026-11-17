import type { IconName } from "@/components/ui";
import type { Role } from "@/types/app";

export const menus: Record<Role, { label: string; icon: IconName; page: string }[]> = {
  admin: [
    { label: "Dashboard", icon: "home", page: "dashboard" },
    { label: "Gestión de usuarios", icon: "users", page: "users" },
    { label: "Instituciones", icon: "school", page: "institutions" },
    { label: "Gestión de roles", icon: "shield", page: "roles" },
    { label: "Gestión de permisos", icon: "lock", page: "permissions" },
    { label: "Módulos formativos", icon: "book", page: "modules" },
    { label: "Diagnóstico digital", icon: "award", page: "diagnostic-admin" },
    { label: "Seguimiento docente", icon: "chart", page: "tracking" },
    { label: "Tiempos de entrega", icon: "clock", page: "deadlines" },
    { label: "Conectividad", icon: "wifi", page: "connectivity-admin" },
  ],
  trainer: [
    { label: "Dashboard", icon: "home", page: "dashboard" },
    { label: "Seguimiento docente", icon: "users", page: "tracking" },
    { label: "Progreso por módulos", icon: "chart", page: "progress" },
    { label: "Informes de progreso", icon: "report", page: "reports" },
    { label: "Informes de conectividad", icon: "wifi", page: "connectivity-admin" },
    { label: "Módulos formativos", icon: "book", page: "modules" },
    { label: "Tiempos de entrega", icon: "clock", page: "deadlines" },
  ],
  teacher: [
    { label: "Inicio", icon: "home", page: "dashboard" },
    { label: "Mi diagnóstico", icon: "award", page: "diagnostic" },
    { label: "Mi formación", icon: "book", page: "learning" },
    { label: "Mis módulos", icon: "school", page: "modules" },
    { label: "Mis lecciones", icon: "book", page: "lessons" },
    { label: "Mis recursos", icon: "download", page: "resources" },
    { label: "Mis actividades", icon: "check", page: "activities" },
    { label: "Mis evaluaciones", icon: "report", page: "evaluations" },
    { label: "Mi progreso", icon: "chart", page: "progress" },
    { label: "Mi conectividad", icon: "wifi", page: "connectivity" },
    { label: "Mi perfil", icon: "settings", page: "profile" },
  ],
  technical: [
    { label: "Dashboard técnico", icon: "home", page: "dashboard" },
    { label: "Gestión de usuarios", icon: "users", page: "users" },
    { label: "Instituciones", icon: "school", page: "institutions" },
    { label: "Gestión de roles", icon: "shield", page: "roles" },
    { label: "Gestión de permisos", icon: "lock", page: "permissions" },
    { label: "Módulos formativos", icon: "book", page: "modules" },
    { label: "Diagnóstico digital", icon: "award", page: "diagnostic-admin" },
    { label: "Seguimiento docente", icon: "chart", page: "tracking" },
    { label: "Tiempos de entrega", icon: "clock", page: "deadlines" },
    { label: "Conectividad", icon: "wifi", page: "connectivity-admin" },
    { label: "Peticiones", icon: "activity", page: "requests" },
    { label: "Rendimiento", icon: "chart", page: "performance" },
    { label: "Historial de errores", icon: "report", page: "errors" },
    { label: "Disponibilidad", icon: "wifi", page: "uptime" },
  ],
};

export const roleNameAliases: Record<Role, string[]> = {
  admin: ["administrador", "superadministrador"],
  trainer: ["capacitador"],
  teacher: ["docente"],
  technical: ["sistemas"],
};

export const permissionRouteAliases: Record<string, string> = {
  "users.index": "users",
  "roles.index": "roles",
  "permissions.index": "permissions",
  "modules.index": "modules",
  "diagnosticos.index": "diagnostic-admin",
  "seguimiento.docentes": "tracking",
  "plazos-modulos.index": "deadlines",
  "reportes.conectividad": "connectivity-admin",
};

export const frontendPages = Array.from(
  new Map(
    Object.values(menus)
      .flat()
      .map((item) => [item.page, item]),
  ).values(),
);
