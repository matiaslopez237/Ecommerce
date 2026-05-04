import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { useParams, Link } from "react-router-dom";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "../components/Icons";

type OrderStatus = "PENDING" | "PAID" | "CANCELLED";
type OrderItem = { id: number; productId: number; quantity: number; unitPrice: string | number; subtotal: string | number; product?: { id: number; name: string } };
type Order = { id: number; status: OrderStatus; total: string | number; createdAt: string; items: OrderItem[] };

const money = (v: any) => { const n = typeof v === "number" ? v : Number(v); return Number.isFinite(n) ? n : 0; };

const STATUS_CONFIG: Record<OrderStatus, { label: string; desc: string; color: string; bg: string; border: string; Icon: React.FC<any> }> = {
  PENDING:   { label: "Pendiente",  desc: "Esperando confirmación de pago", color: "#92660a", bg: "#fef9ec", border: "#f0d080", Icon: ClockIcon },
  PAID:      { label: "Pagada",     desc: "Pago confirmado",                color: "#1a7a42", bg: "#f0faf4", border: "#a3ddb8", Icon: CheckCircleIcon },
  CANCELLED: { label: "Cancelada",  desc: "La orden fue cancelada",         color: "#c0392b", bg: "#fff0f0", border: "#f5c6c6", Icon: XCircleIcon },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder]       = useState<Order | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<number | null>(null);

  async function load() {
    setError(null); setRefreshing(true);
    try { const res = await api.get(`/orders/${id}`); setOrder(res.data); }
    catch (e: any) { setError("No pude cargar el detalle"); }
    finally { setRefreshing(false); }
  }

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
    if (!order) return;
    if (order.status === "PENDING") {
      intervalRef.current = window.setInterval(() => {
        api.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch(() => {});
      }, 3000);
    }
    return () => { if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [order?.status, id]);

  const computedTotal = useMemo(() =>
    order ? order.items.reduce((acc, it) => acc + money(it.subtotal), 0) : 0,
    [order]
  );

  if (error) {
    return (
      <div className="page-container">
        <h2 className="page-title">Orden #{id}</h2>
        <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #f5c6c6", borderRadius: 10, color: "#c0392b", fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
        <button onClick={load} className="btn-primary" style={{ maxWidth: 160 }}>Reintentar</button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <p style={{ color: "var(--text-muted)" }}>Cargando...</p>
      </div>
    );
  }

  const { label, desc, color, bg, border, Icon } = STATUS_CONFIG[order.status];

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      <Link to="/orders" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>
        ← Volver a mis órdenes
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 20px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", margin: 0 }}>
          Orden #{order.id}
        </h2>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 12px", borderRadius: 999,
          background: bg, color, border: `1px solid ${border}`,
          fontSize: 12, fontWeight: 700,
        }}>
          <Icon size={13} color={color} />
          {label}
        </span>
      </div>

      {/* Resumen */}
      <div style={{ border: "1.5px solid var(--border)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", background: bg, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <Icon size={20} color={color} />
          <div>
            <div style={{ fontWeight: 700, color }}>{label}</div>
            <div style={{ fontSize: 13, color, opacity: 0.8 }}>{desc}</div>
          </div>
        </div>

        <div style={{ padding: "16px 20px", background: "white", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Fecha</div>
            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>
              {new Date(order.createdAt).toLocaleString("es-AR")}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Total</div>
            <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 18 }}>${money(order.total)}</div>
          </div>
        </div>

        {order.status === "PENDING" && (
          <div style={{ padding: "12px 20px", background: "#fef9ec", borderTop: `1px solid ${border}`, fontSize: 13, color: "#92660a" }}>
            Se actualizará automáticamente cuando se confirme el pago.
          </div>
        )}
      </div>

      {/* Items */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
        Productos ({order.items.length})
      </h3>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {order.items.map((it) => (
          <div key={it.id} style={{
            border: "1.5px solid var(--border)", borderRadius: 12,
            padding: "14px 18px", background: "white",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>
                {it.product?.name ?? `Producto ${it.productId}`}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
                {it.quantity} × ${money(it.unitPrice)}
              </div>
            </div>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15, flexShrink: 0 }}>
              ${money(it.subtotal)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "var(--bg)", borderRadius: 12, border: "1.5px solid var(--border)" }}>
        <span style={{ fontWeight: 700, color: "var(--text)" }}>Total</span>
        <span style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)" }}>${computedTotal}</span>
      </div>

      <button
        onClick={load}
        disabled={refreshing}
        style={{
          marginTop: 16, padding: "10px 20px", borderRadius: 10,
          border: "1.5px solid var(--border)", background: "white",
          color: "var(--text-muted)", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}
      >
        {refreshing ? "Actualizando..." : "Actualizar estado"}
      </button>
    </div>
  );
}
