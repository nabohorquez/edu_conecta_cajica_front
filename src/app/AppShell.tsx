import { useEffect, useState } from "react";
import { api, apiConfigured, type ApiRole, type ApiUser } from "@/api/client";
import { Avatar, Icon } from "@/components/ui";
import { Logo } from "@/components/Logo";
import {
  ActivitiesPage,
  DeadlinesPage,
  EvaluationsPage,
  ProgressPage,
} from "@/features/learning/WorkPages";
import { ReportsPage, TechnicalLogsPage } from "@/features/reports/ReportsPages";
import { ConnectivityPage } from "@/features/connectivity/ConnectivityPage";
import { DiagnosticAdminPage } from "@/features/diagnostic/DiagnosticAdminPage";
import { GenericPage } from "@/features/common/GenericPage";
import { DiagnosticPage } from "@/features/diagnostic/DiagnosticPage";
import { RolesPage } from "@/features/roles/RolesPage";
import { TrackingPage } from "@/features/tracking/TrackingPage";
import { LearningPage, ApiLearningCatalogPage } from "@/features/modules/LearningPage";
import { ModulesPage } from "@/features/modules/ModulesPage";
import { ProfilePage } from "@/features/users/ProfilePage";
import { UsersPage } from "@/features/users/UsersPage";
import { InstitutionsPage } from "@/features/users/InstitutionsPage";
import { CreateUserModal } from "@/features/users/CreateUserModal";
import {
  AdminDashboard,
  TeacherDashboard,
  TechnicalDashboard,
} from "@/features/dashboard/Dashboards";
import { modules, users } from "./demoData";
import { roleInfo } from "./config";
import { frontendPages, menus } from "./navigation";
import { usePagePermissions } from "./usePagePermissions";
import type { Role } from "@/types/app";

export function AppShell({
  role,
  user,
  onLogout,
  onUserUpdated,
}: {
  role: Role;
  user?: ApiUser;
  onLogout: () => void;
  onUserUpdated: (user: ApiUser) => void;
}) {
  const [page, setPage] = useState("dashboard");
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [roleOptions, setRoleOptions] = useState<ApiRole[]>([]);
  const {
    allowedPages,
    pageLabels,
    loading: permissionsLoading,
    error: permissionsError,
  } = usePagePermissions(role, user);
  const [navigationError, setNavigationError] = useState("");
  const info = roleInfo[role];
  const displayName =
    user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || info.name;
  const displayInitials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const visibleMenu = apiConfigured
    ? frontendPages
        .filter((item) => allowedPages.has(item.page))
        .map((item) => ({ ...item, label: pageLabels[item.page] || item.label }))
    : menus[role].filter((item) => allowedPages.has(item.page));
  useEffect(() => {
    if (!apiConfigured || permissionsLoading || permissionsError || allowedPages.has(page)) return;
    const firstAllowedPage = frontendPages.find((item) => allowedPages.has(item.page));
    if (firstAllowedPage) setPage(firstAllowedPage.page);
  }, [allowedPages, page, permissionsError, permissionsLoading, role]);
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
      setToast(
        cause instanceof Error ? cause.message : "No fue posible cargar las notificaciones.",
      );
    }
  };
  useEffect(() => {
    if (!apiConfigured || page !== "users") return;
    api
      .roles()
      .then(({ roles }) => setRoleOptions(roles))
      .catch((cause) =>
        setToast(cause instanceof Error ? cause.message : "No fue posible cargar los roles."),
      );
  }, [page]);
  let content: React.ReactNode;
  if (apiConfigured && permissionsLoading)
    content = (
      <div className="form-message" role="status">
        Cargando permisos de páginas...
      </div>
    );
  else if (apiConfigured && permissionsError)
    content = (
      <div className="form-message" role="alert">
        {permissionsError}
      </div>
    );
  else if (apiConfigured && !allowedPages.has(page))
    content = (
      <div className="form-message" role="alert">
        No tienes permiso para acceder a las páginas disponibles.
      </div>
    );
  else if (page === "dashboard")
    content =
      role === "teacher" ? (
        <TeacherDashboard navigate={navigate} user={user} />
      ) : role === "technical" ? (
        <TechnicalDashboard />
      ) : (
        <AdminDashboard trainer={role === "trainer"} navigate={navigate} />
      );
  else if (page === "users")
    content = (
      <UsersPage
        demoUsers={users}
        roleLabels={roleInfo}
        roleOptions={roleOptions}
        openModal={() => setModal(true)}
      />
    );
  else if (page === "institutions") content = <InstitutionsPage />;
  else if (page === "modules")
    content = (
      <ModulesPage
        role={role}
        navigate={navigate}
        demoModules={modules}
        onSelectModule={(moduleId) => setActiveModuleId(moduleId ?? null)}
      />
    );
  else if (page === "learning")
    content = (
      <LearningPage
        moduleId={activeModuleId}
        onSelectModule={(moduleId) => setActiveModuleId(moduleId ?? null)}
        navigate={navigate}
      />
    );
  else if (page === "lessons")
    content = apiConfigured ? (
      <ApiLearningCatalogPage kind="lessons" />
    ) : (
      <GenericPage page={page} />
    );
  else if (page === "resources")
    content = apiConfigured ? (
      <ApiLearningCatalogPage kind="resources" />
    ) : (
      <GenericPage page={page} />
    );
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
            <button className="icon-btn notification" onClick={() => void showNotifications()}>
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
          {navigationError && (
            <div className="form-message" role="alert">
              {navigationError}
            </div>
          )}
          {content}
        </main>
      </div>
      <CreateUserModal open={modal} onClose={() => setModal(false)} onToast={setToast} />
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
