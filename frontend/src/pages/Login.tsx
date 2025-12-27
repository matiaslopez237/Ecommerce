import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    try {
      await login(email, password);
      setMsg("✅ Login OK");
      navigate("/me");
    } catch {
      setMsg("❌ Error de login");
    }
  }

  // ✅ ESTO VA ACÁ (antes del return del form)
  if (user) {
    return (
      <div style={{ maxWidth: 360, margin: "40px auto", fontFamily: "sans-serif" }}>
        <h2>Login</h2>
        <p>
          Ya estás logueado como <b>{user.email}</b>
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            onClick={() => navigate("/me")}
            style={{ flex: 1, padding: 10 }}
          >
            Ir a Me
          </button>

          <button
            onClick={logout}
            style={{ flex: 1, padding: 10 }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }


  return (
    <div style={{ maxWidth: 360, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button style={{ width: "100%", padding: 10 }}>Entrar</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
