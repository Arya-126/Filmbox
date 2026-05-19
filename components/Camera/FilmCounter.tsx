import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'

export function FilmCounter({ current, max = 27 }: { current: number, max?: number }) {
  // Mock display: string of dots representing shots used
  // Just show count for now, adding dots could be tricky to fit. Or we can just use monospace font
  const remaining = max - current

  return (
    <View style={s.container}>
      <Text style={s.count}>{String(remaining).padStart(2, '0')}</Text>
      <Text style={s.label}>SHOTS</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: '#FFD200',
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
})
