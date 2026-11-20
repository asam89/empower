type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Empower logo mark: a child with arms raised in celebration,
 * a spark of confidence overhead, standing on a rising arc of support.
 */
export function LogoMark({ size = 40, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="48" height="48" rx="12" fill="#4B2E91" />
      {/* supporting arc */}
      <path
        d="M9 42 Q24 35.5 39 42"
        stroke="#0E9C92"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* child: arms raised, legs planted */}
      <g stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 12 L24 22.5 L34.5 12" />
        <path d="M24 22.5 V30" />
        <path d="M19 37 L24 30 L29 37" />
      </g>
      <circle cx="24" cy="14.5" r="4.5" fill="#FFFFFF" />
      {/* spark */}
      <path
        d="M38 3.5 L39.3 7.2 L43 8.5 L39.3 9.8 L38 13.5 L36.7 9.8 L33 8.5 L36.7 7.2 Z"
        fill="#FF8A3D"
      />
    </svg>
  );
}

export function Logo({
  size = 40,
  className,
  textClassName = "text-brand-primary",
}: LogoMarkProps & { textClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span className={`font-bold tracking-tight ${textClassName}`}>Empower</span>
    </span>
  );
}
