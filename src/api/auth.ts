import { json, request, setApiToken } from "./http";
import type { ApiUser } from "./types";

export const authApi = {
  login: async (email: string, password: string) => {
    const result = await request<{ token: string; usuario: ApiUser; mensaje: string }>(
      "/autenticacion/iniciar-sesion",
      json("POST", { email, password }),
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
    request<{ mensaje: string }>(
      "/autenticacion/solicitar-restablecimiento",
      json("POST", { email }),
    ),
  resetPassword: (data: {
    token: string;
    email: string;
    contrasena: string;
    contrasena_confirmation: string;
  }) => request<{ mensaje: string }>("/autenticacion/restablecer-contrasena", json("POST", data)),
  profile: () => request<{ perfil: ApiUser }>("/perfil"),
  updateProfile: (data: Partial<ApiUser>) => request("/perfil", json("PUT", data)),
};

export function roleFromApiUser(
  user: ApiUser,
): "admin" | "trainer" | "teacher" | "technical" | null {
  const roles = user.roles?.map((role) => role.rol_name.toLocaleLowerCase("es")) || [];
  if (roles.some((role) => role.includes("superadministrador") || role.includes("administrador"))) {
    return "admin";
  }
  if (roles.some((role) => role.includes("capacitador"))) return "trainer";
  if (roles.some((role) => role.includes("docente"))) return "teacher";
  if (roles.some((role) => role.includes("sistemas"))) return "technical";
  return null;
}
