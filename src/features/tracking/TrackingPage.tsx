import { useEffect, useState } from "react";
import { api, apiConfigured, type ApiProgress } from "@/api/client";
import { Avatar, Icon, PageTitle, Progress, Stat } from "@/components/ui";

export function TrackingPage({ demoUsers, demoModules }: { demoUsers: Array<{ name: string; initials: string; school: string }>; demoModules: Array<{ title: string }> }) {
  return apiConfigured ? <ApiTrackingPage /> : <DemoTrackingPage demoUsers={demoUsers} demoModules={demoModules} />;
}

function ApiTrackingPage() {
  type TeacherRow = { id: number; name: string; email: string; ultimo_acceso_en?: string | null; progreso: ApiProgress[] };
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [selected, setSelected] = useState<{ docente: { id: number; name: string; email: string }; progreso: ApiProgress[] }>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.teachersTracking(query || undefined).then((response) => { if (!cancelled) setTeachers(response.data); })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar el seguimiento."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);
  const viewTeacher = async (teacherId: number) => {
    try {
      setSelected(await api.teacherProgress(teacherId) as typeof selected);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar el detalle del docente.");
    }
  };
  if (selected) return <div><button className="back" onClick={() => setSelected(undefined)}><Icon name="arrow" /> Volver al seguimiento</button><PageTitle eyebrow="DETALLE DEL DOCENTE" title={selected.docente.name} subtitle={selected.docente.email} /><section className="panel table-panel"><table><thead><tr><th>Módulo</th><th>Estado</th><th>Avance</th><th>Nota</th></tr></thead><tbody>{selected.progreso.map((item) => <tr key={item.modulo_id}><td>{item.modulo}</td><td>{item.estado}</td><td>{item.porcentaje}%</td><td>{item.nota_evaluacion ?? "—"}</td></tr>)}</tbody></table></section></div>;
  return <div><PageTitle eyebrow="ACOMPAÑAMIENTO" title="Seguimiento de docentes" subtitle="Consulta el avance individual de cada docente." /><section className="panel table-panel"><div className="table-tools"><div className="search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar docente..." /></div></div>{error && <div className="form-message" role="alert">{error}</div>}<div className="table-scroll"><table><thead><tr><th>Docente</th><th>Módulos</th><th>Avance promedio</th><th>Último acceso</th><th></th></tr></thead><tbody>{loading && <tr><td colSpan={5}>Cargando seguimiento...</td></tr>}{!loading && teachers.length === 0 && <tr><td colSpan={5}>No se encontraron docentes.</td></tr>}{teachers.map((teacher) => { const average = teacher.progreso.length ? Math.round(teacher.progreso.reduce((sum, item) => sum + item.porcentaje, 0) / teacher.progreso.length) : 0; return <tr key={teacher.id}><td><div className="user-cell"><Avatar initials={teacher.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()} /><div><b>{teacher.name}</b><span>{teacher.email}</span></div></div></td><td>{teacher.progreso.length}</td><td>{average}%</td><td>{teacher.ultimo_acceso_en ? new Date(teacher.ultimo_acceso_en).toLocaleString("es-CO") : "Sin ingreso"}</td><td><button className="secondary-btn" onClick={() => void viewTeacher(teacher.id)}>Ver detalle</button></td></tr>; })}</tbody></table></div></section></div>;
}

function DemoTrackingPage({ demoUsers, demoModules }: { demoUsers: Array<{ name: string; initials: string; school: string }>; demoModules: Array<{ title: string }> }) {
  const [detail, setDetail] = useState(false);
  if (detail)
    return (
      <div>
        <button className="back" onClick={() => setDetail(false)}>
          <Icon name="arrow" /> Volver al seguimiento consolidado
        </button>
        <PageTitle
          eyebrow="DETALLE DEL DOCENTE"
          title="Andrea Beltrán"
          subtitle="I.E.D. Pompilio Martínez · Ciencias naturales"
        />
        <div className="stats-grid">
          <Stat icon="book" value="8" label="Módulos asignados" />
          <Stat icon="check" value="5" label="Completados" tone="green" />
          <Stat icon="chart" value="78%" label="Avance general" />
          <Stat icon="award" value="4,6" label="Promedio" tone="purple" />
        </div>
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Docente</th>
                <th>Módulo</th>
                <th>Tarea</th>
                <th>Nota</th>
                <th>Fecha de inicio</th>
                <th>Fecha de finalización</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Andrea Beltrán</b>
                </td>
                <td>Ciudadanía digital</td>
                <td>Protocolo de convivencia</td>
                <td>4,6</td>
                <td>03 jun 2025</td>
                <td>14 jun 2025</td>
                <td>
                  <span className="status success">Completada</span>
                </td>
              </tr>
              <tr>
                <td>
                  <b>Andrea Beltrán</b>
                </td>
                <td>Herramientas para el aula</td>
                <td>Diseño de recurso educativo</td>
                <td>—</td>
                <td>15 jun 2025</td>
                <td>—</td>
                <td>
                  <span className="status warning">En curso</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    );
  return (
    <div>
      <PageTitle
        eyebrow="ACOMPAÑAMIENTO"
        title="Seguimiento de docentes"
        subtitle="Consulta el avance individual y prioriza acciones de acompañamiento."
        action={
          <button className="secondary-btn">
            <Icon name="download" /> Exportar informe
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="table-tools">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Buscar docente..." />
          </div>
          <select>
            <option>Todos los módulos</option>
          </select>
          <select>
            <option>Todos los estados</option>
          </select>
          <button className="secondary-btn">
            <Icon name="calendar" /> Fechas
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Docente</th>
                <th>Módulo actual</th>
                <th>Estado</th>
                <th>Avance</th>
                <th>Nota</th>
                <th>Última actividad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {demoUsers.slice(0, 4).map((u, i) => (
                <tr key={u.name}>
                  <td>
                    <div className="user-cell">
                      <Avatar initials={u.initials} />
                      <div>
                        <b>{u.name}</b>
                        <span>{u.school}</span>
                      </div>
                    </div>
                  </td>
                  <td>{demoModules[i % 3].title}</td>
                  <td>
                    <span className={`status ${i === 2 ? "warning" : "success"}`}>
                      {i === 2 ? "Pendiente" : "En curso"}
                    </span>
                  </td>
                  <td>
                    <div className="table-progress">
                      <Progress value={[78, 54, 22, 91][i]} />
                      <b>{[78, 54, 22, 91][i]}%</b>
                    </div>
                  </td>
                  <td>
                    <b>{[4.6, 4.2, 3.8, 4.9][i]}</b> / 5
                  </td>
                  <td>{i === 2 ? "Hace 12 días" : "Hace " + (i + 1) + " días"}</td>
                  <td>
                    <button
                      className="icon-btn"
                      onClick={() => setDetail(true)}
                      title="Consultar detalle"
                    >
                      <Icon name="arrow" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Mostrando 1–4 de 84 docentes</span>
          <div>
            <button className="active">1</button>
            <button>2</button>
            <button>Siguiente</button>
          </div>
        </div>
      </section>
    </div>
  );
}
