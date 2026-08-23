export function pad(n) {
  return String(n).padStart(2, '0')
}

export function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export function monthLabel(d) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
}

export function currentStreak(entrySet) {
  if (!entrySet) return 0
  let streak = 0
  let d = new Date()
  if (!entrySet.has(dateKey(d))) {
    d.setDate(d.getDate() - 1)
  }
  while (entrySet.has(dateKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}
