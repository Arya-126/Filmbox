import { View, StyleSheet, TextInput } from 'react-native'
import { Text } from '@/components/ui/Text'
import { ACCENT, BORDER, TEXT_PRIMARY, TEXT_SECONDARY } from '@/lib/theme'

export function JoinCodeInput({ value, onChangeText }: { value: string, onChangeText: (val: string) => void }) {
  return (
    <View style={s.container}>
      <Text style={s.label}>Enter 6-digit code</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={t => onChangeText(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
        placeholder="ABCDEF"
        placeholderTextColor="rgba(255, 255, 255, 0.2)"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  label: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: 4,
  },
  input: {
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    color: ACCENT,
    fontSize: 32,
    fontFamily: 'SpaceMono_400Regular',
    textAlign: 'center',
    letterSpacing: 6,
  },
})
