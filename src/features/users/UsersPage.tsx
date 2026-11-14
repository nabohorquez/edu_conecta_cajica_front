import { useEffect, useMemo, useState } from 'react';
import { api, apiConfigured, type ApiRole } from '@/api/client';
import { Avatar, Icon, PageTitle, Stat } from '@/components/ui';

type Role = "admin" | "trainer" | "teacher" | "technical";

export function UsersPage({ openModal, roleOptions, demoUsers, roleLabels }: { openModal: () => void; roleOptions: ApiRole[]; demoUsers: Array<{ id: string; name: string; initials: string; email: string; school: string; role: string; area: string; status: string; last: string }>; roleLabels: Record<string, { label: string }> }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(apiConfigured ? 0 : demoUsers.length);
  const [lastPage, setLastPage] = useState(1);
  const [userRows, setUserRows] = useState(() =>
    apiConfigured ? [] : demoUsers.map((user) => ({ ...user, roles: [user.role] })),
  );
  const [loading, setLoading] = useState(apiConfigured);
  const [apiError, setApiError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  useEffect(() => {
    const refresh = () => setRefreshVersion((version) => version + 1);
    window.addEventListener("educonecta:users-changed", refresh);
    return () => window.removeEventListener("educonecta:users-changed", refresh);
  }, []);
  useEffect(() => {
    if (!apiConfigured) return;
    let cancelled = false;
    setLoading(true);
    api.users({
      buscar: query || undefined,
      activo: status === "Todos" ? undefined : status === "Activo",
      por_pagina: 100,
      page,
    })
      .then(({ data, total, current_page, last_page }) => {
        if (cancelled) return;
        setTotalUsers(total ?? data.length);
        setPage(current_page ?? page);
        setLastPage(last_page ?? 1);
        setUserRows(data.map((user) => {
          const name = user.name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
          const roleNames = user.roles?.map((assignedRole) => assignedRole.rol_name) || [];
          return {
            id: String(user.id),
            name,
            initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
            email: user.email,
            school: "—",
            role: roleNames[0] || "Sin rol",
            roles: roleNames,
            area: "—",
            status: user.activo === false ? "Inactivo" : "Activo",
            last: user.ultimo_acceso_en ? new Date(user.ultimo_acceso_en).toLocaleString("es-CO") : "Sin ingreso",
          };
        }));
        setApiError("");
      })
      .catch((cause) => {
        if (!cancelled) setApiError(cause instanceof Error ? cause.message : "No fue posible cargar usuarios.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query, status, refreshVersion, page]);
  useEffect(() => { setPage(1); }, [query, status]);
  const toggleUserStatus = async (user: (typeof userRows)[number]) => {
    const nextActive = user.status !== "Activo";
    if (apiConfigured) {
      try {
        await api.setUserActive(Number(user.id), nextActive);
      } catch (cause) {
        setApiError(cause instanceof Error ? cause.message : "No fue posible actualizar el usuario.");
        return;
      }
    }
    setUserRows((rows) => rows.map((row) => row.id === user.id
      ? { ...row, status: nextActive ? "Activo" : "Inactivo" }
      : row));
  };
  const filtered = useMemo(
    () =>
      userRows.filter(
        (u) =>
          (u.name + u.email + u.school).toLowerCase().includes(query.toLowerCase()) &&
          (status === "Todos" || u.status === status),
      ),
    [query, status, userRows],
  );
  return (
    <div>
      <PageTitle
        eyebrow="ADMINISTRACIÓN"
        title="Gestión de usuarios"
        subtitle="Administra cuentas, roles y accesos de la comunidad educativa."
        action={
          <button className="primary-btn" onClick={openModal}>
            <Icon name="plus" /> Registrar usuario
          </button>
        }
      />
      <div className="stats-grid small">
        <Stat icon="users" value="1.312" label="Usuarios totales" />
        <Stat icon="check" value="1.086" label="Activos" tone="green" />
        <Stat icon="clock" value="226" label="Inactivos" tone="orange" />
        <Stat icon="school" value="14" label="Instituciones" tone="purple" />
      </div>
      <section className="panel table-panel">
        {apiError && <div className="form-message" role="alert">{apiError}</div>}
        <div className="table-tools">
          <div className="search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, correo o institución..."
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Todos</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
          <button className="secondary-btn">
            <Icon name="filter" /> Más filtros
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Institución educativa</th>
                <th>Área</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8}>Cargando usuarios...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8}>No se encontraron usuarios.</td></tr>}
              {filtered.map((u) => (
                <tr key={u.name}>
                  <td>
                    <b>{u.id}</b>
                  </td>
                  <td>
                    <div className="user-cell">
                      <Avatar initials={u.initials} />
                      <div>
                        <b>{u.name}</b>
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.school}</td>
                  <td>{u.area}</td>
                  <td>
                    <div className="role-tags">
                      {u.roles.map((assignedRole) => (
                        <span className="role-tag" key={assignedRole}>
                          {assignedRole}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status ${u.status === "Activo" ? "success" : "muted-status"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{u.last}</td>
                  <td>
                    <div className="actions">
                      <button title="Ver">
                        <Icon name="eye" />
                      </button>
                      <button
                        title="Asignar roles"
                        onClick={() => setEditingUser(userRows.findIndex((row) => row.id === u.id))}
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        title={u.status === "Activo" ? "Desactivar cuenta" : "Activar cuenta"}
                        onClick={() => void toggleUserStatus(u)}
                      >
                        <Icon name={u.status === "Activo" ? "lock" : "check"} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Mostrando {totalUsers === 0 ? 0 : (page - 1) * 100 + 1}–{Math.min(page * 100, totalUsers)} de {totalUsers.toLocaleString("es-CO")} usuarios</span>
          <div>
            <button disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</button>
            <span>{page} / {lastPage}</span>
            <button disabled={page >= lastPage || loading} onClick={() => setPage((current) => Math.min(lastPage, current + 1))}>Siguiente</button>
          </div>
        </div>
      </section>
      {editingUser !== null && (
        <div className="modal-backdrop">
          <form
            className="modal compact-modal"
            onSubmit={async (e) => {
              e.preventDefault();
              if (apiConfigured) {
                const currentUser = userRows[editingUser];
                const selectedRole = roleOptions.find((option) => currentUser.roles.includes(option.rol_name));
                if (!selectedRole) {
                  setApiError("Selecciona un rol para guardar los cambios.");
                  return;
                }
                try {
                  await api.updateUser(Number(currentUser.id), { rol_id: selectedRole.id });
                  window.dispatchEvent(new Event("educonecta:users-changed"));
                  setApiError("");
                } catch (cause) {
                  setApiError(cause instanceof Error ? cause.message : "No fue posible actualizar el rol.");
                  return;
                }
              }
              setEditingUser(null);
            }}
          >
            <header>
              <div>
                <span className="eyebrow">ROLES_X_USUARIO</span>
                <h2>Asignar roles</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setEditingUser(null)}>
                <Icon name="close" />
              </button>
            </header>
            <div className="role-assignment">
              <div className="selected-user">
                <Avatar initials={userRows[editingUser].initials} />
                <div>
                  <b>{userRows[editingUser].name}</b>
                  <span>{userRows[editingUser].email}</span>
                </div>
              </div>
              <p>
                Selecciona uno o varios roles. La asignación corresponde a la relación{" "}
                <code>roles_x_usuario</code>.
              </p>
              {(apiConfigured ? roleOptions.map((option) => ({ key: option.rol_name, label: option.rol_name })) : (Object.keys(roleLabels) as Role[]).map((roleKey) => ({ key: roleKey, label: roleLabels[roleKey].label }))).map(({ key: roleKey, label }) => {
                const checked = userRows[editingUser].roles.includes(label);
                return (
                  <label className="role-check" key={roleKey}>
                    <input
                      type={apiConfigured ? "radio" : "checkbox"}
                      name={apiConfigured ? "role_assignment" : undefined}
                      checked={checked}
                      onChange={() =>
                        setUserRows((rows) =>
                          rows.map((row, index) =>
                            index === editingUser
                              ? {
                                  ...row,
                                  roles: apiConfigured ? [label] : checked
                                    ? row.roles.filter((r) => r !== label)
                                    : [...row.roles, label],
                                }
                              : row,
                          ),
                        )
                      }
                    />
                    <span>
                      <b>{label}</b>
                      <small>
                        {roleKey === "admin"
                          ? "Administración general"
                          : roleKey === "trainer"
                            ? "Seguimiento y formación"
                            : roleKey === "teacher"
                              ? "Formación personal"
                              : "Monitoreo técnico"}
                      </small>
                    </span>
                  </label>
                );
              })}
              {userRows[editingUser].roles.length === 0 && (
                <div className="form-message">
                  El usuario debe conservar al menos un rol asignado.
                </div>
              )}
            </div>
            <footer>
              <button type="button" className="secondary-btn" onClick={() => setEditingUser(null)}>
                Cancelar
              </button>
              <button className="primary-btn" disabled={userRows[editingUser].roles.length === 0}>
                Guardar asignación
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

