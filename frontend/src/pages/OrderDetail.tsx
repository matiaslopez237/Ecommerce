import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { useParams } from "react-router-dom";

type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  product?: { id: number; name: string };
};

type Order = {
  id: number;
  status: OrderStatus;
  total: string | number;
  createdAt: string;
  items: OrderItem[];
};

const money = (v: any) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const intervalRef = useRef<number | null>(null);

  async function load() {
    setError(null);
    setRefreshing(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (e: any) {
      console.log("LOAD ORDER DETAIL ERROR:", e?.response?.status, e?.response?.data, e?.message);
      setError("No pude cargar el detalle");
    } finally {
      setRefreshing(false);
    }
  }

  // Carga inicial
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Polling mientras esté PENDING
  useEffect(() => {
    // limpiar intervalo anterior si existía
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!order) return;

    if (order.status === "PENDING") {
      intervalRef.current = window.setInterval(() => {
        // refresca cada 3s
        api
          .get(`/orders/${id}`)
          .then((res) => {
            setOrder(res.data);
          })
          .catch((e) => {
            console.log("POLL ERROR:", e?.response?.status, e?.response?.data, e?.message);
          });
      }, 3000);
    }

    // cleanup
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [order?.status, id]); // 👈 se reconfigura cuando cambia el status

  const computedTotal = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((acc, it) => acc + money(it.subtotal), 0);
  }, [order]);

  if (error) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <h2>Detalle orden #{id}</h2>
        <p>❌ {error}</p>
        <button onClick={load} style={{ padding: 10, marginTop: 10 }}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <h2>Detalle orden #{id}</h2>
        <p>Cargando...</p>
      </div>
    );
  }

  const statusText =
    order.status === "PENDING"
      ? "⏳ PENDING (esperando pago...)"
      : order.status === "PAID"
      ? "✅ PAID (pagada)"
      : "❌ CANCELLED (cancelada)";

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Detalle orden #{order.id}</h2>

      <div style={{ border: "1px solid #444", borderRadius: 8, padding: 12, marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>Estado</b>
          <span>{statusText}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, opacity: 0.9 }}>
          <span>Fecha</span>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <b>Total (DB)</b>
          <b>${money(order.total)}</b>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, opacity: 0.9 }}>
          <span>Total (calculado)</span>
          <span>${computedTotal}</span>
        </div>

        {order.status === "PENDING" && (
          <p style={{ marginTop: 10, opacity: 0.85 }}>
            Se actualizará automáticamente cuando el webhook confirme el pago.
          </p>
        )}
      </div>

      <h3 style={{ marginTop: 16 }}>Items</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {order.items.map((it) => (
          <div key={it.id} style={{ border: "1px solid #444", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <b>{it.product?.name ?? `Producto ${it.productId}`}</b>
              <span>${money(it.unitPrice)}</span>
            </div>
            <div style={{ marginTop: 6, opacity: 0.9 }}>Cantidad: {it.quantity}</div>
            <div style={{ marginTop: 6 }}>
              Subtotal: <b>${money(it.subtotal)}</b>
            </div>
          </div>
        ))}
      </div>

      <button onClick={load} style={{ marginTop: 12, padding: 10 }} disabled={refreshing}>
        {refreshing ? "Recargando..." : "Recargar"}
      </button>
    </div>
  );
}
