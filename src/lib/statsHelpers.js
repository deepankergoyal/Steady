import { currentStreak, dateKey } from './dateHelpers'

// Actual completion for the current calendar week (Monday through Sunday),
// not an average — days after today are marked "future" and not yet scored.
export function thisWeekPattern(habits, entriesByHabit) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const jsDay = today.getDay() // 0 = Sun .. 6 = Sat
  const mondayOffset = jsDay === 0 ? 6 : jsDay - 1
  const monday = new Date(today)
  monday.setDate(monday.getDate() - mondayOffset)

  const result = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    const future = d > today

    let done = 0
    let eligible = 0
    if (!future) {
      habits.forEach((h) => {
        const created = h.created_at ? new Date(h.created_at) : null
        if (created) created.setHours(0, 0, 0, 0)
        if (created && d < created) return
        eligible++
        if (entriesByHabit[h.id]?.has(dateKey(d))) done++
      })
    }

    result.push({
      date: d,
      pct: eligible > 0 ? Math.round((done / eligible) * 100) : 0,
      future,
    })
  }
  return result
}

export function longestStreak(entrySet, frozenSet) {
  if (!entrySet || entrySet.size === 0) return 0
  const dates = Array.from(entrySet).sort()
  let longest = 1
  let current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const cur = new Date(dates[i])
    const diffDays = Math.round((cur - prev) / 86400000)
    if (diffDays === 1) {
      current++
    } else if (diffDays > 1) {
      // check whether every day in the gap was frozen; if so, the streak survives
      let allFrozen = true
      const check = new Date(prev)
      for (let g = 1; g < diffDays; g++) {
        check.setDate(check.getDate() + 1)
        if (!frozenSet?.has(dateKey(check))) {
          allFrozen = false
          break
        }
      }
      current = allFrozen ? current + 1 : 1
    }
    if (current > longest) longest = current
  }
  return longest
}

// Percentage of eligible days completed, over the last `windowDays`,
// clipped to not count days before the habit existed.
export function completionRate(entrySet, createdAt, windowDays = 30) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const created = createdAt ? new Date(createdAt) : today
  created.setHours(0, 0, 0, 0)

  const windowStart = new Date(today)
  windowStart.setDate(windowStart.getDate() - (windowDays - 1))

  const effectiveStart = created > windowStart ? created : windowStart
  const totalDays = Math.round((today - effectiveStart) / 86400000) + 1
  if (totalDays <= 0) return null

  let doneCount = 0
  const d = new Date(effectiveStart)
  for (let i = 0; i < totalDays; i++) {
    if (entrySet && entrySet.has(dateKey(d))) doneCount++
    d.setDate(d.getDate() + 1)
  }
  return Math.round((doneCount / totalDays) * 100)
}

// Returns 7 percentages [Mon..Sun] for how often habits get done on each weekday,
// looking back `windowDays` and only counting days a habit already existed.
export function weekdayPattern(habits, entriesByHabit, windowDays = 56) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const done = Array(7).fill(0)
  const eligible = Array(7).fill(0)

  habits.forEach((h) => {
    const created = h.created_at ? new Date(h.created_at) : null
    if (created) created.setHours(0, 0, 0, 0)
    const entrySet = entriesByHabit[h.id]

    for (let i = 0; i < windowDays; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (created && d < created) continue

      const jsDay = d.getDay() // 0 = Sun .. 6 = Sat
      const idx = jsDay === 0 ? 6 : jsDay - 1 // 0 = Mon .. 6 = Sun

      eligible[idx]++
      if (entrySet && entrySet.has(dateKey(d))) done[idx]++
    }
  })

  return eligible.map((e, i) => (e > 0 ? Math.round((done[i] / e) * 100) : 0))
}

export function overallCompletion(habits, entriesByHabit, windowDays = 30) {
  if (habits.length === 0) return null
  const rates = habits
    .map((h) => completionRate(entriesByHabit[h.id], h.created_at, windowDays))
    .filter((r) => r !== null)
  if (rates.length === 0) return null
  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
}

