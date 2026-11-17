import { useEffect, useState } from "react";
import {
  api,
  apiConfigured,
  getApiToken,
  roleFromApiUser,
  setApiToken,
  type ApiInstitution,
  type ApiProgress,
  type ApiRole,
  type ApiUser,
} from "@/api/client";
import { Avatar, Icon, PageTitle, PanelHead, Progress, RowActions, Stat, type IconName } from "@/components/ui";
import { Chart } from "@/components/Chart";
import { Logo } from "@/components/Logo";
import { ActivitiesPage, DeadlinesPage, EvaluationsPage, ProgressPage } from "@/features/learning/WorkPages";
import { ReportsPage, TechnicalLogsPage } from "@/features/reports/ReportsPages";
import { ConnectivityPage } from "@/features/connectivity/ConnectivityPage";
import { DiagnosticAdminPage } from "@/features/diagnostic/DiagnosticAdminPage";
import { GenericPage } from "@/features/common/GenericPage";
import { DiagnosticPage } from "@/features/diagnostic/DiagnosticPage";
import { RolesPage } from "@/features/roles/RolesPage";
import { TrackingPage } from "@/features/tracking/TrackingPage";
import { Login } from "@/features/auth/Login";
import { ContentManagementPage } from "@/features/modules/ContentManagementPage";
import { LearningPage, ApiLearningCatalogPage } from "@/features/modules/LearningPage";
import { ModulesPage } from "@/features/modules/ModulesPage";
import { ProfilePage } from "@/features/users/ProfilePage";
import { UsersPage } from "@/features/users/UsersPage";
import { InstitutionsPage } from "@/features/users/InstitutionsPage";
import type { Role } from "@/types/app";

const roleInfo = {
  admin: { label: "Administrador", name: "Karen Hoya", initials: "KH", color: "#2563A6" },
  trainer: { label: "Capacitador", name: "Jose Hernandez", initials: "JH", color: "#7C5CFC" },
  teacher: { label: "Docente", name: "Nixon Bohorquez", initials: "NB", color: "#20A58A" },
  technical: {
    label: "Sistemas",
    name: "Daniel Torres",
    initials: "DT",
    color: "#E07A46",
  },
};

const demoAccounts: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@educonecta.com", password: "AdminDemo2025!" },
  trainer: { email: "capacitador@educonecta.com", password: "CapDemo2025!" },
  teacher: { email: "docente@educonecta.com", password: "DocenteDemo2025!" },
  technical: { email: "sistemas@educonecta.com", password: "SistemasDemo2025!" },
};

const demoDisplayNames: Record<Role, string> = {
  admin: "Carlos Rodríguez",
  trainer: "Laura Martínez",
  teacher: "Andrés Gómez",
  technical: "Daniel Torres",
};

