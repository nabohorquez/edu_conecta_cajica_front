import { useEffect, useState } from "react";
import { api, apiConfigured, type ApiModule } from "@/api/client";
import { Icon, PageTitle, PanelHead, Progress } from "@/components/ui";

export function LearningPage({ moduleId, onSelectModule, navigate }: { moduleId: number | null; onSelectModule: (moduleId?: number) => void; navigate: (page: string) => void }) {
  return apiConfigured ? <ApiLearningPage moduleId={moduleId} onSelectModule={onSelectModule} navigate={navigate} /> : <DemoLearningPage />;
}

function ApiLearningPage({ moduleId, onSelectModule, navigate }: { moduleId: number | null; onSelectModule: (moduleId?: number) => void; navigate: (page: string) => void }) {
  type Lesson = { id: number; titulo: string; descripcion?: string; orden?: number; recursos?: Array<{ id: number; titulo: string; tipo: string; url?: string | null; ruta_archivo?: string | null }> };
  const [moduleOptions, setModuleOptions] = useState<ApiModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ApiModule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedModule(null);
    setActiveLesson(null);
    Promise.all([api.modules(), api.myProgress()]).then(([moduleResult, progressResult]) => {
      if (cancelled) return;
      setModuleOptions(moduleResult.data);
      const saved = progressResult.progreso.find((item) => item.modulo_id === moduleId);
      setCompletedLessonIds((saved?.lecciones || []).filter((lesson) => lesson.estado === "completada").map((lesson) => lesson.id));
      if (moduleId) {
        api.module(moduleId).then((response) => {
          if (cancelled) return;
          const loaded = response.modulo;
          setSelectedModule(loaded);
          setLessons((loaded.lecciones || []) as Lesson[]);
        }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar el módulo."); });
      }
    }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar el contenido."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [moduleId]);
  const openLesson = async (lesson: Lesson) => {
    try {
      const response = await api.lesson(lesson.id) as { leccion: Lesson };
      setActiveLesson(response.leccion);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible cargar la lección."); }
  };
  const completeLesson = async () => {
    if (!activeLesson) return;
    try {
      await api.saveLessonProgress(activeLesson.id, { porcentaje: 100, estado: "completada" });
      setCompletedLessonIds((ids) => ids.includes(activeLesson.id) ? ids : [...ids, activeLesson.id]);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar el progreso."); }
  };
  const download = async (resource: NonNullable<Lesson["recursos"]>[number]) => {
    try {
      if (resource.url) window.open(resource.url, "_blank", "noopener,noreferrer");
      else await api.downloadResource(resource.id, resource.titulo);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible abrir el recurso."); }
  };
  if (loading) return <section className="panel">Cargando contenido...</section>;
  if (!selectedModule) return <div><PageTitle eyebrow="MI FORMACIÓN" title="Elige un módulo" subtitle="Selecciona un módulo para consultar sus lecciones y recursos." />{error && <div className="form-message" role="alert">{error}</div>}<div className="module-grid">{moduleOptions.map((module) => <article className="module-card" key={module.id}><div className="module-body"><span className="category">{module.nivel?.nombre || "Formación"}</span><h3>{module.nombre}</h3><p>{module.descripcion}</p><button className="primary-btn full" onClick={() => onSelectModule(module.id)}>Abrir módulo <Icon name="arrow" /></button></div></article>)}</div></div>;
  const completion = lessons.length ? Math.round(completedLessonIds.length / lessons.length * 100) : 0;
  return <div className="learning-layout"><aside className="lesson-nav"><button className="back" onClick={() => { setActiveLesson(null); onSelectModule(undefined); }}><Icon name="arrow" /> Volver a mis módulos</button><span className="category">MÓDULO EN CURSO</span><h2>{selectedModule.nombre}</h2><div className="progress-label"><span>Progreso</span><b>{completion}%</b></div><Progress value={completion} /><div className="lesson-list">{lessons.map((lesson, index) => <button key={lesson.id} className={activeLesson?.id === lesson.id ? "active" : ""} onClick={() => void openLesson(lesson)}><i className={completedLessonIds.includes(lesson.id) ? "done" : "current"}>{completedLessonIds.includes(lesson.id) ? <Icon name="check" size={14} /> : index + 1}</i><span><small>LECCIÓN {index + 1}</small>{lesson.titulo}</span></button>)}</div>{completion === 100 && <button className="primary-btn full" onClick={() => navigate("evaluations")}>Presentar evaluación</button>}</aside><article className="lesson-content">{error && <div className="form-message" role="alert">{error}</div>}{activeLesson ? <><div className="lesson-top"><span className="category">LECCIÓN</span></div><h1>{activeLesson.titulo}</h1><p className="lead">{activeLesson.descripcion || "Contenido de formación del módulo."}</p><section className="panel"><PanelHead title="Recursos de la lección" />{activeLesson.recursos?.length ? activeLesson.recursos.map((resource) => <div className="setting-row" key={resource.id}><div><b>{resource.titulo}</b><span>{resource.tipo}</span></div><button className="secondary-btn" onClick={() => void download(resource)}><Icon name="download" /> Abrir recurso</button></div>) : <p>No hay recursos adjuntos a esta lección.</p>}</section><footer className="question-actions"><button className="primary-btn" disabled={completedLessonIds.includes(activeLesson.id)} onClick={() => void completeLesson()}>{completedLessonIds.includes(activeLesson.id) ? "Lección completada" : "Marcar como completada"} <Icon name="check" /></button></footer></> : <><span className="eyebrow">CONTENIDO DEL MÓDULO</span><h1>Selecciona una lección</h1><p className="lead">El progreso se guarda en tu cuenta cuando marcas una lección como completada.</p></>}</article></div>;
}

function DemoLearningPage() {
  const [lesson, setLesson] = useState(4);
  const lessonNames = [
    "Bienvenida al módulo",
    "Identidad digital",
    "Privacidad y datos personales",
    "Seguridad de la información",
    "Convivencia en entornos digitales",
    "Evaluación final",
  ];
  return (
    <div className="learning-layout">
      <aside className="lesson-nav">
        <button className="back">
          <Icon name="arrow" /> Volver a mis módulos
        </button>
        <span className="category">MÓDULO EN CURSO</span>
        <h2>Ciudadanía digital responsable</h2>
        <div className="progress-label">
          <span>Progreso</span>
          <b>78%</b>
        </div>
        <Progress value={78} />
        <div className="lesson-list">
          {lessonNames.map((x, i) => (
            <button key={x} className={lesson === i ? "active" : ""} onClick={() => setLesson(i)}>
              <i className={i < 4 ? "done" : i === 4 ? "current" : "locked"}>
                {i < 4 ? (
                  <Icon name="check" size={14} />
                ) : i === 5 ? (
                  <Icon name="lock" size={14} />
                ) : (
                  i + 1
                )}
              </i>
              <span>
                <small>{i === 5 ? "EVALUACIÓN" : `LECCIÓN ${i + 1}`}</small>
                {x}
              </span>
            </button>
          ))}
        </div>
      </aside>
      <article className="lesson-content">
        <div className="lesson-top">
          <span className="category">LECCIÓN {lesson + 1} DE 6</span>
          <button className="secondary-btn">
            <Icon name="download" /> Descargar recursos
          </button>
        </div>
        <h1>{lesson === 4 ? "Convivencia en entornos digitales" : lessonNames[lesson]}</h1>
        <p className="lead">
          Aprende a construir espacios digitales seguros, respetuosos y colaborativos para toda la
          comunidad educativa.
        </p>
        <div className="video-placeholder">
          <button>
            <Icon name="play" size={32} />
          </button>
          <span>Video · 08:24 min</span>
        </div>
        <div className="article-copy">
          <h2>Comunicación responsable en línea</h2>
          <p>
            La convivencia digital requiere los mismos principios de respeto y empatía que aplicamos
            en nuestras relaciones cotidianas. Como docentes, orientamos a los estudiantes para
            participar de forma segura y constructiva.
          </p>
          <div className="callout">
            <Icon name="help" />
            <div>
              <b>Ten presente</b>
              <p>
                Antes de compartir contenido, verifica la fuente, protege los datos personales y
                piensa en el impacto que puede tener en otras personas.
              </p>
            </div>
          </div>
          <h2>Prácticas recomendadas</h2>
          <ul className="check-list">
            <li>
              <Icon name="check" />
              Utiliza un lenguaje claro y respetuoso.
            </li>
            <li>
              <Icon name="check" />
              Promueve la participación equitativa.
            </li>
            <li>
              <Icon name="check" />
              Reporta contenido inadecuado.
            </li>
          </ul>
        </div>
        <footer className="lesson-actions">
          <button className="secondary-btn">Lección anterior</button>
          <button className="primary-btn">
            Marcar como completada <Icon name="check" />
          </button>
        </footer>
      </article>
    </div>
  );
}

export function ApiLearningCatalogPage({ kind }: { kind: "lessons" | "resources" }) {
  type Row = { id: number; titulo: string; descripcion?: string; tipo?: string; url?: string | null; modulo?: { nombre?: string }; leccion?: { titulo?: string } };
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    const request = kind === "lessons" ? api.lessons() : api.resources();
    request.then((response) => {
      const data = response as { data?: Row[]; recursos?: Row[] };
      if (!cancelled) setRows(data.data || data.recursos || []);
    }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar el contenido."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [kind]);
  const openResource = async (resource: Row) => {
    try {
      if (resource.url) window.open(resource.url, "_blank", "noopener,noreferrer");
      else await api.downloadResource(resource.id, resource.titulo);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible abrir el recurso."); }
  };
  return <div><PageTitle eyebrow="MI FORMACIÓN" title={kind === "lessons" ? "Mis lecciones" : "Mis recursos"} subtitle={kind === "lessons" ? "Consulta las lecciones disponibles en tus módulos." : "Abre o descarga los materiales de formación."} />
    {error && <div className="form-message" role="alert">{error}</div>}
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Título</th><th>Módulo</th><th>{kind === "resources" ? "Tipo" : "Descripción"}</th><th></th></tr></thead><tbody>{loading && <tr><td colSpan={4}>Cargando...</td></tr>}{!loading && rows.length === 0 && <tr><td colSpan={4}>No hay registros disponibles.</td></tr>}{rows.map((row) => <tr key={row.id}><td><b>{row.titulo}</b></td><td>{row.modulo?.nombre || row.leccion?.titulo || "—"}</td><td>{kind === "resources" ? row.tipo || "—" : row.descripcion || "—"}</td><td>{kind === "resources" && <button className="secondary-btn" onClick={() => void openResource(row)}><Icon name="download" /> Abrir</button>}</td></tr>)}</tbody></table></div></section>
  </div>;
}
