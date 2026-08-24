import { monthLabel } from '../lib/dateHelpers'
import HabitRow from './HabitRow'
import ArchivedHabits from './ArchivedHabits'
import EmptyState from './EmptyState'

export default function MonthView({
  habits,
  archivedHabits,
  entriesByHabit,
  notesByEntry,
  frozenByHabit,
  onSetNote,
  onToggleFreeze,
  viewDate,
  setViewDate,
  onToggle,
  onArchive,
  onRename,
  onReorder,
  onRestore,
  onDelete,
}) {
  function prevMonth() {
    setViewDate((d) => {
      const next = new Date(d)
      next.setMonth(next.getMonth() - 1)
      return next
    })
  }

  function nextMonth() {
    setViewDate((d) => {
      const next = new Date(d)
      next.setMonth(next.getMonth() + 1)
      return next
    })
  }

  return (
    <div className="view-panel">
      <div className="month-nav">
        <div className="label">{monthLabel(viewDate)}</div>
        <div className="arrows">
          <button onClick={prevMonth}>←</button>
          <button onClick={nextMonth}>→</button>
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyState headline="nothing tracked yet" sub="add your first habit above" />
      ) : (
        <div>
          {habits.map((habit, i) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              entrySet={entriesByHabit[habit.id]}
              notesByEntry={notesByEntry}
              onSetNote={onSetNote}
              frozenSet={frozenByHabit?.[habit.id]}
              onToggleFreeze={onToggleFreeze}
              viewDate={viewDate}
              onToggle={onToggle}
              onArchive={onArchive}
              onRename={onRename}
              onReorder={onReorder}
              isFirst={i === 0}
              isLast={i === habits.length - 1}
            />
          ))}
        </div>
      )}

      <ArchivedHabits archivedHabits={archivedHabits} onRestore={onRestore} onDelete={onDelete} />
    </div>
  )
}