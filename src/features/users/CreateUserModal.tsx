import { useEffect, useState, type FormEvent } from "react";
import { api, apiConfigured, type ApiInstitution, type ApiRole } from "@/api/client";
import { Icon } from "@/components/ui";

type CreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  onToast: (message: string) => void;
};

export function CreateUserModal({ open, onClose, onToast }: CreateUserModalProps) {
  const [roleOptions, setRoleOptions] = useState<ApiRole[]>([]);
  const [institutionOptions, setInstitutionOptions] = useState<ApiInstitution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [error, setError] = useState("");
  const selectedRoleName =
    roleOptions.find((option) => String(option.id) === selectedUserRole)?.rol_name || "";
  const needsInstitutionalAssignment = /docente|capacitador/i.test(selectedRoleName);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError("");
    setRoleOptions([]);
    setSelectedUserRole("");
    setInstitutionOptions([]);
    setInstitutionsLoading(apiConfigured);
    if (apiConfigured) {
      api
        .roles()
        .then(({ roles }) => {
          if (!cancelled) setRoleOptions(roles);
        })
        .catch((cause) => {
          if (!cancelled)
            setError(cause instanceof Error ? cause.message : "No fue posible cargar los roles.");
        });
      api
        .institutions({ activo: true, por_pagina: 100 })
        .then(({ data }) => {
          if (!cancelled) {
            setInstitutionOptions(data);
            if (data.length === 0) setError("No hay instituciones activas para asignar.");
          }
        })
        .catch((cause) => {
          if (!cancelled)
            setError(
              cause instanceof Error ? cause.message : "No fue posible cargar las instituciones.",
            );
        })
        .finally(() => {
          if (!cancelled) setInstitutionsLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiConfigured) {
      onClose();
      onToast("Usuario registrado correctamente.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const firstName = [formData.get("first_name"), formData.get("second_name")]
      .filter(Boolean)
      .join(" ");
    const lastName = [formData.get("last_name"), formData.get("second_last_name")]
      .filter(Boolean)
      .join(" ");
    const email = String(formData.get("email"));
    try {
      const result = await api.createUser({
        first_name: String(firstName),
        last_name: String(lastName),
        email,
        contrasena: String(formData.get("contrasena")),
        rol_id: Number(formData.get("rol_id")),
      });
      if (needsInstitutionalAssignment) {
        try {
          let createdUserId = result.usuario?.id;
          if (!createdUserId) {
            const matchingUsers = await api.users({ buscar: email, por_pagina: 100 });
            createdUserId = matchingUsers.data.find(
              (candidate) =>
                candidate.email.toLocaleLowerCase("es") === email.toLocaleLowerCase("es"),
            )?.id;
          }
          if (!createdUserId) {
            throw new Error(
              "No se pudo identificar al usuario creado para asociarlo a la institución.",
            );
          }
          await api.addInstitutionUsers(Number(formData.get("institucion_id")), [createdUserId]);
        } catch (cause) {
          window.dispatchEvent(new Event("educonecta:users-changed"));
          onClose();
          onToast(
            cause instanceof Error
              ? `Usuario creado, pero no fue posible asignar la institución: ${cause.message}`
              : "Usuario creado, pero no fue posible asignar la institución.",
          );
          return;
        }
      }
      window.dispatchEvent(new Event("educonecta:users-changed"));
      onClose();
      onToast("Usuario registrado correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible registrar el usuario.");
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={(event) => void submit(event)}>
        <header>
          <div>
            <span className="eyebrow">NUEVO REGISTRO</span>
            <h2>Registrar usuario</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>
        {error && (
          <div className="form-message" role="alert">
            {error}
          </div>
        )}
        <div className="form-grid">
          <label>
            Primer nombre
            <input required name="first_name" placeholder="Ej. Claudia" />
          </label>
          <label>
            Segundo nombre
            <input name="second_name" placeholder="Ej. Marcela" />
          </label>
          <label>
            Primer apellido
            <input required name="last_name" placeholder="Ej. Rodríguez" />
          </label>
          <label>
            Segundo apellido
            <input name="second_last_name" placeholder="Ej. López" />
          </label>
          <label>
            Correo electrónico
            <input required name="email" type="email" placeholder="nombre@institucion.edu.co" />
          </label>
          <label>
            Contraseña temporal
            <input
              required
              name="contrasena"
              type="password"
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </label>
          <label>
            Rol
            <select
              name={apiConfigured ? "rol_id" : "rol"}
              value={selectedUserRole}
              onChange={(event) => setSelectedUserRole(event.target.value)}
              required
            >
              <option value="">Selecciona un rol</option>
              {apiConfigured ? (
                roleOptions.length ? (
                  roleOptions.map((apiRole) => (
                    <option key={apiRole.id} value={apiRole.id}>
                      {apiRole.rol_name}
                    </option>
                  ))
                ) : (
                  <option value="">Cargando roles...</option>
                )
              ) : (
                <>
                  <option>Docente</option>
                  <option>Capacitador</option>
                  <option>Administrador</option>
                </>
              )}
            </select>
          </label>
          {needsInstitutionalAssignment && (
            <>
              <label>
                Institución
                <select name={apiConfigured ? "institucion_id" : "institucion"} required>
                  <option value="">
                    {institutionsLoading
                      ? "Cargando instituciones..."
                      : "Selecciona una institución"}
                  </option>
                  {apiConfigured ? (
                    institutionOptions.map((institution) => (
                      <option key={institution.id} value={institution.id}>
                        {institution.nombre}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="I.E.D. Pompilio Martínez">I.E.D. Pompilio Martínez</option>
                      <option value="I.E.D. Capellanía">I.E.D. Capellanía</option>
                    </>
                  )}
                </select>
              </label>
              <label className="wide">
                Área de formación
                <select name="area_formacion" required>
                  <option value="">Selecciona un área</option>
                  <option value="Ciencias naturales">Ciencias naturales</option>
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Tecnología e informática">Tecnología e informática</option>
                  <option value="Lenguaje">Lenguaje</option>
                </select>
              </label>
            </>
          )}
          <label>
            Estado
            <select>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </label>
          <label className="consent-field">
            <input required type="checkbox" />
            Acepta el tratamiento de datos personales
          </label>
        </div>
        <footer>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="primary-btn"
            disabled={
              apiConfigured &&
              (roleOptions.length === 0 ||
                (needsInstitutionalAssignment &&
                  (institutionsLoading || institutionOptions.length === 0)))
            }
          >
            Registrar usuario
          </button>
        </footer>
      </form>
    </div>
  );
}
