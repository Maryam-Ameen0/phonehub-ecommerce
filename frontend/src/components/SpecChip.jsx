import './SpecChip.css';

// The recurring "spec chip" signature — used on product cards and detail pages
// to show condition, storage, color, etc. `tone` controls the accent color.
export default function SpecChip({ children, tone = 'default' }) {
    return <span className={`spec-chip spec-chip--${tone}`}>{children}</span>;
}
