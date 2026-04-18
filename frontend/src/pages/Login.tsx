import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await login(email, password);
      setMsg({ text: "Ingreso exitoso", ok: true });
      navigate("/me");
    } catch {
      setMsg({ text: "Email o contraseña incorrectos", ok: false });
    }
  }

  if (user) {
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
          <p className="form-title">¡Bienvenido!</p>
          <p className="form-subtitle">
            Sesión iniciada como <b>{user.email}</b>
          </p>
          <button className="btn-primary" onClick={() => navigate("/me")}>
            Ir a Mi Cuenta
          </button>
          <button
            className="btn-primary"
            style={{ background: "transparent", color: "var(--primary)", border: "1.5px solid var(--primary)", marginTop: 10 }}
            onClick={logout}
          >
            Cerrar Sesión
          </button>
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

        <p className="form-title">Iniciar Sesión</p>
        <p className="form-subtitle">Ingresá a tu cuenta del centro médico</p>

        <form onSubmit={handleLogin}>
          <input
            className="form-input"
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="form-input"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button className="btn-primary" type="submit">
            Ingresar
          </button>
        </form>

        {msg && (
          <p className={msg.ok ? "form-msg-ok" : "form-msg-err"}>{msg.text}</p>
        )}

        <p className="form-link">
          ¿No tenés cuenta?{" "}
          <Link to="/register">Registrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
