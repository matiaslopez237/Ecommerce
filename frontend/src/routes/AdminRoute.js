import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("div", { style: { padding: 20 }, children: "Cargando..." });
    if (!user)
        return _jsx(Navigate, { to: "/", replace: true });
    if (user.role !== "ADMIN")
        return _jsx(Navigate, { to: "/me", replace: true });
    return _jsx(_Fragment, { children: children });
}
//# sourceMappingURL=AdminRoute.js.map