import { useState } from "react";
import { Link } from "react-router-dom";
import { SERVICIOS, WA_LINK } from "../constants/servicios";
import TurnoBtn from "../components/TurnoBtn";

export default function Home() {
  const [heroDot, setHeroDot] = useState(0);

  const heroSlides = [
    {
      eyebrow: "Centro Médico Santo Domingo",
      title: "TU SALUD,\nNUESTRA\nPRIORIDAD",
      subtitle: "Especialistas comprometidos con tu bienestar",
      cta: "Reservar Turno",
      ctaHref: WA_LINK,
      bg: "linear-gradient(130deg, #f5ede3 0%, #e8d8c4 30%, #8B7355 75%, #5E4A35 100%)",
      leftText: "SALUD",
    },
    {
      eyebrow: "Estética y Bienestar",
      title: "BELLEZA\nY\nSALUD",
      subtitle: "Tratamientos faciales, corporales y láser de última generación",
      cta: "Ver Servicios",
      ctaHref: "/servicios/estetica-facial",
      bg: "linear-gradient(130deg, #f5ede3 0%, #e8d8c4 30%, #8B7355 75%, #5E4A35 100%)",
      leftText: "VIDA",
    },
    {
      eyebrow: "Prevención y Cuidado",
      title: "PREVENIR\nES\nCUIDAR",
      subtitle: "Ginecología, medicina general y más especialidades",
      cta: "Ver Especialidades",
      ctaHref: "/servicios/ginecologia",
      bg: "linear-gradient(130deg, #f5ede3 0%, #e8d8c4 30%, #8B7355 75%, #5E4A35 100%)",
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
        <div className="hero-decor-circle" style={{ width: 340, height: 340, top: -80, left: -60 }} />
        <div className="hero-decor-circle" style={{ width: 200, height: 200, top: 40, left: 200 }} />
        <div className="hero-decor-circle" style={{ width: 160, height: 160, bottom: -40, left: 400 }} />

        <div className="hero-left-text">{slide.leftText}</div>

        <div className="hero-content">
          <p className="hero-eyebrow">{slide.eyebrow}</p>
          <h1 className="hero-title" style={{ whiteSpace: "pre-line" }}>
            {slide.title}
          </h1>
          <p className="hero-subtitle">{slide.subtitle}</p>
          {slide.ctaHref.startsWith("http") ? (
            <a
              href={slide.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta"
            >
              {slide.cta}
            </a>
          ) : (
            <Link to={slide.ctaHref} className="hero-cta">
              {slide.cta}
            </Link>
          )}
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
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Nuestros Servicios</h2>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: 14 }}>
              Todo lo que necesitás en un solo lugar
            </p>
          </div>
        </div>

        <div className="servicios-home-grid">
          {SERVICIOS.map((s) => (
            <Link
              key={s.slug}
              to={`/servicios/${s.slug}`}
              className="servicio-home-card"
            >
              <div className="servicio-home-card-icono">{s.icono}</div>
              <h3>{s.nombre}</h3>
              <p>{s.descripcionCorta}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── OFERTAS ── */}
      <section className="home-section bg-cream">
        <div className="offers-intro">
          <h2>Turnos a Medida</h2>
          <p>Descubrí los tratamientos especiales que tenemos para vos</p>
        </div>
        <div className="offers-grid">
          <div className="offer-card light">
            <h3>Estética Corporal</h3>
            <p>Reducí, reafirmá y modelá tu figura con aparatología de última generación</p>
            <Link to="/servicios/estetica-corporal">
              <button className="offer-shop-btn">Ver Tratamientos</button>
            </Link>
            <span className="offer-icon">💆</span>
          </div>
          <div className="offer-card dark">
            <h3>Ginecología y Estética Médica</h3>
            <p>Atención ginecológica integral y medicina estética avanzada</p>
            <Link to="/servicios/ginecologia">
              <button className="offer-shop-btn">Ver Más</button>
            </Link>
            <span className="offer-icon">🩺</span>
          </div>
        </div>
      </section>

      {/* ── ESPECIALIDADES ── */}
      <section className="specialists-section">
        <div className="specialists-header">
          <div>
            <h2>Nuestras Especialidades</h2>
            <p>Desde estética hasta medicina especializada, lo tenemos todo</p>
          </div>
          <div className="scroll-btns">
            <button className="scroll-btn">‹</button>
            <button className="scroll-btn">›</button>
          </div>
        </div>
        <div className="specialists-scroll">
          {SERVICIOS.map((s) => (
            <Link to={`/servicios/${s.slug}`} key={s.slug}>
              <div className="specialist-chip">
                {s.icono} {s.nombre}
              </div>
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
              <div className="why-icon">📍</div>
              <h3>Encontranos en Catriel</h3>
              <p>
                13 de Diciembre n° 1220 esquina YPF — Catriel, Rio Negro.{" "}
                <a
                  href="https://maps.app.goo.gl/Tum9MiVqodAZgBVJA"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--primary)", fontWeight: 600 }}
                >
                  Ver en el mapa
                </a>
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">🕐</div>
              <h3>Horarios Convenientes</h3>
              <p>
                Lunes a Viernes: 9:00–12:00 y 15:00–20:00<br />
                Sábados: 9:00–13:00
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">⭐</div>
              <h3>Especialistas Certificados</h3>
              <p>
                Equipo profesional en estética, medicina, odontología, kinesiología y más.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACTO / CTA WHATSAPP ── */}
      <section className="testimonial-banner" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <h2>¿Querés sacar un turno?</h2>
        <p>Contactanos por WhatsApp y te asignamos un turno rápidamente</p>
        <TurnoBtn texto="Reservar Turno por WhatsApp" />
        <div style={{ display: "flex", gap: 24, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="https://www.instagram.com/centromedicosantodomingocatr"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white", fontWeight: 600, fontSize: 14, opacity: 0.9 }}
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/belleesteticacatriel/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white", fontWeight: 600, fontSize: 14, opacity: 0.9 }}
          >
            Facebook
          </a>
          <a
            href="https://maps.app.goo.gl/Tum9MiVqodAZgBVJA"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white", fontWeight: 600, fontSize: 14, opacity: 0.9 }}
          >
            Google Maps
          </a>
        </div>
      </section>
    </div>
  );
}
