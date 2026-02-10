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
  const { id } = useParams(); // "new" o número
  const isNew = id === "new";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
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
      price: price, // lo mando como string, prisma Decimal lo acepta
      stock: Number(stock),
      categoryId: categoryId.trim() === "" ? null : Number(categoryId),
      imageUrl: imageUrl.trim() === "" ? null : imageUrl.trim(),
    };

    if (!payload.name) {
      setError("El nombre es requerido");
      return;
    }
    if (!Number.isFinite(Number(payload.price))) {
      setError("Precio inválido");
      return;
    }
    if (!Number.isFinite(payload.stock) || payload.stock < 0) {
      setError("Stock inválido (>= 0)");
      return;
    }
    if (payload.categoryId !== null && !Number.isFinite(payload.categoryId)) {
      setError("categoryId inválido");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post("/products", payload); // requiere ADMIN
        const created: Product = res.data;
        alert("✅ Producto creado");
        navigate(`/admin/products/${created.id}`);
      } else {
        await api.patch(`/products/${id}`, payload); // requiere ADMIN
        alert("✅ Cambios guardados");
      }
    } catch (e: any) {
      console.log("SAVE PRODUCT ERROR:", e?.response?.status, e?.response?.data, e?.message);
      const msg = e?.response?.data?.error ?? "No se pudo guardar";
      setError(`${msg} (${e?.response?.status ?? "NETWORK"})`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <h2>Admin · {isNew ? "Nuevo producto" : `Editar producto #${id}`}</h2>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Admin · {isNew ? "Nuevo producto" : `Editar producto #${id}`}</h2>
        <Link to="/admin/products" style={{ color: "inherit" }}>
          ← Volver
        </Link>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #733", borderRadius: 10 }}>
          ❌ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12, marginTop: 12 }}>
        {/* FORM */}
        <div style={{ border: "1px solid #444", borderRadius: 12, padding: 14, background: "#0f0f0f" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <label>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Nombre</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
              />
            </label>

            <label>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Descripción</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Precio</div>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
                />
              </label>

              <label>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Stock</div>
                <input
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
                />
              </label>
            </div>

            <label>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                CategoryId (opcional)
              </div>
              <input
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="ej: 1"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
              />
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                Dejalo vacío para “sin categoría”.
              </div>
            </label>

            <label>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Foto (imageUrl)</div>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../imagen.jpg"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #444" }}
              />
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                Pegá un link directo a imagen (.jpg/.png). Si es una página HTML, no se va a ver.
              </div>
            </label>

            <button
              onClick={save}
              disabled={saving}
              style={{ padding: 12, borderRadius: 10, border: "1px solid #444" }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div style={{ border: "1px solid #444", borderRadius: 12, padding: 14, background: "#0f0f0f" }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Preview</div>

          <div
            style={{
              height: 220,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #333",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewOk ? (
              <img
                src={imageUrl.trim()}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ opacity: 0.7, padding: 12, textAlign: "center" }}>
                {imageUrl.trim() === "" ? "Sin foto" : "URL inválida"}
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, opacity: 0.85 }}>
            <div style={{ fontWeight: 800 }}>{name || "Nombre del producto"}</div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>
              ${Number.isFinite(Number(price)) ? Number(price) : 0} · stock:{" "}
              {Number.isFinite(Number(stock)) ? Number(stock) : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
