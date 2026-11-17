import { json, request } from "./http";
import type { ApiConnectivityMeasurement } from "./types";

export const connectivityApi = {
  recordConnectivity: (data: {
    velocidad_bajada?: number;
    latencia_ms?: number;
    tipo_conexion?: string;
    estado: string;
  }) =>
    request<{ mensaje: string; medicion: ApiConnectivityMeasurement }>(
      "/conectividad/mediciones",
      json("POST", data),
    ),
  latestConnectivity: () =>
    request<{ medicion: ApiConnectivityMeasurement | null }>("/conectividad/ultima-medicion"),
};
