import { useState } from 'react'
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PhotoGrid } from '@/components/Gallery/PhotoGrid'
import { FullScreenPhoto } from '@/components/Gallery/FullScreenPhoto'
import { MockPhoto } from '@/components/Gallery/PhotoCard'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { BG, TEXT_SECONDARY, ACCENT, SURFACE, BORDER, TEXT_PRIMARY, ACCENT_DIM, ACCENT_BORDER } from '@/lib/theme'
import { useGlobalSearchParams, router } from 'expo-router'
import { useEvent } from '@/hooks/useEvent'
import { usePhotos } from '@/hooks/usePhotos'
import { Camera, Download, Share2, Info } from 'lucide-react-native'
import { Share } from 'react-native'
import { APP_NAME, APP_SCHEME } from '@/lib/constants'

export default function GalleryTab() {
  const { code } = useGlobalSearchParams<{ code: string }>()
  const insets = useSafeAreaInsets()
  const [selectedPhoto, setSelectedPhoto] = useState<MockPhoto | null>(null)

  const { data: event, isLoading: eventLoading } = useEvent(code)
  const { data: photos = [], isLoading: photosLoading } = usePhotos(event?.id || '')

  const revealedCount = photos.filter(p => p.revealed).length
  const developingCount = photos.filter(p => !p.revealed).length

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my ${APP_NAME} event! Enter code: ${code}\nOr tap to join: ${APP_SCHEME}://join?code=${code}`,
      })
    } catch (error) {
      console.error('Error sharing', error)
    }
  }

  if (eventLoading || photosLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={ACCENT} />
      </View>
    )
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <View style={s.headerTop}>
          <View style={s.headerInfo}>
            <Text style={s.title}>{event?.name || 'Gallery'}</Text>
            <Text style={s.subtitle}>{revealedCount} revealed · {developingCount} developing</Text>
          </View>
          <Pressable onPress={handleShare} style={s.shareBtn} hitSlop={8}>
            <Share2 size={18} color={ACCENT} strokeWidth={2} />
          </Pressable>
        </View>
        {/* Event code pill */}
        <View style={s.codePill}>
          <Text style={s.codePillText}>CODE: {code}</Text>
        </View>
      </View>

      {/* Gallery content */}
      {photos.length === 0 ? (
        <View style={s.emptyState}>
          <View style={s.emptyIcon}>
            <Camera size={48} color={ACCENT} strokeWidth={1.2} />
          </View>
          <Text style={s.emptyTitle}>No photos yet</Text>
          <Text style={s.emptySubtitle}>Switch to the camera tab and start capturing moments. Photos will appear here as they develop.</Text>
        </View>
      ) : (
        <PhotoGrid photos={photos} onPhotoPress={setSelectedPhoto} />
      )}

      <FullScreenPhoto 
        photo={selectedPhoto} 
        visible={!!selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
      />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'Arvo_700Bold',
    fontSize: 28,
    color: '#fff',
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ACCENT_DIM,
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  codePill: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 210, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 210, 0, 0.2)',
  },
  codePillText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: ACCENT,
    letterSpacing: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: ACCENT_DIM,
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: 'Arvo_700Bold',
    fontSize: 20,
    color: TEXT_PRIMARY,
  },
  emptySubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
})
