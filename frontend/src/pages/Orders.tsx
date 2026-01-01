import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";

type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

type Order = {
  id: number;
  status: OrderStatus;
  total: string | number;
  createdAt: string;
  items: any[];
};

type Filter = "ALL" | OrderStatus;

function money(v: any) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [payingId, setPayingId] = useState<number | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (e: any) {
      console.log("LOAD ORDERS ERROR:", e?.response?.status, e?.response?.data, e?.message);
      setError("No pude cargar tus órdenes");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const counts = useMemo(() => {
    const c = { ALL: orders.length, PENDING: 0, PAID: 0, CANCELLED: 0 };
    for (const o of orders) c[o.status] += 1 as any;
    return c;
  }, [orders]);

  async function pay(orderId: number) {
    setPayingId(orderId);
    try {
      const res = await api.post("/payments/mercadopago/checkout", { orderId });
      // MP devuelve init_point (prod) y sandbox_init_point (sandbox)
      const url = res.data?.init_point || res.data?.sandbox_init_point;
      if (!url) {
        alert("❌ No llegó init_point de MercadoPago");
        return;
      }
      window.open(url, "_blank");
    } catch (e: any) {
      console.log("PAY ERROR:", e?.response?.status, e?.response?.data, e?.message);
      alert(`❌ No se pudo iniciar pago (${e?.response?.status ?? "NETWORK"})`);
    } finally {
      setPayingId(null);
    }
  }

  const buttonStyle = (active: boolean) => ({
    padding: 10,
    borderRadius: 8,
    border: "1px solid #444",
    background: active ? "#222" : "transparent",
    cursor: "pointer",
  });

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Mis órdenes</h2>
      {error && <p>❌ {error}</p>}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "12px 0" }}>
        <button style={buttonStyle(filter === "ALL")} onClick={() => setFilter("ALL")}>
          Todas ({counts.ALL})
        </button>
        <button style={buttonStyle(filter === "PENDING")} onClick={() => setFilter("PENDING")}>
          Pending ({counts.PENDING})
        </button>
        <button style={buttonStyle(filter === "PAID")} onClick={() => setFilter("PAID")}>
          Paid ({counts.PAID})
        </button>
        <button style={buttonStyle(filter === "CANCELLED")} onClick={() => setFilter("CANCELLED")}>
          Cancelled ({counts.CANCELLED})
        </button>

        <button onClick={load} style={{ padding: 10, marginLeft: "auto" }}>
          Recargar
        </button>
      </div>

      {filtered.length === 0 ? (
        <p>No hay órdenes para ese filtro</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((o) => (
            <div key={o.id} style={{ border: "1px solid #444", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>Orden #{o.id}</b>
                <span>{o.status}</span>
              </div>

              <div style={{ marginTop: 6 }}>
                Total: <b>${money(o.total)}</b> — items: {o.items?.length ?? 0}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                <Link to={`/orders/${o.id}`}>Ver detalle</Link>

                {/* Botón pagar solo si está pendiente */}
                {o.status === "PENDING" && (
                  <button
                    onClick={() => pay(o.id)}
                    disabled={payingId === o.id}
                    style={{ marginLeft: "auto", padding: 8 }}
                  >
                    {payingId === o.id ? "Abriendo MercadoPago..." : "Pagar"}
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
