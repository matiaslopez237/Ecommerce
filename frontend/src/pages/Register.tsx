import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!email.trim() || !password) {
      setMsg({ text: "Completá email y contraseña", ok: false });
      return;
    }
    if (password.length < 6) {
      setMsg({ text: "La contraseña debe tener mínimo 6 caracteres", ok: false });
      return;
    }
    if (password !== password2) {
      setMsg({ text: "Las contraseñas no coinciden", ok: false });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { email: email.trim(), password });
      setDone(true);
    } catch (e: any) {
      setMsg({ text: e?.response?.data?.error ?? "No se pudo registrar", ok: false });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="form-page">
        <div className="form-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <p className="form-title">¡Revisá tu email!</p>
          <p className="form-subtitle" style={{ marginBottom: 24 }}>
            Te mandamos un link a <strong>{email}</strong> para confirmar tu cuenta.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Si no lo ves en la bandeja principal, revisá la carpeta de spam.
          </p>
          <p className="form-link" style={{ marginTop: 24 }}>
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-logo">
          <div className="logo-cross">✚</div>
          <div className="logo-text">
            <span className="logo-name">CMSD</span>
            <span className="logo-sub">Centro Médico</span>
          </div>
        </div>

        <p className="form-title">Crear Cuenta</p>
        <p className="form-subtitle">Registrate para gestionar tus turnos</p>

        <form onSubmit={submit}>
          <input
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            type="email"
            autoComplete="email"
            required
          />
          <input
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            type="password"
            autoComplete="new-password"
            required
          />
          <input
            className="form-input"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="Repetir contraseña"
            type="password"
            autoComplete="new-password"
            required
          />

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>

          {msg && (
            <p className={msg.ok ? "form-msg-ok" : "form-msg-err"}>{msg.text}</p>
          )}
        </form>

        <p className="form-link">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
