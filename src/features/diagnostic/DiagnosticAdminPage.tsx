import { Icon, PageTitle, RowActions } from "@/components/ui";

export function DiagnosticAdminPage() {
  return (
    <div>
      <PageTitle
        eyebrow="CONFIGURACIÓN"
        title="Diagnóstico de competencias"
        subtitle="Administra preguntas y opciones para las cinco competencias digitales."
        action={
          <button className="primary-btn">
            <Icon name="plus" /> Crear pregunta
          </button>
        }
      />
      <div className="competency-strip">
        {["Tecnológica", "Comunicativa", "Pedagógica", "De gestión", "Investigativa"].map(
          (x, i) => (
            <div key={x}>
              <span>{i + 1}</span>
              <b>{x}</b>
              <small>{[12, 10, 14, 8, 9][i]} preguntas</small>
            </div>
          ),
        )}
      </div>
      <section className="panel table-panel">
        <div className="table-tools">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Buscar pregunta..." />
          </div>
          <select>
            <option>Todas las competencias</option>
          </select>
          <select>
            <option>Todos los niveles</option>
            <option>Exploración</option>
            <option>Integración</option>
            <option>Innovación</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pregunta</th>
                <th>Competencia</th>
                <th>Opciones</th>
                <th>Orden</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PRG-001</td>
                <td>
                  <b>¿Con qué frecuencia utiliza herramientas digitales en clase?</b>
                </td>
                <td>Tecnológica</td>
                <td>4</td>
                <td>1</td>
                <td>
                  <span className="status success">Activa</span>
                </td>
                <RowActions />
              </tr>
              <tr>
                <td>PRG-002</td>
                <td>
                  <b>¿Cómo comparte recursos con sus estudiantes?</b>
                </td>
                <td>Comunicativa</td>
                <td>4</td>
                <td>2</td>
                <td>
                  <span className="status success">Activa</span>
                </td>
                <RowActions />
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
