import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { BG, TEXT_SECONDARY } from '@/lib/theme'
import { useGlobalSearchParams, router } from 'expo-router'
import { useState } from 'react'
import { downloadEventZip } from '@/lib/zip'
import { useEvent } from '@/hooks/useEvent'
import { useToast } from '@/contexts/ToastContext'

export default function DownloadScreen() {
  const { code } = useGlobalSearchParams<{ code: string }>()
  const { data: event } = useEvent(code)
  const [downloading, setDownloading] = useState(false)
  const { showToast } = useToast()

  const handleDownload = async () => {
    if (!event) return
    setDownloading(true)
    try {
      await downloadEventZip(event.id, event.name)
      showToast('Download started!', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <View style={s.root}>
      <Text style={s.title}>Download Album</Text>
      <Text style={s.subtitle}>Get all revealed photos in a single ZIP file.</Text>
      
      <View style={s.card}>
        <Text style={s.eventName}>{event?.name || 'Event'}</Text>
        <Button 
          label="Generate ZIP" 
          onPress={handleDownload} 
          loading={downloading}
          style={{ marginTop: 20 }}
        />
        <Button 
          label="Back to Gallery" 
          variant="ghost" 
          onPress={() => router.back()} 
          style={{ marginTop: 10 }}
        />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'Arvo_700Bold',
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  eventName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
})
