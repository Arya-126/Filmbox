import { supabase } from './supabase'

// Standard RFC 4122 UUID v4 generator for React Native / Hermes (which lacks global crypto)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export type PhotoRow = {
  id: string
  event_id: string
  taker_id: string
  taker_name: string
  storage_path: string
  taken_at: string
  reveal_at: string
  revealed: boolean
  created_at: string
}

export async function uploadPhoto(
  eventId: string,
  imageUri: string,
  takerName: string,
  delayMinutes: number
): Promise<PhotoRow> {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Must be logged in to take photos')

  // Generate a unique ID for the photo and storage path
  const photoId = uuidv4()
  const fileExt = imageUri.split('.').pop() || 'jpg'
  const storagePath = `${eventId}/${photoId}.${fileExt}`

  // Prepare native Form Data for React Native file upload
  const formData = new FormData()
  formData.append('file', {
    uri: imageUri,
    name: `${photoId}.${fileExt}`,
    type: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
  } as any)

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('event-photos')
    .upload(storagePath, formData, {
      contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
    })

  if (uploadError) throw uploadError

  // Calculate reveal time
  const revealAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString()
  const revealed = delayMinutes === 0

  // Insert DB row
  const { data, error } = await supabase
    .from('photos')
    .insert({
      id: photoId,
      event_id: eventId,
      taker_id: user.user.id,
      taker_name: takerName,
      storage_path: storagePath,
      reveal_at: revealAt,
      revealed,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  // We can cache these locally if needed, but for now just fetch
  const { data, error } = await supabase.storage
    .from('event-photos')
    .createSignedUrl(storagePath, 3600) // 1 hour expiry
    
  if (error) throw error
  return data.signedUrl
}
