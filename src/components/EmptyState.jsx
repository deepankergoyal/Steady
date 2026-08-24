export default function EmptyState({ headline, sub }) {
    return (
      <div className="empty">
        <svg className="empty-mark" viewBox="0 0 32 12" width="30" height="11" aria-hidden="true">
          <path
            d="M0,6 Q4,1 8,6 T16,6 T24,6 T32,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="glyph">{headline}</span>
        <span className="sub">{sub}</span>
      </div>
    )
  }