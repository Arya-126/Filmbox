import { View, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated'
import { useEffect, useState } from 'react'
import { DEVELOPING_BG, ACCENT } from '@/lib/theme'
import { Text } from '@/components/ui/Text'

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function DevelopingOverlay({ revealAt }: { revealAt: Date | string }) {
  const opacity = useSharedValue(0.4)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    )
  }, [])

  // Countdown timer
  useEffect(() => {
    const update = () => {
      const revealTime = typeof revealAt === 'string' ? new Date(revealAt).getTime() : revealAt.getTime()
      const remaining = revealTime - Date.now()
      setCountdown(formatCountdown(remaining))
    }

    update() // immediate
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [revealAt])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <View style={s.container}>
      <Animated.View style={[StyleSheet.absoluteFillObject, s.shimmer, style]} />
      <Text style={s.text}>developing...</Text>
      <Text style={s.countdown}>{countdown}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DEVELOPING_BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shimmer: {
    backgroundColor: 'rgba(255, 210, 0, 0.1)',
  },
  text: {
    fontFamily: 'SpaceMono_400Regular',
    color: ACCENT,
    fontSize: 10,
    letterSpacing: 1,
    opacity: 0.8,
  },
  countdown: {
    fontFamily: 'SpaceMono_400Regular',
    color: ACCENT,
    fontSize: 14,
    letterSpacing: 2,
    opacity: 0.6,
  },
})
