import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "../components/Icons";

function StatusIcon({ icon, color, bg }: { icon: React.ReactNode; color: string; bg: string }) {
  return (
    <div style={{
      width: 72, height: 72, borderRadius: "50%",
      background: bg, display: "flex",
      alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px",
    }}>
      {icon}
    </div>
  );
}

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
          <StatusIcon
            icon={<ClockIcon size={32} color="var(--primary)" />}
            color="var(--primary)"
            bg="var(--primary-light)"
          />
          <p className="form-title">Verificando...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="form-page">
        <div className="form-card" style={{ textAlign: "center" }}>
          <StatusIcon
            icon={<XCircleIcon size={32} color="#c0392b" />}
            color="#c0392b"
            bg="#fff0f0"
          />
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
        <StatusIcon
          icon={<CheckCircleIcon size={32} color="#1a8a4a" />}
          color="#1a8a4a"
          bg="#f0faf4"
        />
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
