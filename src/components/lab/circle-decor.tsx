/** Decorative ring/circle motifs matching the concentric-circle graphics used on chieta.org.za. */

export function RingCluster({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" aria-hidden="true">
      <circle cx="200" cy="200" r="180" stroke="var(--chieta-purple)" strokeWidth="1.5" opacity="0.22" />
      <circle cx="200" cy="200" r="142" stroke="var(--chieta-purple)" strokeWidth="1.5" opacity="0.3" />
      <circle cx="200" cy="200" r="104" stroke="var(--chieta-gold)" strokeWidth="1.5" opacity="0.4" />
      <circle cx="200" cy="200" r="66" stroke="var(--chieta-purple)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="200" cy="200" r="28" stroke="var(--chieta-gold)" strokeWidth="2" opacity="0.65" />
    </svg>
  );
}

export function RingDonut({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden="true">
      <circle cx="118" cy="100" r="92" stroke="var(--chieta-purple)" strokeWidth="1" opacity="0.18" />
      <circle cx="100" cy="92" r="56" stroke="var(--chieta-gold)" strokeWidth="2" opacity="0.55" />
      <circle cx="108" cy="102" r="68" stroke="var(--chieta-purple)" strokeWidth="15" opacity="0.9" />
    </svg>
  );
}

export function RingArcs({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="220" stroke="var(--chieta-gold)" strokeWidth="2" opacity="0.4" />
      <circle cx="70" cy="10" r="160" stroke="var(--chieta-gold)" strokeWidth="1.5" opacity="0.3" />
      <circle cx="10" cy="80" r="110" stroke="var(--chieta-purple)" strokeWidth="1.5" opacity="0.25" />
    </svg>
  );
}

/** Same motif tuned for dark backgrounds (gold/white strokes instead of purple). */
export function RingDonutLight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden="true">
      <circle cx="118" cy="100" r="92" stroke="#FFFFFF" strokeWidth="1" opacity="0.18" />
      <circle cx="100" cy="92" r="56" stroke="var(--chieta-gold)" strokeWidth="2" opacity="0.7" />
      <circle cx="108" cy="102" r="68" stroke="var(--chieta-gold-deep)" strokeWidth="15" opacity="0.55" />
    </svg>
  );
}
