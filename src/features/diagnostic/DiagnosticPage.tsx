import { useEffect, useState, type CSSProperties } from "react";
import { api, apiConfigured } from "@/api/client";
import { Icon, PageTitle, PanelHead, Progress } from "@/components/ui";

export function DiagnosticPage() {
  return apiConfigured ? <ApiDiagnosticPage /> : <DemoDiagnosticPage />;
}

function ApiDiagnosticPage() {
  type Question = { id: number; enunciado: string; obligatoria?: boolean; opciones: Array<{ id: number; texto: string }> };
  const [diagnostic, setDiagnostic] = useState<{ id: number; titulo: string; descripcion?: string; preguntas?: Question[] }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.latestDiagnosticAttempt() as Promise<{ intento?: { id: number; estado: string; puntaje?: number } | null }>, api.availableDiagnostic() as Promise<{ diagnostico?: { id: number; titulo: string; descripcion?: string } | null }>])
      .then(([latest, available]) => {
        if (cancelled) return;
        if (latest.intento?.estado === "completado") {
          setResult(latest.intento.puntaje ?? 0);
          return;
        }
        if (!available.diagnostico) return;
        setDiagnostic(available.diagnostico);
        const savedAttempt = latest.intento?.estado === "en_progreso" ? latest.intento.id : null;
        const savedAnswers = savedAttempt ? sessionStorage.getItem(`diagnostic-${savedAttempt}-answers`) : null;
        if (savedAttempt) setAttemptId(savedAttempt);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers) as Record<number, number>);
        if (savedAttempt) {
          api.diagnostic(available.diagnostico.id).then((data) => {
            if (!cancelled) setQuestions((data as { diagnostico: { preguntas: Question[] } }).diagnostico.preguntas || []);
          }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible reanudar el diagnóstico."); });
        }
      })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "No fue posible cargar el diagnóstico."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const start = async () => {
    if (!diagnostic) return;
    try {
      const response = await api.startDiagnostic(diagnostic.id) as { intento: { id: number }; preguntas: Question[] };
      setAttemptId(response.intento.id);
      setQuestions(response.preguntas);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible iniciar el diagnóstico.");
    }
  };
  const choose = (questionId: number, optionId: number) => {
    setAnswers((current) => {
      const updated = { ...current, [questionId]: optionId };
      if (attemptId !== null) sessionStorage.setItem(`diagnostic-${attemptId}-answers`, JSON.stringify(updated));
      return updated;
    });
  };
  const finish = async () => {
    if (attemptId === null) return;
    try {
      const respuestas = Object.entries(answers).map(([preguntaId, opcionId]) => ({ pregunta_id: Number(preguntaId), opcion_id: opcionId }));
      await api.saveDiagnosticAnswers(attemptId, respuestas);
      const response = await api.finishDiagnostic(attemptId) as { intento: { puntaje?: number } };
      setResult(response.intento.puntaje ?? 0);
      sessionStorage.removeItem(`diagnostic-${attemptId}-answers`);
      setAttemptId(null);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible finalizar el diagnóstico.");
    }
  };
  if (loading) return <section className="panel">Cargando diagnóstico...</section>;
  if (error && !diagnostic) return <div className="focus-page"><div className="form-message" role="alert">{error}</div></div>;
  if (result !== null) return <div className="focus-page"><div className="focus-icon"><Icon name="award" size={42} /></div><span className="eyebrow">DIAGNÓSTICO COMPLETADO</span><h1>Tus resultados</h1><div className="result-number">{result}<small> / 100</small></div><p>Tu resultado se guardó en tu historial de formación.</p></div>;
  if (attemptId !== null) return <div className="question-page">
    <div className="question-progress"><div><span>{questions.length} preguntas</span><b>{questions.length ? Math.round(Object.keys(answers).length / questions.length * 100) : 0}% completado</b></div><Progress value={questions.length ? Object.keys(answers).length / questions.length * 100 : 0} /></div>
    {error && <div className="form-message" role="alert">{error}</div>}
    {questions.map((question, index) => <section className="question-card" key={question.id}><span className="category">PREGUNTA {index + 1} DE {questions.length}</span><h1>{question.enunciado}</h1><div className="answers">{question.opciones.map((option, optionIndex) => <button type="button" className={answers[question.id] === option.id ? "selected" : ""} key={option.id} onClick={() => choose(question.id, option.id)}><i>{String.fromCharCode(65 + optionIndex)}</i>{option.texto}</button>)}</div></section>)}
    <button className="primary-btn" disabled={questions.filter((question) => question.obligatoria !== false).some((question) => !answers[question.id])} onClick={() => void finish()}>Guardar y finalizar</button>
  </div>;
  if (!diagnostic) return <div className="focus-page"><span className="eyebrow">DIAGNÓSTICO INICIAL</span><h1>No hay un diagnóstico disponible</h1><p>El administrador aún no ha publicado el diagnóstico inicial.</p></div>;
  return <div className="focus-page"><div className="focus-icon"><Icon name="award" size={42} /></div><span className="eyebrow">DIAGNÓSTICO INICIAL</span><h1>{diagnostic.titulo}</h1><p>{diagnostic.descripcion || "Responde las preguntas para identificar tu nivel inicial de competencias digitales."}</p>{error && <div className="form-message" role="alert">{error}</div>}<button className="primary-btn" onClick={() => void start()}>Comenzar diagnóstico <Icon name="arrow" /></button></div>;
}

