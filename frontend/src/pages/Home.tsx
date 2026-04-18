import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

type Product = {
  id: number;
  name: string;
  price: number | string;
  imageUrl?: string | null;
  category?: { name: string } | null;
  description?: string | null;
};

const SPECIALISTS = [
  "Medicina General",
  "Cardiología",
  "Pediatría",
  "Dermatología",
  "Traumatología",
  "Laboratorio",
  "Ginecología",
  "Oftalmología",
  "Neurología",
  "Nutrición",
  "Psicología",
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"destacados" | "nuevos">("destacados");
  const [heroDot, setHeroDot] = useState(0);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const displayed = products.slice(0, 4);

  const heroSlides = [
    {
      eyebrow: "Centro Médico Santo Domingo",
      title: "TU SALUD,\nNUESTRA\nPRIORIDAD",
      subtitle: "Especialistas comprometidos con tu bienestar",
      cta: "Reservar Turno",
      bg: "linear-gradient(130deg, #f5e8ef 0%, #f9d5e5 30%, #C82560 75%, #8c1940 100%)",
      leftText: "SALUD",
    },
    {
      eyebrow: "Nuevos Servicios",
      title: "ATENCIÓN\nDE\nEXCELENCIA",
      subtitle: "Diagnóstico preciso, tratamientos de calidad",
      cta: "Ver Servicios",
      bg: "linear-gradient(130deg, #e8f0fc 0%, #c8d8f8 30%, #2560C8 75%, #194090 100%)",
      leftText: "VIDA",
    },
    {
      eyebrow: "Chequeo Preventivo",
      title: "PREVENIR\nES\nCUIDAR",
      subtitle: "Planes de salud integrales para toda la familia",
      cta: "Ver Planes",
      bg: "linear-gradient(130deg, #e8fce8 0%, #c8f0c8 30%, #25A860 75%, #188040 100%)",
      leftText: "BIEN",
    },
  ];

  const slide = heroSlides[heroDot];

  return (
    <div>
      {/* ── HERO ── */}
      <section
        className="hero-section"
        style={{ background: slide.bg, transition: "background 0.6s" }}
      >
        <div
          className="hero-decor-circle"
          style={{ width: 340, height: 340, top: -80, left: -60 }}
        />
        <div
          className="hero-decor-circle"
          style={{ width: 200, height: 200, top: 40, left: 200 }}
        />
        <div
          className="hero-decor-circle"
          style={{ width: 160, height: 160, bottom: -40, left: 400 }}
        />

        <div className="hero-left-text">{slide.leftText}</div>

        <div className="hero-content">
          <p className="hero-eyebrow">{slide.eyebrow}</p>
          <h1 className="hero-title" style={{ whiteSpace: "pre-line" }}>
            {slide.title}
          </h1>
          <p className="hero-subtitle">{slide.subtitle}</p>
          <Link to="/products" className="hero-cta">
            {slide.cta}
          </Link>
        </div>

        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === heroDot ? " active" : ""}`}
              onClick={() => setHeroDot(i)}
            />
          ))}
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section className="home-section bg-white">
        <div className="section-header">
          <div className="section-tabs">
            <button
              className={`section-tab${activeTab === "destacados" ? " active" : ""}`}
              onClick={() => setActiveTab("destacados")}
            >
              Más Solicitados
            </button>
            <span className="section-tab-divider">/</span>
            <button
              className={`section-tab${activeTab === "nuevos" ? " active" : ""}`}
              onClick={() => setActiveTab("nuevos")}
            >
              Nuevos Servicios
            </button>
          </div>
          <Link to="/products">
            <button className="view-all-btn">Ver Todos</button>
          </Link>
        </div>

        <div className="products-grid">
          {displayed.length > 0
            ? displayed.map((p) => (
                <Link
                  to={`/products/${p.id}`}
                  key={p.id}
                  style={{ textDecoration: "none" }}
                >
                  <div className="product-card">
                    <div className="product-card-img">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} loading="lazy" />
                      ) : (
                        <div className="product-card-img-placeholder">🏥</div>
                      )}
                      <button
                        className="product-wishlist-btn"
                        onClick={(e) => e.preventDefault()}
                      >
                        ♡
                      </button>
                    </div>
                    <div className="product-card-body">
                      {p.category?.name && (
                        <p className="product-category-label">{p.category.name}</p>
                      )}
                      <p className="product-name">{p.name}</p>
                      <p className="product-price">
                        ${Number(p.price).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="product-card">
                  <div
                    className="product-card-img"
                    style={{ background: "#f0eae6", animation: "none" }}
                  >
                    <div className="product-card-img-placeholder">🏥</div>
                  </div>
                  <div className="product-card-body">
                    <p className="product-category-label">Cargando...</p>
                    <p className="product-name" style={{ color: "#ccc" }}>
                      ──────────
                    </p>
                    <p className="product-price" style={{ color: "#ccc" }}>$ ─────</p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* ── OFERTAS ── */}
      <section className="home-section bg-cream">
        <div className="offers-intro">
          <h2>Turnos a Medida</h2>
          <p>Descubrí los planes de salud y consultas especiales para vos</p>
        </div>
        <div className="offers-grid">
          <div className="offer-card light">
            <h3>Chequeo Preventivo</h3>
            <p>Revisión completa adaptada a tu perfil de salud</p>
            <Link to="/products">
              <button className="offer-shop-btn">Reservar</button>
            </Link>
            <span className="offer-icon">🩺</span>
          </div>
          <div className="offer-card dark">
            <h3>Consulta con Especialista</h3>
            <p>Accedé a nuestros mejores especialistas al mejor precio</p>
            <Link to="/products">
              <button className="offer-shop-btn">Ver Más</button>
            </Link>
            <span className="offer-icon">⚕️</span>
          </div>
        </div>
      </section>

      {/* ── ESPECIALIDADES ── */}
      <section className="specialists-section">
        <div className="specialists-header">
          <div>
            <h2>Nuestras Especialidades</h2>
            <p>
              Desde medicina general hasta especialidades de alto nivel, lo
              tenemos todo
            </p>
          </div>
          <div className="scroll-btns">
            <button className="scroll-btn">‹</button>
            <button className="scroll-btn">›</button>
          </div>
        </div>
        <div className="specialists-scroll">
          {SPECIALISTS.map((s) => (
            <Link to={`/products?cat=${s.toLowerCase()}`} key={s}>
              <div className="specialist-chip">{s}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRNOS ── */}
      <section className="why-section">
        <div className="why-inner">
          <h2 className="why-title">¿Por qué elegirnos?</h2>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🚑</div>
              <h3>Atención Rápida</h3>
              <p>
                Turnos el mismo día para urgencias y consultas de guardia
                disponibles las 24 horas
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🩺</div>
              <h3>Especialistas Certificados</h3>
              <p>
                Más de 50 especialistas con formación de excelencia y amplia
                experiencia clínica
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">⭐</div>
              <h3>Confianza de Pacientes</h3>
              <p>
                Más de 10.000 pacientes satisfechos y calificaciones de
                excelencia constantes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="testimonial-banner">
        <h2>Nuestros pacientes hablan por nosotros</h2>
        <p>
          Más de 10.000 historias de confianza y bienestar en Centro Médico
          Santo Domingo
        </p>
      </section>
    </div>
  );
}
