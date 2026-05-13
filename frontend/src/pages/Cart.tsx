import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const WHATSAPP_NUMBER = "5492995502644";

type CartItem = {
  productId: number;
  quantity: number;
  product?: { id: number; name: string; price: number; stock: number };
};

function toNumber(v: any) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeItems(raw: any): CartItem[] {
  if (Array.isArray(raw)) return raw;
  if (raw?.items && Array.isArray(raw.items)) return raw.items;
  return [];
}

function formatMoney(n: number) {
  return n.toLocaleString("es-AR");
}

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems]     = useState<CartItem[]>([]);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  async function loadCart() {
    setError(null);
    try {
      const res = await api.get("/cart");
      setItems(normalizeItems(res.data));
    } catch {
      setError("No pude cargar el carrito");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCart(); }, []);

  const total = useMemo(() =>
    items.reduce((acc, it) => {
      const qty   = toNumber(it.quantity);
      const price = toNumber(it.product?.price);
      return acc + qty * price;
    }, 0),
    [items]
  );

  async function setQuantity(productId: number, quantity: number) {
    try {
      await api.patch(`/cart/${productId}`, { quantity });
      await loadCart();
    } catch {
      alert("No se pudo actualizar la cantidad");
    }
  }

  async function removeItem(productId: number) {
    try {
      await api.delete(`/cart/${productId}`);
      await loadCart();
    } catch {
      alert("No se pudo quitar el producto");
    }
  }

  async function clearCart() {
    try {
      await api.delete("/cart");
      setItems([]);
    } catch {
      alert("No se pudo vaciar el carrito");
    }
  }

  function buildWhatsAppMessage() {
    const lines = items.map((it) => {
      const name  = it.product?.name ?? `Producto ${it.productId}`;
      const qty   = toNumber(it.quantity);
      const price = toNumber(it.product?.price);
      const sub   = qty * price;
      return `• ${name} x${qty} — $${formatMoney(sub)}`;
    });

    const msg = [
      `Hola! 👋 Quisiera hacer el siguiente pedido, vengo desde la web:`,
      `*Usuario:* ${user?.username ?? ""}`,
      "",
      "*CMSD — Centro Médico Santo Domingo*",
      "",
      "*Productos:*",
      ...lines,
      "",
      `*Total: $${formatMoney(total)}*`,
      "",
      "Quedo a la espera de confirmación. ¡Gracias!",
    ].join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  async function handleOrder() {
    if (items.length === 0 || ordering) return;
    setOrdering(true);

    const url = buildWhatsAppMessage();
    window.open(url, "_blank");

    // Vaciar carrito después de enviar
    try {
      await api.delete("/cart");
      setItems([]);
    } catch {
      // Si falla el vaciado no es crítico
    }

    setOrdering(false);
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: "var(--text-muted)" }}>Cargando carrito...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 680 }}>
      <h2 className="page-title">Mi carrito</h2>

      {error && (
        <div style={{
          padding: "10px 14px", background: "#fff0f0",
          border: "1px solid #f5c6c6", borderRadius: 10,
          color: "#c0392b", fontSize: 14, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {items.length === 0 ? (
        /* ── Empty state ── */
        <div style={{
          textAlign: "center", padding: "56px 24px",
          border: "1.5px dashed var(--border)", borderRadius: 16,
          color: "var(--text-muted)",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginBottom: 12 }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p style={{ fontSize: 15, marginBottom: 16 }}>Tu carrito está vacío</p>
          <Link to="/products" className="btn-primary"
            style={{ textDecoration: "none", display: "inline-block", maxWidth: 200 }}>
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          {/* ── Items ── */}
          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            {items.map((it) => {
              const productId = toNumber(it.productId ?? it.product?.id);
              const name  = it.product?.name ?? `Producto ${productId}`;
              const price = toNumber(it.product?.price);
              const stock = toNumber(it.product?.stock);
              const qty   = toNumber(it.quantity);

              return (
                <div key={productId} style={{
                  border: "1.5px solid var(--border)", borderRadius: 12,
                  padding: "14px 16px", background: "white",
                  display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                }}>
                  {/* Nombre y precio unitario */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 3 }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      ${formatMoney(price)} por unidad
                    </div>
                  </div>

                  {/* Controles de cantidad */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => setQuantity(productId, Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        border: "1.5px solid var(--border)", background: "var(--bg)",
                        fontWeight: 700, fontSize: 16, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text)",
                      }}
                    >−</button>
                    <span style={{ minWidth: 22, textAlign: "center", fontWeight: 700, fontSize: 15 }}>
                      {qty}
                    </span>
                    <button
                      onClick={() => setQuantity(productId, qty + 1)}
                      disabled={stock > 0 ? qty >= stock : false}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        border: "1.5px solid var(--border)", background: "var(--bg)",
                        fontWeight: 700, fontSize: 16, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text)",
                      }}
                    >+</button>
                  </div>

                  {/* Subtotal */}
                  <div style={{
                    fontWeight: 800, fontSize: 15, color: "var(--text)",
                    flexShrink: 0, minWidth: 70, textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    ${formatMoney(qty * price)}
                  </div>

                  {/* Quitar */}
                  <button
                    onClick={() => removeItem(productId)}
                    title="Quitar producto"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", padding: 4, flexShrink: 0,
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Total ── */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px", background: "var(--bg)",
            borderRadius: 12, border: "1.5px solid var(--border)", marginBottom: 16,
          }}>
            <span style={{ fontWeight: 700, color: "var(--text)" }}>
              Total ({items.length} {items.length === 1 ? "producto" : "productos"})
            </span>
            <span style={{
              fontWeight: 900, fontSize: 22, color: "var(--primary)",
              fontVariantNumeric: "tabular-nums",
            }}>
              ${formatMoney(total)}
            </span>
          </div>

          {/* ── Botón principal: Ordenar por WhatsApp ── */}
          <button
            onClick={handleOrder}
            disabled={ordering}
            style={{
              width: "100%", padding: "15px 20px",
              background: ordering ? "var(--border)" : "#25D366",
              color: "white", border: "none", borderRadius: 12,
              fontSize: 16, fontWeight: 800, cursor: ordering ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "background 0.2s, transform 0.15s",
              marginBottom: 10,
            }}
            onMouseEnter={e => { if (!ordering) (e.currentTarget as HTMLElement).style.background = "#1ea952"; }}
            onMouseLeave={e => { if (!ordering) (e.currentTarget as HTMLElement).style.background = "#25D366"; }}
          >
            {/* WhatsApp icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {ordering ? "Abriendo WhatsApp..." : "Ordenar por WhatsApp"}
          </button>

          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginBottom: 16 }}>
            Se abrirá WhatsApp con tu pedido listo para enviar al centro médico.
          </p>

          {/* ── Vaciar carrito ── */}
          <button
            onClick={clearCart}
            style={{
              width: "100%", padding: "11px 16px", borderRadius: 10,
              border: "1.5px solid var(--border)", background: "white",
              color: "var(--text-muted)", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            Vaciar carrito
          </button>
        </>
      )}
    </div>
  );
}
