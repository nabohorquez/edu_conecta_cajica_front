import { useEffect, useState } from "react";
import { api, apiConfigured } from "@/api/client";
import { Chart } from "@/components/Chart";
import { Icon, PageTitle, PanelHead, Stat } from "@/components/ui";

export function ReportsPage({ connectivity = false }: { connectivity?: boolean }) {
  return apiConfigured ? <ApiReportsPage connectivity={connectivity} /> : <DemoReportsPage connectivity={connectivity} />;
}

function ApiReportsPage({ connectivity }: { connectivity: boolean }) {
  type ReportRow = { docente?: string; usuario?: { name?: string; email?: string }; modulo?: string; tarea?: string; nota?: number | null; fecha_inicio?: string; fecha_fin?: string; estado?: string; latencia_ms?: number; velocidad_bajada?: number; tipo_conexion?: string; medido_en?: string };
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const query = { desde: from || undefined, hasta: to || undefined };
    const request = connectivity ? api.connectivityReport(query) : api.progressReport(query);
    request.then((response) => {
      const data = response as { informe?: ReportRow[]; data?: ReportRow[] };
      if (!cancelled) setRows(data.informe || data.data || []);
    }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible generar el informe."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [connectivity, from, to]);
  const averageGrade = rows.map((row) => row.nota).filter((grade): grade is number => grade !== null && grade !== undefined);
  const button = connectivity ? undefined : <button className="secondary-btn" onClick={() => void api.downloadProgressReport().catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible descargar el informe."))}><Icon name="download" /> Exportar CSV</button>;
  return <div><PageTitle eyebrow="INFORMES" title={connectivity ? "Informe de conectividad" : "Informe de progreso"} subtitle="Consulta información consolidada del periodo seleccionado." action={button} />
    {error && <div className="form-message" role="alert">{error}</div>}
    <section className="panel table-panel"><div className="table-tools"><label>Desde<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label>Hasta<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label></div><div className="table-scroll"><table><thead>{connectivity ? <tr><th>Docente</th><th>Fecha</th><th>Descarga</th><th>Latencia</th><th>Conexión</th><th>Estado</th></tr> : <tr><th>Docente</th><th>Módulo</th><th>Tarea</th><th>Nota</th><th>Inicio</th><th>Fin</th></tr>}</thead><tbody>{loading && <tr><td colSpan={connectivity ? 6 : 6}>Generando informe...</td></tr>}{!loading && rows.length === 0 && <tr><td colSpan={6}>No hay datos para el periodo seleccionado.</td></tr>}{rows.map((row, index) => connectivity ? <tr key={`${row.usuario?.email}-${row.medido_en}-${index}`}><td>{row.usuario?.name || row.usuario?.email || "—"}</td><td>{row.medido_en ? new Date(row.medido_en).toLocaleString("es-CO") : "—"}</td><td>{row.velocidad_bajada ?? "—"} Mbps</td><td>{row.latencia_ms ?? "—"} ms</td><td>{row.tipo_conexion || "—"}</td><td>{row.estado || "—"}</td></tr> : <tr key={`${row.docente}-${row.tarea}-${index}`}><td>{row.docente || "—"}</td><td>{row.modulo || "—"}</td><td>{row.tarea || "—"}</td><td>{row.nota ?? "—"}</td><td>{row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString("es-CO") : "—"}</td><td>{row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString("es-CO") : "—"}</td></tr>)}</tbody></table></div></section>
    {!connectivity && <div className="stats-grid"><Stat icon="chart" value={String(rows.length)} label="Registros reportados" /><Stat icon="award" value={averageGrade.length ? (averageGrade.reduce((sum, grade) => sum + grade, 0) / averageGrade.length).toLocaleString("es-CO", { maximumFractionDigits: 1 }) : "—"} label="Promedio de notas" tone="purple" /></div>}
  </div>;
}

function DemoReportsPage({ connectivity = false }: { connectivity?: boolean }) {
  return (
    <div>
      <PageTitle
        eyebrow="INFORMES"
        title={connectivity ? "Informe de conectividad" : "Informe de progreso"}
        subtitle="Consulta información consolidada y exportable de los docentes asignados."
        action={
          <button className="secondary-btn">
            <Icon name="download" /> Exportar CSV
          </button>
        }
      />
      <div className="stats-grid">
        <Stat icon="users" value="84" label="Docentes incluidos" />
        <Stat
          icon={connectivity ? "wifi" : "chart"}
          value={connectivity ? "76%" : "68%"}
          label={connectivity ? "Conexión buena" : "Avance promedio"}
          tone="green"
        />
        <Stat
          icon="clock"
          value={connectivity ? "16%" : "14"}
          label={connectivity ? "Conexión regular" : "Módulos en curso"}
          tone="orange"
        />
        <Stat
          icon="report"
          value={connectivity ? "8%" : "4,3"}
          label={connectivity ? "Conexión mala" : "Promedio de notas"}
          tone="purple"
        />
      </div>
      <section className="panel">
        <PanelHead
          title={connectivity ? "Distribución de conectividad" : "Evolución del progreso"}
          subtitle="Información calculada a partir de registros almacenados"
        />
        <Chart />
      </section>
    </div>
  );
}

export function TechnicalLogsPage({ page }: { page: string }) {
  return apiConfigured ? <ApiTechnicalLogsPage page={page} /> : <DemoTechnicalLogsPage page={page} />;
}

function ApiTechnicalLogsPage({ page }: { page: string }) {
  type MetricRow = { fecha: string; ruta: string; metodo: string; codigo_estado: number; solicitudes: number; tiempo_promedio_ms: number };
  const [rows, setRows] = useState<MetricRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(page !== "uptime");
  const title = page === "errors" ? "Historial de errores" : page === "performance" ? "Rendimiento de comunicaciones" : page === "uptime" ? "Disponibilidad del sistema" : "Peticiones del sistema";
  useEffect(() => {
    if (page === "uptime") return;
    let cancelled = false;
    api.technicalHistory({ tipo: page }).then((response) => { if (!cancelled) setRows(response.data); })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar las métricas técnicas."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);
  return <div><PageTitle eyebrow="REGISTROS TÉCNICOS" title={title} subtitle="Datos agregados de las solicitudes registradas por el backend." />
    {error && <div className="form-message" role="alert">{error}</div>}
    {page === "uptime" ? <section className="panel"><h3>Disponibilidad no configurada</h3><p>La API no dispone de una fuente de monitoreo externo para calcular el tiempo de actividad.</p></section> : <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Fecha</th><th>Método</th><th>Ruta</th><th>Código</th><th>Peticiones</th><th>Tiempo promedio</th></tr></thead><tbody>{loading && <tr><td colSpan={6}>Cargando métricas...</td></tr>}{!loading && rows.length === 0 && <tr><td colSpan={6}>No hay registros técnicos para mostrar.</td></tr>}{rows.map((row, index) => <tr key={`${row.fecha}-${row.ruta}-${row.metodo}-${row.codigo_estado}-${index}`}><td>{row.fecha}</td><td><span className={`method ${row.metodo.toLowerCase()}`}>{row.metodo}</span></td><td><code>{row.ruta}</code></td><td><span className={`status ${row.codigo_estado < 400 ? "success" : row.codigo_estado < 500 ? "warning" : "danger"}`}>{row.codigo_estado}</span></td><td>{row.solicitudes}</td><td>{Number(row.tiempo_promedio_ms).toFixed(2)} ms</td></tr>)}</tbody></table></div></section>}
  </div>;
}

function DemoTechnicalLogsPage({ page }: { page: string }) {
  const title =
    page === "errors"
      ? "Historial de errores"
      : page === "performance"
        ? "Rendimiento de comunicaciones"
        : page === "uptime"
          ? "Disponibilidad del sistema"
          : "Peticiones del sistema";
  return (
    <div>
      <PageTitle
        eyebrow="REGISTROS TÉCNICOS"
        title={title}
        subtitle="Datos obtenidos de los registros de comunicaciones de los últimos dos meses."
        action={
          <button className="secondary-btn">
            <Icon name="download" /> Exportar CSV
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="table-tools">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Buscar ruta o código..." />
          </div>
          <select>
            <option>Todos los métodos</option>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
          </select>
          <select>
            <option>Todos los códigos</option>
            <option>200</option>
            <option>201</option>
            <option>404</option>
            <option>500</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Método HTTP</th>
              <th>Ruta</th>
              <th>Código de estado</th>
              <th>Duración</th>
              <th>Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="method get">GET</span>
              </td>
              <td>
                <code>/api/modulos</code>
              </td>
              <td>
                <span className="status success">200</span>
              </td>
              <td>142 ms</td>
              <td>18 jun 2025 · 09:42:16</td>
            </tr>
            <tr>
              <td>
                <span className="method post">POST</span>
              </td>
              <td>
                <code>/api/entregas</code>
              </td>
              <td>
                <span className="status success">201</span>
              </td>
              <td>218 ms</td>
              <td>18 jun 2025 · 09:41:03</td>
            </tr>
            <tr>
              <td>
                <span className="method get">GET</span>
              </td>
              <td>
                <code>/api/recursos/184</code>
              </td>
              <td>
                <span className="status warning">404</span>
              </td>
              <td>96 ms</td>
              <td>18 jun 2025 · 09:38:44</td>
            </tr>
            <tr>
              <td>
                <span className="method post">POST</span>
              </td>
              <td>
                <code>/api/evaluaciones/respuestas</code>
              </td>
              <td>
                <span className="status danger">500</span>
              </td>
              <td>864 ms</td>
              <td>18 jun 2025 · 09:32:11</td>
            </tr>
          </tbody>
        </table>
        <div className="pagination">
          <span>Mostrando 1–4 de 2.481.320 registros</span>
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
