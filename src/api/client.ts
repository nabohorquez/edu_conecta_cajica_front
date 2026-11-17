import { authApi } from "./auth";
import { connectivityApi } from "./connectivity";
import { dashboardApi } from "./dashboard";
import { diagnosticsApi } from "./diagnostics";
import { learningApi } from "./learning";
import { notificationsApi } from "./notifications";
import { progressApi } from "./progress";
import { reportsApi } from "./reports";
import { systemApi } from "./system";
import { usersApi } from "./users";

export { ApiError, apiConfigured, getApiToken, setApiToken } from "./http";
export { roleFromApiUser } from "./auth";
export type {
  ApiConnectivityMeasurement,
  ApiInstitution,
  ApiInstitutionInput,
  ApiModule,
  ApiNotification,
  ApiPermissionCatalog,
  ApiProgress,
  ApiRole,
  ApiRoleDetail,
  ApiUser,
} from "./types";

export const api = {
  ...systemApi,
  ...authApi,
  ...usersApi,
  ...learningApi,
  ...diagnosticsApi,
  ...progressApi,
  ...reportsApi,
  ...connectivityApi,
  ...notificationsApi,
  ...dashboardApi,
};
