import type { Role } from "@/types/app";

export const roleInfo = {
  admin: { label: "Administrador", name: "Karen Hoya", initials: "KH", color: "#2563A6" },
  trainer: { label: "Capacitador", name: "Jose Hernandez", initials: "JH", color: "#7C5CFC" },
  teacher: { label: "Docente", name: "Nixon Bohorquez", initials: "NB", color: "#20A58A" },
  technical: {
    label: "Sistemas",
    name: "Daniel Torres",
    initials: "DT",
    color: "#E07A46",
  },
};

export const demoAccounts: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@educonecta.com", password: "AdminDemo2025!" },
  trainer: { email: "capacitador@educonecta.com", password: "CapDemo2025!" },
  teacher: { email: "docente@educonecta.com", password: "DocenteDemo2025!" },
  technical: { email: "sistemas@educonecta.com", password: "SistemasDemo2025!" },
};

export const demoDisplayNames: Record<Role, string> = {
  admin: "Carlos Rodríguez",
  trainer: "Laura Martínez",
  teacher: "Andrés Gómez",
  technical: "Daniel Torres",
};
