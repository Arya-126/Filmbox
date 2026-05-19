import { supabase } from './supabase'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'

export async function downloadEventZip(eventId: string, eventName: string) {
  // 1. Fetch all revealed photos for the event
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('revealed', true)

  if (error) throw error
  if (!photos || photos.length === 0) throw new Error('No revealed photos to download')

  // 2. In a real app, you'd likely call an Edge Function here to generate a ZIP
  // on the server, as zipping on the client can be slow/memory intensive for many images.
  // For the sake of the template stretch goal, we will just simulate the download process
  // or use a mock.
  
  // Example Edge Function Call (Mocked):
  /*
  const { data: zipBlob } = await supabase.functions.invoke('generate-zip', {
    body: { eventId },
  })
  */

  // Mock saving a file and sharing it
  // @ts-ignore - documentDirectory is present but not typed correctly in this Expo version
  const dummyFile = `${FileSystem.documentDirectory}${eventName.replace(/\s+/g, '_')}_photos.zip`
  await FileSystem.writeAsStringAsync(dummyFile, 'mock zip content for demo')

  // 3. Prompt share sheet so user can save to files or AirDrop
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dummyFile, {
      mimeType: 'application/zip',
      dialogTitle: 'Download Event Photos',
    })
  } else {
    throw new Error('Sharing not available on this device')
  }
}
