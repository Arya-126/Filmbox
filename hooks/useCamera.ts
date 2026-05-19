import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useCamera(eventId: string, maxShots: number) {
  const [shotsTaken, setShotsTaken] = useState(0)
  const [loading, setLoading] = useState(true)

  const canTakePhoto = shotsTaken < maxShots

  useEffect(() => {
    async function fetchShotCount() {
      if (!eventId) {
        setLoading(false)
        return
      }
      
      try {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) {
          setLoading(false)
          return
        }

        const { count, error } = await supabase
          .from('photos')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('taker_id', user.user.id)

        if (!error && count !== null) {
          setShotsTaken(count)
        }
      } catch (err) {
        console.warn('[useCamera] Failed to fetch shot count:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchShotCount()
  }, [eventId])

  const incrementShots = () => {
    setShotsTaken(s => s + 1)
  }

  return {
    shotsTaken,
    canTakePhoto,
    loading,
    incrementShots,
  }
}
