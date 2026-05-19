import { supabase } from './supabase'

export type EventRow = {
  id: string
  code: string
  name: string
  host_id: string
  delay_minutes: number
  max_shots: number
  created_at: string
  expires_at: string | null
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createEvent(name: string, delayMinutes: number = 60, maxShots: number = 27): Promise<EventRow> {
  const code = generateCode()
  
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Must be logged in to create an event')

  const { data, error } = await supabase
    .from('events')
    .insert({
      code,
      name,
      host_id: user.user.id,
      delay_minutes: delayMinutes,
      max_shots: maxShots,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function joinEvent(code: string): Promise<EventRow> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') throw new Error('Event not found')
    throw error
  }
  return data
}

export async function getEvent(code: string): Promise<EventRow> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error) throw error
  return data
}
