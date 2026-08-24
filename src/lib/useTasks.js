import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useTasks(session, dateKey) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    if (!session) return
    setLoading(true)

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('task_date', dateKey)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setTasks(data || [])
    setLoading(false)
  }, [session, dateKey])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const addTask = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || !session) return

      const nextOrder = tasks.length
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: session.user.id,
          task_date: dateKey,
          text: trimmed,
          sort_order: nextOrder,
        })
        .select()
        .single()

      if (error) {
        console.error(error)
        return
      }
      setTasks((prev) => [...prev, data])
    },
    [session, dateKey, tasks.length]
  )

  const toggleTask = useCallback(async (id, done) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)))
    const { error } = await supabase.from('tasks').update({ done }).eq('id', id)
    if (error) console.error(error)
  }, [])

  const deleteTask = useCallback(async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) console.error(error)
  }, [])

  return { tasks, loading, addTask, toggleTask, deleteTask }
}