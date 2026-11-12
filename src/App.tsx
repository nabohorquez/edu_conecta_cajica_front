import type { Chart as ChartInstance } from "chart.js";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "admin" | "trainer" | "teacher" | "technical";
type IconName =
  | "home"
  | "users"
  | "shield"
  | "school"
  | "book"
  | "chart"
  | "wifi"
  | "report"
  | "settings"
  | "bell"
  | "search"
  | "plus"
  | "more"
  | "arrow"
  | "check"
  | "clock"
  | "download"
  | "play"
  | "award"
  | "menu"
  | "close"
  | "logout"
  | "activity"
  | "calendar"
  | "eye"
  | "edit"
  | "filter"
  | "help"
  | "lock";

const paths: Record<IconName, JSX.Element> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  school: (
    <>
      <path d="m3 10 9-6 9 6" />
      <path d="M5 9v11h14V9M9 20v-6h6v6M2 20h20" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 16 4-5 4 3 5-7" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" />
    </>
  ),
  report: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.15.36.36.67.6.9.3.28.7.43 1.1.43h.1v4h-.1c-.4 0-.8.15-1.1.43-.24.23-.45.54-.6.9Z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  arrow: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m10 8 6 4-6 4Z" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M8.2 13 7 22l5-3 5 3-1.2-9" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" />
    </>
  ),
  activity: (
    <>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  filter: (
    <>
      <path d="M4 5h16l-6 7v5l-4 2v-7Z" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1 .8-1.9 1.3-1.9 2.9M12 18h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

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

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo">
      <div className="logo-mark">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {!compact && (
        <div>
          <strong>
            EDU<span>Conecta</span>
          </strong>
          <small>Cajicá</small>
        </div>
      )}
    </div>
  );
}

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState("");
  const [recover, setRecover] = useState(false);
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [email, setEmail] = useState(demoAccounts.admin.email);
  const [password, setPassword] = useState(demoAccounts.admin.password);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Completa tu correo electrónico y contraseña.");
    const matchedRole = (Object.keys(demoAccounts) as Role[]).find(
      (key) =>
        demoAccounts[key].email.toLowerCase() === email.trim().toLowerCase() &&
        demoAccounts[key].password === password,
    );
    if (!matchedRole) {
      setError("El correo o la contraseña no coinciden con una cuenta de demostración.");
      return;
    }
    setError("");
    onLogin(matchedRole);
  };
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <Logo />
          <div className="eyebrow light">FORMACIÓN DOCENTE PARA EL FUTURO</div>
        </div>
        <div className="visual-content">
          <h1>
            Conectamos conocimiento,
            <br />
            transformamos la educación.
          </h1>
          <p>
            Una plataforma creada para fortalecer tus competencias digitales y acompañarte en cada
            paso de tu formación.
          </p>
          <div className="illustration" aria-hidden="true">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
            <div className="ill-card card-a">
              <Icon name="book" size={28} />
              <b>+24</b>
              <span>módulos</span>
            </div>
            <div className="ill-card card-b">
              <Icon name="wifi" size={27} />
              <b>Conexión</b>
              <span>estable</span>
            </div>
            <div className="laptop">
              <div>
                <Icon name="school" size={52} />
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        <p className="login-footer">Alcaldía Municipal de Cajicá · Secretaría de Educación</p>
      </section>
      <section className="login-form-wrap">
        {recover ? (
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="mobile-logo">
              <Logo />
            </div>
            <button
              type="button"
              className="back recover-back"
              onClick={() => {
                setRecover(false);
                setSent(false);
              }}
            >
              <Icon name="arrow" /> Volver al inicio de sesión
            </button>
            <div className="focus-icon recover-icon">
              <Icon name={sent ? "check" : "lock"} size={34} />
            </div>
            {sent ? (
              <>
                <div className="eyebrow">CORREO ENVIADO</div>
                <h2>Revisa tu bandeja de entrada</h2>
                <p className="muted">
                  Enviamos un enlace de recuperación a <b>maria.ruiz@educonecta.gov.co</b>. El
                  enlace estará disponible durante 30 minutos.
                </p>
                <button
                  type="button"
                  className="primary-btn full"
                  onClick={() => {
                    setRecover(false);
                    setSent(false);
                  }}
                >
                  Volver para ingresar
                </button>
              </>
            ) : (
              <>
                <div className="eyebrow">RECUPERA TU ACCESO</div>
                <h2>¿Olvidaste tu contraseña?</h2>
                <p className="muted">
                  Ingresa el correo asociado a tu cuenta y te enviaremos instrucciones para crear
                  una nueva contraseña.
                </p>
                <label>
                  Correo electrónico
                  <input
                    required
                    type="email"
                    placeholder="nombre@institucion.edu.co"
                    defaultValue="maria.ruiz@educonecta.gov.co"
                  />
                </label>
                <button className="primary-btn full" type="submit">
                  Enviar instrucciones <Icon name="arrow" size={17} />
                </button>
              </>
            )}
            <p className="support">
              Si no tienes acceso a tu correo,{" "}
              <button type="button" className="link">
                contacta a soporte
              </button>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={submit}>
            <div className="mobile-logo">
              <Logo />
            </div>
            <div className="eyebrow">BIENVENIDO DE NUEVO</div>
            <h2>Ingresa a tu cuenta</h2>
            <p className="muted">Continúa tu proceso de formación en EDUConecta.</p>
            <label>
              Correo electrónico
              <input
                name="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Contraseña
              <div className="input-icon">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name="eye" size={18} />
                </button>
              </div>
            </label>
            <div className="form-row">
              <label className="checkbox">
                <input type="checkbox" /> Recordarme
              </label>
              <button type="button" className="link" onClick={() => setRecover(true)}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            {error && <div className="form-message">{error}</div>}
            <button className="primary-btn full" type="submit">
              Ingresar a la plataforma <Icon name="arrow" size={17} />
            </button>
            <div className="demo-label">
              <span></span>Accesos de demostración<span></span>
            </div>
            <p className="demo-intro">
              ¿Quieres explorar la plataforma? Selecciona un perfil para probar sus funcionalidades.
            </p>
            <div className="role-options">
              {(Object.keys(roleInfo) as Role[]).map((r) => (
                <button
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setEmail(demoAccounts[r].email);
                    setPassword(demoAccounts[r].password);
                    setError("");
                  }}
                  className={role === r ? "selected" : ""}
                  key={r}
                >
                  <i className="demo-role-icon">
                    <Icon
                      name={
                        r === "admin"
                          ? "shield"
                          : r === "trainer"
                            ? "users"
                            : r === "teacher"
                              ? "book"
                              : "activity"
                      }
                      size={18}
                    />
                  </i>
                  <span className="demo-role-copy">
                    <b>{r === "technical" ? "Monitoreo técnico" : roleInfo[r].label}</b>
                    <small>{demoDisplayNames[r]}</small>
                  </span>
                  <i className="demo-selected">
                    <Icon name="check" size={12} />
                  </i>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="demo-credentials-toggle"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            >
              {showDemoCredentials
                ? "Ocultar credenciales de demostración"
                : "Ver credenciales de demostración"}
              <Icon name="arrow" size={13} />
            </button>
            {showDemoCredentials && (
              <div className="demo-credentials" role="status">
                <div>
                  <span>Correo</span>
                  <code>{demoAccounts[role].email}</code>
                </div>
                <div>
                  <span>Contraseña</span>
                  <code>{demoAccounts[role].password}</code>
                </div>
                <small>
                  Solo para demostración. En producción, la autenticación se valida en el backend y
                  las contraseñas se almacenan con hash seguro.
                </small>
              </div>
            )}
            <p className="support">
              ¿Necesitas ayuda?{" "}
              <button type="button" className="link">
                Contacta a soporte
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
  note,
  tone = "blue",
}: {
  icon: IconName;
  value: string;
  label: string;
  note?: string;
  tone?: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}

function Progress({ value, color = "#2563A6" }: { value: number; color?: string }) {
  return (
    <div className="progress">
      <span style={{ width: `${value}%`, background: color }}></span>
    </div>
  );
}

function Chart({ technical = false }: { technical?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const values = technical
    ? [48, 55, 51, 69, 65, 78, 74, 87, 82, 92, 88, 96]
    : [38, 46, 43, 58, 54, 69, 64, 78, 72, 82, 87, 92];
  useEffect(() => {
    let chart: ChartInstance | undefined;
    let cancelled = false;
    const color = technical ? "#7C5CFC" : "#2563A6";
    void import("chart.js/auto").then(({ default: ChartJS }) => {
      if (cancelled || !canvas.current) return;
      chart = new ChartJS(canvas.current, {
        type: "line",
        data: {
          labels: [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
          ],
          datasets: [
            {
              data: values,
              borderColor: color,
              backgroundColor: `${color}20`,
              fill: true,
              tension: 0.25,
              pointRadius: 3,
              pointBackgroundColor: "#fff",
              pointBorderColor: color,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { displayColors: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#8B98A7", font: { size: 9 } } },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { stepSize: 25, color: "#8B98A7", font: { size: 9 } },
              grid: { color: "#EDF1F4" },
            },
          },
        },
      });
    });
    return () => {
      cancelled = true;
      chart?.destroy();
    };
  }, [technical]);
  return (
    <div className="chart-canvas">
      <canvas ref={canvas} aria-label="Gráfico de tendencia" />
    </div>
  );
}

function AdminDashboard({
  trainer = false,
  navigate,
}: {
  trainer?: boolean;
  navigate: (p: string) => void;
}) {
  return (
    <div>
      <PageTitle
        eyebrow={trainer ? "PANEL DEL CAPACITADOR" : "RESUMEN GENERAL"}
        title={trainer ? "Buenos días, Andrés" : "Buenos días, María Fernanda"}
        subtitle={
          trainer
            ? "Acompaña el avance de tus docentes y prioriza los seguimientos."
            : "Aquí tienes el panorama de EDUConecta hoy, 18 de junio de 2025."
        }
        action={
          <button className="secondary-btn">
            <Icon name="download" /> Exportar reporte
          </button>
        }
      />
      <div className="stats-grid">
        {!trainer && <Stat icon="users" value="1.312" label="Total de usuarios" />}
        <Stat
          icon="users"
          value={trainer ? "84" : "1.248"}
          label={trainer ? "Docentes asignados" : "Docentes registrados"}
          note="+4,8% este mes"
        />
        {!trainer && (
          <Stat icon="shield" value="64" label="Capacitadores registrados" tone="purple" />
        )}
        <Stat
          icon="activity"
          value={trainer ? "67" : "1.086"}
          label="Usuarios activos"
          note="87% del total"
          tone="green"
        />
        {trainer && <Stat icon="book" value="14" label="Módulos en curso" tone="purple" />}
        {trainer && <Stat icon="award" value="4,3" label="Promedio de notas" tone="green" />}
        <Stat
          icon="book"
          value={trainer ? "126" : "24"}
          label={trainer ? "Módulos completados" : "Módulos disponibles"}
          note={trainer ? "+18 este mes" : "3 nuevos este mes"}
          tone="purple"
        />
        <Stat
          icon="clock"
          value={trainer ? "17" : "42"}
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

function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function PanelHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="panel-head">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
function Avatar({ initials, color }: { initials: string; color?: string }) {
  return (
    <span className="avatar" style={color ? { background: color } : undefined}>
      {initials}
    </span>
  );
}

function UsersPage({ openModal }: { openModal: () => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [userRows, setUserRows] = useState(() =>
    users.map((user) => ({ ...user, roles: [user.role] })),
  );
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const filtered = useMemo(
    () =>
      userRows.filter(
        (u) =>
          (u.name + u.email + u.school).toLowerCase().includes(query.toLowerCase()) &&
          (status === "Todos" || u.status === status),
      ),
    [query, status, userRows],
  );
  return (
    <div>
      <PageTitle
        eyebrow="ADMINISTRACIÓN"
        title="Gestión de usuarios"
        subtitle="Administra cuentas, roles y accesos de la comunidad educativa."
        action={
          <button className="primary-btn" onClick={openModal}>
            <Icon name="plus" /> Registrar usuario
          </button>
        }
      />
      <div className="stats-grid small">
        <Stat icon="users" value="1.312" label="Usuarios totales" />
        <Stat icon="check" value="1.086" label="Activos" tone="green" />
        <Stat icon="clock" value="226" label="Inactivos" tone="orange" />
        <Stat icon="school" value="14" label="Instituciones" tone="purple" />
      </div>
      <section className="panel table-panel">
        <div className="table-tools">
          <div className="search">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, correo o institución..."
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Todos</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
          <button className="secondary-btn">
            <Icon name="filter" /> Más filtros
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Institución educativa</th>
                <th>Área</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.name}>
                  <td>
                    <b>{u.id}</b>
                  </td>
                  <td>
                    <div className="user-cell">
                      <Avatar initials={u.initials} />
                      <div>
                        <b>{u.name}</b>
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.school}</td>
                  <td>{u.area}</td>
                  <td>
                    <div className="role-tags">
                      {u.roles.map((assignedRole) => (
                        <span className="role-tag" key={assignedRole}>
                          {assignedRole}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status ${u.status === "Activo" ? "success" : "muted-status"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{u.last}</td>
                  <td>
                    <div className="actions">
                      <button title="Ver">
                        <Icon name="eye" />
                      </button>
                      <button
                        title="Asignar roles"
                        onClick={() => setEditingUser(userRows.findIndex((row) => row.id === u.id))}
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        title={u.status === "Activo" ? "Desactivar cuenta" : "Activar cuenta"}
                        onClick={() =>
                          setUserRows((rows) =>
                            rows.map((row) =>
                              row.id === u.id
                                ? {
                                    ...row,
                                    status: row.status === "Activo" ? "Inactivo" : "Activo",
                                  }
                                : row,
                            ),
                          )
                        }
                      >
                        <Icon name={u.status === "Activo" ? "lock" : "check"} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Mostrando 1–{filtered.length} de 1.312 usuarios</span>
          <div>
            <button disabled>Anterior</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>Siguiente</button>
          </div>
        </div>
      </section>
      {editingUser !== null && (
        <div className="modal-backdrop">
          <form
            className="modal compact-modal"
            onSubmit={(e) => {
              e.preventDefault();
              setEditingUser(null);
            }}
          >
            <header>
              <div>
                <span className="eyebrow">ROLES_X_USUARIO</span>
                <h2>Asignar roles</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setEditingUser(null)}>
                <Icon name="close" />
              </button>
            </header>
            <div className="role-assignment">
              <div className="selected-user">
                <Avatar initials={userRows[editingUser].initials} />
                <div>
                  <b>{userRows[editingUser].name}</b>
                  <span>{userRows[editingUser].email}</span>
                </div>
              </div>
              <p>
                Selecciona uno o varios roles. La asignación corresponde a la relación{" "}
                <code>roles_x_usuario</code>.
              </p>
              {(Object.keys(roleInfo) as Role[]).map((roleKey) => {
                const label = roleInfo[roleKey].label;
                const checked = userRows[editingUser].roles.includes(label);
                return (
                  <label className="role-check" key={roleKey}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setUserRows((rows) =>
                          rows.map((row, index) =>
                            index === editingUser
                              ? {
                                  ...row,
                                  roles: checked
                                    ? row.roles.filter((r) => r !== label)
                                    : [...row.roles, label],
                                }
                              : row,
                          ),
                        )
                      }
                    />
                    <span>
                      <b>{label}</b>
                      <small>
                        {roleKey === "admin"
                          ? "Administración general"
                          : roleKey === "trainer"
                            ? "Seguimiento y formación"
                            : roleKey === "teacher"
                              ? "Formación personal"
                              : "Monitoreo técnico"}
                      </small>
                    </span>
                  </label>
                );
              })}
              {userRows[editingUser].roles.length === 0 && (
                <div className="form-message">
                  El usuario debe conservar al menos un rol asignado.
                </div>
              )}
            </div>
            <footer>
              <button type="button" className="secondary-btn" onClick={() => setEditingUser(null)}>
                Cancelar
              </button>
              <button className="primary-btn" disabled={userRows[editingUser].roles.length === 0}>
                Guardar asignación
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

function ContentManagementPage({ readOnly = false }: { readOnly?: boolean }) {
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

function RowActions() {
  return (
    <td>
      <div className="actions">
        <button title="Consultar">
          <Icon name="eye" />
        </button>
        <button title="Editar">
          <Icon name="edit" />
        </button>
        <button title="Más acciones">
          <Icon name="more" />
        </button>
      </div>
    </td>
  );
}

function ModulesPage({ role, navigate }: { role: Role; navigate: (p: string) => void }) {
  if (role !== "teacher") return <ContentManagementPage readOnly={role === "trainer"} />;
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
      <div className="module-grid">
        {modules.map((m, i) => (
          <article className="module-card" key={m.title}>
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
                onClick={() => navigate("learning")}
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

function TeacherDashboard({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div>
      <div className="teacher-hero">
        <div>
          <span className="eyebrow light">MI RUTA DE APRENDIZAJE</span>
          <h1>¡Hola, Laura! Qué bueno verte.</h1>
          <p>Estás cada vez más cerca de tu meta. Continúa donde quedaste.</p>
          <button onClick={() => navigate("learning")}>
            Continuar formación <Icon name="arrow" />
          </button>
        </div>
        <div className="hero-progress">
          <div className="donut light-donut" style={{ "--percent": "64%" } as React.CSSProperties}>
            <div>
              <strong>64%</strong>
              <span>avance general</span>
            </div>
          </div>
        </div>
      </div>
      <div className="stats-grid teacher-stats">
        <Stat icon="book" value="3" label="Módulos en curso" />
        <Stat icon="check" value="5" label="Completados" tone="green" />
        <Stat icon="clock" value="4" label="Actividades pendientes" tone="orange" />
        <Stat icon="award" value="4,6" label="Promedio de notas" tone="purple" />
      </div>
      <div className="dashboard-grid">
        <section className="panel span-2 current-course">
          <PanelHead title="Continúa aprendiendo" subtitle="Tu módulo más reciente" />
          <div className="course-row">
            <div className="course-icon">
              <Icon name="shield" size={34} />
            </div>
            <div className="grow">
              <span className="category">CIUDADANÍA DIGITAL · BÁSICO</span>
              <h3>Ciudadanía digital responsable</h3>
              <p>Lección 5 de 6 · Protección de datos personales</p>
              <Progress value={78} />
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
        {modules.slice(1).map((m) => (
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

function LearningPage() {
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

function DiagnosticPage() {
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
            <div className="donut" style={{ "--percent": "72%" } as React.CSSProperties}>
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

function ConnectivityPage({ admin = false }: { admin?: boolean }) {
  const [measured, setMeasured] = useState(false);
  return (
    <div>
      <PageTitle
        eyebrow="DIAGNÓSTICO DE RED"
        title={admin ? "Monitoreo de conectividad" : "Mi conectividad"}
        subtitle={
          admin
            ? "Consulta la calidad de conexión reportada por institución y docente."
            : "Analizamos tu conexión para ofrecerte la mejor experiencia de aprendizaje."
        }
        action={
          <button className="primary-btn" onClick={() => setMeasured(true)}>
            <Icon name="activity" /> Realizar nueva prueba
          </button>
        }
      />
      {!admin && (
        <div className={`connection-banner ${measured ? "good" : "pending"}`}>
          <div>
            <Icon name="wifi" size={38} />
          </div>
          <section>
            <span>ESTADO DE TU CONEXIÓN</span>
            <h2>
              {measured ? "Medición completada: conexión buena" : "Aún no hay una medición activa"}
            </h2>
            <p>
              {measured
                ? "Los valores fueron obtenidos al ejecutar esta prueba y pueden guardarse en el historial."
                : "Inicia la prueba para calcular descarga, latencia y jitter mediante JavaScript."}
            </p>
          </section>
          <time>
            {measured ? "Prueba actual" : "Última prueba almacenada"}
            <br />
            <b>{measured ? "Hace unos segundos" : "12 jun, 3:24 p. m."}</b>
          </time>
        </div>
      )}
      <div className="stats-grid connection-stats">
        <Stat
          icon="download"
          value={admin ? "68%" : measured ? "42,8" : "—"}
          label={admin ? "Conexiones buenas" : "Descarga · Mbps"}
          tone="green"
        />
        <Stat
          icon="activity"
          value={admin ? "24%" : measured ? "28" : "—"}
          label={admin ? "Conexiones regulares" : "Latencia · ms"}
        />
        <Stat
          icon="chart"
          value={admin ? "8%" : measured ? "4,2" : "—"}
          label={admin ? "Conexiones deficientes" : "Jitter · ms"}
          tone="orange"
        />
        <Stat
          icon="wifi"
          value={admin ? "1.183" : measured ? "Wi-Fi" : "Sin medir"}
          label={admin ? "Pruebas este mes" : "Tipo de conexión"}
          tone="purple"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel span-2">
          <PanelHead
            title={admin ? "Calidad de conexión por institución" : "Historial de mediciones"}
            subtitle="Resultados de los últimos 30 días"
          />
          {admin ? (
            <Chart />
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fecha y hora</th>
                    <th>Descarga</th>
                    <th>Latencia</th>
                    <th>Jitter</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {measured && (
                    <tr>
                      <td>Medición actual</td>
                      <td>
                        <b>42,8 Mbps</b>
                      </td>
                      <td>28 ms</td>
                      <td>4,2 ms</td>
                      <td>Wi-Fi</td>
                      <td>
                        <span className="status success">Buena</span>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>12 jun 2025 · 3:24 p. m.</td>
                    <td>
                      <b>18,6 Mbps</b>
                    </td>
                    <td>64 ms</td>
                    <td>12,1 ms</td>
                    <td>Wi-Fi</td>
                    <td>
                      <span className="status warning">Regular</span>
                    </td>
                  </tr>
                  <tr>
                    <td>28 may 2025 · 8:10 a. m.</td>
                    <td>
                      <b>7,2 Mbps</b>
                    </td>
                    <td>118 ms</td>
                    <td>28,4 ms</td>
                    <td>Datos móviles</td>
                    <td>
                      <span className="status danger">Mala</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="data-note">
                Los registros históricos corresponden a mediciones almacenadas. Los valores nuevos
                solo aparecen después de ejecutar la prueba.
              </p>
            </div>
          )}
        </section>
        <section className="panel tips">
          <PanelHead title="Recomendaciones" />
          <div>
            <i>
              <Icon name="wifi" />
            </i>
            <p>
              <b>Ubícate cerca del router</b>
              <span>Una menor distancia mejora la estabilidad.</span>
            </p>
          </div>
          <div>
            <i>
              <Icon name="download" />
            </i>
            <p>
              <b>Descarga tus recursos</b>
              <span>Tenlos disponibles incluso sin conexión.</span>
            </p>
          </div>
          <div>
            <i>
              <Icon name="activity" />
            </i>
            <p>
              <b>Evita descargas simultáneas</b>
              <span>Libera ancho de banda durante tus clases.</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function TrackingPage() {
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
              {users.slice(0, 4).map((u, i) => (
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
                  <td>{modules[i % 3].title}</td>
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

function TechnicalDashboard() {
  return (
    <div>
      <PageTitle
        eyebrow="MONITOREO TÉCNICO"
        title="Estado del sistema"
        subtitle="Resumen operativo de los últimos 60 días · Actualizado hace 2 minutos"
        action={
          <span className="live">
            <i></i> Todos los sistemas operativos
          </span>
        }
      />
      <div className="stats-grid">
        <Stat
          icon="activity"
          value="2,48 M"
          label="Peticiones realizadas"
          note="+12,4% vs. período anterior"
        />
        <Stat
          icon="clock"
          value="186 ms"
          label="Respuesta promedio"
          note="Objetivo: < 250 ms"
          tone="green"
        />
        <Stat
          icon="report"
          value="0,18%"
          label="Tasa de errores"
          note="-0,06% este mes"
          tone="orange"
        />
        <Stat
          icon="wifi"
          value="99,97%"
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

function RolesPage() {
  const permissions = [
    "Dashboard",
    "Usuarios",
    "Módulos",
    "Diagnóstico",
    "Seguimiento",
    "Reportes técnicos",
  ];
  const roles = [
    ["Administrador", "Gestiona usuarios, roles y contenidos", "Activo"],
    ["Capacitador", "Acompaña y califica a docentes", "Activo"],
    ["Docente", "Realiza formación y evaluaciones", "Activo"],
    ["Sistemas", "Consulta registros de comunicaciones", "Activo"],
  ];
  return (
    <div>
      <PageTitle
        eyebrow="ADMINISTRACIÓN"
        title="Roles y permisos"
        subtitle="Configura el acceso a páginas y acciones del sistema."
        action={
          <button className="primary-btn">
            <Icon name="plus" /> Crear rol
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Rol</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r[0]}>
                  <td>
                    <b>{r[0]}</b>
                  </td>
                  <td>{r[1]}</td>
                  <td>
                    <span className="status success">{r[2]}</span>
                  </td>
                  <RowActions />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel permission-panel">
        <PanelHead
          title="Matriz de permisos"
          subtitle="Permisos asociados a las páginas del sistema"
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Página</th>
                {["Ver", "Crear", "Editar", "Eliminar"].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={p}>
                  <td>
                    <b>{p}</b>
                  </td>
                  {[0, 1, 2, 3].map((a) => (
                    <td key={a}>
                      <input
                        type="checkbox"
                        aria-label={`${a} ${p}`}
                        defaultChecked={i === 0 || a === 0 || (i < 3 && a < 3)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DiagnosticAdminPage() {
  return (
    <div>
      <PageTitle
        eyebrow="CONFIGURACIÓN"
        title="Diagnóstico de competencias"
        subtitle="Administra preguntas y opciones para las cinco competencias digitales."
        action={
          <button className="primary-btn">
            <Icon name="plus" /> Crear pregunta
          </button>
        }
      />
      <div className="competency-strip">
        {["Tecnológica", "Comunicativa", "Pedagógica", "De gestión", "Investigativa"].map(
          (x, i) => (
            <div key={x}>
              <span>{i + 1}</span>
              <b>{x}</b>
              <small>{[12, 10, 14, 8, 9][i]} preguntas</small>
            </div>
          ),
        )}
      </div>
      <section className="panel table-panel">
        <div className="table-tools">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Buscar pregunta..." />
          </div>
          <select>
            <option>Todas las competencias</option>
          </select>
          <select>
            <option>Todos los niveles</option>
            <option>Exploración</option>
            <option>Integración</option>
            <option>Innovación</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pregunta</th>
                <th>Competencia</th>
                <th>Opciones</th>
                <th>Orden</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PRG-001</td>
                <td>
                  <b>¿Con qué frecuencia utiliza herramientas digitales en clase?</b>
                </td>
                <td>Tecnológica</td>
                <td>4</td>
                <td>1</td>
                <td>
                  <span className="status success">Activa</span>
                </td>
                <RowActions />
              </tr>
              <tr>
                <td>PRG-002</td>
                <td>
                  <b>¿Cómo comparte recursos con sus estudiantes?</b>
                </td>
                <td>Comunicativa</td>
                <td>4</td>
                <td>2</td>
                <td>
                  <span className="status success">Activa</span>
                </td>
                <RowActions />
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ActivitiesPage() {
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

function EvaluationsPage() {
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

function ProgressPage() {
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

function DeadlinesPage() {
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

function ReportsPage({ connectivity = false }: { connectivity?: boolean }) {
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

function TechnicalLogsPage({ page }: { page: string }) {
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

function GenericPage({ page }: { page: string }) {
  const labels: Record<string, string> = {
    roles: "Roles y permisos",
    institutions: "Instituciones educativas",
    "diagnostic-admin": "Diagnóstico de competencias",
    reports: "Reportes e informes",
    settings: "Configuración",
    activities: "Mis actividades",
    evaluations: "Mis evaluaciones",
    progress: "Progreso por módulos",
    profile: "Mi perfil",
    deadlines: "Tiempos de entrega",
    requests: "Peticiones del sistema",
    performance: "Rendimiento",
    errors: "Historial de errores",
    uptime: "Disponibilidad",
  };
  const title = labels[page] || "Vista general";
  return (
    <div>
      <PageTitle
        eyebrow="EDUCONECTA CAJICÁ"
        title={title}
        subtitle="Consulta y administra la información de este módulo."
      />
      <div className="generic-grid">
        <section className="panel">
          <div className="empty-illustration">
            <Icon
              name={
                page.includes("report")
                  ? "report"
                  : page.includes("progress")
                    ? "chart"
                    : "settings"
              }
              size={46}
            />
          </div>
          <h2>{title}</h2>
          <p>
            Esta vista está conectada a la arquitectura del prototipo. Usa los controles principales
            para explorar su comportamiento.
          </p>
          <button className="primary-btn">
            <Icon name="plus" /> Crear nuevo registro
          </button>
        </section>
        <section className="panel">
          <PanelHead title="Resumen reciente" subtitle="Información actualizada hoy" />
          {["Configuración principal", "Permisos y accesos", "Actividad reciente"].map((x, i) => (
            <div className="setting-row" key={x}>
              <div>
                <b>{x}</b>
                <span>
                  {i === 0
                    ? "Datos institucionales configurados"
                    : i === 1
                      ? "Políticas de acceso vigentes"
                      : "Última actualización hace 2 horas"}
                </span>
              </div>
              <span className="status success">Activo</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function AppShell({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const [page, setPage] = useState("dashboard");
  const [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const info = roleInfo[role];
  const navigate = (p: string) => {
    setPage(p);
    setMobile(false);
  };
  let content: React.ReactNode;
  if (page === "dashboard")
    content =
      role === "teacher" ? (
        <TeacherDashboard navigate={navigate} />
      ) : role === "technical" ? (
        <TechnicalDashboard />
      ) : (
        <AdminDashboard trainer={role === "trainer"} navigate={navigate} />
      );
  else if (page === "users") content = <UsersPage openModal={() => setModal(true)} />;
  else if (page === "modules") content = <ModulesPage role={role} navigate={navigate} />;
  else if (page === "learning") content = <LearningPage />;
  else if (page === "diagnostic") content = <DiagnosticPage />;
  else if (page === "connectivity" || page === "connectivity-admin")
    content = <ConnectivityPage admin={page === "connectivity-admin"} />;
  else if (page === "tracking") content = <TrackingPage />;
  else if (page === "roles") content = <RolesPage />;
  else if (page === "diagnostic-admin") content = <DiagnosticAdminPage />;
  else if (page === "activities") content = <ActivitiesPage />;
  else if (page === "evaluations") content = <EvaluationsPage />;
  else if (page === "progress") content = <ProgressPage />;
  else if (page === "deadlines") content = <DeadlinesPage />;
  else if (page === "reports") content = <ReportsPage />;
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
          {menus[role].map((item) => (
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
            <b>{menus[role].find((x) => x.page === page)?.label || "Vista"}</b>
          </div>
          <div className="top-actions">
            <button
              className="icon-btn notification"
              onClick={() => setToast("No tienes notificaciones nuevas.")}
            >
              <Icon name="bell" />
              <i></i>
            </button>
            <div className="profile">
              <Avatar initials={info.initials} color={info.color} />
              <div>
                <b>{info.name}</b>
                <span>{info.label}</span>
              </div>
              <Icon name="arrow" size={15} />
            </div>
          </div>
        </header>
        <main className="content">{content}</main>
      </div>
      {modal && (
        <div className="modal-backdrop">
          <form
            className="modal"
            onSubmit={(e) => {
              e.preventDefault();
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
            <div className="form-grid">
              <label>
                Primer nombre
                <input required placeholder="Ej. Claudia" />
              </label>
              <label>
                Segundo nombre
                <input placeholder="Ej. Marcela" />
              </label>
              <label>
                Primer apellido
                <input required placeholder="Ej. Rodríguez" />
              </label>
              <label>
                Segundo apellido
                <input placeholder="Ej. López" />
              </label>
              <label>
                Correo electrónico
                <input required type="email" placeholder="nombre@institucion.edu.co" />
              </label>
              <label>
                Contraseña temporal
                <input required type="password" minLength={8} placeholder="Mínimo 8 caracteres" />
              </label>
              <label>
                Rol
                <select>
                  <option>Docente</option>
                  <option>Capacitador</option>
                  <option>Administrador</option>
                </select>
              </label>
              <label>
                Institución
                <select>
                  <option>I.E.D. Pompilio Martínez</option>
                  <option>I.E.D. Capellanía</option>
                </select>
              </label>
              <label className="wide">
                Área de formación
                <select>
                  <option>Ciencias naturales</option>
                  <option>Matemáticas</option>
                  <option>Tecnología e informática</option>
                  <option>Lenguaje</option>
                </select>
              </label>
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
              <button className="primary-btn">Registrar usuario</button>
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
  return role ? (
    <AppShell role={role} onLogout={() => setRole(null)} />
  ) : (
    <Login onLogin={setRole} />
  );
}
