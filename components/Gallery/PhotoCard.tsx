import { View, StyleSheet, Pressable } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { Text } from '@/components/ui/Text'
import { DevelopingOverlay } from '@/components/Event/DevelopingOverlay'
import { TEXT_PRIMARY } from '@/lib/theme'

export type MockPhoto = {
  id: string
  revealed: boolean
  url?: string
  takerName: string
  revealAt: string
}

export function PhotoCard({ photo, onPress }: { photo: MockPhoto, onPress?: () => void }) {
  // Hash ID for a stable random rotation between -2 and 2 degrees
  const hash = photo.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
  const rotation = (Math.abs(hash) % 5) - 2

  // Reveal animation state
  const [isRevealed, setIsRevealed] = useState(photo.revealed)
  const revealOpacity = useSharedValue(photo.revealed ? 1 : 0)
  const revealScale = useSharedValue(photo.revealed ? 1 : 0.95)

  useEffect(() => {
    if (photo.revealed && !isRevealed) {
      // Trigger reveal animation
      setIsRevealed(true)
      revealOpacity.value = withTiming(1, { duration: 800 })
      revealScale.value = withTiming(1, { duration: 600 })
    }
  }, [photo.revealed])

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
    transform: [{ scale: revealScale.value }],
  }))

  return (
    <Pressable 
      onPress={isRevealed ? onPress : undefined} 
      style={({ pressed }) => [
        s.card, 
        { transform: [{ rotate: `${rotation}deg` }, { scale: pressed && isRevealed ? 0.98 : 1 }] }
      ]}
    >
      <View style={s.imageContainer}>
        <DevelopingOverlay revealAt={photo.revealAt} />
        
        {isRevealed && photo.url && (
          <Animated.View style={[StyleSheet.absoluteFillObject, imageAnimatedStyle, { zIndex: 1 }]}>
            <Image source={photo.url} style={s.image} contentFit="cover" transition={300} />
          </Animated.View>
        )}
      </View>
      <View style={s.footer}>
        <Text style={s.takerName} numberOfLines={1}>{photo.takerName}</Text>
      </View>
    </Pressable>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 8,
    paddingBottom: 24,
    borderRadius: 2,
    shadowColor: '#FFD200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    aspectRatio: 0.8,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    alignItems: 'center',
  },
  takerName: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: '#000',
    opacity: 0.6,
  },
})