const menus: Record<Role, { label: string; icon: IconName; page: string }[]> = {
  admin: [
    { label: "Dashboard", icon: "home", page: "dashboard" },
    { label: "Gestión de usuarios", icon: "users", page: "users" },
    { label: "Instituciones", icon: "school", page: "institutions" },
    { label: "Gestión de roles", icon: "shield", page: "roles" },
    { label: "Gestión de permisos", icon: "lock", page: "permissions" },
    { label: "Módulos formativos", icon: "book", page: "modules" },
    { label: "Diagnóstico digital", icon: "award", page: "diagnostic-admin" },
    { label: "Seguimiento docente", icon: "chart", page: "tracking" },
    { label: "Tiempos de entrega", icon: "clock", page: "deadlines" },
    { label: "Conectividad", icon: "wifi", page: "connectivity-admin" },
  ],
  trainer: [
    { label: "Dashboard", icon: "home", page: "dashboard" },
    { label: "Seguimiento docente", icon: "users", page: "tracking" },
    { label: "Progreso por módulos", icon: "chart", page: "progress" },
    { label: "Informes de progreso", icon: "report", page: "reports" },
    { label: "Informes de conectividad", icon: "wifi", page: "connectivity-admin" },
    { label: "Módulos formativos", icon: "book", page: "modules" },
    { label: "Tiempos de entrega", icon: "clock", page: "deadlines" },
  ],
  teacher: [
    { label: "Inicio", icon: "home", page: "dashboard" },
    { label: "Mi diagnóstico", icon: "award", page: "diagnostic" },
    { label: "Mi formación", icon: "book", page: "learning" },
    { label: "Mis módulos", icon: "school", page: "modules" },
    { label: "Mis lecciones", icon: "book", page: "lessons" },
    { label: "Mis recursos", icon: "download", page: "resources" },
    { label: "Mis actividades", icon: "check", page: "activities" },
    { label: "Mis evaluaciones", icon: "report", page: "evaluations" },
    { label: "Mi progreso", icon: "chart", page: "progress" },
    { label: "Mi conectividad", icon: "wifi", page: "connectivity" },
    { label: "Mi perfil", icon: "settings", page: "profile" },
  ],
  technical: [
    { label: "Dashboard técnico", icon: "home", page: "dashboard" },
    { label: "Gestión de usuarios", icon: "users", page: "users" },
    { label: "Instituciones", icon: "school", page: "institutions" },
    { label: "Gestión de roles", icon: "shield", page: "roles" },
    { label: "Gestión de permisos", icon: "lock", page: "permissions" },
    { label: "Módulos formativos", icon: "book", page: "modules" },
    { label: "Diagnóstico digital", icon: "award", page: "diagnostic-admin" },
    { label: "Seguimiento docente", icon: "chart", page: "tracking" },
    { label: "Tiempos de entrega", icon: "clock", page: "deadlines" },
    { label: "Conectividad", icon: "wifi", page: "connectivity-admin" },
    { label: "Peticiones", icon: "activity", page: "requests" },
    { label: "Rendimiento", icon: "chart", page: "performance" },
    { label: "Historial de errores", icon: "report", page: "errors" },
    { label: "Disponibilidad", icon: "wifi", page: "uptime" },
  ],
};

const roleNameAliases: Record<Role, string[]> = {
  admin: ["administrador", "superadministrador"],
  trainer: ["capacitador"],
  teacher: ["docente"],
  technical: ["sistemas"],
};

const permissionRouteAliases: Record<string, string> = {
  "users.index": "users",
  "roles.index": "roles",
  "permissions.index": "permissions",
  "modules.index": "modules",
  "diagnosticos.index": "diagnostic-admin",
  "seguimiento.docentes": "tracking",
  "plazos-modulos.index": "deadlines",
  "reportes.conectividad": "connectivity-admin",
};

const frontendPages = Array.from(
  new Map(Object.values(menus).flat().map((item) => [item.page, item])).values(),
);

const users = [
  {
    id: "USR-001",
    name: "Andrea Beltrán",
    initials: "AB",
    email: "andrea.beltran@iedp.edu.co",
    school: "I.E.D. Pompilio Martínez",
    role: "Docente",
    area: "Ciencias naturales",
    status: "Activo",
    last: "Hoy, 8:42 a. m.",
  },
  {
    id: "USR-002",
    name: "Carlos Mendoza",
    initials: "CM",
    email: "carlos.mendoza@capellania.edu.co",
    school: "I.E.D. Capellanía",
    role: "Docente",
    area: "Matemáticas",
    status: "Activo",
    last: "Ayer, 4:18 p. m.",
  },
  {
    id: "USR-003",
    name: "Natalia Gómez",
    initials: "NG",
    email: "natalia.gomez@rincon.edu.co",
    school: "I.E.D. Rincón Santo",
    role: "Capacitador",
    area: "Tecnología e informática",
    status: "Activo",
    last: "12 jun, 10:30 a. m.",
  },
  {
    id: "USR-004",
    name: "Jorge Ramírez",
    initials: "JR",
    email: "jorge.ramirez@pabloh.edu.co",
    school: "I.E.D. Pablo Herrera",
    role: "Docente",
    area: "Lenguaje",
    status: "Inactivo",
    last: "28 may, 2:12 p. m.",
  },
  {
    id: "USR-005",
    name: "Mónica Torres",
    initials: "MT",
    email: "monica.torres@antonion.edu.co",
    school: "I.E.D. Antonio Nariño",
    role: "Docente",
    area: "Ciencias sociales",
    status: "Activo",
    last: "10 jun, 7:55 a. m.",
  },
];

