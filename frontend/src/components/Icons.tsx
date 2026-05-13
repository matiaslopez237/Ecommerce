type IconProps = { size?: number; color?: string; strokeWidth?: number };
const d = (size = 20, color = "currentColor", sw = 1.75) =>
  ({ width: size, height: size, fill: "none", viewBox: "0 0 24 24", stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export function LogOutIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg {...d(size, color)}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function WrenchIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg {...d(size, color)}>
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function ShieldIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg {...d(size, color)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* ── Me page action icons ── */

export function CartIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 3.5h2.6l1 3m0 0 2 8.4a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 1.95-1.55L21.5 6.5h-15" />
      <circle cx="9.5" cy="20" r="1.6" />
      <circle cx="17.5" cy="20" r="1.6" />
    </svg>
  );
}


export function BriefcaseSearchIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8.5h11a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
      <path d="M8 8.5V7a2.5 2.5 0 0 1 5 0v1.5" />
      <circle cx="17.2" cy="15.2" r="3.6" fill="var(--primary-light, #f5ede3)" />
      <path d="m20 18 2.2 2.2" />
      <path d="M17.2 13.4l1.7.95v1.9l-1.7.95-1.7-.95v-1.9z" />
      <path d="M17.2 15.3v1.9M15.5 14.35l1.7.95 1.7-.95" />
    </svg>
  );
}

export function UserIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M3.5 20.5c1.4-3.7 4.7-5.7 8.5-5.7s7.1 2 8.5 5.7" />
    </svg>
  );
}
