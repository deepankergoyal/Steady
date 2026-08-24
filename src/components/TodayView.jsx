import { useState } from 'react'
import { currentStreak, dateKey } from '../lib/dateHelpers'
import Flame from './Flame'
import EmptyState from './EmptyState'
import TodoList from './TodoList'

export default function TodayView({
  habits,
  entriesByHabit,
  notesByEntry,
  frozenByHabit,
  onToggle,
  onSetNote,
  onToggleFreeze,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) {
  const [openNoteId, setOpenNoteId] = useState(null)
  const [draftNote, setDraftNote] = useState('')

  const today = new Date()
  const key = dateKey(today)
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  if (habits.length === 0) {
    return (
      <div className="view-panel">
        <p className="today-date">{dateLabel}</p>
        <TodoList tasks={tasks} onAdd={onAddTask} onToggle={onToggleTask} onDelete={onDeleteTask} />
        <EmptyState headline="nothing tracked yet" sub="add your first habit above" />
      </div>
    )
  }

  function openNote(habitId, existing) {
    setOpenNoteId(habitId)
    setDraftNote(existing || '')
  }

  function closeAndSaveNote(habitId) {
    onSetNote(habitId, key, draftNote)
    setOpenNoteId(null)
  }

  return (
    <div className="view-panel">
      <p className="today-date">{dateLabel}</p>
      <div>
        {habits.map((habit) => {
          const entrySet = entriesByHabit[habit.id]
          const done = entrySet?.has(key)
          const streak = currentStreak(entrySet, frozenByHabit?.[habit.id])
          const noteKey = `${habit.id}:${key}`
          const existingNote = notesByEntry?.[noteKey]
          const noteOpen = openNoteId === habit.id

          const color = habit.color || '#748165'

          return (
            <div
              key={habit.id}
              className={'today-row-wrap' + (done ? ' done' : '')}
              style={{ boxShadow: `inset 3px 0 0 ${color}` }}
            >
              <div className="today-row" onClick={() => onToggle(habit.id, key)}>
                <div
                  className="today-check"
                  style={done ? { background: color, borderColor: color, boxShadow: `0 2px 6px ${color}59` } : undefined}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 3"
                      stroke="#EEEBE3"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="today-info">
                  <div className="today-name">{habit.name}</div>
                  <div className="today-streak">
                    {streak > 0 ? (
                      <>
                        <Flame />
                        {streak} day{streak === 1 ? '' : 's'} running
                      </>
                    ) : (
                      'no streak yet'
                    )}
                  </div>
                </div>
                {done && (
                  <button
                    className={'note-toggle' + (existingNote ? ' has-note' : '')}
                    title={existingNote ? 'Edit note' : 'Add a note'}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (noteOpen) closeAndSaveNote(habit.id)
                      else openNote(habit.id, existingNote)
                    }}
                  >
                    ✎
                  </button>
                )}
              </div>

              {done && noteOpen && (
                <div className="note-editor" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    autoFocus
                    placeholder="How did it go?"
                    value={draftNote}
                    maxLength={280}
                    onChange={(e) => setDraftNote(e.target.value)}
                    onBlur={() => closeAndSaveNote(habit.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setOpenNoteId(null)
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        closeAndSaveNote(habit.id)
                      }
                    }}
                  />
                </div>
              )}

              {done && !noteOpen && existingNote && (
                <div className="note-preview" onClick={() => openNote(habit.id, existingNote)}>
                  {existingNote}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <TodoList tasks={tasks} onAdd={onAddTask} onToggle={onToggleTask} onDelete={onDeleteTask} />
    </div>
  )
}