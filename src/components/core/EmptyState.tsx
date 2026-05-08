import "./EmptyState.css";

export function EmptyState() {
  return (
    <div className="empty-state">
      <svg className="empty-state-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Log lines */}
        <rect x="8" y="16" width="36" height="4" rx="2" fill="currentColor" opacity="0.2" />
        <rect x="8" y="26" width="28" height="4" rx="2" fill="currentColor" opacity="0.2" />
        <rect x="8" y="36" width="32" height="4" rx="2" fill="currentColor" opacity="0.2" />
        <rect x="8" y="46" width="20" height="4" rx="2" fill="currentColor" opacity="0.2" />
        <rect x="8" y="56" width="30" height="4" rx="2" fill="currentColor" opacity="0.2" />
        {/* Magnifying glass */}
        <circle cx="54" cy="46" r="16" stroke="currentColor" strokeWidth="4" opacity="0.7" />
        <line x1="65" y1="57" x2="74" y2="66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        {/* Chevron inside glass */}
        <path d="M46 44 L52 50 L62 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </svg>

      <h2 className="empty-state-title">Let's do some pattern analysis</h2>
      <p className="empty-state-subtitle">
        Add an event log to get started — drop a file anywhere or hit <strong>+ Add</strong> below.
      </p>
    </div>
  );
}