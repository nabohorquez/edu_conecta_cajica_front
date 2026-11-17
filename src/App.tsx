import { useEffect, useState } from "react";
import { api, getApiToken, roleFromApiUser, setApiToken, type ApiUser } from "@/api/client";
import { AppShell } from "@/app/AppShell";
import { demoAccounts, demoDisplayNames, roleInfo } from "@/app/config";
import { Login } from "@/features/auth/Login";
import type { Role } from "@/types/app";

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<ApiUser>();
  const [restoringSession, setRestoringSession] = useState(Boolean(getApiToken()));

  useEffect(() => {
    if (!getApiToken()) return;
    api
      .currentUser()
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

  if (restoringSession)
    return (
      <main className="login-page">
        <p className="muted">{"Restaurando sesi\u00f3n..."}</p>
      </main>
    );
  return role ? (
    <AppShell role={role} user={user} onLogout={logout} onUserUpdated={setUser} />
  ) : (
    <Login
      roleInfo={roleInfo}
      demoAccounts={demoAccounts}
      demoDisplayNames={demoDisplayNames}
      onLogin={(nextRole, nextUser) => {
        setRole(nextRole);
        setUser(nextUser);
      }}
    />
  );
}
