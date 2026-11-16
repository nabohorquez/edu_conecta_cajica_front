import { FormEvent, useEffect, useState } from "react";
import { api, apiConfigured, type ApiModule, type ApiProgress } from "@/api/client";
import { Icon, PageTitle, PanelHead, Progress, RowActions, Stat } from "@/components/ui";

export function ActivitiesPage() {
  return apiConfigured ? <ApiActivitiesPage /> : <DemoActivitiesPage />;
}

function ApiActivitiesPage() {
  const [activities, setActivities] = useState<Array<{ id: number; titulo: string; instrucciones?: string; descripcion?: string; modulo?: { nombre?: string } }>>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    api.activities().then(({ data }) => { if (!cancelled) setActivities(data as typeof activities); })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar las actividades."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const activity = activities.find((item) => item.id === selected);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!activity) return;
    try {
      await api.submitActivity(activity.id, { respuesta: answer });
      setMessage("Tu entrega quedó registrada y está pendiente de calificación.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible enviar la actividad.");
    }
  };
  return (
    <div>
      <PageTitle eyebrow="MI FORMACIÓN" title="Mis actividades" subtitle="Consulta instrucciones y entrega tus actividades prácticas." />
      {error && <div className="form-message" role="alert">{error}</div>}
      {message && <div className="status success" role="status">{message}</div>}
      {loading ? <section className="panel">Cargando actividades...</section> : activities.length === 0 ? <section className="panel">No tienes actividades disponibles.</section> : (
        <div className="dashboard-grid">
          <section className="panel span-2">
            {!activity ? <>
              <PanelHead title="Actividades disponibles" />
              {activities.map((item) => <div className="setting-row" key={item.id}>
                <div><b>{item.titulo}</b><span>{item.modulo?.nombre || "Actividad formativa"}</span></div>
                <button className="secondary-btn" onClick={() => { setSelected(item.id); setAnswer(""); setMessage(""); }}>Ver instrucciones</button>
              </div>)}
            </> : <>
              <button className="back" onClick={() => setSelected(null)}><Icon name="arrow" /> Volver a actividades</button>
              <PanelHead title={activity.titulo} subtitle={activity.modulo?.nombre || "Actividad formativa"} />
              <div className="activity-instructions"><b>Instrucciones</b><p>{activity.instrucciones || activity.descripcion || "Completa y envía esta actividad."}</p></div>
              <form className="submission-form" onSubmit={submit}>
                <label>Respuesta escrita<textarea required rows={6} value={answer} onChange={(event) => setAnswer(event.target.value)} /></label>
                <button className="primary-btn"><Icon name="plus" /> Enviar actividad</button>
              </form>
            </>}
          </section>
        </div>
      )}
    </div>
  );
}

function DemoActivitiesPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <PageTitle
        eyebrow="MI FORMACIÓN"
        title="Mis actividades"
        subtitle="Consulta instrucciones y entrega tus actividades prácticas."
      />
      <div className="dashboard-grid">
        <section className="panel span-2">
          <PanelHead
            title="Protocolo de convivencia digital"
            subtitle="Ciudadanía digital responsable · Fecha límite: 21 de junio de 2025"
          />
          <div className="activity-instructions">
            <b>Instrucciones</b>
            <p>
              Redacta un protocolo breve con cinco acuerdos para promover una convivencia respetuosa
              en los espacios digitales de tu institución.
            </p>
            <span>Nota máxima: 5,0 · Requiere calificación</span>
          </div>
          <form
            className="submission-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label>
              Respuesta escrita
              <textarea required rows={6} placeholder="Escribe aquí tu respuesta..."></textarea>
            </label>
            <label>
              Archivo adjunto (opcional)
              <input type="file" accept=".pdf,.doc,.docx,.png,.jpg" />
              <small>PDF, Word o imagen. Tamaño máximo: 10 MB.</small>
            </label>
            <button className="primary-btn">
              {sent ? (
                <>
                  <Icon name="check" /> Entrega enviada
                </>
              ) : (
                <>
                  <Icon name="plus" /> Enviar actividad
                </>
              )}
            </button>
          </form>
        </section>
        <section className="panel">
          <PanelHead title="Estado de entrega" />
          <div className="submission-state">
            <div className={sent ? "done" : "pending"}>
              <Icon name={sent ? "check" : "clock"} size={28} />
            </div>
            <h3>{sent ? "Entregada" : "Pendiente"}</h3>
            <p>
              {sent
                ? "Tu entrega quedó registrada y está pendiente de calificación."
                : "Aún no has enviado esta actividad."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export function EvaluationsPage() {
  return apiConfigured ? <ApiEvaluationsPage /> : <DemoEvaluationsPage />;
}

function ApiEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Array<{ id: number; titulo: string; puntaje_minimo?: number; modulo?: { nombre?: string } }>>([]);
  const [questions, setQuestions] = useState<Array<{ id: number; enunciado: string; puntaje: number; opciones: Array<{ id: number; texto: string }> }>>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ puntaje?: number; aprobado?: boolean }>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    api.evaluations().then(({ data }) => { if (!cancelled) setEvaluations(data as typeof evaluations); })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar las evaluaciones."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const start = async (id: number) => {
    try {
      const response = await api.startEvaluation(id) as { intento: { id: number }; preguntas: typeof questions };
      setAttemptId(response.intento.id);
      setQuestions(response.preguntas);
      setAnswers({});
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible iniciar la evaluación.");
    }
  };
  const finish = async () => {
    if (attemptId === null) return;
    try {
      const respuestas = Object.entries(answers).map(([questionId, optionId]) => ({ pregunta_id: Number(questionId), opcion_id: optionId }));
      await api.saveEvaluationAnswers(attemptId, respuestas);
      const response = await api.finishEvaluation(attemptId) as { resultado: { puntaje?: number; aprobado?: boolean } };
      setResult(response.resultado);
      setAttemptId(null);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible finalizar la evaluación.");
    }
  };
  if (result) return <div className="focus-page">
    <div className="focus-icon"><Icon name={result.aprobado ? "award" : "report"} size={40} /></div>
    <span className="eyebrow">EVALUACIÓN FINALIZADA</span>
    <h1>{result.aprobado ? "Aprobaste la evaluación" : "Evaluación completada"}</h1>
    <div className="result-number">{result.puntaje ?? 0}<small> / 100</small></div>
    <button className="primary-btn" onClick={() => setResult(undefined)}>Volver a evaluaciones</button>
  </div>;
  if (attemptId !== null) return <div className="question-page">
    <div className="exam-header"><div><span>{questions.length} preguntas</span><Progress value={questions.length ? Object.keys(answers).length / questions.length * 100 : 0} /></div></div>
    {error && <div className="form-message" role="alert">{error}</div>}
    {questions.map((question, index) => <section className="question-card" key={question.id}>
      <span className="category">PREGUNTA {index + 1} · {question.puntaje} PUNTOS</span>
      <h1>{question.enunciado}</h1>
      <div className="answers">{question.opciones.map((option, optionIndex) => <button type="button" className={answers[question.id] === option.id ? "selected" : ""} key={option.id} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}><i>{String.fromCharCode(65 + optionIndex)}</i>{option.texto}</button>)}</div>
    </section>)}
    <button className="primary-btn" disabled={Object.keys(answers).length < questions.length} onClick={() => void finish()}>Guardar y finalizar</button>
  </div>;
  return <div>
    <PageTitle eyebrow="MI FORMACIÓN" title="Mis evaluaciones" subtitle="Las evaluaciones se habilitan cuando completas las lecciones del módulo." />
    {error && <div className="form-message" role="alert">{error}</div>}
    {loading ? <section className="panel">Cargando evaluaciones...</section> : evaluations.length === 0 ? <section className="panel">No hay evaluaciones disponibles.</section> : <section className="panel table-panel"><table><thead><tr><th>Evaluación</th><th>Módulo</th><th>Puntaje mínimo</th><th></th></tr></thead><tbody>{evaluations.map((evaluation) => <tr key={evaluation.id}><td><b>{evaluation.titulo}</b></td><td>{evaluation.modulo?.nombre || "—"}</td><td>{evaluation.puntaje_minimo ?? 60}%</td><td><button className="primary-btn" onClick={() => void start(evaluation.id)}>Comenzar</button></td></tr>)}</tbody></table></section>}
  </div>;
}

