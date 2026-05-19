import { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { JoinCodeInput } from '@/components/Event/JoinCodeInput'
import { BG, TEXT_SECONDARY } from '@/lib/theme'
import { joinEvent } from '@/lib/events'
import { useToast } from '@/contexts/ToastContext'
import { supabase } from '@/lib/supabase'
import { AlertModal } from '@/components/ui/AppModal'

export default function JoinEventScreen() {
  const insets = useSafeAreaInsets()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const { showToast } = useToast()
  const [showNameModal, setShowNameModal] = useState(false)
  const [eventCode, setEventCode] = useState('')

  const handleJoin = async () => {
    if (code.length !== 6) return
    setLoading(true)
    
    try {
      const event = await joinEvent(code)
      setEventCode(event.code)
      
      // Check if user has display name
      const { data } = await supabase.auth.getUser()
      if (!data.user?.user_metadata?.display_name) {
        setShowNameModal(true)
      } else {
        router.replace(`/event/${event.code}`)
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to join event', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleNameSubmit = async () => {
    // For now we'll just set it to 'Guest' as a fallback if they don't enter anything
    // A more advanced modal would include a TextInput inside it. We will use a predefined action 
    // or just assume they will be prompted in the gallery/camera if needed.
    // For simplicity, we just set a mock name here since AlertModal doesn't have an input field.
    await supabase.auth.updateUser({ data: { display_name: 'Guest' } })
    setShowNameModal(false)
    router.replace(`/event/${eventCode}`)
  }

  return (
    <KeyboardAvoidingView 
      style={s.root} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        
        <View style={s.header}>
          <Text style={s.title}>Join Roll</Text>
          <Text style={s.subtitle}>Enter the 6-digit code from the host to join the camera.</Text>
        </View>

        <View style={s.form}>
          <JoinCodeInput value={code} onChangeText={setCode} />

          <Button 
            label="Join Event" 
            size="lg" 
            fullWidth 
            onPress={handleJoin}
            loading={loading}
            disabled={code.length !== 6 || loading}
            style={{ marginTop: 16 }}
          />
        </View>

      </ScrollView>

      <AlertModal 
        visible={showNameModal}
        title="Welcome!"
        message="Please set a display name for this event."
        buttons={[
          { text: "Continue as Guest", onPress: handleNameSubmit }
        ]}
        onDismiss={() => setShowNameModal(false)}
      />
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  header: {
    marginBottom: 40,
    gap: 8,
  },
  title: {
    fontFamily: 'Arvo_700Bold',
    fontSize: 32,
    color: '#fff',
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 24,
  },
})
