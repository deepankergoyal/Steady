import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { currentStreak } from '../lib/dateHelpers'
import {
  longestStreak,
  completionRate,
  weekdayPattern,
  overallCompletion,
  bestStreakHabit,
  dailyCompletionMap,
  perfectDaysCount,
  weekTrend,
  weekdayInsight,
} from '../lib/statsHelpers'
import ContributionGraph from './ContributionGraph'
import Flame from './Flame'

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function Dashboard({ habits, entriesByHabit }) {
  const stats = useMemo(() => {
    const overall = overallCompletion(habits, entriesByHabit, 30)
    const best = bestStreakHabit(habits, entriesByHabit)
    const pattern = weekdayPattern(habits, entriesByHabit, 56)
    const dailyMap = dailyCompletionMap(habits, entriesByHabit, 371)
    const perfectDays = perfectDaysCount(dailyMap)
    const trend = weekTrend(dailyMap)
    const insight = weekdayInsight(pattern)
    return { overall, best, pattern, perfectDays, trend, insight }
  }, [habits, entriesByHabit])

  if (habits.length === 0) {
    return (
      <div className="view-panel">
        <div className="empty">
          <span className="glyph">nothing to show yet</span>
          <span className="sub">add a habit and check in a few times</span>
        </div>
      </div>
    )
  }

  const rhythmData = stats.pattern.map((pct, i) => ({ label: WEEKDAY_LABELS[i], pct }))

  return (
    <div className="view-panel">
      <div className="stat-cards">
        <div className="stat-card cat-thread">
          <div className="stat-value">{habits.length}</div>
          <div className="stat-label">habit{habits.length === 1 ? '' : 's'} tracked</div>
        </div>
        <div className="stat-card cat-ember">
          <div className={'stat-value' + (stats.best ? ' ember-value' : '')}>
            {stats.best && <Flame size={22} />}
            {stats.best ? stats.best.streak : '—'}
          </div>
          <div className="stat-label">
            {stats.best ? `day streak · ${stats.best.habit.name}` : 'no active streak'}
          </div>
        </div>
        <div className="stat-card cat-blue">
          <div className="stat-value">
            {stats.overall !== null ? `${stats.overall}%` : '—'}
            {stats.trend !== null && stats.trend !== 0 && (
              <span className={'trend-badge ' + (stats.trend > 0 ? 'up' : 'down')}>
                {stats.trend > 0 ? '▲' : '▼'} {Math.abs(stats.trend)}
              </span>
            )}
          </div>
          <div className="stat-label">completion, last 30 days</div>
        </div>
        <div className="stat-card cat-plum">
          <div className="stat-value">{stats.perfectDays}</div>
          <div className="stat-label">perfect day{stats.perfectDays === 1 ? '' : 's'}, past year</div>
        </div>
      </div>

      <ContributionGraph habits={habits} entriesByHabit={entriesByHabit} />

      <div className="rhythm-block">
        <h3 className="block-title">Weekly rhythm</h3>
        <p className="block-sub">how consistent you are by day of week, last 8 weeks</p>
        <div className="rhythm-chart-wrap">
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={rhythmData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={{ stroke: 'var(--stone-line)' }}
                tickLine={false}
                tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--stone)' }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: 'var(--warm-hover)' }}
                formatter={(value) => [`${value}%`, 'Completion']}
                contentStyle={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 12,
                  background: 'var(--paper-raised)',
                  border: '1px solid var(--stone-line)',
                  borderRadius: 4,
                }}
              />
              <Bar dataKey="pct" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {rhythmData.map((entry, i) => (
                  <Cell key={i} fill="var(--thread)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {stats.insight && (
          <p className="insight-line">
            <span className="insight-dot" />
            {stats.insight}
          </p>
        )}
      </div>

      <div className="habit-stats-block">
        <h3 className="block-title">By habit</h3>
        <div className="habit-stats-table">
          <div className="habit-stats-header">
            <div>Name</div>
            <div>Current</div>
            <div>Longest</div>
            <div>30-day</div>
          </div>
          {habits.map((h) => {
            const entrySet = entriesByHabit[h.id]
            const cur = currentStreak(entrySet)
            const longest = longestStreak(entrySet)
            const rate = completionRate(entrySet, h.created_at, 30)
            return (
              <div className="habit-stats-row" key={h.id}>
                <div className="habit-stats-name">{h.name}</div>
                <div className={cur > 0 ? 'ember-text' : ''}>{cur > 0 ? `${cur}d` : '—'}</div>
                <div>{longest > 0 ? `${longest}d` : '—'}</div>
                <div>{rate !== null ? `${rate}%` : '—'}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
