import { useEffect, useState } from "react";
import { api, apiConfigured, type ApiConnectivityMeasurement } from "@/api/client";
import { Chart } from "@/components/Chart";
import { Icon, PageTitle, PanelHead, Stat } from "@/components/ui";

export function ConnectivityPage({ admin = false }: { admin?: boolean }) {
  const [measured, setMeasured] = useState(false);
  const [checking, setChecking] = useState(false);
  const [measurement, setMeasurement] = useState<ApiConnectivityMeasurement>();
  const [connectivityError, setConnectivityError] = useState("");
  const [connectivityRows, setConnectivityRows] = useState<Array<{ id: number; estado: string; velocidad_bajada?: number; latencia_ms?: number; tipo_conexion?: string; medido_en?: string; usuario?: { name?: string } }>>([]);
  useEffect(() => {
    if (!apiConfigured || !admin) return;
    api.connectivityReport().then((response) => setConnectivityRows((response as { data: typeof connectivityRows }).data || []))
      .catch((cause) => setConnectivityError(cause instanceof Error ? cause.message : "No fue posible cargar el informe de conectividad."));
  }, [admin]);
  useEffect(() => {
    if (!apiConfigured || admin) return;
    setConnectivityError("");
    api.latestConnectivity().then((response) => {
      const latest = response.medicion;
      if (latest) { setMeasurement(latest); setMeasured(true); }
    }).catch((cause) =>
      setConnectivityError(cause instanceof Error ? cause.message : "No fue posible cargar la última medición."),
    );
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
      const response = await api.recordConnectivity(result);
      setMeasurement(response.medicion);
      setMeasured(true);
    } catch (cause) {
      setConnectivityError(cause instanceof Error ? cause.message : "No fue posible medir la conectividad.");
    } finally {
      setChecking(false);
    }
  };
  const connectivityStatus =
    measurement?.estado === "sin_conexion" ? "sin conexión" : measurement?.estado || "";
  const connectionBannerTone =
    measurement?.estado === "buena"
      ? "good"
      : measurement?.estado === "limitada"
        ? "limited"
        : measurement?.estado === "sin_conexion"
          ? "disconnected"
          : "pending";
  const measurementDate = measurement?.medido_en
    ? new Date(measurement.medido_en).toLocaleString("es-CO")
    : null;
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
        <div className={`connection-banner ${connectionBannerTone}`}>
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
                ? apiConfigured
                  ? "La medición fue registrada en el historial."
                  : "Los valores fueron obtenidos al ejecutar esta prueba y pueden guardarse en el historial."
                : "Inicia la prueba para calcular descarga, latencia y jitter mediante JavaScript."}
            </p>
          </section>
          <time>
            {apiConfigured
              ? measurementDate
                ? "Última prueba registrada"
                : "Sin mediciones"
              : measured
                ? "Prueba actual"
                : "Última prueba almacenada"}
            <br />
            <b>
              {apiConfigured ? measurementDate || "—" : measured ? "Hace unos segundos" : "12 jun, 3:24 p. m."}
            </b>
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
                      <td>{measurementDate || "Última medición"}</td>
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
