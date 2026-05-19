import { useQuery } from '@tanstack/react-query'
import { getEvent } from '@/lib/events'

export function useEvent(code: string) {
  return useQuery({
    queryKey: ['event', code],
    queryFn: () => getEvent(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
