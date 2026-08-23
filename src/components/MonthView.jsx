import { monthLabel } from '../lib/dateHelpers'
import HabitRow from './HabitRow'
import ArchivedHabits from './ArchivedHabits'

export default function MonthView({
  habits,
  archivedHabits,
  entriesByHabit,
  notesByEntry,
  onSetNote,
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
        <div className="empty">
          <span className="glyph">nothing tracked yet</span>
          <span className="sub">add your first habit above</span>
        </div>
      ) : (
        <div>
          {habits.map((habit, i) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              entrySet={entriesByHabit[habit.id]}
              notesByEntry={notesByEntry}
              onSetNote={onSetNote}
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
