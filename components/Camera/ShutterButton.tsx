import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { FILM_RED } from '@/lib/theme'

export function ShutterButton({ onPress, disabled = false }: { onPress: () => void, disabled?: boolean }) {
  const scale = useSharedValue(1)

  const handlePressIn = () => {
    if (disabled) return
    scale.value = withSpring(0.9, { damping: 10, stiffness: 200 })
  }

  const handlePressOut = () => {
    if (disabled) return
    scale.value = withSpring(1, { damping: 10, stiffness: 200 })
  }

  const handlePress = () => {
    if (disabled) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    onPress()
  }

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }))

  return (
    <View style={s.outer}>
      <Animated.View style={[s.innerWrap, style]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={disabled}
          style={s.button}
        />
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  outer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  innerWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: FILM_RED,
    borderWidth: 2,
    borderColor: 'rgba(200, 30, 40, 1)',
  },
})
