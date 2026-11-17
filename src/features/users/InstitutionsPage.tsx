import { useEffect, useState, type FormEvent } from "react";
import { api, apiConfigured, type ApiInstitution, type ApiInstitutionInput } from "@/api/client";
import { Icon, PageTitle } from "@/components/ui";

const INSTITUTIONS_PER_PAGE = 100;

export function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<ApiInstitution[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(apiConfigured);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiInstitution | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!apiConfigured) return;
    let cancelled = false;
    setLoading(true);
    api.institutions({ por_pagina: INSTITUTIONS_PER_PAGE, page })
      .then(({ data, last_page }) => {
        if (cancelled) return;
        setInstitutions(data);
        setLastPage(last_page ?? 1);
        setError("");
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar las instituciones.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  const openForm = (institution: ApiInstitution | null = null) => {
    setError("");
    setEditing(institution);
    setShowForm(true);
  };

  const saveInstitution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const valueOrNull = (key: string) => String(formData.get(key) || "").trim() || null;
    const data: ApiInstitutionInput = {
      nombre: String(formData.get("nombre") || "").trim(),
      codigo_dane: valueOrNull("codigo_dane"),
      direccion: valueOrNull("direccion"),
      telefono: valueOrNull("telefono"),
      email: valueOrNull("email"),
      activo: formData.get("activo") === "true",
    };

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (editing) await api.updateInstitution(editing.id, data);
      else await api.createInstitution(data);
      setShowForm(false);
      setEditing(null);
      setSuccess(editing ? "Institución actualizada correctamente." : "Institución creada correctamente.");
      if (page !== 1) setPage(1);
      else await reloadFirstPage();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar la institución.");
    } finally {
      setSaving(false);
    }
  };

  const reloadFirstPage = async () => {
    setLoading(true);
    try {
      const { data, last_page } = await api.institutions({ por_pagina: INSTITUTIONS_PER_PAGE, page: 1 });
      setInstitutions(data);
      setLastPage(last_page ?? 1);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar las instituciones.");
    } finally {
      setLoading(false);
    }
  };

  const deleteInstitution = async (institution: ApiInstitution) => {
    if (!window.confirm(`¿Eliminar la institución "${institution.nombre}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await api.deleteInstitution(institution.id);
      setSuccess("Institución eliminada correctamente.");
      if (page !== 1) setPage(1);
      else await reloadFirstPage();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible eliminar la institución.");
    }
  };

  if (!apiConfigured) {
    return (
      <div>
        <PageTitle eyebrow="ADMINISTRACIÓN" title="Instituciones" subtitle="Consulta y administra las instituciones educativas." />
        <div className="form-message" role="status">Conecta la API para gestionar instituciones.</div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        eyebrow="ADMINISTRACIÓN"
        title="Instituciones"
        subtitle="Consulta y administra las instituciones educativas."
        action={<button className="primary-btn" onClick={() => openForm()}><Icon name="plus" /> Crear institución</button>}
      />
      {error && <div className="form-message" role="alert">{error}</div>}
      {success && <div className="form-message success" role="status">{success}</div>}
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Institución</th>
                <th>Código DANE</th>
                <th>Contacto</th>
                <th>Usuarios asociados</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6}>Cargando instituciones...</td></tr>}
              {!loading && institutions.length === 0 && <tr><td colSpan={6}>No hay instituciones registradas.</td></tr>}
              {!loading && institutions.map((institution) => (
                <tr key={institution.id}>
                  <td><b>{institution.nombre}</b><span>{institution.direccion || "Sin dirección"}</span></td>
                  <td>{institution.codigo_dane || "—"}</td>
                  <td>{institution.email || institution.telefono || "—"}</td>
                  <td>{institution.usuarios?.length ?? "—"}</td>
                  <td><span className={`status ${institution.activo === false ? "muted-status" : "success"}`}>{institution.activo === false ? "Inactiva" : "Activa"}</span></td>
                  <td>
                    <div className="actions">
                      <button title="Editar institución" onClick={() => openForm(institution)}><Icon name="edit" /></button>
                      <button title="Eliminar institución" onClick={() => void deleteInstitution(institution)}><Icon name="close" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Página {page} de {lastPage}</span>
          <div>
            <button disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</button>
            <button disabled={page >= lastPage || loading} onClick={() => setPage((current) => Math.min(lastPage, current + 1))}>Siguiente</button>
          </div>
        </div>
      </section>
      {showForm && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={(event) => void saveInstitution(event)}>
            <header>
              <div>
                <span className="eyebrow">INSTITUCIONES</span>
                <h2>{editing ? "Editar institución" : "Crear institución"}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setShowForm(false)}><Icon name="close" /></button>
            </header>
            {error && <div className="form-message" role="alert">{error}</div>}
            <div className="form-grid">
              <label className="wide">Nombre<input name="nombre" required maxLength={150} defaultValue={editing?.nombre} /></label>
              <label>Código DANE<input name="codigo_dane" maxLength={20} defaultValue={editing?.codigo_dane || ""} /></label>
              <label>Teléfono<input name="telefono" maxLength={30} defaultValue={editing?.telefono || ""} /></label>
              <label className="wide">Dirección<input name="direccion" maxLength={255} defaultValue={editing?.direccion || ""} /></label>
              <label className="wide">Correo electrónico<input name="email" type="email" defaultValue={editing?.email || ""} /></label>
              <label>Estado<select name="activo" defaultValue={editing?.activo === false ? "false" : "true"}><option value="true">Activa</option><option value="false">Inactiva</option></select></label>
            </div>
            <footer>
              <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="primary-btn" disabled={saving}>{saving ? "Guardando..." : "Guardar institución"}</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
