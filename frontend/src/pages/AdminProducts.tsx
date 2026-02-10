import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: string | number;
  stock: number;
  imageUrl?: string | null;
  category?: { id: number; name: string } | null;
};

function money(v: any) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (e: any) {
      console.log("ADMIN PRODUCTS LOAD ERROR:", e?.response?.status, e?.response?.data, e?.message);
      setError("No pude cargar productos");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      `${p.name} ${p.description ?? ""} ${p.category?.name ?? ""}`.toLowerCase().includes(term)
    );
  }, [products, q]);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h2>Admin · Productos</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "12px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, descripción o categoría..."
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #444",
            minWidth: 260,
            flex: 1,
          }}
        />

        <button onClick={load} style={{ padding: 10 }}>
          Recargar
        </button>

        <Link
          to="/admin/products/new"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #444",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          ➕ Nuevo producto
        </Link>
      </div>

      {error && <p>❌ {error}</p>}

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #444",
              borderRadius: 12,
              padding: 12,
              display: "grid",
              gridTemplateColumns: "110px 1fr auto",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 110,
                height: 70,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #333",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              ) : (
                <span style={{ opacity: 0.7, fontSize: 12 }}>Sin foto</span>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{p.name}</div>
              <div style={{ opacity: 0.8, marginTop: 2 }}>
                ${money(p.price)} · stock: {p.stock}
                {p.category?.name ? ` · cat: ${p.category.name}` : ""}
              </div>
              {p.description && (
                <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>
                  {p.description}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link
                to={`/admin/products/${p.id}`}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #444",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                ✏️ Editar
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <p style={{ marginTop: 10 }}>No hay productos para ese filtro.</p>}
    </div>
  );
}
