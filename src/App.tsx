import type { Chart as ChartInstance } from "chart.js";
import type { JSX } from "react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { api, apiConfigured, getApiToken, roleFromApiUser, setApiToken, type ApiModule, type ApiProgress, type ApiRole, type ApiUser } from "@/api/client";

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

function Login({ onLogin }: { onLogin: (role: Role, user?: ApiUser) => void }) {
  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState("");
  const [recover, setRecover] = useState(false);
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState(apiConfigured ? "" : demoAccounts.admin.email);
  const [password, setPassword] = useState(apiConfigured ? "" : demoAccounts.admin.password);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Completa tu correo electrónico y contraseña.");
    if (apiConfigured) {
      setBusy(true);
      setError("");
      try {
        const user = await api.login(email.trim(), password);
        const apiRole = roleFromApiUser(user);
        if (!apiRole) {
          await api.logout();
          setError("Tu cuenta no tiene un rol habilitado para ingresar a la plataforma.");
          return;
        }
        onLogin(apiRole, user);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No fue posible iniciar sesiÃ³n.");
      } finally {
        setBusy(false);
      }
      return;
    }
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
              if (!apiConfigured) {
                setSent(true);
                return;
              }
              setBusy(true);
              api.requestPasswordReset(email.trim())
                .then(() => setSent(true))
                .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible enviar el correo."))
                .finally(() => setBusy(false));
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
            {error && <div className="form-message" role="alert">{error}</div>}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <button className="primary-btn full" type="submit" disabled={busy}>
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
            <button className="primary-btn full" type="submit" disabled={busy}>
              {busy ? "Conectando..." : "Ingresar a la plataforma"} <Icon name="arrow" size={17} />
            </button>
            {!apiConfigured && <div className="demo-label">
              <span></span>Accesos de demostración<span></span>
            </div>}
            {!apiConfigured && <p className="demo-intro">
              ¿Quieres explorar la plataforma? Selecciona un perfil para probar sus funcionalidades.
            </p>}
            {!apiConfigured && <div className="role-options">
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
            </div>}
            {!apiConfigured && <button
              type="button"
              className="demo-credentials-toggle"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            >
              {showDemoCredentials
                ? "Ocultar credenciales de demostración"
                : "Ver credenciales de demostración"}
              <Icon name="arrow" size={13} />
            </button>}
            {!apiConfigured && showDemoCredentials && (
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

function UsersPage({ openModal, roleOptions }: { openModal: () => void; roleOptions: ApiRole[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(apiConfigured ? 0 : users.length);
  const [lastPage, setLastPage] = useState(1);
  const [userRows, setUserRows] = useState(() =>
    apiConfigured ? [] : users.map((user) => ({ ...user, roles: [user.role] })),
  );
  const [loading, setLoading] = useState(apiConfigured);
  const [apiError, setApiError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  useEffect(() => {
    const refresh = () => setRefreshVersion((version) => version + 1);
    window.addEventListener("educonecta:users-changed", refresh);
    return () => window.removeEventListener("educonecta:users-changed", refresh);
  }, []);
  useEffect(() => {
    if (!apiConfigured) return;
    let cancelled = false;
    setLoading(true);
    api.users({
      buscar: query || undefined,
      activo: status === "Todos" ? undefined : status === "Activo",
      por_pagina: 100,
      page,
    })
      .then(({ data, total, current_page, last_page }) => {
        if (cancelled) return;
        setTotalUsers(total ?? data.length);
        setPage(current_page ?? page);
        setLastPage(last_page ?? 1);
        setUserRows(data.map((user) => {
          const name = user.name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
          const roleNames = user.roles?.map((assignedRole) => assignedRole.rol_name) || [];
          return {
            id: String(user.id),
            name,
            initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
            email: user.email,
            school: "—",
            role: roleNames[0] || "Sin rol",
            roles: roleNames,
            area: "—",
            status: user.activo === false ? "Inactivo" : "Activo",
            last: user.ultimo_acceso_en ? new Date(user.ultimo_acceso_en).toLocaleString("es-CO") : "Sin ingreso",
          };
        }));
        setApiError("");
      })
      .catch((cause) => {
        if (!cancelled) setApiError(cause instanceof Error ? cause.message : "No fue posible cargar usuarios.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query, status, refreshVersion, page]);
  useEffect(() => { setPage(1); }, [query, status]);
  const toggleUserStatus = async (user: (typeof userRows)[number]) => {
    const nextActive = user.status !== "Activo";
    if (apiConfigured) {
      try {
        await api.setUserActive(Number(user.id), nextActive);
      } catch (cause) {
        setApiError(cause instanceof Error ? cause.message : "No fue posible actualizar el usuario.");
        return;
      }
    }
    setUserRows((rows) => rows.map((row) => row.id === user.id
      ? { ...row, status: nextActive ? "Activo" : "Inactivo" }
      : row));
  };
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
        {apiError && <div className="form-message" role="alert">{apiError}</div>}
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
              {loading && <tr><td colSpan={8}>Cargando usuarios...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8}>No se encontraron usuarios.</td></tr>}
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
                        onClick={() => void toggleUserStatus(u)}
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
          <span>Mostrando {totalUsers === 0 ? 0 : (page - 1) * 100 + 1}–{Math.min(page * 100, totalUsers)} de {totalUsers.toLocaleString("es-CO")} usuarios</span>
          <div>
            <button disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</button>
            <span>{page} / {lastPage}</span>
            <button disabled={page >= lastPage || loading} onClick={() => setPage((current) => Math.min(lastPage, current + 1))}>Siguiente</button>
          </div>
        </div>
      </section>
      {editingUser !== null && (
        <div className="modal-backdrop">
          <form
            className="modal compact-modal"
            onSubmit={async (e) => {
              e.preventDefault();
              if (apiConfigured) {
                const currentUser = userRows[editingUser];
                const selectedRole = roleOptions.find((option) => currentUser.roles.includes(option.rol_name));
                if (!selectedRole) {
                  setApiError("Selecciona un rol para guardar los cambios.");
                  return;
                }
                try {
                  await api.updateUser(Number(currentUser.id), { rol_id: selectedRole.id });
                  window.dispatchEvent(new Event("educonecta:users-changed"));
                  setApiError("");
                } catch (cause) {
                  setApiError(cause instanceof Error ? cause.message : "No fue posible actualizar el rol.");
                  return;
                }
              }
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
              {(apiConfigured ? roleOptions.map((option) => ({ key: option.rol_name, label: option.rol_name })) : (Object.keys(roleInfo) as Role[]).map((roleKey) => ({ key: roleKey, label: roleInfo[roleKey].label }))).map(({ key: roleKey, label }) => {
                const checked = userRows[editingUser].roles.includes(label);
                return (
                  <label className="role-check" key={roleKey}>
                    <input
                      type={apiConfigured ? "radio" : "checkbox"}
                      name={apiConfigured ? "role_assignment" : undefined}
                      checked={checked}
                      onChange={() =>
                        setUserRows((rows) =>
                          rows.map((row, index) =>
                            index === editingUser
                              ? {
                                  ...row,
                                  roles: apiConfigured ? [label] : checked
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

function ModulesPage({ role, navigate, onSelectModule }: { role: Role; navigate: (p: string) => void; onSelectModule: (moduleId?: number) => void }) {
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
    : modules;
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

function LearningPage({ moduleId, onSelectModule, navigate }: { moduleId: number | null; onSelectModule: (moduleId?: number) => void; navigate: (page: string) => void }) {
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

function ApiLearningCatalogPage({ kind }: { kind: "lessons" | "resources" }) {
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

function DiagnosticPage() {
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
  const [checking, setChecking] = useState(false);
  const [measurement, setMeasurement] = useState<{ velocidad_bajada?: number; latencia_ms?: number; tipo_conexion?: string; estado?: string }>();
  const [connectivityError, setConnectivityError] = useState("");
  const [connectivityRows, setConnectivityRows] = useState<Array<{ id: number; estado: string; velocidad_bajada?: number; latencia_ms?: number; tipo_conexion?: string; medido_en?: string; usuario?: { name?: string } }>>([]);
  useEffect(() => {
    if (!apiConfigured || !admin) return;
    api.connectivityReport().then((response) => setConnectivityRows((response as { data: typeof connectivityRows }).data || []))
      .catch((cause) => setConnectivityError(cause instanceof Error ? cause.message : "No fue posible cargar el informe de conectividad."));
  }, [admin]);
  useEffect(() => {
    if (!apiConfigured || admin) return;
    api.latestConnectivity().then((response) => {
      const latest = (response as { medicion?: typeof measurement }).medicion;
      if (latest) { setMeasurement(latest); setMeasured(true); }
    }).catch(() => undefined);
  }, [admin]);
  const runConnectivityCheck = async () => {
    if (!apiConfigured) { setMeasured(true); return; }
    setChecking(true);
    setConnectivityError("");
    const startedAt = performance.now();
    try {
      await api.health();
      const latency = Math.max(0, Math.round(performance.now() - startedAt));
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection;
      const speed = connection?.downlink || 0;
      const estado = latency < 150 && (!speed || speed >= 5) ? "buena" : latency < 500 && (!speed || speed >= 1) ? "limitada" : "sin_conexion";
      const result = { velocidad_bajada: speed, latencia_ms: latency, tipo_conexion: connection?.effectiveType || "desconocida", estado };
      await api.recordConnectivity(result);
      setMeasurement(result);
      setMeasured(true);
    } catch (cause) {
      setConnectivityError(cause instanceof Error ? cause.message : "No fue posible medir la conectividad.");
    } finally {
      setChecking(false);
    }
  };
  const connectivityStatus = measurement?.estado === "buena" ? "buena" : measurement?.estado === "limitada" ? "limitada" : measurement?.estado === "sin_conexion" ? "deficiente" : "";
  const connectivityPercent = (state: string) => connectivityRows.length ? `${Math.round(connectivityRows.filter((row) => row.estado === state).length / connectivityRows.length * 100)}%` : "0%";
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
          <button className="primary-btn" disabled={checking} onClick={() => void runConnectivityCheck()}>
            <Icon name="activity" /> {checking ? "Midiendo..." : "Realizar nueva prueba"}
          </button>
        }
      />
      {connectivityError && <div className="form-message" role="alert">{connectivityError}</div>}
      {!admin && (
        <div className={`connection-banner ${measured ? "good" : "pending"}`}>
          <div>
            <Icon name="wifi" size={38} />
          </div>
          <section>
            <span>ESTADO DE TU CONEXIÓN</span>
            <h2>
              {measured ? `Medición completada: conexión ${connectivityStatus || "registrada"}` : "Aún no hay una medición activa"}
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
          value={admin ? apiConfigured ? connectivityPercent("buena") : "68%" : apiConfigured ? measurement?.velocidad_bajada != null ? String(measurement.velocidad_bajada) : "—" : measured ? "42,8" : "—"}
          label={admin ? "Conexiones buenas" : "Descarga · Mbps"}
          tone="green"
        />
        <Stat
          icon="activity"
          value={admin ? apiConfigured ? connectivityPercent("limitada") : "24%" : apiConfigured ? measurement?.latencia_ms != null ? String(measurement.latencia_ms) : "—" : measured ? "28" : "—"}
          label={admin ? "Conexiones regulares" : "Latencia · ms"}
        />
        <Stat
          icon="chart"
          value={admin ? apiConfigured ? connectivityPercent("sin_conexion") : "8%" : apiConfigured ? "—" : measured ? "4,2" : "—"}
          label={admin ? "Conexiones deficientes" : "Jitter · ms"}
          tone="orange"
        />
        <Stat
          icon="wifi"
          value={admin ? apiConfigured ? String(connectivityRows.length) : "1.183" : apiConfigured ? measurement?.tipo_conexion || "Sin medir" : measured ? "Wi-Fi" : "Sin medir"}
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
          {admin ? apiConfigured ? (
            <div className="table-scroll"><table><thead><tr><th>Docente</th><th>Fecha</th><th>Descarga</th><th>Latencia</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>{connectivityRows.map((row) => <tr key={row.id}><td>{row.usuario?.name || "—"}</td><td>{row.medido_en ? new Date(row.medido_en).toLocaleString("es-CO") : "—"}</td><td>{row.velocidad_bajada ?? "—"} Mbps</td><td>{row.latencia_ms ?? "—"} ms</td><td>{row.tipo_conexion || "—"}</td><td>{row.estado}</td></tr>)}</tbody></table>{connectivityRows.length === 0 && <p>No hay mediciones registradas.</p>}</div>
          ) : (
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
                      <td>Última medición</td>
                      <td>
                        <b>{apiConfigured ? measurement?.velocidad_bajada ?? "—" : "42,8"} Mbps</b>
                      </td>
                      <td>{apiConfigured ? measurement?.latencia_ms ?? "—" : "28"} ms</td>
                      <td>—</td>
                      <td>{apiConfigured ? measurement?.tipo_conexion || "Desconocida" : "Wi-Fi"}</td>
                      <td>
                        <span className={`status ${connectivityStatus === "buena" || !apiConfigured ? "success" : connectivityStatus === "limitada" ? "warning" : "danger"}`}>{apiConfigured ? connectivityStatus || "Sin datos" : "Buena"}</span>
                      </td>
                    </tr>
                  )}
                  {!apiConfigured && <>
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
                  </>}
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
  return apiConfigured ? <ApiTrackingPage /> : <DemoTrackingPage />;
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

function DemoTrackingPage() {
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

function RolesPage() {
  return apiConfigured ? <ApiRolesPage /> : <DemoRolesPage />;
}

function ApiRolesPage() {
  type PagePermission = { id: number; page_name: string; route?: string };
  type Permission = { id: number; permission: string };
  type RoleDetail = ApiRole & { pages_by_role?: Array<{ id_page: number; id_permission: number }> };
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [pages, setPages] = useState<PagePermission[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiRole | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const [roleResult, catalogResult] = await Promise.all([api.roles(), api.permissionCatalog()]);
      const catalog = catalogResult as { paginas: PagePermission[]; permisos: Permission[] };
      setRoles(roleResult.roles);
      setPages(catalog.paginas || []);
      setPermissions(catalog.permisos || []);
      setSelectedRoleId((current) => current || roleResult.roles[0]?.id || null);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible cargar roles y permisos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!selectedRoleId) return;
    api.role(selectedRoleId).then((response) => {
      const role = (response as { rol: RoleDetail }).rol;
      setSelectedPermissions(new Set((role.pages_by_role || []).map((item) => `${item.id_page}:${item.id_permission}`)));
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar los permisos del rol."));
  }, [selectedRoleId]);
  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const saveRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      if (editing) await api.updateRole(editing.id, { rol_name: String(data.get("rol_name")), description: String(data.get("description")) });
      else await api.createRole({ rol_name: String(data.get("rol_name")), description: String(data.get("description")) });
      setShowForm(false); setEditing(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar el rol."); }
    finally { setSaving(false); }
  };
  const savePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const permisos = Array.from(selectedPermissions).map((value) => {
        const [pagina_id, permiso_id] = value.split(":").map(Number);
        return { pagina_id, permiso_id };
      });
      await api.updateRolePermissions(selectedRoleId, permisos);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar los permisos."); }
    finally { setSaving(false); }
  };
  const removeRole = async (id: number) => {
    try { await api.deleteRole(id); if (selectedRoleId === id) setSelectedRoleId(null); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible eliminar el rol."); }
  };
  return <div><PageTitle eyebrow="ADMINISTRACIÓN" title="Roles y permisos" subtitle="Configura roles y permisos de acceso a páginas." action={<button className="primary-btn" onClick={() => { setEditing(null); setShowForm(true); }}><Icon name="plus" /> Crear rol</button>} />
    {error && <div className="form-message" role="alert">{error}</div>}
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Rol</th><th>Descripción</th><th></th></tr></thead><tbody>{loading && <tr><td colSpan={3}>Cargando roles...</td></tr>}{roles.map((role) => <tr key={role.id}><td><b>{role.rol_name}</b></td><td>{role.description || "—"}</td><td className="actions"><button title="Editar" onClick={() => { setEditing(role); setShowForm(true); }}><Icon name="edit" /></button><button title="Eliminar" onClick={() => void removeRole(role.id)}><Icon name="close" /></button></td></tr>)}</tbody></table></div></section>
    <section className="panel permission-panel"><PanelHead title="Matriz de permisos" subtitle="Los cambios aplican a todos los usuarios que tengan asignado el rol." /><label>Rol<select value={selectedRoleId || ""} onChange={(event) => setSelectedRoleId(Number(event.target.value) || null)}>{roles.map((role) => <option key={role.id} value={role.id}>{role.rol_name}</option>)}</select></label><div className="table-scroll"><table><thead><tr><th>Página</th>{permissions.map((permission) => <th key={permission.id}>{permission.permission}</th>)}</tr></thead><tbody>{pages.map((page) => <tr key={page.id}><td><b>{page.page_name}</b></td>{permissions.map((permission) => { const key = `${page.id}:${permission.id}`; return <td key={permission.id}><input type="checkbox" aria-label={`${permission.permission} ${page.page_name}`} checked={selectedPermissions.has(key)} onChange={(event) => setSelectedPermissions((current) => { const updated = new Set(current); if (event.target.checked) updated.add(key); else updated.delete(key); return updated; })} /></td>; })}</tr>)}</tbody></table></div><button className="primary-btn" disabled={saving || !selectedRoleId} onClick={() => void savePermissions()}>{saving ? "Guardando..." : "Guardar permisos"}</button></section>
    {showForm && <div className="modal-backdrop"><form className="modal compact-modal" onSubmit={saveRole}><header><div><span className="eyebrow">ROLES</span><h2>{editing ? "Editar rol" : "Crear rol"}</h2></div><button type="button" className="icon-btn" onClick={() => setShowForm(false)}><Icon name="close" /></button></header><div className="form-grid"><label>Nombre<input name="rol_name" required maxLength={20} defaultValue={editing?.rol_name} /></label><label className="wide">Descripción<input name="description" maxLength={100} defaultValue={editing?.description || ""} /></label></div><footer><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? "Guardando..." : "Guardar rol"}</button></footer></form></div>}
  </div>;
}

function DemoRolesPage() {
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

function EvaluationsPage() {
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

function ProgressPage() {
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

function DeadlinesPage() {
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

function ReportsPage({ connectivity = false }: { connectivity?: boolean }) {
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

function TechnicalLogsPage({ page }: { page: string }) {
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

function ProfilePage({ user, onUpdate }: { user?: ApiUser; onUpdate: (user: ApiUser) => void }) {
  const [profile, setProfile] = useState<ApiUser | undefined>(user);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!apiConfigured) return;
    api.profile().then(({ perfil }) => setProfile(perfil))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar el perfil."));
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await api.updateProfile({
        first_name: String(formData.get("first_name")),
        last_name: String(formData.get("last_name")),
        email: String(formData.get("email")),
      });
      const { perfil } = await api.profile();
      setProfile(perfil);
      onUpdate(perfil);
      setMessage("Tu perfil fue actualizado.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };
  if (!apiConfigured) return <GenericPage page="profile" />;
  return <div><PageTitle eyebrow="MI CUENTA" title="Mi perfil" subtitle="Actualiza tus datos personales." />
    {error && <div className="form-message" role="alert">{error}</div>}
    {message && <div className="status success" role="status">{message}</div>}
    <section className="panel"><form className="submission-form" onSubmit={submit}>
      <label>Nombres<input name="first_name" required defaultValue={profile?.first_name || profile?.name?.split(" ").slice(0, -1).join(" ") || ""} /></label>
      <label>Apellidos<input name="last_name" required defaultValue={profile?.last_name || ""} /></label>
      <label>Correo electrónico<input name="email" type="email" required defaultValue={profile?.email || ""} /></label>
      <button className="primary-btn" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
    </form></section>
  </div>;
}

function AppShell({ role, user, onLogout, onUserUpdated }: { role: Role; user?: ApiUser; onLogout: () => void; onUserUpdated: (user: ApiUser) => void }) {
  const [page, setPage] = useState("dashboard");
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [roleOptions, setRoleOptions] = useState<ApiRole[]>([]);
  const [modalError, setModalError] = useState("");
  const info = roleInfo[role];
  const displayName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || info.name;
  const displayInitials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const navigate = (p: string) => {
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
  if (page === "dashboard")
    content =
      role === "teacher" ? (
        <TeacherDashboard navigate={navigate} user={user} />
      ) : role === "technical" ? (
        <TechnicalDashboard />
      ) : (
        <AdminDashboard trainer={role === "trainer"} navigate={navigate} />
      );
  else if (page === "users") content = <UsersPage roleOptions={roleOptions} openModal={() => {
    setModalError("");
    if (apiConfigured) api.roles().then(({ roles }) => setRoleOptions(roles))
      .catch((cause) => setModalError(cause instanceof Error ? cause.message : "No fue posible cargar los roles."));
    setModal(true);
  }} />;
  else if (page === "modules") content = <ModulesPage role={role} navigate={navigate} onSelectModule={(moduleId) => setActiveModuleId(moduleId ?? null)} />;
  else if (page === "learning") content = <LearningPage moduleId={activeModuleId} onSelectModule={(moduleId) => setActiveModuleId(moduleId ?? null)} navigate={navigate} />;
  else if (page === "lessons") content = apiConfigured ? <ApiLearningCatalogPage kind="lessons" /> : <GenericPage page={page} />;
  else if (page === "resources") content = apiConfigured ? <ApiLearningCatalogPage kind="resources" /> : <GenericPage page={page} />;
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
        <main className="content">{content}</main>
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
                try {
                  await api.createUser({
                    first_name: String(firstName),
                    last_name: String(lastName),
                    email: String(formData.get("email")),
                    contrasena: String(formData.get("contrasena")),
                    rol_id: Number(formData.get("rol_id")),
                  });
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
                <select name={apiConfigured ? "rol_id" : "rol"} required>
                  {apiConfigured
                    ? roleOptions.length ? roleOptions.map((apiRole) => <option key={apiRole.id} value={apiRole.id}>{apiRole.rol_name}</option>) : <option value="">Cargando roles...</option>
                    : <><option>Docente</option><option>Capacitador</option><option>Administrador</option></>}
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
              <button className="primary-btn" disabled={apiConfigured && roleOptions.length === 0}>Registrar usuario</button>
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
    <Login onLogin={(nextRole, nextUser) => { setRole(nextRole); setUser(nextUser); }} />
  );
}
