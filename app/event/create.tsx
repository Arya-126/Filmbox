import { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import TextInputField from '@/components/ui/TextInputField'
import { EventCodeCard } from '@/components/Event/EventCodeCard'
import { BG, TEXT_SECONDARY, BORDER } from '@/lib/theme'
import { createEvent } from '@/lib/events'
import { useToast } from '@/contexts/ToastContext'

export default function CreateEventScreen() {
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  
  const [maxShots, setMaxShots] = useState(27)
  const [delayHours, setDelayHours] = useState(1)

  const { showToast } = useToast()

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    
    try {
      // Create event with selected delay (in minutes) and max shots
      const event = await createEvent(name.trim(), delayHours * 60, maxShots)
      setCreatedCode(event.code)
    } catch (err: any) {
      showToast(err.message || 'Failed to create event', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEnterEvent = () => {
    router.replace(`/event/${createdCode}`)
  }

  const SHOT_OPTIONS = [15, 27, 36]
  const DELAY_OPTIONS = [
    { label: 'Instant', value: 0 },
    { label: '1 hr', value: 1 },
    { label: '12 hrs', value: 12 },
    { label: '24 hrs', value: 24 }
  ]

  return (
    <KeyboardAvoidingView 
      style={s.root} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        
        <View style={s.header}>
          <Text style={s.title}>New Roll</Text>
          <Text style={s.subtitle}>Create a shared disposable camera for your event.</Text>
        </View>

        {!createdCode ? (
          <View style={s.form}>
            <TextInputField
              label="Event Name"
              placeholder="e.g. Sarah's Birthday"
              value={name}
              onChangeText={setName}
            />

            <View style={s.settingsBox}>
              <View style={s.settingBlock}>
                <Text style={s.settingLabel}>Film Capacity (Shots)</Text>
                <View style={s.pickerRow}>
                  {SHOT_OPTIONS.map(num => (
                    <Pressable
                      key={num}
                      onPress={() => setMaxShots(num)}
                      style={[s.pickerOption, maxShots === num && s.pickerOptionActive]}
                    >
                      <Text style={[s.pickerText, maxShots === num && s.pickerTextActive]}>{num}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={s.divider} />
              <View style={s.settingBlock}>
                <Text style={s.settingLabel}>Development Delay</Text>
                <View style={s.pickerRow}>
                  {DELAY_OPTIONS.map(opt => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setDelayHours(opt.value)}
                      style={[s.pickerOption, delayHours === opt.value && s.pickerOptionActive]}
                    >
                      <Text style={[s.pickerText, delayHours === opt.value && s.pickerTextActive]}>{opt.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <Button 
              label="Create Event" 
              size="lg" 
              fullWidth 
              onPress={handleCreate}
              loading={loading}
              disabled={!name.trim() || loading}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <View style={s.successWrap}>
            <Text style={s.successTitle}>Roll Ready!</Text>
            <EventCodeCard code={createdCode} />
            <Button 
              label="Enter Camera" 
              size="lg" 
              fullWidth 
              onPress={handleEnterEvent}
              style={{ marginTop: 20 }}
            />
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  header: {
    marginBottom: 32,
    marginTop: 20,
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
  settingsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingBlock: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionActive: {
    borderColor: 'rgba(255, 210, 0, 0.4)',
    backgroundColor: 'rgba(255, 210, 0, 0.1)',
  },
  pickerText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500',
  },
  pickerTextActive: {
    color: '#FFD200',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
  },
  settingLabel: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  successWrap: {
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
})
