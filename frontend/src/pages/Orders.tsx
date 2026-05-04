import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";
import { CheckCircleIcon, ClockIcon, XCircleIcon, PackageIcon } from "../components/Icons";

type OrderStatus = "PENDING" | "PAID" | "CANCELLED";
type Order = { id: number; status: OrderStatus; total: string | number; createdAt: string; items: any[] };
type Filter = "ALL" | OrderStatus;

function money(v: any) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; Icon: React.FC<any> }> = {
  PENDING:   { label: "Pendiente",  color: "#92660a", bg: "#fef9ec", Icon: ClockIcon },
  PAID:      { label: "Pagada",     color: "#1a7a42", bg: "#f0faf4", Icon: CheckCircleIcon },
  CANCELLED: { label: "Cancelada",  color: "#c0392b", bg: "#fff0f0", Icon: XCircleIcon },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, color, bg, Icon } = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 999,
      background: bg, color, fontSize: 12, fontWeight: 700,
    }}>
      <Icon size={13} color={color} />
      {label}
    </span>
  );
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL",       label: "Todas" },
  { key: "PENDING",   label: "Pendientes" },
  { key: "PAID",      label: "Pagadas" },
  { key: "CANCELLED", label: "Canceladas" },
];

export default function Orders() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [error, setError]     = useState<string | null>(null);
  const [filter, setFilter]   = useState<Filter>("ALL");
  const [payingId, setPayingId] = useState<number | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (e: any) {
      setError("No pude cargar tus órdenes");
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter]
  );

  const counts = useMemo(() => {
    const c = { ALL: orders.length, PENDING: 0, PAID: 0, CANCELLED: 0 };
    for (const o of orders) c[o.status] += 1 as any;
    return c;
  }, [orders]);

  async function pay(orderId: number) {
    setPayingId(orderId);
    try {
      const res = await api.post("/payments/mercadopago/checkout", { orderId });
      const url = res.data?.init_point || res.data?.sandbox_init_point;
      if (!url) { alert("No se pudo obtener el link de pago"); return; }
      window.open(url, "_blank");
    } catch (e: any) {
      alert(`No se pudo iniciar el pago. Intentá de nuevo.`);
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Mis órdenes</h2>

      {error && (
        <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #f5c6c6", borderRadius: 10, color: "#c0392b", fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "7px 16px", borderRadius: 20,
              border: `1.5px solid ${filter === key ? "var(--primary)" : "var(--border)"}`,
              background: filter === key ? "var(--primary)" : "white",
              color: filter === key ? "white" : "var(--text-muted)",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            {label} ({counts[key]})
          </button>
        ))}
        <button
          onClick={load}
          style={{
            marginLeft: "auto", padding: "7px 16px", borderRadius: 20,
            border: "1.5px solid var(--border)", background: "white",
            color: "var(--text-muted)", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}
        >
          Actualizar
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          border: "1.5px dashed var(--border)", borderRadius: 16,
          color: "var(--text-muted)",
        }}>
          <PackageIcon size={40} color="var(--border)" />
          <p style={{ marginTop: 12, fontSize: 15 }}>No hay órdenes para este filtro</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((o) => (
            <div key={o.id} style={{
              border: "1.5px solid var(--border)",
              borderRadius: 14, padding: "16px 20px",
              background: "white",
              display: "flex", alignItems: "center",
              gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>Orden #{o.id}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {new Date(o.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{o.items?.length ?? 0} {o.items?.length === 1 ? "producto" : "productos"}
                </div>
              </div>

              <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", flexShrink: 0 }}>
                ${money(o.total)}
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link
                  to={`/orders/${o.id}`}
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    border: "1.5px solid var(--border)", background: "var(--bg)",
                    color: "var(--text)", fontWeight: 600, fontSize: 13,
                  }}
                >
                  Ver detalle
                </Link>
                {o.status === "PENDING" && (
                  <button
                    onClick={() => pay(o.id)}
                    disabled={payingId === o.id}
                    style={{
                      padding: "8px 16px", borderRadius: 8, border: "none",
                      background: payingId === o.id ? "var(--border)" : "var(--primary)",
                      color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    {payingId === o.id ? "Abriendo..." : "Pagar"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
