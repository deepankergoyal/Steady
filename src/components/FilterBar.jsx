export default function FilterBar({ value, onChange, resultCount, totalCount }) {
  if (totalCount < 6) return null // not worth showing until the list grows

  return (
    <div className="filter-row">
      <input
        type="text"
        className="filter-input"
        placeholder="Filter habits…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <span className="filter-count">
          {resultCount} of {totalCount}
        </span>
      )}
    </div>
  )
}
