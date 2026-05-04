import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Me from "./pages/Me";
import Home from "./pages/Home";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminRoute from "./routes/AdminRoute";
import AdminProducts from "./pages/AdminProducts";
import AdminProductEdit from "./pages/AdminProductEdit";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ProductDetail from "./pages/ProductDetail";
import ServicioDetalle from "./pages/ServicioDetalle";
import "./App.css";

const NAV_LINKS = [
  { label: "Inicio", to: "/" },
  { label: "Estética Facial", to: "/servicios/estetica-facial" },
  { label: "Estética Corporal", to: "/servicios/estetica-corporal" },
  { label: "Depilación Láser", to: "/servicios/depilacion-laser" },
  { label: "Ginecología", to: "/servicios/ginecologia" },
  { label: "Quiropraxia", to: "/servicios/quiropraxia" },
  { label: "Odontología", to: "/servicios/odontologia" },
  { label: "Kinesiología", to: "/servicios/kinesiologia" },
  { label: "Medicina General", to: "/servicios/medicina-general" },
  { label: "Catálogo", to: "/products" },
];

function NavSearch() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function NavCart() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function NavUser() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header>
      <div className="top-banner">
        Bienvenidos al Centro Médico Santo Domingo — Tu salud, nuestra prioridad
      </div>

      <nav className="main-nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="logo-cross">✚</div>
            <div className="logo-text">
              <span className="logo-name">CMSD</span>
              <span className="logo-sub">Centro Médico</span>
            </div>
          </Link>

          <ul className="nav-categories">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className={location.pathname === l.to.split("?")[0] ? "nav-active" : ""}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <Link to="/products" className="nav-icon-btn" title="Buscar">
              <NavSearch />
            </Link>

            <Link to="/cart" className="nav-icon-btn" title="Carrito">
              <NavCart />
            </Link>

            <Link to={user ? "/me" : "/login"} className="nav-icon-btn" title={user ? "Mi cuenta" : "Ingresar"}>
              <NavUser />
            </Link>

            {user && (
              <>
                <span className="nav-user-email">{user.email}</span>
                <button className="nav-logout-btn" onClick={logout} title="Cerrar sesión">
                  Salir
                </button>
              </>
            )}

            {user?.role === "ADMIN" && (
              <Link to="/admin/products">
                <button className="nav-logout-btn" style={{ borderColor: "var(--primary)", color: "var(--primary)" }} title="Panel de administración">
                  Admin
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          <Route path="/me" element={<ProtectedRoute><Me /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

          <Route path="/servicios/:slug" element={<ServicioDetalle />} />

          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/products/:id" element={<AdminRoute><AdminProductEdit /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