function DemoEvaluationsPage() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  if (finished)
    return (
      <div className="focus-page">
        <div className="focus-icon">
          <Icon name="award" size={40} />
        </div>
        <span className="eyebrow">EVALUACIÓN FINALIZADA</span>
        <h1>Aprobaste la evaluación</h1>
        <div className="result-number">
          4,2 <small>/ 5,0</small>
        </div>
        <p>Superaste la nota mínima de 3,5. Te queda 1 intento disponible.</p>
        <button
          className="primary-btn"
          onClick={() => {
            setStarted(false);
            setFinished(false);
          }}
        >
          Volver a evaluaciones
        </button>
      </div>
    );
  if (started)
    return (
      <div className="question-page">
        <div className="exam-header">
          <div>
            <span>Pregunta 1 de 10</span>
            <Progress value={10} />
          </div>
          <time>
            <Icon name="clock" /> 29:42
          </time>
        </div>
        <section className="question-card">
          <span className="category">SELECCIÓN MÚLTIPLE · 0,5 PUNTOS</span>
          <h1>¿Cuál práctica protege mejor los datos personales de los estudiantes?</h1>
          <div className="answers">
            {[
              "Compartir contraseñas con el grupo",
              "Usar contraseñas seguras y permisos de acceso",
              "Publicar listados completos en redes abiertas",
              "Guardar información en cualquier dispositivo",
            ].map((x, i) => (
              <button key={x}>
                <i>{String.fromCharCode(65 + i)}</i>
                {x}
              </button>
            ))}
          </div>
          <div className="question-actions">
            <button className="secondary-btn">Pregunta anterior</button>
            <button className="primary-btn" onClick={() => setFinished(true)}>
              Finalizar evaluación
            </button>
          </div>
        </section>
      </div>
    );
  return (
    <div>
      <PageTitle
        eyebrow="MI FORMACIÓN"
        title="Mis evaluaciones"
        subtitle="Las evaluaciones se habilitan al completar todas las lecciones del módulo."
      />
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Evaluación</th>
              <th>Módulo</th>
              <th>Nota mínima</th>
              <th>Intentos</th>
              <th>Tiempo</th>
              <th>Disponibilidad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>Evaluación final de ciudadanía digital</b>
              </td>
              <td>Ciudadanía digital responsable</td>
              <td>3,5</td>
              <td>2</td>
              <td>30 min</td>
              <td>
                <span className="status success">Habilitada</span>
              </td>
              <td>
                <button className="primary-btn" onClick={() => setStarted(true)}>
                  Presentar
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <b>Evaluación de herramientas para el aula</b>
              </td>
              <td>Herramientas para el aula</td>
              <td>3,5</td>
              <td>3</td>
              <td>40 min</td>
              <td>
                <span className="status muted-status">Lecciones pendientes</span>
              </td>
              <td>
                <button className="secondary-btn" disabled>
                  <Icon name="lock" /> Bloqueada
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export function ProgressPage() {
  return apiConfigured ? <ApiProgressPage /> : <DemoProgressPage />;
}

function ApiProgressPage() {
  const [progressRows, setProgressRows] = useState<ApiProgress[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    api.myProgress().then(({ progreso }) => { if (!cancelled) setProgressRows(progreso); })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar tu progreso."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const average = progressRows.length ? Math.round(progressRows.reduce((sum, item) => sum + item.porcentaje, 0) / progressRows.length) : 0;
  const completed = progressRows.filter((item) => item.porcentaje === 100).length;
  const inProgress = progressRows.filter((item) => item.porcentaje > 0 && item.porcentaje < 100).length;
  const grades = progressRows.map((item) => item.nota_evaluacion).filter((grade): grade is number => grade !== null);
  const averageGrade = grades.length ? (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toLocaleString("es-CO", { maximumFractionDigits: 1 }) : "—";
  return <div><PageTitle eyebrow="MI FORMACIÓN" title="Mi progreso" subtitle="Consulta tu avance, las notas y el estado de cada módulo." />
    {error && <div className="form-message" role="alert">{error}</div>}
    <div className="stats-grid"><Stat icon="chart" value={`${average}%`} label="Avance general" /><Stat icon="check" value={String(completed)} label="Completados" tone="green" /><Stat icon="book" value={String(inProgress)} label="En curso" /><Stat icon="award" value={averageGrade} label="Promedio" tone="purple" /></div>
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Módulo</th><th>Estado</th><th>Avance</th><th>Nota evaluación</th><th>Lecciones</th></tr></thead><tbody>{loading && <tr><td colSpan={5}>Cargando progreso...</td></tr>}{!loading && progressRows.length === 0 && <tr><td colSpan={5}>Aún no tienes progreso registrado.</td></tr>}{progressRows.map((row) => <tr key={row.modulo_id}><td><b>{row.modulo}</b></td><td><span className={`status ${row.porcentaje === 100 ? "success" : row.porcentaje ? "warning" : "muted-status"}`}>{row.estado}</span></td><td><div className="table-progress"><Progress value={row.porcentaje} /><b>{row.porcentaje}%</b></div></td><td>{row.nota_evaluacion ?? "—"}</td><td>{row.lecciones_completadas}/{row.total_lecciones}</td></tr>)}</tbody></table></div></section>
  </div>;
}

function DemoProgressPage() {
  const states = [
    ["Ciudadanía digital responsable", "En curso", 78, "4,2", "03 mar 2025", "—"],
    ["Herramientas para el aula", "Completado", 100, "4,7", "12 feb 2025", "18 abr 2025"],
    ["Evaluación con medios digitales", "No iniciado", 0, "—", "—", "—"],
    ["Proyectos de innovación", "Vencido", 45, "3,0", "08 ene 2025", "—"],
  ];
  return (
    <div>
      <PageTitle
        eyebrow="MI FORMACIÓN"
        title="Mi progreso"
        subtitle="Consulta el avance, las notas y las fechas de cada módulo."
      />
      <div className="stats-grid">
        <Stat icon="chart" value="64%" label="Avance general" />
        <Stat icon="check" value="5" label="Módulos completados" tone="green" />
        <Stat icon="book" value="3" label="En curso" />
        <Stat icon="award" value="4,3" label="Promedio" tone="purple" />
      </div>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Estado</th>
              <th>Avance</th>
              <th>Nota evaluación</th>
              <th>Fecha de inicio</th>
              <th>Fecha de finalización</th>
            </tr>
          </thead>
          <tbody>
            {states.map((r, i) => (
              <tr key={r[0] as string}>
                <td>
                  <b>{r[0]}</b>
                </td>
                <td>
                  <span
                    className={`status ${i === 1 ? "success" : i === 3 ? "danger" : i === 2 ? "muted-status" : "warning"}`}
                  >
                    {r[1]}
                  </span>
                </td>
                <td>
                  <div className="table-progress">
                    <Progress value={r[2] as number} />
                    <b>{r[2]}%</b>
                  </div>
                </td>
                <td>{r[3]}</td>
                <td>{r[4]}</td>
                <td>{r[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export function DeadlinesPage() {
  return apiConfigured ? <ApiDeadlinesPage /> : <DemoDeadlinesPage />;
}

function ApiDeadlinesPage() {
  type Deadline = { id: number; modulo_id: number; fecha_inicio?: string | null; fecha_fin: string; estado: string; modulo?: { nombre: string } };
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [modulesList, setModulesList] = useState<ApiModule[]>([]);
  const [editing, setEditing] = useState<Deadline | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const [deadlineResponse, moduleResponse] = await Promise.all([api.deadlines(), api.modules()]);
      setDeadlines((deadlineResponse as { data: Deadline[] }).data || []);
      setModulesList(moduleResponse.data);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible cargar los plazos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input = { modulo_id: Number(formData.get("modulo_id")), fecha_inicio: String(formData.get("fecha_inicio") || "") || null, fecha_fin: String(formData.get("fecha_fin")), estado: String(formData.get("estado")) };
    setSaving(true);
    try {
      if (editing) await api.updateDeadline(editing.id, input); else await api.createDeadline(input);
      setShowForm(false); setEditing(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar el plazo."); }
    finally { setSaving(false); }
  };
  const remove = async (id: number) => {
    try { await api.deleteDeadline(id); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible eliminar el plazo."); }
  };
  return <div><PageTitle eyebrow="PLANIFICACIÓN" title="Tiempos de entrega" subtitle="Establece las fechas disponibles para cada módulo." action={<button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true); }}><Icon name="plus" /> Crear plazo</button>} />
    {error && <div className="form-message" role="alert">{error}</div>}
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Módulo</th><th>Inicio</th><th>Fecha límite</th><th>Estado</th><th></th></tr></thead><tbody>{loading && <tr><td colSpan={5}>Cargando plazos...</td></tr>}{!loading && deadlines.length === 0 && <tr><td colSpan={5}>No hay plazos configurados.</td></tr>}{deadlines.map((deadline) => <tr key={deadline.id}><td><b>{deadline.modulo?.nombre || modulesList.find((module) => module.id === deadline.modulo_id)?.nombre || "—"}</b></td><td>{deadline.fecha_inicio ? new Date(deadline.fecha_inicio).toLocaleDateString("es-CO") : "—"}</td><td>{new Date(deadline.fecha_fin).toLocaleDateString("es-CO")}</td><td><span className={`status ${deadline.estado === "activo" ? "success" : "muted-status"}`}>{deadline.estado}</span></td><td className="actions"><button title="Editar" onClick={() => { setEditing(deadline); setShowForm(true); }}><Icon name="edit" /></button><button title="Eliminar" onClick={() => void remove(deadline.id)}><Icon name="close" /></button></td></tr>)}</tbody></table></div></section>
    {showForm && <div className="modal-backdrop"><form className="modal compact-modal" onSubmit={save}><header><div><span className="eyebrow">PLAZOS</span><h2>{editing ? "Editar plazo" : "Crear plazo"}</h2></div><button type="button" className="icon-btn" onClick={() => setShowForm(false)}><Icon name="close" /></button></header><div className="form-grid"><label className="wide">Módulo<select name="modulo_id" required defaultValue={editing?.modulo_id || ""}><option value="">Selecciona un módulo</option>{modulesList.map((module) => <option key={module.id} value={module.id}>{module.nombre}</option>)}</select></label><label>Fecha de inicio<input name="fecha_inicio" type="date" defaultValue={editing?.fecha_inicio?.slice(0, 10) || ""} /></label><label>Fecha límite<input name="fecha_fin" type="date" required defaultValue={editing?.fecha_fin.slice(0, 10)} /></label><label>Estado<select name="estado" defaultValue={editing?.estado || "activo"}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label></div><footer><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-btn" disabled={saving || modulesList.length === 0}>{saving ? "Guardando..." : "Guardar plazo"}</button></footer></form></div>}
  </div>;
}

function DemoDeadlinesPage() {
  return (
    <div>
      <PageTitle
        eyebrow="PLANIFICACIÓN"
        title="Tiempos de entrega"
        subtitle="Establece las fechas disponibles para cada módulo."
        action={
          <button className="primary-btn">
            <Icon name="plus" /> Crear plazo
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="table-tools">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Buscar módulo..." />
          </div>
          <select>
            <option>Todos los estados</option>
            <option>Vigente</option>
            <option>Próximo</option>
            <option>Vencido</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Fecha de inicio</th>
              <th>Fecha límite</th>
              <th>Descripción</th>
              <th>Estado del plazo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>Ciudadanía digital responsable</b>
              </td>
              <td>03 jun 2025</td>
              <td>30 jun 2025</td>
              <td>Primera cohorte de formación</td>
              <td>
                <span className="status success">Vigente</span>
              </td>
              <RowActions />
            </tr>
            <tr>
              <td>
                <b>Herramientas para el aula</b>
              </td>
              <td>01 jul 2025</td>
              <td>15 ago 2025</td>
              <td>Segunda fase de formación</td>
              <td>
                <span className="status warning">Próximo</span>
              </td>
              <RowActions />
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
