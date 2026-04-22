import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SERVICIOS } from "../constants/servicios";
import TurnoBtn from "../components/TurnoBtn";

function AccordionItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tratamiento-faq-item">
      <button
        className="tratamiento-faq-q"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{pregunta}</span>
        <span style={{ fontSize: 12, color: "var(--primary)", flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && <p className="tratamiento-faq-a">{respuesta}</p>}
    </div>
  );
}

export default function ServicioDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const servicio = SERVICIOS.find((s) => s.slug === slug);

  if (!servicio) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h1 style={{ color: "var(--primary)", marginBottom: 12 }}>Servicio no encontrado</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
          El servicio que buscás no existe o fue movido.
        </p>
        <Link
          to="/"
          style={{
            background: "var(--primary)",
            color: "white",
            padding: "12px 28px",
            borderRadius: 25,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section className="servicio-hero">
        <div className="servicio-hero-icono">
          {servicio.imagen ? (
            <img src={servicio.imagen} alt={servicio.nombre} className="servicio-hero-img" />
          ) : (
            servicio.icono
          )}
        </div>
        <h1>{servicio.nombre}</h1>
        <p>{servicio.descripcionCorta}</p>
        {servicio.descripcionLarga && (
          <p
            style={{
              fontSize: 15,
              color: "var(--text-muted)",
              maxWidth: 700,
              margin: "0 auto 28px",
              lineHeight: 1.7,
            }}
          >
            {servicio.descripcionLarga}
          </p>
        )}
        <TurnoBtn texto="Reservar Turno por WhatsApp" />
      </section>

      {/* ── OBRAS SOCIALES (si aplica) ── */}
      {servicio.obrasSociales && servicio.obrasSociales.length > 0 && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 0" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
            Obras sociales aceptadas
          </h2>
          <div className="obras-sociales-grid">
            {servicio.obrasSociales.map((os) => (
              <span key={os} className="obras-sociales-pill">
                {os}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── TRATAMIENTOS ── */}
      {servicio.tratamientos && servicio.tratamientos.length > 0 && (
        <div className="tratamientos-grid">
          {servicio.tratamientos.map((t) => (
            <article key={t.nombre} className="tratamiento-card">
              {t.video && (
                <div className={`tratamiento-video-wrap${t.videoFormato === "horizontal" ? " tratamiento-video-wrap--h" : ""}`}>
                  <iframe
                    src={t.video}
                    title={t.nombre}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="tratamiento-video"
                  />
                </div>
              )}

              <h2>{t.nombre}</h2>
              <p>{t.descripcion}</p>

              {t.indicaciones && (
                <div className="tratamiento-indicaciones">
                  <strong>Indicaciones:</strong> {t.indicaciones}
                </div>
              )}

              {t.sesiones && (
                <div className="tratamiento-indicaciones" style={{ marginTop: 0 }}>
                  <strong>Sesiones:</strong> {t.sesiones}
                </div>
              )}

              {t.beneficios && t.beneficios.length > 0 && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
                    Beneficios
                  </p>
                  <ul className="tratamiento-beneficios">
                    {t.beneficios.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {t.faq && t.faq.length > 0 && (
                <div className="tratamiento-faq">
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
                    Preguntas frecuentes
                  </p>
                  {t.faq.map((item) => (
                    <AccordionItem
                      key={item.pregunta}
                      pregunta={item.pregunta}
                      respuesta={item.respuesta}
                    />
                  ))}
                </div>
              )}

              <TurnoBtn />
            </article>
          ))}
        </div>
      )}

      {/* ── CTA FINAL ── */}
      <section
        style={{
          background: "var(--primary)",
          color: "white",
          textAlign: "center",
          padding: "48px 24px",
          marginTop: 32,
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
          ¿Listo para reservar tu turno?
        </h2>
        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 28 }}>
          Contactanos por WhatsApp y te asignamos un turno de forma rápida y sencilla.
        </p>
        <TurnoBtn texto="Reservar Turno Ahora" />
      </section>
    </div>
  );
}
