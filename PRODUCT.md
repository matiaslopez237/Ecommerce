# Product

## Register

product

## Users

Pacientes y clientes del Centro Médico Santo Domingo. Adultos de cualquier edad que acceden desde el celular o computadora para gestionar turnos, consultar servicios médicos (estética, odontología, kinesiología, medicina general, etc.) y realizar compras. El contexto de uso es cotidiano: desde el celular en movimiento o desde la PC en casa.

## Product Purpose

Plataforma digital del Centro Médico Santo Domingo. Permite a los pacientes registrarse, verificar su cuenta, consultar servicios y productos, gestionar su carrito y realizar pedidos. Los administradores gestionan el catálogo y los pedidos desde el mismo sistema.

## Brand Personality

Profesional, amigable y moderno. El centro transmite calidad y confianza sin ser frío ni clínico. Cercano con el paciente, serio con el servicio.

## Anti-references

- Interfaces médicas genéricas blanco-azul estilo hospital estéril
- Diseños recargados con demasiados colores o íconos decorativos
- UX confusa con demasiados pasos o formularios complejos

## Design Principles

1. **Claridad ante todo**: cada pantalla tiene una acción principal evidente. El usuario nunca duda qué hacer.
2. **Calidez profesional**: la paleta cálida (marrón, beige) comunica confianza y cercanía, no frialdad clínica.
3. **Mobile-first**: la mayoría de pacientes accede desde el celular. Cada elemento debe funcionar perfectamente en pantallas pequeñas con interacción táctil.
4. **Consistencia del sistema**: colores, tipografía y espaciado usan los tokens CSS definidos. Sin valores hardcoded.
5. **Feedback inmediato**: cada acción del usuario recibe confirmación visual clara (loading, éxito, error).

## Accessibility & Inclusion

- WCAG AA como mínimo (contraste ≥ 4.5:1 para texto)
- Touch targets mínimos de 44×44px en mobile
- Texto nunca menor a 14px en mobile
- Sin scroll horizontal en ningún breakpoint
