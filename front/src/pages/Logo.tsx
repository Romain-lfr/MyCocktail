// Couleurs des verres : tokens de la charte, surchargeables selon le fond
// (--verre-liquide, --verre-deco, --verre-paille ; voir docs/Charte.md)
const LIQUIDE = { fill: "var(--verre-liquide, var(--citron))" };
const DECO = { fill: "var(--verre-deco, var(--mangue))" };
const PAILLE = { stroke: "var(--verre-paille, var(--paprika))" };

// Logo Myxo : verre en Y (cocktails)
export function GlasseY({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 64" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14 L40 14 L24 32 Z" style={LIQUIDE} />
      <path d="M24 32 C24 44 20 50 24 56 C26 59 32 58 34 56" stroke="currentColor" strokeWidth="5" />
      <path d="M8 14 L24 32 L40 14" stroke="currentColor" strokeWidth="4" />
      <circle cx="38" cy="10" r="6" style={DECO} />
    </svg>
  );
}

export default function Logo() {
  return (
    <>
      <span>M</span>
      <GlasseY />
      <span>xo</span>
    </>
  );
}

// Verre en U (moktails)
export function GlasseU({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 64" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8 L14 54 Q14 58 18 58 L30 58 Q34 58 34 54 L36 8" stroke="currentColor" strokeWidth="4" />
      <path d="M13.2 30 L34.8 30 L34 54 Q34 56 31 56 L17 56 Q14 56 14 54 Z" stroke="none" style={LIQUIDE} />
      <path d="M26 4 L30 36" strokeWidth="4" style={PAILLE} />
    </svg>
  );
}