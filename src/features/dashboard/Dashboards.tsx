import { useEffect, useState } from "react";
import { api, apiConfigured, type ApiProgress, type ApiUser } from "@/api/client";
import { Avatar, Icon, PageTitle, PanelHead, Progress, Stat } from "@/components/ui";
import { Chart } from "@/components/Chart";
import { modules, users } from "@/app/demoData";
export function AdminDashboard({
  trainer = false,
  navigate,
  user,
}: {
  trainer?: boolean;
  navigate: (p: string) => void;
  user?: ApiUser;
}) {
  const [dashboard, setDashboard] = useState<Record<string, unknown>>();
  const [dashboardError, setDashboardError] = useState("");
  useEffect(() => {
    if (!apiConfigured) return;
    api
      .dashboard(trainer ? "capacitador" : "administrador")
      .then(setDashboard)
      .catch((cause) =>
        setDashboardError(
          cause instanceof Error ? cause.message : "No fue posible cargar el tablero.",
        ),
      );
  }, [trainer]);
  const value = (key: string, fallback: string) => {
    if (!apiConfigured) return fallback;
    const raw = dashboard?.[key];
    if (Array.isArray(raw)) return raw.length.toLocaleString("es-CO");
    return typeof raw === "number" ? raw.toLocaleString("es-CO") : dashboard ? "0" : "—";
  };
  const greetingName =
    user?.first_name || user?.name?.split(" ")[0] || (trainer ? "Capacitador" : "Administrador");
  return (
    <div>
      <PageTitle
        eyebrow={trainer ? "PANEL DEL CAPACITADOR" : "RESUMEN GENERAL"}
        title={`Buenos días, ${greetingName}`}
        subtitle={
          trainer
            ? "Acompaña el avance de tus docentes y prioriza los seguimientos."
            : "Aquí tienes el panorama actualizado de EDUConecta."
        }
        action={
          <button className="secondary-btn">
            <Icon name="download" /> Exportar reporte
          </button>
        }
      />
      {dashboardError && (
        <div className="form-message" role="alert">
          {dashboardError}
        </div>
      )}
      <div className="stats-grid">
        {!trainer && (
          <Stat
            icon="users"
            value={value("usuarios_activos", "1.312")}
            label={apiConfigured ? "Usuarios activos" : "Total de usuarios"}
          />
        )}
        <Stat
          icon="users"
          value={value(
            trainer ? "docentes_sin_conexion_15_dias" : "docentes",
            trainer ? "84" : "1.248",
          )}
          label={trainer ? "Docentes sin conexión reciente" : "Docentes registrados"}
          note={apiConfigured ? undefined : "+4,8% este mes"}
        />
        {!trainer && (
          <Stat icon="shield" value="64" label="Capacitadores registrados" tone="purple" />
        )}
        <Stat
          icon="activity"
          value={value("modulos_activos", trainer ? "67" : "1.086")}
          label={trainer ? "Módulos activos" : "Módulos disponibles"}
          note={apiConfigured ? undefined : "87% del total"}
          tone="green"
        />
        {trainer && (
          <Stat
            icon="book"
            value={value("plazos_por_vencer", "14")}
            label="Plazos por vencer"
            tone="purple"
          />
        )}
        {trainer && <Stat icon="award" value="4,3" label="Promedio de notas" tone="green" />}
        <Stat
          icon="book"
          value={trainer ? value("plazos_por_vencer", "126") : value("modulos_activos", "24")}
          label={trainer ? "Módulos completados" : "Módulos disponibles"}
          note={apiConfigured ? undefined : trainer ? "+18 este mes" : "3 nuevos este mes"}
          tone="purple"
        />
        <Stat
          icon="clock"
          value={trainer ? "—" : value("docentes_sin_conexion_30_dias", "42")}
          label={trainer ? "Requieren seguimiento" : "Sin ingreso reciente"}
          note="Últimos 15 días"
          tone="orange"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel span-2">
          <PanelHead
            title={trainer ? "Progreso de docentes" : "Actividad de usuarios"}
            subtitle={
              trainer
                ? "Promedio general por semana"
                : "Usuarios activos durante los últimos 12 meses"
            }
          />
          <Chart />
        </section>
        <section className="panel">
          <PanelHead title="Progreso general" subtitle="Formación completada" />
          <div className="donut" style={{ "--percent": "68%" } as React.CSSProperties}>
            <div>
              <strong>68%</strong>
              <span>promedio</span>
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="dot blue"></i>Completado <b>68%</b>
            </span>
            <span>
              <i className="dot pale"></i>En proceso <b>32%</b>
            </span>
          </div>
        </section>
      </div>
      <div className="dashboard-grid lower">
        <section className="panel span-2">
          <PanelHead
            title={trainer ? "Docentes que requieren atención" : "Docentes sin conexión reciente"}
            subtitle="Prioriza el acompañamiento de estos usuarios"
            action={
              <button className="link" onClick={() => navigate("tracking")}>
                Ver todos <Icon name="arrow" size={14} />
              </button>
            }
          />
          <div className="mini-list">
            {users.slice(1, 5).map((u, i) => (
              <div className="mini-user" key={u.name}>
                <Avatar initials={u.initials} />
                <div>
                  <b>{u.name}</b>
                  <span>{u.school}</span>
                </div>
                <span className={`status ${i === 2 ? "danger" : "warning"}`}>
                  {i === 2 ? "21 días" : `${9 + i * 2} días`}
                </span>
                <button className="icon-btn">
                  <Icon name="more" />
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <PanelHead title="Actividad reciente" subtitle="Últimas actualizaciones" />
          <div className="timeline">
            <div>
              <i className="green">
                <Icon name="check" size={13} />
              </i>
              <p>
                <b>Andrea Beltrán</b> completó el módulo Ciudadanía digital
                <small>Hace 12 minutos</small>
              </p>
            </div>
            <div>
              <i className="blue">
                <Icon name="users" size={13} />
              </i>
              <p>
                Se registraron <b>8 nuevos docentes</b>
                <small>Hace 1 hora</small>
              </p>
            </div>
            <div>
              <i className="purple">
                <Icon name="book" size={13} />
              </i>
              <p>
                Nuevo módulo publicado por <b>Natalia Gómez</b>
                <small>Hace 3 horas</small>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function TeacherDashboard({
  navigate,
  user,
}: {
  navigate: (p: string) => void;
  user?: ApiUser;
}) {
  const [dashboard, setDashboard] = useState<{
    progreso?: ApiProgress[];
    proximos_plazos?: Array<{ id: number; fecha_fin: string; modulo?: { nombre?: string } }>;
  }>();
  const [dashboardError, setDashboardError] = useState("");
  useEffect(() => {
    if (!apiConfigured) return;
    api
      .dashboard("docente")
      .then((result) => setDashboard(result as typeof dashboard))
      .catch((cause) =>
        setDashboardError(
          cause instanceof Error ? cause.message : "No fue posible cargar tu resumen.",
        ),
      );
  }, []);
  const progressRows = dashboard?.progreso || [];
  const averageProgress = progressRows.length
    ? Math.round(progressRows.reduce((sum, item) => sum + item.porcentaje, 0) / progressRows.length)
    : 0;
  const inProgressCount = progressRows.filter(
    (item) => item.porcentaje > 0 && item.porcentaje < 100,
  ).length;
  const completedCount = progressRows.filter((item) => item.porcentaje === 100).length;
  const grades = progressRows
    .map((item) => item.nota_evaluacion)
    .filter((grade): grade is number => grade !== null);
  const averageGrade = grades.length
    ? (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toLocaleString("es-CO", {
        maximumFractionDigits: 1,
      })
    : "—";
  const currentModule = progressRows.find((item) => item.porcentaje > 0) || progressRows[0];
  const greetingName = user?.first_name || user?.name?.split(" ")[0] || "docente";
  return (
    <div>
      <div className="teacher-hero">
        <div>
          <span className="eyebrow light">MI RUTA DE APRENDIZAJE</span>
          <h1>¡Hola, {greetingName}! Qué bueno verte.</h1>
          <p>Estás cada vez más cerca de tu meta. Continúa donde quedaste.</p>
          <button onClick={() => navigate("learning")}>
            Continuar formación <Icon name="arrow" />
          </button>
        </div>
        <div className="hero-progress">
          <div
            className="donut light-donut"
            style={
              { "--percent": `${apiConfigured ? averageProgress : 64}%` } as React.CSSProperties
            }
          >
            <div>
              <strong>{apiConfigured ? averageProgress : 64}%</strong>
              <span>avance general</span>
            </div>
          </div>
        </div>
      </div>
      <div className="stats-grid teacher-stats">
        {dashboardError && (
          <div className="form-message" role="alert">
            {dashboardError}
          </div>
        )}
        <Stat
          icon="book"
          value={apiConfigured ? String(inProgressCount) : "3"}
          label="Módulos en curso"
        />
        <Stat
          icon="check"
          value={apiConfigured ? String(completedCount) : "5"}
          label="Completados"
          tone="green"
        />
        <Stat
          icon="clock"
          value={apiConfigured ? "—" : "4"}
          label="Actividades pendientes"
          tone="orange"
        />
        <Stat
          icon="award"
          value={apiConfigured ? averageGrade : "4,6"}
          label="Promedio de notas"
          tone="purple"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel span-2 current-course">
          <PanelHead title="Continúa aprendiendo" subtitle="Tu módulo más reciente" />
          <div className="course-row">
            <div className="course-icon">
              <Icon name="shield" size={34} />
            </div>
            <div className="grow">
              <span className="category">{currentModule?.nivel || "MI FORMACIÓN"}</span>
              <h3>
                {apiConfigured
                  ? currentModule?.modulo || "Aún no tienes módulos asignados"
                  : "Ciudadanía digital responsable"}
              </h3>
              <p>
                {apiConfigured
                  ? `${currentModule?.lecciones_completadas || 0} de ${currentModule?.total_lecciones || 0} lecciones completadas`
                  : "Lección 5 de 6 · Protección de datos personales"}
              </p>
              <Progress value={apiConfigured ? currentModule?.porcentaje || 0 : 78} />
            </div>
            <button className="primary-btn" onClick={() => navigate("learning")}>
              <Icon name="play" /> Continuar
            </button>
          </div>
        </section>
        <section className="panel deadlines">
          <PanelHead
            title="Próximas entregas"
            action={<button className="link">Ver todas</button>}
          />
          <div>
            <time>
              <b>21</b>JUN
            </time>
            <p>
              <b>Diseña una actividad colaborativa</b>
              <span>Herramientas para el aula</span>
            </p>
          </div>
          <div>
            <time>
              <b>27</b>JUN
            </time>
            <p>
              <b>Evaluación final</b>
              <span>Ciudadanía digital</span>
            </p>
          </div>
        </section>
      </div>
      <PageTitle
        title="Recomendado para ti"
        subtitle="Basado en tu diagnóstico y progreso actual."
      />
      <div className="recommendations">
        {(apiConfigured
          ? progressRows
              .filter((item) => item !== currentModule)
              .map((item, index) => ({
                title: item.modulo,
                level: item.nivel || "Formación",
                lessons: item.total_lecciones,
                time: `${item.porcentaje}%`,
                color: ["#2563A6", "#20A58A", "#7C5CFC"][index % 3],
              }))
          : modules.slice(1)
        ).map((m) => (
          <div className="recommend-card" key={m.title}>
            <div style={{ background: m.color }}>
              <Icon name="book" size={28} />
            </div>
            <section>
              <span className="category">{m.level}</span>
              <h3>{m.title}</h3>
              <p>
                {m.lessons} lecciones · {m.time}
              </p>
            </section>
            <button className="icon-btn">
              <Icon name="arrow" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechnicalDashboard() {
  const [metrics, setMetrics] = useState<Record<string, unknown>>();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!apiConfigured) return;
    api
      .dashboard("sistemas")
      .then(setMetrics)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "No fue posible cargar las métricas."),
      );
  }, []);
  const metric = (key: string, fallback: string, suffix = "") => {
    if (!apiConfigured) return fallback;
    const value = metrics?.[key];
    if (typeof value !== "number") return metrics ? "No disponible" : "—";
    return `${value.toLocaleString("es-CO", { maximumFractionDigits: 2 })}${suffix}`;
  };
  return (
    <div>
      <PageTitle
        eyebrow="MONITOREO TÉCNICO"
        title="Estado del sistema"
        subtitle="Resumen operativo de los últimos 60 días · Actualizado hace 2 minutos"
        action={
          <span className="live">
            <i></i> {apiConfigured ? "Métricas del servidor" : "Todos los sistemas operativos"}
          </span>
        }
      />
      {error && (
        <div className="form-message" role="alert">
          {error}
        </div>
      )}
      <div className="stats-grid">
        <Stat
          icon="activity"
          value={metric("peticiones", "2,48 M")}
          label="Peticiones realizadas"
          note="+12,4% vs. período anterior"
        />
        <Stat
          icon="clock"
          value={metric("tiempo_promedio_respuesta_ms", "186 ms", " ms")}
          label="Respuesta promedio"
          note="Objetivo: < 250 ms"
          tone="green"
        />
        <Stat
          icon="report"
          value={metric("porcentaje_errores", "0,18%", "%")}
          label="Tasa de errores"
          note="-0,06% este mes"
          tone="orange"
        />
        <Stat
          icon="wifi"
          value={metric("disponibilidad_porcentaje", "99,97%", "%")}
          label="Disponibilidad"
          note="Objetivo: 99,9%"
          tone="purple"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel span-2">
          <PanelHead title="Peticiones y rendimiento" subtitle="Volumen de tráfico por semana" />
          <Chart technical />
        </section>
        <section className="panel">
          <PanelHead title="Resultado de peticiones" />
          <div
            className="donut technical-donut"
            style={{ "--percent": "99.82%" } as React.CSSProperties}
          >
            <div>
              <strong>99,82%</strong>
              <span>exitosas</span>
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="dot green"></i>Exitosas <b>2,47 M</b>
            </span>
            <span>
              <i className="dot orange"></i>Fallidas <b>4.464</b>
            </span>
          </div>
        </section>
      </div>
      <section className="panel error-panel">
        <PanelHead
          title="Registros recientes de comunicaciones"
          subtitle="Solicitudes procesadas por la API REST"
          action={
            <button className="link">
              Ver historial completo <Icon name="arrow" size={14} />
            </button>
          }
        />
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
              <td>18 jun · 08:42:16</td>
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
              <td>17 jun · 22:18:04</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
