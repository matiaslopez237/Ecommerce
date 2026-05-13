import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  stock: number;
  imageUrl?: string | null;
  category?: { id: number; name: string } | null;
  categoryId?: number | null;
};

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch {
        setError("No se pudieron cargar los servicios");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 110px)" }}>
      <div className="page-container">
        <div className="products-page-header">
          <h1 className="page-title">Nuestros Servicios</h1>
          {isAdmin && (
            <Link to="/admin/products">
              <button
                style={{
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  padding: "9px 22px",
                  borderRadius: 22,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                + Nuevo Servicio
              </button>
            </Link>
          )}
        </div>

        {error && (
          <p style={{ color: "#c0392b", marginBottom: 16 }}>⚠ {error}</p>
        )}

        <div className="products-grid">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-card skeleton-card">
              <div className="product-card-img skeleton-box" />
              <div className="product-card-body">
                <div className="skeleton-line" style={{ width: "50%", marginBottom: 8 }} />
                <div className="skeleton-line" style={{ width: "90%", marginBottom: 4 }} />
                <div className="skeleton-line" style={{ width: "70%", marginBottom: 12 }} />
                <div className="skeleton-line" style={{ width: "40%" }} />
              </div>
            </div>
          ))}
          {!loading && products.map((p) => (
            <Link
              to={`/products/${p.id}`}
              key={p.id}
              style={{ textDecoration: "none" }}
            >
              <div className="product-card">
                <div className="product-card-img">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-card-img-placeholder">🏥</div>
                  )}
                  <button
                    className="product-wishlist-btn"
                    onClick={(e) => e.preventDefault()}
                  >
                    ♡
                  </button>
                </div>

                <div className="product-card-body">
                  {p.category?.name && (
                    <p className="product-category-label">{p.category.name}</p>
                  )}
                  <p className="product-name">{p.name}</p>
                  {p.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.description}
                    </p>
                  )}
                  <p className="product-price">
                    ${Number(p.price).toLocaleString("es-AR")}
                  </p>
                  {isAdmin && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-light)",
                        marginTop: 4,
                      }}
                    >
                      Stock: {p.stock}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && products.length === 0 && !error && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: 60 }}>
            No hay servicios disponibles.
          </p>
        )}
      </div>
    </div>
  );
}
