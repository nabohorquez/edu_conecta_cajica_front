import { json, request } from "./http";
import type {
  ApiInstitution,
  ApiInstitutionInput,
  ApiPermissionCatalog,
  ApiRole,
  ApiRoleDetail,
  ApiUser,
} from "./types";

export const usersApi = {
  users: (
    params: {
      buscar?: string;
      rol?: string;
      activo?: boolean;
      por_pagina?: number;
      page?: number;
    } = {},
  ) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    return request<{ data: ApiUser[]; total?: number; current_page?: number; last_page?: number }>(
      `/usuarios${query.size ? `?${query}` : ""}`,
    );
  },
  institutions: (params: { activo?: boolean; por_pagina?: number; page?: number } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    );
    return request<{
      data: ApiInstitution[];
      total?: number;
      current_page?: number;
      last_page?: number;
    }>(`/instituciones${query.size ? `?${query}` : ""}`);
  },
  institution: (id: number) => request<{ institucion: ApiInstitution }>(`/instituciones/${id}`),
  createInstitution: (data: ApiInstitutionInput) =>
    request<{ institucion?: ApiInstitution; mensaje?: string }>(
      "/instituciones",
      json("POST", data),
    ),
  updateInstitution: (id: number, data: Partial<ApiInstitutionInput>) =>
    request<{ institucion?: ApiInstitution; mensaje?: string }>(
      `/instituciones/${id}`,
      json("PUT", data),
    ),
  patchInstitution: (id: number, data: Partial<ApiInstitutionInput>) =>
    request<{ institucion?: ApiInstitution; mensaje?: string }>(
      `/instituciones/${id}`,
      json("PATCH", data),
    ),
  deleteInstitution: (id: number) =>
    request<{ mensaje?: string }>(`/instituciones/${id}`, json("DELETE")),
  addInstitutionUsers: (id: number, usuarios: number[]) =>
    request<{ mensaje?: string; institucion?: ApiInstitution }>(
      `/instituciones/${id}/usuarios`,
      json("POST", { usuarios }),
    ),
  replaceInstitutionUsers: (id: number, usuarios: number[]) =>
    request<{ mensaje?: string; institucion?: ApiInstitution }>(
      `/instituciones/${id}/usuarios`,
      json("PUT", { usuarios }),
    ),
  removeInstitutionUser: (id: number, userId: number) =>
    request<{ mensaje?: string }>(`/instituciones/${id}/usuarios/${userId}`, json("DELETE")),
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
  role: (id: number) => request<{ rol: ApiRoleDetail }>(`/roles/${id}`),
  createRole: (data: { rol_name: string; description?: string }) =>
    request("/roles", json("POST", data)),
  updateRole: (id: number, data: Partial<ApiRole>) => request(`/roles/${id}`, json("PUT", data)),
  deleteRole: (id: number) => request(`/roles/${id}`, json("DELETE")),
  updateRolePermissions: (id: number, permisos: Array<{ pagina_id: number; permiso_id: number }>) =>
    request<{ mensaje?: string }>(`/roles/${id}/permisos`, json("PUT", { permisos })),
  permissionCatalog: () => request<ApiPermissionCatalog>("/catalogos/permisos"),
};