export function bestStreakHabit(habits, entriesByHabit, frozenByHabit) {
  let best = null
  let bestValue = -1
  habits.forEach((h) => {
    const s = currentStreak(entriesByHabit[h.id], frozenByHabit?.[h.id])
    if (s > bestValue) {
      bestValue = s
      best = h
    }
  })
  return best && bestValue > 0 ? { habit: best, streak: bestValue } : null
}

// Finds the strongest "on days you do A, you also tend to do B" relationship
// across all habit pairs, using only client-side data already loaded.
// Returns null if there isn't enough overlapping data to say anything meaningful.
export function habitCorrelation(habits, entriesByHabit, days = 90) {
  if (habits.length < 2) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateKeys = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dateKeys.push(dateKey(d))
  }

  let best = null

  for (let i = 0; i < habits.length; i++) {
    for (let j = 0; j < habits.length; j++) {
      if (i === j) continue
      const a = habits[i]
      const b = habits[j]
      const aSet = entriesByHabit[a.id] || new Set()
      const bSet = entriesByHabit[b.id] || new Set()

      let aDoneCount = 0
      let bDoneCount = 0
      let bothDoneCount = 0

      dateKeys.forEach((key) => {
        const aDone = aSet.has(key)
        const bDone = bSet.has(key)
        if (aDone) aDoneCount++
        if (bDone) bDoneCount++
        if (aDone && bDone) bothDoneCount++
      })

      // require enough real data on both sides before drawing any conclusion
      if (aDoneCount < 8 || bDoneCount < 8) continue

      const coRate = bothDoneCount / aDoneCount // P(B done | A done)
      const baseRate = bDoneCount / days // B's overall rate
      const lift = coRate - baseRate

      if (lift > 0.25 && coRate > 0.6) {
        if (!best || lift > best.lift) {
          best = { a, b, coRate, lift }
        }
      }
    }
  }

  return best
}

// Map of dateKey -> { done, total, pct } for each of the last `days` days,
// only counting habits that already existed on that date.
export function dailyCompletionMap(habits, entriesByHabit, days = 371) {
  const map = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = dateKey(d)

    let total = 0
    let done = 0
    habits.forEach((h) => {
      const created = h.created_at ? new Date(h.created_at) : null
      if (created) created.setHours(0, 0, 0, 0)
      if (created && d < created) return
      total++
      if (entriesByHabit[h.id] && entriesByHabit[h.id].has(key)) done++
    })

    map[key] = { done, total, pct: total > 0 ? done / total : null }
  }
  return map
}

export function perfectDaysCount(dailyMap) {
  return Object.values(dailyMap).filter((v) => v.total > 0 && v.pct === 1).length
}

// Percentage-point change in average completion, this week vs the prior week.
export function weekTrend(dailyMap) {
  const keys = Object.keys(dailyMap).sort()
  const last7 = keys.slice(-7)
  const prev7 = keys.slice(-14, -7)

  const avg = (arr) => {
    const vals = arr.map((k) => dailyMap[k]?.pct).filter((v) => v !== null && v !== undefined)
    if (vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const a = avg(last7)
  const b = avg(prev7)
  if (a === null || b === null) return null
  return Math.round((a - b) * 100)
}

const FULL_WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Turns the 7-value weekday completion pattern into a one-line observation,
// or null if there isn't enough signal yet (too little data, or no real variance).
export function weekdayInsight(pattern) {
  const hasData = pattern.some((v) => v > 0)
  if (!hasData) return null

  let maxIdx = 0
  let minIdx = 0
  pattern.forEach((v, i) => {
    if (v > pattern[maxIdx]) maxIdx = i
    if (v < pattern[minIdx]) minIdx = i
  })

  const gap = pattern[maxIdx] - pattern[minIdx]
  if (gap < 12 || maxIdx === minIdx) return null

  if (pattern[minIdx] === 0) {
    return `You're most consistent on ${FULL_WEEKDAY_NAMES[maxIdx]}s — ${FULL_WEEKDAY_NAMES[minIdx]}s tend to slip entirely.`
  }
  return `You're most consistent on ${FULL_WEEKDAY_NAMES[maxIdx]}s, least on ${FULL_WEEKDAY_NAMES[minIdx]}s.`
}