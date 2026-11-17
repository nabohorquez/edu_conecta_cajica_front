import { request } from "./http";

export const systemApi = {
  health: () => request<{ estado: string }>("/salud"),
};
