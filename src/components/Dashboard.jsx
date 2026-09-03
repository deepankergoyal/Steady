import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { currentStreak } from '../lib/dateHelpers'
import {
  longestStreak,
  completionRate,
  weekdayPattern,
  thisWeekPattern,
  overallCompletion,
  bestStreakHabit,
  dailyCompletionMap,
  perfectDaysCount,
  weekTrend,
  weekdayInsight,
  habitCorrelation,
} from '../lib/statsHelpers'
import ContributionGraph from './ContributionGraph'
import Flame from './Flame'
import EmptyState from './EmptyState'
import { IconLayers, IconTrendUp, IconStar } from './Icons'

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const RHYTHM_COLORS = [
  'var(--thread)',
  'var(--ember)',
  'var(--accent-blue)',
  'var(--accent-plum)',
  'var(--thread-dim)',
  'var(--ember)',
  'var(--accent-blue)',
]

export default function Dashboard({ habits, entriesByHabit, frozenByHabit }) {
  const stats = useMemo(() => {
    const overall = overallCompletion(habits, entriesByHabit, 30)
    const best = bestStreakHabit(habits, entriesByHabit, frozenByHabit)
    const pattern = weekdayPattern(habits, entriesByHabit, 56)
    const thisWeek = thisWeekPattern(habits, entriesByHabit)
    const dailyMap = dailyCompletionMap(habits, entriesByHabit, 371)
    const perfectDays = perfectDaysCount(dailyMap)
    const trend = weekTrend(dailyMap)
    const insight = weekdayInsight(pattern)
    const correlation = habitCorrelation(habits, entriesByHabit)
    const allStreaks = habits
      .map((h) => ({ habit: h, streak: currentStreak(entriesByHabit[h.id], frozenByHabit?.[h.id]) }))
      .sort((a, b) => b.streak - a.streak)
    return { overall, best, pattern, thisWeek, perfectDays, trend, insight, correlation, allStreaks }
  }, [habits, entriesByHabit, frozenByHabit])

  if (habits.length === 0) {
    return (
      <div className="view-panel">
        <EmptyState headline="nothing to show yet" sub="add a habit and check in a few times" />
      </div>
    )
  }

  const rhythmData = stats.thisWeek.map((d, i) => ({
    label: WEEKDAY_LABELS[i],
    pct: d.future ? null : d.pct,
    future: d.future,
    isToday: !d.future && d.date.toDateString() === new Date().toDateString(),
  }))

  return (
    <div className="view-panel">
      <div className="stat-cards">
        <div className="stat-card cat-thread">
          <div className="stat-icon-badge badge-thread">
            <IconLayers size={16} />
          </div>
          <div className="stat-value">{habits.length}</div>
          <div className="stat-label">habit{habits.length === 1 ? '' : 's'} tracked</div>
        </div>
        <div className="stat-card cat-ember">
          <div className="stat-icon-badge badge-ember">
            <Flame size={16} />
          </div>
          <div className={'stat-value' + (stats.best ? ' ember-value' : '')}>
            {stats.best ? stats.best.streak : '—'}
          </div>
          <div className="stat-label">
            {stats.best ? `day streak · ${stats.best.habit.name}` : 'no active streak'}
          </div>
        </div>
        <div className="stat-card cat-blue">
          <div className="stat-icon-badge badge-blue">
            <IconTrendUp size={16} />
          </div>
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
          <div className="stat-icon-badge badge-plum">
            <IconStar size={15} />
          </div>
          <div className="stat-value">{stats.perfectDays}</div>
          <div className="stat-label">perfect day{stats.perfectDays === 1 ? '' : 's'}, past year</div>
        </div>
      </div>

      {stats.allStreaks.some((s) => s.streak > 0) && (
        <div className="all-streaks-block">
          <h3 className="block-title">All streaks</h3>
          <div className="all-streaks-list">
            {stats.allStreaks.map(({ habit, streak }) => (
              <div className="streak-chip" key={habit.id}>
                <span className="chip-color-dot" style={{ background: habit.color || '#748165' }} />
                {streak > 0 && <Flame size={13} />}
                <span className="streak-chip-name">{habit.name}</span>
                <span className={streak > 0 ? 'streak-chip-value ember-text' : 'streak-chip-value'}>
                  {streak > 0 ? `${streak}d` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ContributionGraph habits={habits} entriesByHabit={entriesByHabit} />

      <div className="rhythm-block">
        <h3 className="block-title">Weekly rhythm</h3>
        <p className="block-sub">your completion each day this week</p>
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
                formatter={(value, name, props) =>
                  props.payload.future ? ['—', 'Not yet'] : [`${value}%`, 'Completion']
                }
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
                  <Cell
                    key={i}
                    fill={entry.future ? 'var(--stone-line)' : RHYTHM_COLORS[i % RHYTHM_COLORS.length]}
                    stroke={entry.isToday ? 'var(--ember)' : 'none'}
                    strokeWidth={entry.isToday ? 2 : 0}
                  />
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
        {stats.correlation && (
          <p className="insight-line">
            <span className="insight-dot correlation" />
            On days you do <strong>{stats.correlation.a.name}</strong>, you're{' '}
            {Math.round(stats.correlation.coRate * 100)}% likely to also do{' '}
            <strong>{stats.correlation.b.name}</strong>.
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
            const frozenSet = frozenByHabit?.[h.id]
            const cur = currentStreak(entrySet, frozenSet)
            const longest = longestStreak(entrySet, frozenSet)
            const rate = completionRate(entrySet, h.created_at, 30)
            return (
              <div className="habit-stats-row" key={h.id}>
                <div className="habit-stats-name">
                  <span className="chip-color-dot" style={{ background: h.color || '#748165' }} />
                  {h.name}
                </div>
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