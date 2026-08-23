import { SUGGESTED_HABITS } from '../lib/suggestedHabits'

export default function SuggestedHabits({ existingNames, onAdd }) {
  const existingLower = new Set(existingNames.map((n) => n.toLowerCase()))
  const available = SUGGESTED_HABITS.filter((s) => !existingLower.has(s.toLowerCase()))

  if (available.length === 0) return null

  return (
    <div className="suggestions-row">
      {available.map((name) => (
        <button key={name} type="button" className="suggestion-chip" onClick={() => onAdd(name)}>
          + {name}
        </button>
      ))}
    </div>
  )
}
