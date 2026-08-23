import { useState } from 'react'

export default function ArchivedHabits({ archivedHabits, onRestore, onDelete }) {
  const [open, setOpen] = useState(false)

  if (archivedHabits.length === 0) return null

  return (
    <div className="archived-block">
      <button className="archived-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '▾' : '▸'} Archived ({archivedHabits.length})
      </button>
      {open && (
        <div className="archived-list">
          {archivedHabits.map((h) => (
            <div className="archived-row" key={h.id}>
              <div className="archived-name">{h.name}</div>
              <div className="archived-actions">
                <button className="archived-action" onClick={() => onRestore(h.id)}>
                  Restore
                </button>
                <button
                  className="archived-action danger"
                  onClick={() => {
                    if (window.confirm(`Permanently delete "${h.name}" and all its history?`)) {
                      onDelete(h.id)
                    }
                  }}
                >
                  Delete permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
