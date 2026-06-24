// Diametral logo mark — a circle enclosing an inscribed square crossed by its
// diameter (the "diametral" line). Drawn with currentColor so it inherits the
// surrounding text color and scales crisply at any size. Ported verbatim from
// ophelieV2 — it is the brand identity in the sidebar wordmark.
type BrandmarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

export function Brandmark({ size = 24, className, title }: BrandmarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <circle cx="16" cy="16" r="15" />
      <rect x="5.39" y="5.39" width="21.22" height="21.22" />
      <line x1="26.61" y1="5.39" x2="5.39" y2="26.61" />
    </svg>
  );
}
