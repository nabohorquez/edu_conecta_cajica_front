import { useEffect, useState } from 'react';
import { api, apiConfigured, type ApiModule, type ApiProgress } from '@/api/client';
import { Icon, PageTitle, Progress } from '@/components/ui';
import { ContentManagementPage } from './ContentManagementPage';
import type { Role } from '@/types/app';

export function ModulesPage({ role, navigate, onSelectModule, demoModules }: { role: Role; navigate: (p: string) => void; onSelectModule: (moduleId?: number) => void; demoModules: Array<{ title: string; category: string; level: string; progress: number; lessons: number; time: string; color: string }> }) {
  const [remoteModules, setRemoteModules] = useState<ApiModule[]>([]);
  const [remoteProgress, setRemoteProgress] = useState<ApiProgress[]>([]);
  const [loading, setLoading] = useState(apiConfigured && role === "teacher");
  const [apiError, setApiError] = useState("");
  useEffect(() => {
    if (!apiConfigured || role !== "teacher") return;
    let cancelled = false;
    Promise.all([api.modules(), api.myProgressSummary()])
      .then(([moduleResult, progressResult]) => {
        if (cancelled) return;
        setRemoteModules(moduleResult.data);
        setRemoteProgress(progressResult.progreso);
      })
      .catch((cause) => {
        if (!cancelled) setApiError(cause instanceof Error ? cause.message : "No fue posible cargar los mÃ³dulos.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [role]);
  if (role !== "teacher") return <ContentManagementPage readOnly={role === "trainer"} />;
  const moduleCards: Array<{ id?: number; title: string; category: string; level: string; progress: number; lessons: number; time: string; color: string }> = apiConfigured
    ? remoteModules.map((module, index) => {
        const progress = remoteProgress.find((item) => item.modulo_id === module.id);
        const color = ["#2563A6", "#20A58A", "#7C5CFC"][index % 3];
        return {
          id: module.id,
          title: module.nombre,
          category: module.nivel?.nombre || "FormaciÃ³n docente",
          level: module.nivel?.nombre || "General",
          progress: progress?.porcentaje || 0,
          lessons: progress?.total_lecciones ?? module.lecciones?.length ?? 0,
          time: "",
          color,
        };
      })
    : demoModules;
  return (
    <div>
      <PageTitle
        eyebrow={role === "teacher" ? "MI FORMACIÓN" : "CONTENIDO FORMATIVO"}
        title={role === "teacher" ? "Mis módulos" : "Módulos formativos"}
        subtitle={
          role === "teacher"
            ? "Continúa aprendiendo a tu ritmo. Tu avance se guarda automáticamente."
            : "Organiza competencias, niveles, lecciones, actividades y evaluaciones."
        }
        action={
          role !== "teacher" ? (
            <button className="primary-btn">
              <Icon name="plus" /> Crear módulo
            </button>
          ) : undefined
        }
      />
      {apiError && <div className="form-message" role="alert">{apiError}</div>}
      <div className="module-grid">
        {loading && <div className="panel">Cargando mÃ³dulos...</div>}
        {!loading && moduleCards.length === 0 && <div className="panel">No tienes mÃ³dulos disponibles.</div>}
        {moduleCards.map((m, i) => (
          <article className="module-card" key={m.id ?? m.title}>
            <div
              className="module-cover"
              style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}bb)` }}
            >
              <Icon name={i === 0 ? "shield" : i === 1 ? "book" : "chart"} size={44} />
              <span className="level">{m.level}</span>
            </div>
            <div className="module-body">
              <span className="category">{m.category}</span>
              <h3>{m.title}</h3>
              <p>
                Desarrolla habilidades prácticas para integrar la tecnología de forma efectiva en el
                entorno educativo.
              </p>
              <div className="module-meta">
                <span>
                  <Icon name="book" size={15} />
                  {m.lessons} lecciones
                </span>
                <span>
                  <Icon name="clock" size={15} />
                  {m.time}
                </span>
              </div>
              <div className="progress-label">
                <span>{m.progress ? "Tu progreso" : "Disponible"}</span>
                <b>{m.progress}%</b>
              </div>
              <Progress value={m.progress} color={m.color} />
              <button
                className={m.progress ? "primary-btn full" : "secondary-btn full"}
                onClick={() => { onSelectModule(m.id); navigate("learning"); }}
              >
                {m.progress ? "Continuar módulo" : "Comenzar módulo"}{" "}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

