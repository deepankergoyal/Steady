import { useState } from 'react'

export default function TodoList({ tasks, onAdd, onToggle, onDelete }) {
  const [draft, setDraft] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!draft.trim()) return
    onAdd(draft)
    setDraft('')
  }

  const doneCount = tasks.filter((t) => t.done).length

  return (
    <div className="todo-block">
      <div className="todo-header">
        <h3 className="block-title">Today's tasks</h3>
        {tasks.length > 0 && (
          <span className="todo-count">
            {doneCount}/{tasks.length}
          </span>
        )}
      </div>

      <form className="todo-add-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a quick task…"
          maxLength={140}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit">+</button>
      </form>

      {tasks.length > 0 && (
        <div className="todo-list">
          {tasks.map((task) => (
            <div key={task.id} className={'todo-item' + (task.done ? ' done' : '')}>
              <button
                className="todo-check"
                onClick={() => onToggle(task.id, !task.done)}
                aria-label={task.done ? 'Mark not done' : 'Mark done'}
              >
                {task.done && (
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 3"
                      stroke="#EEEBE3"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span className="todo-text">{task.text}</span>
              <button className="todo-delete" onClick={() => onDelete(task.id)} title="Remove task">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}