const modules = [
  {
    title: "Ciudadanía digital responsable",
    category: "Ciudadanía digital",
    level: "Básico",
    progress: 78,
    lessons: 6,
    time: "4 h 30 min",
    color: "#2563A6",
  },
  {
    title: "Herramientas para el aula",
    category: "Creación de contenido",
    level: "Intermedio",
    progress: 42,
    lessons: 8,
    time: "6 h",
    color: "#20A58A",
  },
  {
    title: "Evaluación con medios digitales",
    category: "Evaluación digital",
    level: "Intermedio",
    progress: 0,
    lessons: 5,
    time: "3 h 45 min",
    color: "#7C5CFC",
  },
];

function AdminDashboard({
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
    api.dashboard(trainer ? "capacitador" : "administrador")
      .then(setDashboard)
      .catch((cause) => setDashboardError(cause instanceof Error ? cause.message : "No fue posible cargar el tablero."));
  }, [trainer]);
  const value = (key: string, fallback: string) => {
    if (!apiConfigured) return fallback;
    const raw = dashboard?.[key];
    if (Array.isArray(raw)) return raw.length.toLocaleString("es-CO");
    return typeof raw === "number" ? raw.toLocaleString("es-CO") : dashboard ? "0" : "—";
  };
  const greetingName = user?.first_name || user?.name?.split(" ")[0] || (trainer ? "Capacitador" : "Administrador");
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
      {dashboardError && <div className="form-message" role="alert">{dashboardError}</div>}
      <div className="stats-grid">
        {!trainer && <Stat icon="users" value={value("usuarios_activos", "1.312")} label={apiConfigured ? "Usuarios activos" : "Total de usuarios"} />}
        <Stat
          icon="users"
          value={value(trainer ? "docentes_sin_conexion_15_dias" : "docentes", trainer ? "84" : "1.248")}
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
        {trainer && <Stat icon="book" value={value("plazos_por_vencer", "14")} label="Plazos por vencer" tone="purple" />}
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

