import { type FormEvent, useState } from 'react';
import { api, apiConfigured, roleFromApiUser, type ApiUser } from '@/api/client';
import { Icon } from '@/components/ui';
import { Logo } from '@/components/Logo';
import type { Role } from '@/types/app';

export function Login({ onLogin, roleInfo, demoAccounts, demoDisplayNames }: { onLogin: (role: Role, user?: ApiUser) => void; roleInfo: Record<Role, { label: string; name: string; initials: string; color: string }>; demoAccounts: Record<Role, { email: string; password: string }>; demoDisplayNames: Record<Role, string> }) {
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