function DemoDiagnosticPage() {
  const [stage, setStage] = useState<"intro" | "questions" | "results">("intro");
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  if (stage === "intro")
    return (
      <div className="focus-page">
        <div className="focus-icon">
          <Icon name="award" size={42} />
        </div>
        <span className="eyebrow">DIAGNÓSTICO INICIAL</span>
        <h1>Descubre tu nivel de competencia digital</h1>
        <p>
          Este diagnóstico nos ayudará a recomendarte una ruta de formación personalizada. No es un
          examen: responde con tranquilidad y honestidad.
        </p>
        <div className="info-triplet">
          <div>
            <Icon name="clock" />
            <b>15 minutos</b>
            <span>Tiempo estimado</span>
          </div>
          <div>
            <Icon name="report" />
            <b>20 preguntas</b>
            <span>5 competencias</span>
          </div>
          <div>
            <Icon name="lock" />
            <b>Una sola vez</b>
            <span>Resultados privados</span>
          </div>
        </div>
        <button className="primary-btn" onClick={() => setStage("questions")}>
          Comenzar diagnóstico <Icon name="arrow" />
        </button>
      </div>
    );
  if (stage === "results")
    return (
      <div>
        <PageTitle
          eyebrow="DIAGNÓSTICO COMPLETADO"
          title="Tus resultados"
          subtitle="Esta es tu línea base para construir una ruta de aprendizaje personalizada."
        />
        <div className="results-grid">
          <section className="panel result-score">
            <div className="donut" style={{ "--percent": "72%" } as CSSProperties}>
              <div>
                <strong>72</strong>
                <span>de 100</span>
              </div>
            </div>
            <h2>Nivel intermedio</h2>
            <p>Tienes bases sólidas. Tu ruta se enfocará en creación de contenido y evaluación.</p>
          </section>
          <section className="panel skill-bars">
            <PanelHead title="Competencias evaluadas" />
            {[
              ["Información y datos", 82],
              ["Comunicación", 76],
              ["Creación de contenido", 58],
              ["Seguridad digital", 71],
              ["Resolución de problemas", 69],
            ].map(([x, v]) => (
              <div key={x as string}>
                <span>
                  {x}
                  <b>{v}%</b>
                </span>
                <Progress value={v as number} color={(v as number) < 60 ? "#E69B45" : "#20A58A"} />
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  return (
    <div className="question-page">
      <div className="question-progress">
        <div>
          <span>Pregunta {question + 1} de 20</span>
          <b>{Math.round((question + 1) * 5)}% completado</b>
        </div>
        <Progress value={(question + 1) * 5} />
      </div>
      <section className="question-card">
        <span className="category">CREACIÓN DE CONTENIDO DIGITAL</span>
        <h1>
          {question === 0
            ? "Cuando necesitas crear una presentación para tus estudiantes, ¿qué tan cómodo te sientes usando herramientas digitales?"
            : "¿Cómo proteges la información personal de tus estudiantes al utilizar plataformas digitales?"}
        </h1>
        <div className="answers">
          {[
            "Necesito ayuda para comenzar",
            "Puedo realizar tareas básicas",
            "Me desenvuelvo con autonomía",
            "Puedo enseñar a otros a utilizar estas herramientas",
          ].map((x, i) => (
            <button className={answer === i ? "selected" : ""} onClick={() => setAnswer(i)} key={x}>
              <i>{String.fromCharCode(65 + i)}</i>
              {x}
              {answer === i && <Icon name="check" />}
            </button>
          ))}
        </div>
        <div className="question-actions">
          <button className="secondary-btn" disabled={question === 0}>
            Anterior
          </button>
          <button
            className="primary-btn"
            disabled={answer === null}
            onClick={() => {
              if (question >= 1) setStage("results");
              else {
                setQuestion(1);
                setAnswer(null);
              }
            }}
          >
            Siguiente <Icon name="arrow" />
          </button>
        </div>
      </section>
    </div>
  );
}
