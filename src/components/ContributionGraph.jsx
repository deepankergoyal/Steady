import { useMemo } from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { dateKey } from '../lib/dateHelpers'
import { dailyCompletionMap } from '../lib/statsHelpers'

function heatLevel(pct) {
  if (pct === null || pct === undefined) return 'l0'
  if (pct === 0) return 'l0'
  if (pct < 0.25) return 'l1'
  if (pct < 0.5) return 'l2'
  if (pct < 0.75) return 'l3'
  return 'l4'
}

export default function ContributionGraph({ habits, entriesByHabit }) {
  const { values, startDate, endDate, dailyMap } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)

    const totalDays = 365
    const dailyMap = dailyCompletionMap(habits, entriesByHabit, totalDays)

    const values = Object.keys(dailyMap).map((key) => ({
      date: key,
      pct: dailyMap[key].pct,
      done: dailyMap[key].done,
      total: dailyMap[key].total,
    }))

    return { values, startDate, endDate: today, dailyMap }
  }, [habits, entriesByHabit])

  return (
    <div className="contribution-block">
      <h3 className="block-title">Consistency, past year</h3>
      <div className="contribution-scroll">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          classForValue={(value) => {
            if (!value) return 'contribution-cell l0'
            return `contribution-cell ${heatLevel(value.pct)}`
          }}
          titleForValue={(value) => {
            if (!value) return ''
            const d = new Date(value.date)
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (!value.total) return `${label} — no habits yet`
            return `${label} — ${value.done}/${value.total} done`
          }}
          showWeekdayLabels={false}
        />
      </div>
      <div className="contribution-legend">
        <span>Less</span>
        <div className="contribution-cell l0 legend-swatch" />
        <div className="contribution-cell l1 legend-swatch" />
        <div className="contribution-cell l2 legend-swatch" />
        <div className="contribution-cell l3 legend-swatch" />
        <div className="contribution-cell l4 legend-swatch" />
        <span>More</span>
      </div>
    </div>
  )
}
