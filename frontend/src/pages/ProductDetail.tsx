import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  stock: number;
  imageUrl?: string | null;
  category?: { id: number; name: string } | null;
};

const money = (v: any) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      setError(null);
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (e: any) {
        setError("No pude cargar el producto");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function addToCart() {
    if (!product) return;
    try {
      await api.post("/cart", { productId: product.id, quantity: qty });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (e: any) {
      alert(`❌ No se pudo agregar (${e?.response?.status ?? "NETWORK"})`);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "var(--text-muted)" }}>Cargando...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "var(--text-muted)" }}>❌ {error ?? "No encontrado"}</p>
        <Link to="/products" style={{ color: "var(--primary)", fontWeight: 600 }}>← Volver a productos</Link>
      </div>
    );
  }

  const maxQty = product.stock > 0 ? product.stock : 1;
  const outOfStock = product.stock <= 0;

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <Link to="/products" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>
        ← Volver a productos
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, marginTop: 16 }}>
        {/* Imagen */}
        <div style={{
          border: "1.5px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--bg)",
          minHeight: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ color: "var(--text-light)", fontSize: 14 }}>📷 Sin foto</div>
          )}
        </div>

        {/* Info */}
        <div style={{
          border: "1.5px solid var(--border)",
          borderRadius: 16,
          padding: 24,
          background: "var(--bg-white)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {product.category?.name && (
            <div style={{
              display: "inline-block",
              background: "var(--primary-light)",
              color: "var(--primary)",
              borderRadius: 20,
              padding: "3px 12px",
              fontSize: 12,
              fontWeight: 600,
              alignSelf: "flex-start",
            }}>
              {product.category.name}
            </div>
          )}

          <h2 style={{ margin: 0, color: "var(--text)", fontSize: 24 }}>{product.name}</h2>

          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--primary)" }}>
            ${money(product.price)}
          </div>

          {isAdmin && (
            <div style={{
              fontSize: 13,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 12px",
              color: "var(--text-muted)",
            }}>
              Stock disponible: <b style={{ color: "var(--text)" }}>{product.stock}</b>
            </div>
          )}

          <div style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
            {product.description ?? "Sin descripción"}
          </div>

          {!outOfStock && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Cantidad</span>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
                style={{
                  width: 80,
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                  background: "var(--bg-white)",
                  color: "var(--text)",
                  fontFamily: "inherit",
                  fontSize: 14,
                }}
              />
            </div>
          )}

          <button
            onClick={addToCart}
            disabled={outOfStock}
            style={{
              marginTop: 4,
              padding: "13px 0",
              width: "100%",
              borderRadius: 12,
              border: "none",
              background: outOfStock ? "var(--border)" : added ? "#5a8a5a" : "var(--primary)",
              color: outOfStock ? "var(--text-light)" : "white",
              fontWeight: 700,
              fontSize: 15,
              cursor: outOfStock ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {outOfStock ? "Sin stock" : added ? "✅ Agregado al carrito" : "Agregar al carrito"}
          </button>

          {isAdmin && (
            <Link
              to={`/admin/products/${product.id}`}
              style={{
                textAlign: "center",
                padding: "10px 0",
                borderRadius: 10,
                border: "1.5px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ✏️ Editar producto (admin)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
