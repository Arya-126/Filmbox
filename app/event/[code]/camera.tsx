import { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { CameraView } from 'expo-camera'
import { DisposableCamera } from '@/components/Camera/DisposableCamera'
import { useToast } from '@/contexts/ToastContext'
import { BG, ACCENT } from '@/lib/theme'
import { useGlobalSearchParams } from 'expo-router'
import { useEvent } from '@/hooks/useEvent'
import { useCamera } from '@/hooks/useCamera'
import { uploadPhoto } from '@/lib/photos'
import { supabase } from '@/lib/supabase'

export default function CameraTab() {
  const { code } = useGlobalSearchParams<{ code: string }>()
  const { showToast } = useToast()
  
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(code)
  const { shotsTaken, canTakePhoto, loading: cameraLoading, incrementShots } = useCamera(event?.id || '', event?.max_shots || 27)
  const [capturing, setCapturing] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    if (eventError) {
      console.error('[CameraTab] Error loading event:', eventError)
      showToast(`Error loading event details: ${eventError.message}`, 'error')
    }
  }, [eventError])

  const handleCapture = async () => {
    console.log('[Camera] Shutter clicked', {
      code,
      canTakePhoto,
      capturing,
      cameraRef: !!cameraRef.current,
      event: !!event,
      eventError: eventError?.message || null
    })

    if (capturing) {
      showToast('Camera is busy...', 'info')
      return
    }
    if (!event) {
      showToast('Loading event details...', 'info')
      return
    }
    if (!canTakePhoto) {
      showToast('Film roll finished! No more shots left.', 'error')
      return
    }
    if (!cameraRef.current) {
      showToast('Camera is initializing, please try again.', 'info')
      return
    }
    
    setCapturing(true)
    
    try {
      // 1. Capture image from camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      })
      
      if (!photo?.uri) {
        showToast('Camera failed to capture image', 'error')
        return
      }

      // 2. Try uploading to Supabase
      try {
        const { data: user } = await supabase.auth.getUser()
        const takerName = user.user?.user_metadata?.display_name || 'Guest'
        
        await uploadPhoto(event.id, photo.uri, takerName, event.delay_minutes)
        
        // 3. Success — update UI
        incrementShots()
        showToast('Photo captured! 📸', 'success')
        
        if (shotsTaken + 1 >= event.max_shots) {
          showToast('Film roll finished — no more shots', 'info')
        }
      } catch (uploadErr: any) {
        console.error('[Camera] Upload error:', uploadErr)
        // Photo was captured but upload failed — still count the shot locally
        incrementShots()
        showToast(`Photo saved locally but upload failed: ${uploadErr?.message || 'Check Supabase storage bucket'}`, 'error')
      }
    } catch (err: any) {
      console.error('[Camera] Capture error:', err)
      showToast(`Camera error: ${err?.message || 'Unknown error'}`, 'error')
    } finally {
      setCapturing(false)
    }
  }

  if (eventLoading || cameraLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={ACCENT} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <DisposableCamera 
        cameraRef={cameraRef}
        onCapture={handleCapture}
        shotsTaken={shotsTaken}
        maxShots={event?.max_shots || 27}
        capturing={capturing}
      />
    </View>
  )
}
