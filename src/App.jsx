import { useMemo, useState } from 'react'
import { useAuth } from './lib/useAuth'
import { useHabits } from './lib/useHabits'
import { useTheme } from './lib/useTheme'
import { useReminders } from './lib/useReminders'
import { useTasks } from './lib/useTasks'
import { supabase } from './lib/supabaseClient'
import AuthScreen from './components/AuthScreen'
import TodayView from './components/TodayView'
import MonthView from './components/MonthView'
import SuggestedHabits from './components/SuggestedHabits'
import FilterBar from './components/FilterBar'
import Dashboard from './components/Dashboard'
import {
  IconToday,
  IconMonth,
  IconDashboard,
  IconSignOut,
  IconSun,
  IconMoon,
  IconBell,
} from './components/Icons'

const VIEW_META = {
  today: { title: 'Today', icon: IconToday },
  month: { title: 'Month', icon: IconMonth },
  dashboard: { title: 'Dashboard', icon: IconDashboard },
}

export default function App() {
  const { session, loading: authLoading } = useAuth()
  const {
    habits,
    archivedHabits,
    entriesByHabit,
    notesByEntry,
    frozenByHabit,
    loading: habitsLoading,
    addHabit,
    deleteHabit,
    toggleDay,
    setEntryNote,
    toggleFreeze,
    renameHabit,
    archiveHabit,
    restoreHabit,
    reorderHabit,
  } = useHabits(session)

  const [view, setView] = useState('today')
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [newHabitName, setNewHabitName] = useState('')
  const [filterText, setFilterText] = useState('')

  const filteredHabits = useMemo(() => {
    if (!filterText.trim()) return habits
    const q = filterText.trim().toLowerCase()
    return habits.filter((h) => h.name.toLowerCase().includes(q))
  }, [habits, filterText])

  const todayKey = new Date().toISOString().slice(0, 10)
  const { tasks, addTask, toggleTask, deleteTask } = useTasks(session, todayKey)
  const doneToday = filteredHabits.filter((h) => entriesByHabit[h.id]?.has(todayKey)).length
  const totalToday = filteredHabits.length

  const { theme, toggleTheme } = useTheme()
  const reminders = useReminders(doneToday, totalToday)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-dot" />
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  function handleAddHabit(e) {
    e.preventDefault()
    addHabit(newHabitName)
    setNewHabitName('')
  }

  const firstName =
    session.user.user_metadata?.full_name?.trim().split(' ')[0] ||
    session.user.email?.split('@')[0] ||
    'there'

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  let progressLine = 'nothing tracked yet'
  if (totalToday > 0) {
    progressLine =
      doneToday === totalToday
        ? `all ${totalToday} done for today`
        : `${doneToday} of ${totalToday} done today`
  }

  const topbarEyebrow =
    view === 'today' ? `${timeGreeting}, ${firstName}` : new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 12" width="26" height="10">
              <path
                d="M0,6 Q4,1 8,6 T16,6 T24,6 T32,6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand-name">Steady</span>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(VIEW_META).map(([key, meta]) => {
            const Icon = meta.icon
            return (
              <button
                key={key}
                className={'nav-item' + (view === key ? ' active' : '')}
                onClick={() => setView(key)}
              >
                <Icon />
                <span>{meta.title}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-utility-row">
            <button
              className="icon-only-btn"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <button
              className={'icon-only-btn' + (reminders.enabled ? ' active' : '')}
              title="Reminder settings"
              onClick={() => setSettingsOpen((o) => !o)}
            >
              <IconBell />
            </button>
          </div>

          {settingsOpen && (
            <div className="reminder-panel">
              <label className="reminder-row">
                <span>Evening reminder</span>
                <input
                  type="checkbox"
                  checked={reminders.enabled}
                  onChange={(e) => reminders.setEnabled(e.target.checked)}
                />
              </label>
              {reminders.enabled && (
                <input
                  type="time"
                  className="reminder-time"
                  value={reminders.time}
                  onChange={(e) => reminders.setTime(e.target.value)}
                />
              )}
              {reminders.permission === 'denied' && (
                <p className="reminder-note">Notifications are blocked in your browser settings.</p>
              )}
              <p className="reminder-note">Only fires while Steady is open in a tab.</p>
            </div>
          )}

          <button className="nav-item signout" onClick={() => supabase.auth.signOut()}>
            <IconSignOut />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        <div className="main-inner">
          <div className="main-topbar">
            <p className="topbar-eyebrow">{topbarEyebrow}</p>
            <h1 className="view-title">{VIEW_META[view].title}</h1>
            {view === 'today' && <p className="topbar-progress">{progressLine}</p>}
          </div>

          {habitsLoading ? (
            <div className="content-loading">
              <div className="skeleton-line" style={{ width: '70%' }} />
              <div className="skeleton-line" style={{ width: '45%' }} />
              <div className="skeleton-line" style={{ width: '60%' }} />
            </div>
          ) : (
            <>
              <form className="add-row" onSubmit={handleAddHabit}>
                <input
                  type="text"
                  placeholder="e.g. Read before bed"
                  maxLength={60}
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
                <button type="submit">Add habit</button>
              </form>

              <SuggestedHabits existingNames={habits.map((h) => h.name)} onAdd={addHabit} />

              <FilterBar
                value={filterText}
                onChange={setFilterText}
                resultCount={filteredHabits.length}
                totalCount={habits.length}
              />

              {view === 'today' && (
                <TodayView
                  habits={filteredHabits}
                  entriesByHabit={entriesByHabit}
                  notesByEntry={notesByEntry}
                  frozenByHabit={frozenByHabit}
                  onToggle={toggleDay}
                  onSetNote={setEntryNote}
                  tasks={tasks}
                  onAddTask={addTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                />
              )}
              {view === 'month' && (
                <MonthView
                  habits={filteredHabits}
                  archivedHabits={archivedHabits}
                  entriesByHabit={entriesByHabit}
                  notesByEntry={notesByEntry}
                  frozenByHabit={frozenByHabit}
                  onSetNote={setEntryNote}
                  onToggleFreeze={toggleFreeze}
                  viewDate={viewDate}
                  setViewDate={setViewDate}
                  onToggle={toggleDay}
                  onArchive={archiveHabit}
                  onRename={renameHabit}
                  onReorder={reorderHabit}
                  onRestore={restoreHabit}
                  onDelete={deleteHabit}
                />
              )}
              {view === 'dashboard' && (
                <Dashboard
                  habits={filteredHabits}
                  entriesByHabit={entriesByHabit}
                  frozenByHabit={frozenByHabit}
                />
              )}
            </>
          )}

          <footer>synced quietly, just for you</footer>
        </div>
      </main>
    </div>
  )
}