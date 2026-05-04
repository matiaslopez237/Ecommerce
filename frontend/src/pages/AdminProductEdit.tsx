import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: string | number;
  stock: number;
  imageUrl?: string | null;
  categoryId?: number | null;
  category?: { id: number; name: string } | null;
};

function isValidUrl(s: string) {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");

  const previewOk = useMemo(() => imageUrl.trim() !== "" && isValidUrl(imageUrl.trim()), [imageUrl]);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      setError(null);
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const p: Product = res.data;
        setName(p.name ?? "");
        setDescription(p.description ?? "");
        setPrice(String(p.price ?? "0"));
        setStock(String(p.stock ?? 0));
        setCategoryId(p.categoryId == null ? "" : String(p.categoryId));
        setImageUrl(p.imageUrl ?? "");
      } catch (e: any) {
        console.log("LOAD PRODUCT ERROR:", e?.response?.status, e?.response?.data, e?.message);
        setError("No pude cargar el producto");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isNew]);

  async function save() {
    setError(null);
    const payload: any = {
      name: name.trim(),
      description: description.trim() === "" ? null : description.trim(),
      price,
      stock: Number(stock),
      categoryId: categoryId.trim() === "" ? null : Number(categoryId),
      imageUrl: imageUrl.trim() === "" ? null : imageUrl.trim(),
    };

    if (!payload.name) { setError("El nombre es requerido"); return; }
    if (!Number.isFinite(Number(payload.price))) { setError("Precio inválido"); return; }
    if (!Number.isFinite(payload.stock) || payload.stock < 0) { setError("Stock inválido (>= 0)"); return; }
    if (payload.categoryId !== null && !Number.isFinite(payload.categoryId)) { setError("categoryId inválido"); return; }

    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post("/products", payload);
        const created: Product = res.data;
        alert("✅ Producto creado");
        navigate(`/admin/products/${created.id}`);
      } else {
        await api.patch(`/products/${id}`, payload);
        alert("✅ Cambios guardados");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "No se pudo guardar";
      setError(`${msg} (${e?.response?.status ?? "NETWORK"})`);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1.5px solid var(--border)",
    background: "var(--bg-white)",
    color: "var(--text)",
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: 4,
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin · {isNew ? "Nuevo producto" : `Editar producto #${id}`}</h2>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "var(--text)" }}>
          Admin · {isNew ? "Nuevo producto" : `Editar producto #${id}`}
        </h2>
        <Link to="/admin/products" style={{ color: "var(--primary)", fontWeight: 600 }}>
          ← Volver
        </Link>
      </div>

      {error && (
        <div style={{
          marginBottom: 12, padding: "10px 14px",
          background: "#fff5f5", border: "1px solid #f5c6c6",
          borderRadius: 10, color: "#c0392b", fontSize: 14,
        }}>
          ❌ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        {/* FORM */}
        <div style={{
          border: "1.5px solid var(--border)",
          borderRadius: 14,
          padding: 20,
          background: "var(--bg-white)",
        }}>
          <div style={{ display: "grid", gap: 14 }}>
            <label>
              <div style={labelStyle}>Nombre</div>
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </label>

            <label>
              <div style={labelStyle}>Descripción</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>
                <div style={labelStyle}>Precio</div>
                <input value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
              </label>
              <label>
                <div style={labelStyle}>Stock</div>
                <input value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
              </label>
            </div>

            <label>
              <div style={labelStyle}>CategoryId (opcional)</div>
              <input
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="ej: 1"
                style={inputStyle}
              />
              <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>
                Dejalo vacío para "sin categoría".
              </div>
            </label>

            <label>
              <div style={labelStyle}>Foto (imageUrl)</div>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../imagen.jpg"
                style={inputStyle}
              />
              <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>
                Pegá un link directo a imagen (.jpg/.png).
              </div>
            </label>

            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "12px 0",
                borderRadius: 10,
                border: "none",
                background: saving ? "var(--border)" : "var(--primary)",
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div style={{
          border: "1.5px solid var(--border)",
          borderRadius: 14,
          padding: 20,
          background: "var(--bg-white)",
        }}>
          <div style={{ fontWeight: 700, color: "var(--text-muted)", marginBottom: 12, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
            Preview
          </div>

          <div style={{
            height: 220,
            borderRadius: 10,
            overflow: "hidden",
            border: "1.5px solid var(--border-light)",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {previewOk ? (
              <img
                src={imageUrl.trim()}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ color: "var(--text-light)", fontSize: 14 }}>
                {imageUrl.trim() === "" ? "Sin foto" : "URL inválida"}
              </div>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 16 }}>
              {name || "Nombre del producto"}
            </div>
            <div style={{ color: "var(--primary)", fontWeight: 600, marginTop: 4 }}>
              ${Number.isFinite(Number(price)) ? Number(price) : 0}
              <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 13 }}>
                {" "}· stock: {Number.isFinite(Number(stock)) ? Number(stock) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
