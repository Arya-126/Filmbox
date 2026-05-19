import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated'
import { useEffect } from 'react'
import { ShutterButton } from './ShutterButton'
import { FilmCounter } from './FilmCounter'
import { SEPIA_OVERLAY, BG, ACCENT } from '@/lib/theme'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

export function DisposableCamera({ 
  onCapture, 
  shotsTaken, 
  maxShots,
  cameraRef,
  capturing = false,
}: { 
  onCapture: () => void, 
  shotsTaken: number, 
  maxShots: number,
  cameraRef?: React.RefObject<CameraView | null>,
  capturing?: boolean,
}) {
  const insets = useSafeAreaInsets()
  const [permission, requestPermission] = useCameraPermissions()

  // White flash animation
  const flashOpacity = useSharedValue(0)

  useEffect(() => {
    if (capturing) {
      flashOpacity.value = 1
      flashOpacity.value = withTiming(0, { duration: 300 })
    }
  }, [capturing])

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }))

  if (!permission) {
    return <View style={s.container} />
  }

  if (!permission.granted) {
    return (
      <View style={s.permissionContainer}>
        <Text style={s.permissionText}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} label="Grant Permission" />
      </View>
    )
  }

  return (
    <View style={s.container}>
      {/* Camera Preview */}
      <View style={s.previewArea}>
        <CameraView style={s.mockCamera} facing="back" ref={cameraRef} />
        
        {/* Sepia Tint */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: SEPIA_OVERLAY }]} />
        
        {/* Grain Mock */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, s.grain]} />
        
        {/* Vignette Mock */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, s.vignette]} />

        {/* White Flash on Capture */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, s.flash, flashStyle]} />
      </View>

      {/* Top HUD */}
      <View style={[s.hudTop, { top: insets.top + 10 }]}>
        <FilmCounter current={shotsTaken} max={maxShots} />
      </View>

      {/* Bottom Controls */}
      <View style={[s.hudBottom, { bottom: insets.bottom + 100 }]}>
        <ShutterButton onPress={onCapture} disabled={shotsTaken >= maxShots} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  previewArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mockCamera: {
    flex: 1,
    backgroundColor: '#111',
  },
  grain: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  vignette: {
    borderWidth: 60,
    borderColor: 'rgba(0,0,0,0.4)',
    borderRadius: 80,
    margin: -40,
  },
  flash: {
    backgroundColor: '#fff',
    zIndex: 99,
  },
  hudTop: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  hudBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
})
