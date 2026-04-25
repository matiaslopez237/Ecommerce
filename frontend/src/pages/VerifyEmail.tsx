import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("No se encontró el token de verificación.");
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        loginWithToken(res.data.token);
        setStatus("ok");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(
          err?.response?.data?.error ?? "El link es inválido o ya fue utilizado."
        );
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="form-page">
        <div className="form-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p className="form-title">Verificando...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="form-page">
        <div className="form-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
          <p className="form-title">Link inválido</p>
          <p className="form-subtitle" style={{ marginBottom: 24 }}>{errorMsg}</p>
          <Link to="/register" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
            Volver al registro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <p className="form-title">¡Cuenta confirmada!</p>
        <p className="form-subtitle" style={{ marginBottom: 24 }}>
          Tu email fue verificado. Ya podés usar tu cuenta.
        </p>
        <Link to="/me" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
          Ver mi perfil
        </Link>
      </div>
    </div>
  );
}
