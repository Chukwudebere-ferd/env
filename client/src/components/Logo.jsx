import './Logo.css';

// CSS-only brand mark. No image assets: accent tile + mono `~/` glyph.
export default function Logo({ size = 'md', wordmark = true }) {
  return (
    <span className={`logo logo-${size}`} role="img" aria-label="env">
      <span className="logo-mark" aria-hidden="true">~/</span>
      {wordmark && (
        <span className="logo-name" aria-hidden="true">env</span>
      )}
    </span>
  );
}
