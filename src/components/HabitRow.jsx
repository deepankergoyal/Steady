import { useLayoutEffect, useRef, useState } from 'react'
import { currentStreak, dateKey, daysInMonth, isSameDay } from '../lib/dateHelpers'
import Flame from './Flame'

// Duolingo-style limit: at most one freeze per rolling 7-day window per habit,
// so it stays a real "grace day" rather than an unlimited way to fake a streak.
function isFreezeAvailable(frozenSet, key) {
  if (!frozenSet) return true
  const target = new Date(key + 'T00:00:00')
  for (const fkey of frozenSet) {
    if (fkey === key) continue
    const d = new Date(fkey + 'T00:00:00')
    const diff = Math.abs((target - d) / 86400000)
    if (diff < 7) return false
  }
  return true
}

export default function HabitRow({
  habit,
  entrySet,
  notesByEntry,
  onSetNote,
  frozenSet,
  onToggleFreeze,
  viewDate,
  onToggle,
  onArchive,
  onRename,
  onReorder,
  isFirst,
  isLast,
}) {
  const daysWrapRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(habit.name)
  const [openNoteKey, setOpenNoteKey] = useState(null)
  const [draftNote, setDraftNote] = useState('')

  const today = new Date()
  const numDays = daysInMonth(viewDate)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const streak = currentStreak(entrySet, frozenSet)

  const days = []
  for (let day = 1; day <= numDays; day++) {
    const d = new Date(year, month, day)
    const key = dateKey(d)
    const done = entrySet?.has(key)
    const future = d > today
    const note = notesByEntry?.[`${habit.id}:${key}`]
    const frozen = frozenSet?.has(key)
    days.push({ day, key, done, future, isToday: isSameDay(d, today), note, frozen })
  }

  // draw thread lines under consecutive done runs
  useLayoutEffect(() => {
    const wrap = daysWrapRef.current
    if (!wrap) return

    wrap.querySelectorAll('.thread-line').forEach((el) => el.remove())

    const cells = wrap.querySelectorAll('.day-cell')
    let runStart = null
    cells.forEach((cell, i) => {
      const done = cell.classList.contains('done')
      const isLast = i === cells.length - 1
      if (done && runStart === null) runStart = i
      if ((!done || isLast) && runStart !== null) {
        const runEnd = done && isLast ? i : i - 1
        if (runEnd > runStart) {
          const startCell = cells[runStart]
          const endCell = cells[runEnd]
          const line = document.createElement('div')
          line.className = 'thread-line'
          const left = startCell.offsetLeft + startCell.offsetWidth / 2
          const right = endCell.offsetLeft + endCell.offsetWidth / 2
          line.style.left = left + 'px'
          line.style.width = right - left + 'px'
          wrap.appendChild(line)
        }
        runStart = done ? i : null
      }
    })
  }, [entrySet, viewDate])

  function startEdit() {
    setDraftName(habit.name)
    setEditing(true)
  }

  function commitEdit() {
    if (draftName.trim() && draftName.trim() !== habit.name) {
      onRename(habit.id, draftName.trim())
    }
    setEditing(false)
  }

  return (
    <div className="habit">
      <div className="habit-top">
        {editing ? (
          <input
            className="habit-name-input"
            value={draftName}
            autoFocus
            maxLength={60}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
          />
        ) : (
          <div className="habit-name" onClick={startEdit} title="Click to rename">
            {habit.name}
          </div>
        )}

        <div className="habit-meta">
          <div className="streak">
            {streak > 0 ? (
              <>
                <Flame />
                {streak} day{streak === 1 ? '' : 's'} running
              </>
            ) : (
              'no streak yet'
            )}
          </div>
          <div className="reorder-buttons">
            <button
              className="habit-icon-btn"
              disabled={isFirst}
              title="Move up"
              onClick={() => onReorder(habit.id, 'up')}
            >
              ↑
            </button>
            <button
              className="habit-icon-btn"
              disabled={isLast}
              title="Move down"
              onClick={() => onReorder(habit.id, 'down')}
            >
              ↓
            </button>
          </div>
          <button className="habit-icon-btn" title="Archive habit" onClick={() => onArchive(habit.id)}>
            ⊡
          </button>
        </div>
      </div>
      <div className="days" ref={daysWrapRef}>
        {days.map(({ day, key, done, future, isToday, note, frozen }) => {
          const canFreeze = !done && !future && isFreezeAvailable(frozenSet, key)
          return (
            <div
              key={key}
              className={
                'day-cell' +
                (done ? ' done' : '') +
                (future ? ' future' : '') +
                (isToday ? ' today' : '') +
                (frozen ? ' frozen' : '')
              }
              title={
                new Date(year, month, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
                (done ? ' — done' : '') +
                (frozen ? ' — streak freeze used' : '') +
                (note ? ` · "${note}"` : '')
              }
              onClick={future ? undefined : () => onToggle(habit.id, key)}
            >
              {done && (
                <span
                  className={'note-dot' + (note ? ' filled' : '')}
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenNoteKey(key)
                    setDraftNote(note || '')
                  }}
                />
              )}
              {!done && !future && (frozen || canFreeze) && (
                <span
                  className={'freeze-dot' + (frozen ? ' active' : '')}
                  title={
                    frozen
                      ? 'Remove streak freeze'
                      : canFreeze
                      ? 'Freeze this day — excuses it without breaking your streak (1 per week)'
                      : 'No freeze available this week'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    if (frozen || canFreeze) onToggleFreeze(habit.id, key)
                  }}
                >
                  ❄
                </span>
              )}
            </div>
          )
        })}
      </div>

      {openNoteKey && (
        <div className="month-note-editor">
          <div className="month-note-editor-label">
            {new Date(openNoteKey + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <textarea
            autoFocus
            placeholder="How did it go?"
            value={draftNote}
            maxLength={280}
            onChange={(e) => setDraftNote(e.target.value)}
            onBlur={() => {
              onSetNote(habit.id, openNoteKey, draftNote)
              setOpenNoteKey(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpenNoteKey(null)
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSetNote(habit.id, openNoteKey, draftNote)
                setOpenNoteKey(null)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}