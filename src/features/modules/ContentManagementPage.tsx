import { type FormEvent, useEffect, useState } from 'react';
import { api, apiConfigured, type ApiModule } from '@/api/client';
import { Icon, PageTitle, RowActions } from '@/components/ui';

export function ContentManagementPage({ readOnly = false }: { readOnly?: boolean }) {
  return apiConfigured ? <ApiContentManagementPage readOnly={readOnly} /> : <DemoContentManagementPage readOnly={readOnly} />;
}

function ApiContentManagementPage({ readOnly }: { readOnly: boolean }) {
  type ContentTab = "modules" | "lessons" | "resources" | "activities" | "evaluations";
  type ContentRow = Record<string, unknown> & { id: number; nombre?: string; titulo?: string; descripcion?: string; estado?: string; modulo_id?: number; tipo?: string; url?: string; nivel_id?: number; puntaje_minimo?: number; instrucciones?: string };
  const [tab, setTab] = useState<ContentTab>("modules");
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [moduleOptions, setModuleOptions] = useState<ApiModule[]>([]);
  const [levelOptions, setLevelOptions] = useState<Array<{ id: number; nombre: string }>>([]);
  const [editing, setEditing] = useState<ContentRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const labels: Record<ContentTab, string> = { modules: "módulo", lessons: "lección", resources: "recurso", activities: "actividad", evaluations: "evaluación" };
  const load = async (currentTab = tab) => {
    setLoading(true);
    try {
      const [list, moduleResult, levelResult] = await Promise.all([
        currentTab === "modules" ? api.modules() : currentTab === "lessons" ? api.lessons() : currentTab === "resources" ? api.resources() : currentTab === "activities" ? api.activities() : api.evaluations(),
        api.modules(),
        api.levels(),
      ]);
      const listData = list as { data?: ContentRow[]; recursos?: ContentRow[] };
      setRows(listData.data || listData.recursos || []);
      setModuleOptions(moduleResult.data);
      const levels = levelResult as { niveles?: Array<{ id: number; nombre: string }> };
      setLevelOptions(levels.niveles || []);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `No fue posible cargar ${labels[currentTab]}.`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(tab); }, [tab]);
  const remove = async (row: ContentRow) => {
    try {
      if (tab === "modules") await api.deactivateModule(row.id);
      else if (tab === "lessons") await api.deleteLesson(row.id);
      else if (tab === "resources") await api.deleteResource(row.id);
      else if (tab === "activities") await api.deleteActivity(row.id);
      else await api.deleteEvaluation(row.id);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible eliminar el registro.");
    }
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = editing?.id;
    const moduloId = Number(data.get("modulo_id")) || undefined;
    const payload = {
      nombre: String(data.get("nombre") || ""),
      titulo: String(data.get("titulo") || ""),
      descripcion: String(data.get("descripcion") || ""),
      estado: String(data.get("estado") || "activo"),
      modulo_id: moduloId,
      nivel_id: Number(data.get("nivel_id")) || null,
      orden: Number(data.get("orden")) || 0,
      instrucciones: String(data.get("instrucciones") || ""),
      puntaje_minimo: Number(data.get("puntaje_minimo")) || 60,
      tipo: String(data.get("tipo") || "enlace"),
      url: String(data.get("url") || ""),
    };
    setSaving(true);
    try {
      if (tab === "modules") {
        const input = { nombre: payload.nombre, descripcion: payload.descripcion, nivel_id: payload.nivel_id, estado: payload.estado };
        if (id) await api.updateModule(id, input); else await api.createModule(input);
      } else if (tab === "lessons") {
        const input = { modulo_id: moduloId, titulo: payload.titulo, descripcion: payload.descripcion, orden: payload.orden, estado: payload.estado };
        if (id) await api.updateLesson(id, input); else await api.createLesson(input);
      } else if (tab === "resources") {
        const file = data.get("archivo");
        if (id) {
          await api.updateResource(id, { titulo: payload.titulo, descripcion: payload.descripcion, tipo: payload.tipo, url: payload.url || null, orden: payload.orden });
        } else {
          const multipart = new FormData();
          multipart.set("modulo_id", String(moduloId)); multipart.set("titulo", payload.titulo); multipart.set("descripcion", payload.descripcion); multipart.set("tipo", payload.tipo); multipart.set("orden", String(payload.orden));
          if (payload.url) multipart.set("url", payload.url);
          if (file instanceof File && file.size) multipart.set("archivo", file);
          await api.createResource(multipart);
        }
      } else if (tab === "activities") {
        const input = { modulo_id: moduloId, titulo: payload.titulo, descripcion: payload.descripcion, instrucciones: payload.instrucciones, estado: payload.estado };
        if (id) await api.updateActivity(id, input); else await api.createActivity(input);
      } else {
        const input = { modulo_id: moduloId, titulo: payload.titulo, descripcion: payload.descripcion, puntaje_minimo: payload.puntaje_minimo, estado: payload.estado };
        if (id) await api.updateEvaluation(id, input); else await api.createEvaluation(input);
      }
      setModalOpen(false); setEditing(null); await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `No fue posible guardar ${labels[tab]}.`);
    } finally { setSaving(false); }
  };
  const openEditor = (row?: ContentRow) => { setEditing(row || null); setError(""); setModalOpen(true); };
  const nameOf = (row: ContentRow) => String(row.nombre || row.titulo || `Registro ${row.id}`);
  const relationOf = (row: ContentRow) => String((row.modulo as { nombre?: string } | undefined)?.nombre || "—");
  return <div className={readOnly ? "readonly-content" : ""}>
    <PageTitle eyebrow="CONTENIDO FORMATIVO" title="Gestión de módulos" subtitle="Administra módulos, lecciones, recursos, actividades y evaluaciones."
      action={!readOnly && <button className="primary-btn" onClick={() => openEditor()}><Icon name="plus" /> Crear {labels[tab]}</button>} />
    <div className="content-tabs" role="tablist">{(["modules", "lessons", "resources", "activities", "evaluations"] as ContentTab[]).map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "modules" ? "Módulos" : item === "lessons" ? "Lecciones" : item === "resources" ? "Recursos" : item === "activities" ? "Actividades" : "Evaluaciones"}</button>)}</div>
    {error && <div className="form-message" role="alert">{error}</div>}
    <section className="panel table-panel"><div className="table-scroll">{loading ? <p>Cargando {labels[tab]}s...</p> : rows.length === 0 ? <p>No hay registros disponibles.</p> : <table><thead><tr><th>Nombre</th><th>Módulo</th><th>Descripción</th><th>Estado</th><th></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><b>{nameOf(row)}</b></td><td>{tab === "modules" ? (row.nivel as { nombre?: string } | undefined)?.nombre || "—" : relationOf(row)}</td><td>{row.descripcion || "—"}</td><td><span className={`status ${row.estado === "inactivo" ? "muted-status" : "success"}`}>{row.estado || "Activo"}</span></td><td className="actions">{!readOnly && <><button title="Editar" onClick={() => openEditor(row)}><Icon name="edit" /></button><button title="Desactivar o eliminar" onClick={() => void remove(row)}><Icon name="close" /></button></>}</td></tr>)}</tbody></table>}</div></section>
    {modalOpen && <div className="modal-backdrop"><form className="modal" onSubmit={save}><header><div><span className="eyebrow">CONTENIDO FORMATIVO</span><h2>{editing ? "Editar" : "Crear"} {labels[tab]}</h2></div><button type="button" className="icon-btn" onClick={() => setModalOpen(false)}><Icon name="close" /></button></header>
      <div className="form-grid">{tab === "modules" ? <><label>Nombre<input name="nombre" required defaultValue={editing?.nombre} /></label><label>Nivel<select name="nivel_id" defaultValue={editing?.nivel_id || ""}><option value="">Sin nivel</option>{levelOptions.map((level) => <option key={level.id} value={level.id}>{level.nombre}</option>)}</select></label></> : <><label className="wide">Módulo<select name="modulo_id" required defaultValue={editing?.modulo_id || ""}><option value="">Selecciona un módulo</option>{moduleOptions.map((module) => <option key={module.id} value={module.id}>{module.nombre}</option>)}</select></label><label className="wide">Título<input name="titulo" required defaultValue={editing?.titulo} /></label></>}
      <label className="wide">Descripción<textarea name="descripcion" rows={3} defaultValue={editing?.descripcion || ""} /></label>
      {(tab === "lessons" || tab === "resources") && <label>Orden<input name="orden" type="number" min="0" defaultValue={editing?.orden as number || 0} /></label>}
      {tab === "resources" && <><label>Tipo<select name="tipo" defaultValue={editing?.tipo || "enlace"}><option value="enlace">Enlace</option><option value="video">Video</option><option value="archivo">Archivo</option></select></label><label className="wide">URL<input name="url" type="url" defaultValue={editing?.url || ""} /></label>{!editing && <label className="wide">Archivo<input name="archivo" type="file" /></label>}</>}
      {tab === "activities" && <label className="wide">Instrucciones<textarea name="instrucciones" rows={3} defaultValue={editing?.instrucciones || ""} /></label>}
      {tab === "evaluations" && <label>Puntaje mínimo<input name="puntaje_minimo" type="number" min="0" max="100" defaultValue={editing?.puntaje_minimo ?? 60} /></label>}
      {tab !== "resources" && <label>Estado<select name="estado" defaultValue={editing?.estado || "activo"}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>}</div>
      <footer><button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button></footer>
    </form></div>}
  </div>;
}

