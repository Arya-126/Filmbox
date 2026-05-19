import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PhotoRow, getSignedUrl } from '@/lib/photos'
import { MockPhoto } from '@/components/Gallery/PhotoCard'

export function usePhotos(eventId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['photos', eventId],
    queryFn: async (): Promise<MockPhoto[]> => {
      if (!eventId) return []
      
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('taken_at', { ascending: true })

      if (error) throw error
      
      // Transform PhotoRow to MockPhoto (used by UI)
      const photos = await Promise.all((data as PhotoRow[]).map(async p => {
        let url: string | undefined
        if (p.revealed) {
          try {
            url = await getSignedUrl(p.storage_path)
          } catch (e) {
            console.error('Failed to get signed URL', e)
          }
        }
        
        return {
          id: p.id,
          revealed: p.revealed,
          url,
          takerName: p.taker_name,
          revealAt: p.reveal_at,
        }
      }))
      
      return photos
    },
    enabled: !!eventId,
  })

  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`photos:${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'photos',
        filter: `event_id=eq.${eventId}`,
      }, () => {
        // Invalidate and refetch when there are changes
        queryClient.invalidateQueries({ queryKey: ['photos', eventId] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId, queryClient])

  // Reveal interval check
  useEffect(() => {
    if (!query.data) return

    const checkAndReveal = async () => {
      const now = new Date()
      const due = query.data.filter(p => !p.revealed && new Date(p.revealAt) <= now)
      if (due.length === 0) return
      
      // Batch update in Supabase
      try {
        await Promise.all(
          due.map(p => supabase.from('photos').update({ revealed: true }).eq('id', p.id))
        )
      } catch (err) {
        console.error('Failed to reveal photos', err)
      }
    }

    const intervalId = setInterval(checkAndReveal, 30_000) // check every 30s
    checkAndReveal() // check immediately on load

    return () => clearInterval(intervalId)
  }, [query.data])

  return query
}
