import { FormEvent, useEffect, useState } from "react";
import { api, apiConfigured, type ApiUser } from "@/api/client";
import { PageTitle } from "@/components/ui";
import { GenericPage } from "@/features/common/GenericPage";

export function ProfilePage({ user, onUpdate }: { user?: ApiUser; onUpdate: (user: ApiUser) => void }) {
  const [profile, setProfile] = useState<ApiUser | undefined>(user);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!apiConfigured) return;
    api.profile().then(({ perfil }) => setProfile(perfil))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar el perfil."));
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await api.updateProfile({
        first_name: String(formData.get("first_name")),
        last_name: String(formData.get("last_name")),
        email: String(formData.get("email")),
      });
      const { perfil } = await api.profile();
      setProfile(perfil);
      onUpdate(perfil);
      setMessage("Tu perfil fue actualizado.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };
  if (!apiConfigured) return <GenericPage page="profile" />;
  return <div><PageTitle eyebrow="MI CUENTA" title="Mi perfil" subtitle="Actualiza tus datos personales." />
    {error && <div className="form-message" role="alert">{error}</div>}
    {message && <div className="status success" role="status">{message}</div>}
    <section className="panel"><form className="submission-form" onSubmit={submit}>
      <label>Nombres<input name="first_name" required defaultValue={profile?.first_name || profile?.name?.split(" ").slice(0, -1).join(" ") || ""} /></label>
      <label>Apellidos<input name="last_name" required defaultValue={profile?.last_name || ""} /></label>
      <label>Correo electrónico<input name="email" type="email" required defaultValue={profile?.email || ""} /></label>
      <button className="primary-btn" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
    </form></section>
  </div>;
}
