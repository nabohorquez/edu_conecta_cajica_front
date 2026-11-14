export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo">
      <div className="logo-mark">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {!compact && (
        <div>
          <strong>
            EDU<span>Conecta</span>
          </strong>
          <small>Cajicá</small>
        </div>
      )}
    </div>
  );
}

