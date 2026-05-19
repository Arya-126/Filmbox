import { View, StyleSheet, Pressable, Share } from 'react-native'
import { Text } from '@/components/ui/Text'
import { ACCENT, BG, BORDER, TEXT_SECONDARY, TEXT_PRIMARY } from '@/lib/theme'
import { Share as ShareIcon } from 'lucide-react-native'
import QRCode from 'react-native-qrcode-svg'
import { APP_NAME, APP_SCHEME } from '@/lib/constants'

export function EventCodeCard({ code, maxShots = 27, delayHours = 1 }: { code: string, maxShots?: number, delayHours?: number }) {
  const qrData = `${APP_SCHEME}://join?code=${code}`

  const onShare = async () => {
    try {
      await Share.share({
        message: `Join my ${APP_NAME} event! Enter code: ${code}\nOr tap to join: ${qrData}`,
      })
    } catch (error) {
      console.error('Error sharing code', error)
    }
  }

  return (
    <View style={s.card}>
      <Text style={s.subtitle}>{maxShots} shots · {delayHours} hr delay</Text>
      
      <View style={s.qrWrapper}>
        <QRCode
          value={qrData}
          size={160}
          color={ACCENT}
          backgroundColor="transparent"
        />
      </View>

      <View style={s.codeBox}>
        <Text style={s.code}>{code}</Text>
      </View>
      <Pressable style={s.shareBtn} onPress={onShare}>
        <ShareIcon size={18} color={BG} />
        <Text style={s.shareText}>Share Code</Text>
      </Pressable>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: 'rgba(255, 210, 0, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 210, 0, 0.15)',
  },
  codeBox: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 210, 0, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 210, 0, 0.3)',
  },
  code: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 42,
    color: ACCENT,
    letterSpacing: 8,
    textAlign: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  shareText: {
    color: BG,
    fontSize: 15,
    fontWeight: '700',
  },
})
