import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { ReactNode } from "react";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/me" replace />;

  return <>{children}</>;
}
