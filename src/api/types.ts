export type ApiUser = {
  id: number;
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  username?: string | null;
  activo?: boolean;
  ultimo_acceso_en?: string | null;
  roles?: Array<{ id?: number; rol_name: string; description?: string | null }>;
};

export type ApiRole = { id: number; rol_name: string; description?: string | null };
export type ApiRoleDetail = ApiRole & {
  pages_by_role?: Array<{ id_page: number; id_permission: number }>;
};
export type ApiPermissionCatalog = {
  paginas: Array<{ id: number; page_name: string; route?: string | null }>;
  permisos: Array<{ id: number; permission: string }>;
};
export type ApiInstitution = {
  id: number;
  nombre: string;
  codigo_dane?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo?: boolean;
  usuarios?: ApiUser[];
};
export type ApiInstitutionInput = {
  nombre: string;
  codigo_dane?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo?: boolean;
};
export type ApiModule = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado?: string;
  nivel?: { nombre: string } | null;
  lecciones?: Array<{ id: number; titulo: string; orden?: number }>;
};
export type ApiProgress = {
  modulo_id: number;
  modulo: string;
  nivel?: string;
  estado: string;
  porcentaje: number;
  lecciones_completadas: number;
  total_lecciones: number;
  nota_evaluacion: number | null;
  evaluacion_habilitada: boolean;
  lecciones?: Array<{ id: number; estado: string; porcentaje?: number }>;
};
export type ApiNotification = {
  id: number;
  titulo?: string;
  mensaje?: string;
  leida?: boolean;
  created_at?: string;
};
export type ApiConnectivityMeasurement = {
  id?: number;
  velocidad_bajada?: number | null;
  latencia_ms?: number | null;
  tipo_conexion?: string | null;
  estado: string;
  usuario_id?: number;
  medido_en?: string;
};