function DemoContentManagementPage({ readOnly = false }: { readOnly?: boolean }) {
  const [tab, setTab] = useState<
    "modules" | "lessons" | "resources" | "activities" | "evaluations"
  >("modules");
  const labels = {
    modules: "módulo",
    lessons: "lección",
    resources: "recurso",
    activities: "actividad",
    evaluations: "evaluación",
  };
  return (
    <div className={readOnly ? "readonly-content" : ""}>
      <PageTitle
        eyebrow="CONTENIDO FORMATIVO"
        title="Gestión de módulos"
        subtitle="Administra la estructura Competencias → Niveles → Módulos → Lecciones → Recursos."
        action={
          !readOnly ? (
            <button className="primary-btn">
              <Icon name="plus" /> Crear {labels[tab]}
            </button>
          ) : (
            <span className="role-tag">
              <Icon name="eye" size={14} /> Modo consulta
            </span>
          )
        }
      />
      <div className="content-tabs" role="tablist">
        <button className={tab === "modules" ? "active" : ""} onClick={() => setTab("modules")}>
          Módulos
        </button>
        <button className={tab === "lessons" ? "active" : ""} onClick={() => setTab("lessons")}>
          Lecciones
        </button>
        <button className={tab === "resources" ? "active" : ""} onClick={() => setTab("resources")}>
          Recursos
        </button>
        <button
          className={tab === "activities" ? "active" : ""}
          onClick={() => setTab("activities")}
        >
          Actividades
        </button>
        <button
          className={tab === "evaluations" ? "active" : ""}
          onClick={() => setTab("evaluations")}
        >
          Evaluaciones
        </button>
      </div>
      <section className="panel table-panel">
        <div className="table-tools">
          <div className="search">
            <Icon name="search" />
            <input placeholder={`Buscar ${labels[tab]}...`} />
          </div>
          <select>
            <option>Todas las competencias</option>
            <option>Tecnológica</option>
            <option>Comunicativa</option>
            <option>Pedagógica</option>
            <option>De gestión</option>
            <option>Investigativa</option>
          </select>
          <select>
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>
        <div className="table-scroll">
          {tab === "modules" && (
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Competencia</th>
                  <th>Nivel</th>
                  <th>Descripción</th>
                  <th>Orden</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>Ciudadanía digital responsable</b>
                  </td>
                  <td>Tecnológica</td>
                  <td>Exploración</td>
                  <td>Uso seguro de entornos digitales</td>
                  <td>1</td>
                  <td>4 h 30 min</td>
                  <td>
                    <span className="status success">Activo</span>
                  </td>
                  <RowActions />
                </tr>
                <tr>
                  <td>
                    <b>Herramientas para el aula</b>
                  </td>
                  <td>Pedagógica</td>
                  <td>Integración</td>
                  <td>Recursos digitales para la enseñanza</td>
                  <td>2</td>
                  <td>6 h</td>
                  <td>
                    <span className="status success">Activo</span>
                  </td>
                  <RowActions />
                </tr>
                <tr>
                  <td>
                    <b>Proyectos de innovación educativa</b>
                  </td>
                  <td>Investigativa</td>
                  <td>Innovación</td>
                  <td>Diseño de proyectos con tecnología</td>
                  <td>3</td>
                  <td>8 h</td>
                  <td>
                    <span className="status muted-status">Inactivo</span>
                  </td>
                  <RowActions />
                </tr>
              </tbody>
            </table>
          )}
          {tab === "lessons" && (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Módulo asociado</th>
                  <th>Orden</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Identidad digital",
                  "Privacidad y datos personales",
                  "Convivencia en entornos digitales",
                ].map((name, i) => (
                  <tr key={name}>
                    <td>
                      <b>{name}</b>
                    </td>
                    <td>Ciudadanía digital responsable</td>
                    <td>{i + 1}</td>
                    <td>{20 + i * 5} min</td>
                    <td>
                      <span className="status success">Activo</span>
                    </td>
                    <RowActions />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "resources" && (
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Lección</th>
                  <th>Tipo</th>
                  <th>Archivo o dirección</th>
                  <th>Tamaño</th>
                  <th>Descarga</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>Guía de identidad digital</b>
                  </td>
                  <td>Identidad digital</td>
                  <td>
                    <span className="role-tag">PDF</span>
                  </td>
                  <td>guia_identidad_digital.pdf</td>
                  <td>2,4 MB</td>
                  <td>Sí</td>
                  <RowActions />
                </tr>
                <tr>
                  <td>
                    <b>Video introductorio</b>
                  </td>
                  <td>Privacidad y datos</td>
                  <td>
                    <span className="role-tag">Video</span>
                  </td>
                  <td>/media/privacidad.mp4</td>
                  <td>34 MB</td>
                  <td>Sí</td>
                  <RowActions />
                </tr>
                <tr>
                  <td>
                    <b>Lectura complementaria</b>
                  </td>
                  <td>Convivencia digital</td>
                  <td>
                    <span className="role-tag">Enlace</span>
                  </td>
                  <td>/recursos/convivencia</td>
                  <td>—</td>
                  <td>No</td>
                  <RowActions />
                </tr>
              </tbody>
            </table>
          )}
          {tab === "activities" && (
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Módulo</th>
                  <th>Lecciones asociadas</th>
                  <th>Nota máxima</th>
                  <th>Calificable</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>Protocolo de convivencia digital</b>
                  </td>
                  <td>Ciudadanía digital</td>
                  <td>Lecciones 3 y 4</td>
                  <td>5,0</td>
                  <td>Sí</td>
                  <td>
                    <span className="status success">Activa</span>
                  </td>
                  <RowActions />
                </tr>
                <tr>
                  <td>
                    <b>Diseño de recurso educativo</b>
                  </td>
                  <td>Herramientas para el aula</td>
                  <td>Lecciones 2, 3 y 5</td>
                  <td>5,0</td>
                  <td>Sí</td>
                  <td>
                    <span className="status success">Activa</span>
                  </td>
                  <RowActions />
                </tr>
              </tbody>
            </table>
          )}
          {tab === "evaluations" && (
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Módulo</th>
                  <th>Nota mínima</th>
                  <th>Intentos</th>
                  <th>Tiempo límite</th>
                  <th>Preguntas</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>Evaluación final de ciudadanía digital</b>
                  </td>
                  <td>Ciudadanía digital</td>
                  <td>3,5</td>
                  <td>2</td>
                  <td>30 min</td>
                  <td>10</td>
                  <td>
                    <span className="status success">Activa</span>
                  </td>
                  <RowActions />
                </tr>
                <tr>
                  <td>
                    <b>Evaluación de herramientas digitales</b>
                  </td>
                  <td>Herramientas para el aula</td>
                  <td>3,5</td>
                  <td>3</td>
                  <td>40 min</td>
                  <td>12</td>
                  <td>
                    <span className="status warning">Borrador</span>
                  </td>
                  <RowActions />
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div className="pagination">
          <span>Datos de demostración para la estructura administrativa</span>
          <div>
            <button className="active">1</button>
          </div>
        </div>
      </section>
    </div>
  );
}

