import { Icon, PageTitle, PanelHead } from "@/components/ui";

export function GenericPage({ page }: { page: string }) {
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
