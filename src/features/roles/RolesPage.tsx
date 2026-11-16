import { useEffect, useState, type FormEvent } from "react";
import { api, apiConfigured, type ApiRole } from "@/api/client";
import { Icon, PageTitle, PanelHead, RowActions } from "@/components/ui";

export function RolesPage() {
  return apiConfigured ? <ApiRolesPage /> : <DemoRolesPage />;
}

function ApiRolesPage() {
  type PagePermission = { id: number; page_name: string; route?: string };
  type Permission = { id: number; permission: string };
  type RoleDetail = ApiRole & { pages_by_role?: Array<{ id_page: number; id_permission: number }> };
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [pages, setPages] = useState<PagePermission[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiRole | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const [roleResult, catalogResult] = await Promise.all([api.roles(), api.permissionCatalog()]);
      const catalog = catalogResult as { paginas: PagePermission[]; permisos: Permission[] };
      setRoles(roleResult.roles);
      setPages(catalog.paginas || []);
      setPermissions(catalog.permisos || []);
      setSelectedRoleId((current) => current || roleResult.roles[0]?.id || null);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible cargar roles y permisos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!selectedRoleId) return;
    api.role(selectedRoleId).then((response) => {
      const role = (response as { rol: RoleDetail }).rol;
      setSelectedPermissions(new Set((role.pages_by_role || []).map((item) => `${item.id_page}:${item.id_permission}`)));
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar los permisos del rol."));
  }, [selectedRoleId]);
  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const saveRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      if (editing) await api.updateRole(editing.id, { rol_name: String(data.get("rol_name")), description: String(data.get("description")) });
      else await api.createRole({ rol_name: String(data.get("rol_name")), description: String(data.get("description")) });
      setShowForm(false); setEditing(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar el rol."); }
    finally { setSaving(false); }
  };
  const savePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const permisos = Array.from(selectedPermissions).map((value) => {
        const [pagina_id, permiso_id] = value.split(":").map(Number);
        return { pagina_id, permiso_id };
      });
      const response = await api.updateRolePermissions(selectedRoleId, permisos);
      setSuccess(response.mensaje || "Permisos guardados correctamente.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar los permisos."); }
    finally { setSaving(false); }
  };
  const removeRole = async (id: number) => {
    try { await api.deleteRole(id); if (selectedRoleId === id) setSelectedRoleId(null); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible eliminar el rol."); }
  };
  return <div><PageTitle eyebrow="ADMINISTRACIÓN" title="Roles y permisos" subtitle="Configura roles y permisos de acceso a páginas." action={<button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true); }}><Icon name="plus" /> Crear rol</button>} />
    {error && <div className="form-message" role="alert">{error}</div>}
    {success && <div className="form-message success" role="status">{success}</div>}
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Rol</th><th>Descripción</th><th></th></tr></thead><tbody>{loading && <tr><td colSpan={3}>Cargando roles...</td></tr>}{roles.map((role) => <tr key={role.id}><td><b>{role.rol_name}</b></td><td>{role.description || "—"}</td><td className="actions"><button title="Editar" onClick={() => { setEditing(role); setShowForm(true); }}><Icon name="edit" /></button><button title="Eliminar" onClick={() => void removeRole(role.id)}><Icon name="close" /></button></td></tr>)}</tbody></table></div></section>
    <section className="panel permission-panel"><PanelHead title="Matriz de permisos" subtitle="Los cambios aplican a todos los usuarios que tengan asignado el rol." /><label>Rol<select value={selectedRoleId || ""} onChange={(event) => setSelectedRoleId(Number(event.target.value) || null)}>{roles.map((role) => <option key={role.id} value={role.id}>{role.rol_name}</option>)}</select></label><div className="table-scroll"><table><thead><tr><th>Página</th>{permissions.map((permission) => <th key={permission.id}>{permission.permission}</th>)}</tr></thead><tbody>{pages.map((page) => <tr key={page.id}><td><b>{page.page_name}</b></td>{permissions.map((permission) => { const key = `${page.id}:${permission.id}`; return <td key={permission.id}><input type="checkbox" aria-label={`${permission.permission} ${page.page_name}`} checked={selectedPermissions.has(key)} onChange={(event) => setSelectedPermissions((current) => { const updated = new Set(current); if (event.target.checked) updated.add(key); else updated.delete(key); return updated; })} /></td>; })}</tr>)}</tbody></table></div><button className="primary-btn" disabled={saving || !selectedRoleId} onClick={() => void savePermissions()}>{saving ? "Guardando..." : "Guardar permisos"}</button></section>
    {showForm && <div className="modal-backdrop"><form className="modal compact-modal" onSubmit={saveRole}><header><div><span className="eyebrow">ROLES</span><h2>{editing ? "Editar rol" : "Crear rol"}</h2></div><button type="button" className="icon-btn" onClick={() => setShowForm(false)}><Icon name="close" /></button></header><div className="form-grid"><label>Nombre<input name="rol_name" required maxLength={20} defaultValue={editing?.rol_name} /></label><label className="wide">Descripción<input name="description" maxLength={100} defaultValue={editing?.description || ""} /></label></div><footer><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? "Guardando..." : "Guardar rol"}</button></footer></form></div>}
  </div>;
}

function DemoRolesPage() {
  const permissions = [
    "Dashboard",
    "Usuarios",
    "Módulos",
    "Diagnóstico",
    "Seguimiento",
    "Reportes técnicos",
  ];
  const roles = [
    ["Administrador", "Gestiona usuarios, roles y contenidos", "Activo"],
    ["Capacitador", "Acompaña y califica a docentes", "Activo"],
    ["Docente", "Realiza formación y evaluaciones", "Activo"],
    ["Sistemas", "Consulta registros de comunicaciones", "Activo"],
  ];
  return (
    <div>
      <PageTitle
        eyebrow="ADMINISTRACIÓN"
        title="Roles y permisos"
        subtitle="Configura el acceso a páginas y acciones del sistema."
        action={
          <button className="primary-btn">
            <Icon name="plus" /> Crear rol
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Rol</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r[0]}>
                  <td>
                    <b>{r[0]}</b>
                  </td>
                  <td>{r[1]}</td>
                  <td>
                    <span className="status success">{r[2]}</span>
                  </td>
                  <RowActions />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel permission-panel">
        <PanelHead
          title="Matriz de permisos"
          subtitle="Permisos asociados a las páginas del sistema"
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Página</th>
                {["Ver", "Crear", "Editar", "Eliminar"].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={p}>
                  <td>
                    <b>{p}</b>
                  </td>
                  {[0, 1, 2, 3].map((a) => (
                    <td key={a}>
                      <input
                        type="checkbox"
                        aria-label={`${a} ${p}`}
                        defaultChecked={i === 0 || a === 0 || (i < 3 && a < 3)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
