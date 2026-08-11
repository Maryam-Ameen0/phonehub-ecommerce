// Shown instead of a real photo until Maryam adds actual product images.
// Renders a simple phone-shaped icon so cards don't look broken/empty.
export default function PlaceholderImage({ label }) {
    return (
        <div className="placeholder-image" role="img" aria-label={label || 'Product image placeholder'}>
            <svg viewBox="0 0 64 64" width="40%" height="40%" fill="none">
                <rect x="18" y="6" width="28" height="52" rx="5" stroke="currentColor" strokeWidth="2.5" />
                <line x1="26" y1="14" x2="38" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="32" cy="50" r="2.2" fill="currentColor" />
            </svg>
        </div>
    );
}