function TeacherDashboard({ navigate, user }: { navigate: (p: string) => void; user?: ApiUser }) {
  const [dashboard, setDashboard] = useState<{ progreso?: ApiProgress[]; proximos_plazos?: Array<{ id: number; fecha_fin: string; modulo?: { nombre?: string } }> }>();
  const [dashboardError, setDashboardError] = useState("");
  useEffect(() => {
    if (!apiConfigured) return;
    api.dashboard("docente")
      .then((result) => setDashboard(result as typeof dashboard))
      .catch((cause) => setDashboardError(cause instanceof Error ? cause.message : "No fue posible cargar tu resumen."));
  }, []);
  const progressRows = dashboard?.progreso || [];
  const averageProgress = progressRows.length
    ? Math.round(progressRows.reduce((sum, item) => sum + item.porcentaje, 0) / progressRows.length)
    : 0;
  const inProgressCount = progressRows.filter((item) => item.porcentaje > 0 && item.porcentaje < 100).length;
  const completedCount = progressRows.filter((item) => item.porcentaje === 100).length;
  const grades = progressRows.map((item) => item.nota_evaluacion).filter((grade): grade is number => grade !== null);
  const averageGrade = grades.length ? (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toLocaleString("es-CO", { maximumFractionDigits: 1 }) : "—";
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
          <div className="donut light-donut" style={{ "--percent": `${apiConfigured ? averageProgress : 64}%` } as React.CSSProperties}>
            <div>
              <strong>{apiConfigured ? averageProgress : 64}%</strong>
              <span>avance general</span>
            </div>
          </div>
        </div>
      </div>
      <div className="stats-grid teacher-stats">
        {dashboardError && <div className="form-message" role="alert">{dashboardError}</div>}
        <Stat icon="book" value={apiConfigured ? String(inProgressCount) : "3"} label="Módulos en curso" />
        <Stat icon="check" value={apiConfigured ? String(completedCount) : "5"} label="Completados" tone="green" />
        <Stat icon="clock" value={apiConfigured ? "—" : "4"} label="Actividades pendientes" tone="orange" />
        <Stat icon="award" value={apiConfigured ? averageGrade : "4,6"} label="Promedio de notas" tone="purple" />
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
              <h3>{apiConfigured ? currentModule?.modulo || "Aún no tienes módulos asignados" : "Ciudadanía digital responsable"}</h3>
              <p>{apiConfigured ? `${currentModule?.lecciones_completadas || 0} de ${currentModule?.total_lecciones || 0} lecciones completadas` : "Lección 5 de 6 · Protección de datos personales"}</p>
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
          ? progressRows.filter((item) => item !== currentModule).map((item, index) => ({ title: item.modulo, level: item.nivel || "Formación", lessons: item.total_lecciones, time: `${item.porcentaje}%`, color: ["#2563A6", "#20A58A", "#7C5CFC"][index % 3] }))
          : modules.slice(1)).map((m) => (
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

function TechnicalDashboard() {
  const [metrics, setMetrics] = useState<Record<string, unknown>>();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!apiConfigured) return;
    api.dashboard("sistemas").then(setMetrics)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar las métricas."));
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
      {error && <div className="form-message" role="alert">{error}</div>}
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

function AppShell({ role, user, onLogout, onUserUpdated }: { role: Role; user?: ApiUser; onLogout: () => void; onUserUpdated: (user: ApiUser) => void }) {
  const [page, setPage] = useState("dashboard");
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [roleOptions, setRoleOptions] = useState<ApiRole[]>([]);
  const [institutionOptions, setInstitutionOptions] = useState<ApiInstitution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [modalError, setModalError] = useState("");
  const [allowedPages, setAllowedPages] = useState<Set<string>>(
    () => new Set(apiConfigured ? [] : menus[role].map((item) => item.page)),
  );
  const [pageLabels, setPageLabels] = useState<Record<string, string>>({});
  const [permissionsLoading, setPermissionsLoading] = useState(apiConfigured);
  const [permissionsError, setPermissionsError] = useState("");
  const [permissionsRefreshVersion, setPermissionsRefreshVersion] = useState(0);
  const [navigationError, setNavigationError] = useState("");
  const info = roleInfo[role];
  const displayName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || info.name;
  const displayInitials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const visibleMenu = apiConfigured
    ? frontendPages
        .filter((item) => allowedPages.has(item.page))
        .map((item) => ({ ...item, label: pageLabels[item.page] || item.label }))
    : menus[role].filter((item) => allowedPages.has(item.page));
  useEffect(() => {
    const refresh = () => setPermissionsRefreshVersion((version) => version + 1);
    window.addEventListener("educonecta:permissions-changed", refresh);
    return () => window.removeEventListener("educonecta:permissions-changed", refresh);
  }, []);
  useEffect(() => {
    if (!apiConfigured) return;
    let cancelled = false;
    setPermissionsLoading(true);
    setPermissionsError("");
    setAllowedPages(new Set());
    setPageLabels({});
    const loadPermissions = async () => {
      const catalog = await api.permissionCatalog();
      const viewPermissionId = catalog.permisos.find(
        (permission) => permission.permission.toLocaleLowerCase("es") === "view",
      )?.id;
      if (viewPermissionId === undefined) {
        throw new Error("El catálogo no contiene el permiso de lectura (view).");
      }

      const assignedRoles = user?.roles || [];
      const roleIds = assignedRoles
        .map((assignedRole) => assignedRole.id)
        .filter((id): id is number => typeof id === "number");
      if (roleIds.length < assignedRoles.length || assignedRoles.length === 0) {
        const { roles } = await api.roles();
        const assignedNames = assignedRoles.length
          ? assignedRoles.map((assignedRole) => assignedRole.rol_name.toLocaleLowerCase("es"))
          : roleNameAliases[role];
        roleIds.push(...roles
          .filter((apiRole) => assignedNames.includes(apiRole.rol_name.toLocaleLowerCase("es")))
          .map((apiRole) => apiRole.id));
      }

      const uniqueRoleIds = Array.from(new Set(roleIds));
      if (uniqueRoleIds.length === 0) {
        throw new Error("No fue posible determinar los roles asignados al usuario.");
      }
      const roleDetails = await Promise.all(uniqueRoleIds.map((id) => api.role(id)));
      const permittedPageIds = new Set(
        roleDetails.flatMap(({ rol }) =>
          (rol.pages_by_role || [])
            .filter((assignment) => assignment.id_permission === viewPermissionId)
            .map((assignment) => assignment.id_page),
        ),
      );
      const supportedPages = new Set(frontendPages.map((item) => item.page));
      const pageEntries = catalog.paginas
          .filter((page) => permittedPageIds.has(page.id) && page.route)
          .flatMap((page) => page.route
            ? [{
                route: permissionRouteAliases[page.route] || page.route,
                label: page.page_name,
              }]
            : [])
          .filter((page) => supportedPages.has(page.route));
      const routes = new Set(pageEntries.map((page) => page.route));
      if (routes.size === 0) {
        throw new Error("Los roles asignados no tienen permiso de lectura en ninguna página.");
      }
      if (!cancelled) {
        setAllowedPages(routes);
        setPageLabels(Object.fromEntries(pageEntries.map((page) => [page.route, page.label])));
      }
    };

    loadPermissions()
      .catch((cause) => {
        if (!cancelled) {
          setAllowedPages(new Set());
          setPageLabels({});
          setPermissionsError(cause instanceof Error ? cause.message : "No fue posible cargar los permisos de páginas.");
        }
      })
      .finally(() => {
        if (!cancelled) setPermissionsLoading(false);
      });
    return () => { cancelled = true; };
  }, [role, user, permissionsRefreshVersion]);
  useEffect(() => {
    if (!apiConfigured || permissionsLoading || permissionsError || allowedPages.has(page)) return;
    const firstAllowedPage = menus[role].find((item) => allowedPages.has(item.page));
    if (firstAllowedPage) setPage(firstAllowedPage.page);
  }, [allowedPages, page, permissionsError, permissionsLoading, role]);
  const selectedRoleName = apiConfigured
    ? roleOptions.find((option) => String(option.id) === selectedUserRole)?.rol_name || ""
    : selectedUserRole;
  const needsInstitutionalAssignment = /docente|capacitador/i.test(selectedRoleName);
  const navigate = (p: string) => {
    if (apiConfigured && !allowedPages.has(p)) {
      setNavigationError("No tienes permiso para acceder a esa página.");
      return;
    }
    setNavigationError("");
    setPage(p);
    setMobile(false);
  };
  const showNotifications = async () => {
    if (!apiConfigured) {
      setToast("No tienes notificaciones nuevas.");
      return;
    }
    try {
      const response = await api.notifications(true);
      const notification = response.notificaciones.data[0];
      if (!notification) {
        setToast("No tienes notificaciones nuevas.");
        return;
      }
      await api.markNotificationRead(notification.id);
      setToast(notification.titulo || notification.mensaje || "Tienes una notificación nueva.");
    } catch (cause) {
      setToast(cause instanceof Error ? cause.message : "No fue posible cargar las notificaciones.");
    }
  };
  useEffect(() => {
    if (!apiConfigured || page !== "users") return;
    api.roles().then(({ roles }) => setRoleOptions(roles))
      .catch((cause) => setModalError(cause instanceof Error ? cause.message : "No fue posible cargar los roles."));
  }, [page]);
  let content: React.ReactNode;
  if (apiConfigured && permissionsLoading)
    content = <div className="form-message" role="status">Cargando permisos de páginas...</div>;
  else if (apiConfigured && permissionsError)
    content = <div className="form-message" role="alert">{permissionsError}</div>;
  else if (apiConfigured && !allowedPages.has(page))
    content = <div className="form-message" role="alert">No tienes permiso para acceder a las páginas disponibles.</div>;
  else if (page === "dashboard")
    content =
      role === "teacher" ? (
        <TeacherDashboard navigate={navigate} user={user} />
      ) : role === "technical" ? (
        <TechnicalDashboard />
      ) : (
        <AdminDashboard trainer={role === "trainer"} navigate={navigate} />
      );
  else if (page === "users") content = <UsersPage demoUsers={users} roleLabels={roleInfo} roleOptions={roleOptions} openModal={() => {
    setModalError("");
    setSelectedUserRole("");
    setInstitutionOptions([]);
    setInstitutionsLoading(apiConfigured);
    if (apiConfigured) api.roles().then(({ roles }) => setRoleOptions(roles))
      .catch((cause) => setModalError(cause instanceof Error ? cause.message : "No fue posible cargar los roles."));
    if (apiConfigured) api.institutions({ activo: true, por_pagina: 100 })
      .then(({ data }) => {
        setInstitutionOptions(data);
        if (data.length === 0) setModalError("No hay instituciones activas para asignar.");
      })
      .catch((cause) => setModalError(cause instanceof Error ? cause.message : "No fue posible cargar las instituciones."))
      .finally(() => setInstitutionsLoading(false));
    setModal(true);
  }} />;
  else if (page === "institutions") content = <InstitutionsPage />;
  else if (page === "modules") content = <ModulesPage role={role} navigate={navigate} demoModules={modules} onSelectModule={(moduleId) => setActiveModuleId(moduleId ?? null)} />;
  else if (page === "learning") content = <LearningPage moduleId={activeModuleId} onSelectModule={(moduleId) => setActiveModuleId(moduleId ?? null)} navigate={navigate} />;
  else if (page === "lessons") content = apiConfigured ? <ApiLearningCatalogPage kind="lessons" /> : <GenericPage page={page} />;
  else if (page === "resources") content = apiConfigured ? <ApiLearningCatalogPage kind="resources" /> : <GenericPage page={page} />;
  else if (page === "diagnostic") content = <DiagnosticPage />;
  else if (page === "connectivity" || page === "connectivity-admin")
    content = <ConnectivityPage admin={page === "connectivity-admin"} />;
  else if (page === "tracking") content = <TrackingPage demoUsers={users} demoModules={modules} />;
  else if (page === "roles" || page === "permissions") content = <RolesPage />;
  else if (page === "diagnostic-admin") content = <DiagnosticAdminPage />;
  else if (page === "activities") content = <ActivitiesPage />;
  else if (page === "evaluations") content = <EvaluationsPage />;
  else if (page === "progress") content = <ProgressPage />;
  else if (page === "deadlines") content = <DeadlinesPage />;
  else if (page === "reports") content = <ReportsPage />;
  else if (page === "profile") content = <ProfilePage user={user} onUpdate={onUserUpdated} />;
  else if (["requests", "performance", "errors", "uptime"].includes(page))
    content = <TechnicalLogsPage page={page} />;
  else content = <GenericPage page={page} />;
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="mobile-close" onClick={() => setMobile(false)}>
            <Icon name="close" />
          </button>
        </div>
        <div className="role-label">ESPACIO {info.label.toUpperCase()}</div>
        <nav>
          {visibleMenu.map((item) => (
            <button
              key={item.page}
              className={page === item.page ? "active" : ""}
              onClick={() => navigate(item.page)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {page === item.page && <i></i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button>
            <Icon name="help" />
            <span>Centro de ayuda</span>
          </button>
          <button onClick={onLogout}>
            <Icon name="logout" />
            <span>Cerrar sesión</span>
          </button>
          <small>EDUConecta v1.0.0</small>
        </div>
      </aside>
      {mobile && <div className="scrim" onClick={() => setMobile(false)}></div>}
      <div className="main-wrap">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobile(true)}>
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            EDUConecta <Icon name="arrow" size={13} />
            <b>{visibleMenu.find((x) => x.page === page)?.label || "Vista"}</b>
          </div>
          <div className="top-actions">
            <button
              className="icon-btn notification"
              onClick={() => void showNotifications()}
            >
              <Icon name="bell" />
              <i></i>
            </button>
            <div className="profile">
              <Avatar initials={displayInitials || info.initials} color={info.color} />
              <div>
                <b>{displayName}</b>
                <span>{info.label}</span>
              </div>
              <Icon name="arrow" size={15} />
            </div>
          </div>
        </header>
        <main className="content">
          {navigationError && <div className="form-message" role="alert">{navigationError}</div>}
          {content}
        </main>
      </div>
      {modal && (
        <div className="modal-backdrop">
          <form
            className="modal"
            onSubmit={async (e) => {
              e.preventDefault();
              if (apiConfigured) {
                const formData = new FormData(e.currentTarget);
                const firstName = [formData.get("first_name"), formData.get("second_name")].filter(Boolean).join(" ");
                const lastName = [formData.get("last_name"), formData.get("second_last_name")].filter(Boolean).join(" ");
                const email = String(formData.get("email"));
                try {
                  const result = await api.createUser({
                    first_name: String(firstName),
                    last_name: String(lastName),
                    email,
                    contrasena: String(formData.get("contrasena")),
                    rol_id: Number(formData.get("rol_id")),
                  });
                  if (needsInstitutionalAssignment) {
                    try {
                      let createdUserId = result.usuario?.id;
                      if (!createdUserId) {
                        const matchingUsers = await api.users({ buscar: email, por_pagina: 100 });
                        createdUserId = matchingUsers.data.find(
                          (candidate) => candidate.email.toLocaleLowerCase("es") === email.toLocaleLowerCase("es"),
                        )?.id;
                      }
                      if (!createdUserId) {
                        throw new Error("No se pudo identificar al usuario creado para asociarlo a la institución.");
                      }
                      await api.addInstitutionUsers(Number(formData.get("institucion_id")), [createdUserId]);
                    } catch (cause) {
                      window.dispatchEvent(new Event("educonecta:users-changed"));
                      setModal(false);
                      setToast(cause instanceof Error
                        ? `Usuario creado, pero no fue posible asignar la institución: ${cause.message}`
                        : "Usuario creado, pero no fue posible asignar la institución.");
                      return;
                    }
                  }
                  window.dispatchEvent(new Event("educonecta:users-changed"));
                  setModal(false);
                  setToast("Usuario registrado correctamente.");
                } catch (cause) {
                  setModalError(cause instanceof Error ? cause.message : "No fue posible registrar el usuario.");
                }
                return;
              }
              setModal(false);
              setToast("Usuario registrado correctamente.");
            }}
          >
            <header>
              <div>
                <span className="eyebrow">NUEVO REGISTRO</span>
                <h2>Registrar usuario</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setModal(false)}>
                <Icon name="close" />
              </button>
            </header>
            {modalError && <div className="form-message" role="alert">{modalError}</div>}
            <div className="form-grid">
              <label>
                Primer nombre
                <input required name="first_name" placeholder="Ej. Claudia" />
              </label>
              <label>
                Segundo nombre
                <input name="second_name" placeholder="Ej. Marcela" />
              </label>
              <label>
                Primer apellido
                <input required name="last_name" placeholder="Ej. Rodríguez" />
              </label>
              <label>
                Segundo apellido
                <input name="second_last_name" placeholder="Ej. López" />
              </label>
              <label>
                Correo electrónico
                <input required name="email" type="email" placeholder="nombre@institucion.edu.co" />
              </label>
              <label>
                Contraseña temporal
                <input required name="contrasena" type="password" minLength={8} placeholder="Mínimo 8 caracteres" />
              </label>
              <label>
                Rol
                <select
                  name={apiConfigured ? "rol_id" : "rol"}
                  value={selectedUserRole}
                  onChange={(event) => setSelectedUserRole(event.target.value)}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {apiConfigured
                    ? roleOptions.length ? roleOptions.map((apiRole) => <option key={apiRole.id} value={apiRole.id}>{apiRole.rol_name}</option>) : <option value="">Cargando roles...</option>
                    : <><option>Docente</option><option>Capacitador</option><option>Administrador</option></>}
                </select>
              </label>
              {needsInstitutionalAssignment && (
                <>
                  <label>
                    Institución
                    <select name={apiConfigured ? "institucion_id" : "institucion"} required>
                      <option value="">{institutionsLoading ? "Cargando instituciones..." : "Selecciona una institución"}</option>
                      {apiConfigured
                        ? institutionOptions.map((institution) => (
                          <option key={institution.id} value={institution.id}>{institution.nombre}</option>
                        ))
                        : <>
                          <option value="I.E.D. Pompilio Martínez">I.E.D. Pompilio Martínez</option>
                          <option value="I.E.D. Capellanía">I.E.D. Capellanía</option>
                        </>}
                    </select>
                  </label>
                  <label className="wide">
                    Área de formación
                    <select name="area_formacion" required>
                      <option value="">Selecciona un área</option>
                      <option value="Ciencias naturales">Ciencias naturales</option>
                      <option value="Matemáticas">Matemáticas</option>
                      <option value="Tecnología e informática">Tecnología e informática</option>
                      <option value="Lenguaje">Lenguaje</option>
                    </select>
                  </label>
                </>
              )}
              <label>
                Estado
                <select>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </label>
              <label className="consent-field">
                <input required type="checkbox" />
                Acepta el tratamiento de datos personales
              </label>
            </div>
            <footer>
              <button type="button" className="secondary-btn" onClick={() => setModal(false)}>
                Cancelar
              </button>
              <button
                className="primary-btn"
                disabled={
                  apiConfigured &&
                  (roleOptions.length === 0 ||
                    (needsInstitutionalAssignment && (institutionsLoading || institutionOptions.length === 0)))
                }
              >
                Registrar usuario
              </button>
            </footer>
          </form>
        </div>
      )}
      {toast && (
        <div className="toast">
          <i>
            <Icon name="check" size={15} />
          </i>
          {toast}
          <button onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<ApiUser>();
  const [restoringSession, setRestoringSession] = useState(Boolean(getApiToken()));

  useEffect(() => {
    if (!getApiToken()) return;
    api.currentUser()
      .then(({ usuario }) => {
        const apiRole = roleFromApiUser(usuario);
        if (apiRole) {
          setUser(usuario);
          setRole(apiRole);
        } else {
          setApiToken(null);
        }
      })
      .catch(() => setApiToken(null))
      .finally(() => setRestoringSession(false));
  }, []);

  const logout = async () => {
    if (getApiToken()) await api.logout().catch(() => setApiToken(null));
    setUser(undefined);
    setRole(null);
  };

  if (restoringSession) return <main className="login-page"><p className="muted">Restaurando sesiÃ³n...</p></main>;
  return role ? (
    <AppShell role={role} user={user} onLogout={logout} onUserUpdated={setUser} />
  ) : (
    <Login
      roleInfo={roleInfo}
      demoAccounts={demoAccounts}
      demoDisplayNames={demoDisplayNames}
      onLogin={(nextRole, nextUser) => { setRole(nextRole); setUser(nextUser); }}
    />
  );
}
