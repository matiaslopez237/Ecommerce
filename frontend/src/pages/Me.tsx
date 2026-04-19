import { useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

function formatDate(s?: string) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

export default function Me() {
  const { user } = useAuth();

  const roleLabel = useMemo(() => {
    if (!user) return "";
    return user.role === "ADMIN" ? "Administrador" : "Usuario";
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Mi perfil</h2>
        <p>No estás logueado.</p>
        <Link to="/login">Ir a login</Link>
      </div>
    );
  }

  const cardStyle = {
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    background: "white",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  } as const;

  const linkBtnStyle = {
    display: "block",
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    textDecoration: "none",
    color: "var(--text)",
    background: "var(--bg)",
    fontWeight: 600,
    fontSize: 14,
    transition: "background 0.15s",
  } as const;

  return (
    <div style={{ padding: "40px 24px", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 24, fontSize: 26, fontWeight: 800, color: "var(--text)" }}>
        Mi perfil
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>

        {/* ── Datos del usuario ── */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{user.email}</div>
            </div>

            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "var(--primary-light)",
              color: "var(--primary)",
              fontSize: 12,
              fontWeight: 700,
            }}>
              {user.role === "ADMIN" ? "🛡️" : "👤"} {roleLabel}
            </span>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "0 0 20px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>User ID</div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{user.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Puntos</div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{user.points}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Creado</div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{formatDate(user.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Actualizado</div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{formatDate(user.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/* ── Acciones rápidas ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
            Acciones rápidas
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <Link to="/products" style={linkBtnStyle}>🛒 Ver productos</Link>
            <Link to="/orders"   style={linkBtnStyle}>📦 Mis órdenes</Link>
            <Link to="/cart"     style={linkBtnStyle}>🧺 Ir al carrito</Link>
            {user.role === "ADMIN" && (
              <Link to="/admin/products" style={{ ...linkBtnStyle, borderColor: "var(--primary)", color: "var(--primary)" }}>
                🛠️ Admin · Productos
              </Link>
            )}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "16px 0" }} />

          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Tip: si querés que esto tenga foto/nombre, agregamos esos campos al modelo User y a <code>/auth/me</code>.
          </div>
        </div>

      </div>
    </div>
  );
}
