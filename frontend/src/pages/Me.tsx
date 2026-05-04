import { useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import { LogOutIcon, WrenchIcon, ShieldIcon } from "../components/Icons";

function formatDate(s?: string) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

function IconBox({ src, alt }: { src: string; alt: string }) {
  return (
    <span style={{
      width: 32, height: 32, borderRadius: 8,
      background: "var(--primary-light)",
      display: "inline-flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <img src={src} alt={alt} style={{ width: 18, height: 18, objectFit: "contain" }} />
    </span>
  );
}

export default function Me() {
  const { user, logout } = useAuth();

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
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 14px",
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

      <div className="me-grid">

        {/* ── Datos del usuario ── */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", wordBreak: "break-all" }}>{user.email}</div>
            </div>

            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "var(--primary-light)",
              color: "var(--primary)",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {user.role === "ADMIN"
                ? <ShieldIcon size={14} color="var(--primary)" />
                : <img src="/iconos/me-usuario.png" alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
              }
              {roleLabel}
            </span>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "0 0 20px" }} />

          <div className="me-data-grid">
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

          <div style={{ display: "grid", gap: 8 }}>
            <Link to="/products" style={linkBtnStyle}>
              <IconBox src="/iconos/me-productos.png" alt="" />
              Ver productos
            </Link>
            <Link to="/orders" style={linkBtnStyle}>
              <IconBox src="/iconos/me-ordenes.png" alt="" />
              Mis órdenes
            </Link>
            <Link to="/cart" style={linkBtnStyle}>
              <IconBox src="/iconos/me-carrito.png" alt="" />
              Ir al carrito
            </Link>
            {user.role === "ADMIN" && (
              <Link to="/admin/products" style={{ ...linkBtnStyle, borderColor: "var(--primary)", color: "var(--primary)" }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "var(--primary-light)",
                  display: "inline-flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}>
                  <WrenchIcon size={16} color="var(--primary)" />
                </span>
                Admin · Productos
              </Link>
            )}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "16px 0" }} />

          <button
            onClick={() => { logout(); window.location.href = "/"; }}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 10,
              border: "1px solid #e0b0b0",
              background: "#fff5f5",
              color: "#c0392b",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <LogOutIcon size={18} color="#c0392b" />
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  );
}
