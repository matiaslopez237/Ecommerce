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

export function CheckCircleIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg {...d(size, color)}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function ClockIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg {...d(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function XCircleIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg {...d(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function MailIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg {...d(size, color)}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function PackageIcon({ size = 20, color = "currentColor" }: IconProps) {
  return (
    <svg {...d(size, color)}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
