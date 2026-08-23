import { useEffect, useRef, useState } from 'react'

const ENABLED_KEY = 'steady-reminder-enabled'
const TIME_KEY = 'steady-reminder-time'
const LAST_KEY = 'steady-reminder-last-date'

export function useReminders(doneToday, totalToday) {
  const [enabled, setEnabledState] = useState(() => localStorage.getItem(ENABLED_KEY) === 'true')
  const [time, setTimeState] = useState(() => localStorage.getItem(TIME_KEY) || '20:00')
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  const stateRef = useRef({ doneToday, totalToday })
  useEffect(() => {
    stateRef.current = { doneToday, totalToday }
  }, [doneToday, totalToday])

  async function setEnabled(next) {
    if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return
    }
    setEnabledState(next)
    localStorage.setItem(ENABLED_KEY, String(next))
  }

  function setTime(next) {
    setTimeState(next)
    localStorage.setItem(TIME_KEY, next)
  }

  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined') return

    const check = () => {
      const now = new Date()
      const [h, m] = time.split(':').map(Number)
      const todayStr = now.toISOString().slice(0, 10)
      const lastNotified = localStorage.getItem(LAST_KEY)
      const { doneToday, totalToday } = stateRef.current

      const pastReminderTime = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)

      if (
        pastReminderTime &&
        lastNotified !== todayStr &&
        totalToday > 0 &&
        doneToday < totalToday &&
        Notification.permission === 'granted'
      ) {
        const left = totalToday - doneToday
        new Notification('Steady', {
          body: `${left} habit${left === 1 ? '' : 's'} left for today`,
        })
        localStorage.setItem(LAST_KEY, todayStr)
      }
    }

    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [enabled, time])

  return { enabled, setEnabled, time, setTime, permission }
}