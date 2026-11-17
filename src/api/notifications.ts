import { json, request } from "./http";
import type { ApiNotification } from "./types";

export const notificationsApi = {
  notifications: (noLeidas = false) =>
    request<{ no_leidas: number; notificaciones: { data: ApiNotification[] } }>(
      `/notificaciones?no_leidas=${noLeidas ? "true" : "false"}`,
    ),
  markNotificationRead: (id: number) => request(`/notificaciones/${id}/leida`, json("PATCH")),
};
