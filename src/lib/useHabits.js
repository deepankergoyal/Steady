import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { colorForIndex } from './habitColors'

export function useHabits(session) {
  const [habits, setHabits] = useState([])
  const [archivedHabits, setArchivedHabits] = useState([])
  const [entriesByHabit, setEntriesByHabit] = useState({})
  const [notesByEntry, setNotesByEntry] = useState({})
  const [frozenByHabit, setFrozenByHabit] = useState({})
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    if (!session) return
    setLoading(true)
    const userId = session.user.id

    const { data: allHabitRows, error: habitErr } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })

    if (habitErr) {
      console.error(habitErr)
      setLoading(false)
      return
    }

    const activeRows = (allHabitRows || []).filter((h) => !h.archived)
    const archivedRows = (allHabitRows || []).filter((h) => h.archived)

    const { data: entryRows, error: entryErr } = await supabase
      .from('entries')
      .select('habit_id, entry_date, note')
      .eq('user_id', userId)

    if (entryErr) {
      console.error(entryErr)
      setLoading(false)
      return
    }

    const grouped = {}
    const notes = {}
    ;(allHabitRows || []).forEach((h) => (grouped[h.id] = new Set()))
    ;(entryRows || []).forEach((row) => {
      if (!grouped[row.habit_id]) grouped[row.habit_id] = new Set()
      grouped[row.habit_id].add(row.entry_date)
      if (row.note) notes[`${row.habit_id}:${row.entry_date}`] = row.note
    })

    const { data: freezeRows, error: freezeErr } = await supabase
      .from('streak_freezes')
      .select('habit_id, freeze_date')
      .eq('user_id', userId)

    if (freezeErr) console.error(freezeErr)

    const frozen = {}
    ;(allHabitRows || []).forEach((h) => (frozen[h.id] = new Set()))
    ;(freezeRows || []).forEach((row) => {
      if (!frozen[row.habit_id]) frozen[row.habit_id] = new Set()
      frozen[row.habit_id].add(row.freeze_date)
    })

    setHabits(activeRows)
    setArchivedHabits(archivedRows)
    setEntriesByHabit(grouped)
    setNotesByEntry(notes)
    setFrozenByHabit(frozen)
    setLoading(false)
  }, [session])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const addHabit = useCallback(
    async (name) => {
      const trimmed = name.trim()
      if (!trimmed || !session) return
      const userId = session.user.id
      const sortOrder = habits.length

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: trimmed,
          sort_order: sortOrder,
          color: colorForIndex(sortOrder),
        })
        .select()
        .single()

      if (error) {
        console.error(error)
        return
      }

      setHabits((prev) => [...prev, data])
      setEntriesByHabit((prev) => ({ ...prev, [data.id]: new Set() }))
      setFrozenByHabit((prev) => ({ ...prev, [data.id]: new Set() }))
    },
    [session, habits.length]
  )

  const renameHabit = useCallback(async (id, newName) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const { error } = await supabase.from('habits').update({ name: trimmed }).eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, name: trimmed } : h)))
  }, [])

  const setHabitColor = useCallback(async (id, color) => {
    const { error } = await supabase.from('habits').update({ color }).eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, color } : h)))
  }, [])

  const archiveHabit = useCallback(async (id) => {
    const { error } = await supabase.from('habits').update({ archived: true }).eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    setHabits((prev) => {
      const found = prev.find((h) => h.id === id)
      if (found) setArchivedHabits((arch) => [...arch, { ...found, archived: true }])
      return prev.filter((h) => h.id !== id)
    })
  }, [])

  const restoreHabit = useCallback(async (id) => {
    const { error } = await supabase.from('habits').update({ archived: false }).eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    setArchivedHabits((prev) => {
      const found = prev.find((h) => h.id === id)
      if (found) setHabits((active) => [...active, { ...found, archived: false }])
      return prev.filter((h) => h.id !== id)
    })
  }, [])

  const reorderHabit = useCallback(
    async (id, direction) => {
      setHabits((prev) => {
        const index = prev.findIndex((h) => h.id === id)
        const swapIndex = direction === 'up' ? index - 1 : index + 1
        if (index === -1 || swapIndex < 0 || swapIndex >= prev.length) return prev

        const next = [...prev]
        ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]

        // persist new sort_order values for the two swapped rows
        const a = next[index]
        const b = next[swapIndex]
        supabase.from('habits').update({ sort_order: index }).eq('id', a.id).then()
        supabase.from('habits').update({ sort_order: swapIndex }).eq('id', b.id).then()

        return next
      })
    },
    []
  )

  const deleteHabit = useCallback(async (id) => {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setArchivedHabits((prev) => prev.filter((h) => h.id !== id))
    setEntriesByHabit((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setFrozenByHabit((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const toggleDay = useCallback(
    async (habitId, key) => {
      if (!session) return
      const userId = session.user.id
      const currentlyDone = entriesByHabit[habitId]?.has(key)

      // optimistic update
      setEntriesByHabit((prev) => {
        const next = { ...prev }
        const set = new Set(next[habitId] || [])
        if (currentlyDone) set.delete(key)
        else set.add(key)
        next[habitId] = set
        return next
      })

      if (currentlyDone) {
        const { error } = await supabase
          .from('entries')
          .delete()
          .eq('habit_id', habitId)
          .eq('entry_date', key)
        if (error) {
          console.error(error)
          loadAll()
        }
      } else {
        const { error } = await supabase
          .from('entries')
          .insert({ habit_id: habitId, user_id: userId, entry_date: key })
        if (error) {
          console.error(error)
          loadAll()
        }
      }
    },
    [session, entriesByHabit, loadAll]
  )

  const setEntryNote = useCallback(
    async (habitId, key, note) => {
      const trimmed = note.trim()
      const noteKey = `${habitId}:${key}`

      setNotesByEntry((prev) => {
        const next = { ...prev }
        if (trimmed) next[noteKey] = trimmed
        else delete next[noteKey]
        return next
      })

      const { error } = await supabase
        .from('entries')
        .update({ note: trimmed || null })
        .eq('habit_id', habitId)
        .eq('entry_date', key)

      if (error) {
        console.error(error)
        loadAll()
      }
    },
    [loadAll]
  )

  const toggleFreeze = useCallback(
    async (habitId, key) => {
      if (!session) return
      const userId = session.user.id
      const currentlyFrozen = frozenByHabit[habitId]?.has(key)

      setFrozenByHabit((prev) => {
        const next = { ...prev }
        const set = new Set(next[habitId] || [])
        if (currentlyFrozen) set.delete(key)
        else set.add(key)
        next[habitId] = set
        return next
      })

      if (currentlyFrozen) {
        const { error } = await supabase
          .from('streak_freezes')
          .delete()
          .eq('habit_id', habitId)
          .eq('freeze_date', key)
        if (error) {
          console.error(error)
          loadAll()
        }
      } else {
        const { error } = await supabase
          .from('streak_freezes')
          .insert({ habit_id: habitId, user_id: userId, freeze_date: key })
        if (error) {
          console.error(error)
          loadAll()
        }
      }
    },
    [session, frozenByHabit, loadAll]
  )

  return {
    habits,
    archivedHabits,
    entriesByHabit,
    notesByEntry,
    frozenByHabit,
    loading,
    addHabit,
    deleteHabit,
    toggleDay,
    setEntryNote,
    toggleFreeze,
    renameHabit,
    setHabitColor,
    archiveHabit,
    restoreHabit,
    reorderHabit,
  }
}