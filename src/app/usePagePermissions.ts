import { useEffect, useState } from "react";
import { api, apiConfigured, type ApiUser } from "@/api/client";
import type { Role } from "@/types/app";
import { frontendPages, menus, permissionRouteAliases, roleNameAliases } from "./navigation";

export function usePagePermissions(role: Role, user?: ApiUser) {
  const [allowedPages, setAllowedPages] = useState<Set<string>>(
    () => new Set(apiConfigured ? [] : menus[role].map((item) => item.page)),
  );
  const [pageLabels, setPageLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(apiConfigured);
  const [error, setError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshVersion((version) => version + 1);
    window.addEventListener("educonecta:permissions-changed", refresh);
    return () => window.removeEventListener("educonecta:permissions-changed", refresh);
  }, []);

  useEffect(() => {
    if (!apiConfigured) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setAllowedPages(new Set());
    setPageLabels({});

    const loadPermissions = async () => {
      const catalog = await api.permissionCatalog();
      const viewPermissionId = catalog.permisos.find(
        (permission) => permission.permission.toLocaleLowerCase("es") === "view",
      )?.id;
      if (viewPermissionId === undefined) {
        throw new Error("El catálogo no contiene el permiso de lectura (view).");
      }

      const assignedRoles = user?.roles || [];
      const roleIds = assignedRoles
        .map((assignedRole) => assignedRole.id)
        .filter((id): id is number => typeof id === "number");
      if (roleIds.length < assignedRoles.length || assignedRoles.length === 0) {
        const { roles } = await api.roles();
        const assignedNames = assignedRoles.length
          ? assignedRoles.map((assignedRole) => assignedRole.rol_name.toLocaleLowerCase("es"))
          : roleNameAliases[role];
        roleIds.push(
          ...roles
            .filter((apiRole) => assignedNames.includes(apiRole.rol_name.toLocaleLowerCase("es")))
            .map((apiRole) => apiRole.id),
        );
      }

      const uniqueRoleIds = Array.from(new Set(roleIds));
      if (uniqueRoleIds.length === 0) {
        throw new Error("No fue posible determinar los roles asignados al usuario.");
      }
      const roleDetails = await Promise.all(uniqueRoleIds.map((id) => api.role(id)));
      const permittedPageIds = new Set(
        roleDetails.flatMap(({ rol }) =>
          (rol.pages_by_role || [])
            .filter((assignment) => assignment.id_permission === viewPermissionId)
            .map((assignment) => assignment.id_page),
        ),
      );
      const supportedPages = new Set(frontendPages.map((item) => item.page));
      const pageEntries = catalog.paginas
        .filter((page) => permittedPageIds.has(page.id) && page.route)
        .flatMap((page) =>
          page.route
            ? [
                {
                  route: permissionRouteAliases[page.route] || page.route,
                  label: page.page_name,
                },
              ]
            : [],
        )
        .filter((page) => supportedPages.has(page.route));
      const routes = new Set(pageEntries.map((page) => page.route));
      if (routes.size === 0) {
        throw new Error("Los roles asignados no tienen permiso de lectura en ninguna página.");
      }
      if (!cancelled) {
        setAllowedPages(routes);
        setPageLabels(Object.fromEntries(pageEntries.map((page) => [page.route, page.label])));
      }
    };

    loadPermissions()
      .catch((cause) => {
        if (!cancelled) {
          setAllowedPages(new Set());
          setPageLabels({});
          setError(
            cause instanceof Error
              ? cause.message
              : "No fue posible cargar los permisos de páginas.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role, user, refreshVersion]);

  return { allowedPages, pageLabels, loading, error };
}
