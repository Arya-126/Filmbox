import { Modal, View, StyleSheet, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '@/components/ui/Text'
import { MockPhoto } from './PhotoCard'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'

export function FullScreenPhoto({ photo, visible, onClose }: { photo: MockPhoto | null, visible: boolean, onClose: () => void }) {
  const insets = useSafeAreaInsets()

  if (!photo) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.container}>
        <Image source={photo.url} style={s.image} contentFit="contain" />
        
        {/* Header Overlay */}
        <View style={[s.header, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={onClose} style={s.closeBtn}>
            <X size={24} color="#fff" />
          </Pressable>
          <View style={s.info}>
            <Text style={s.taker}>{photo.takerName}</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  image: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  info: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 40, // offset close btn
  },
  taker: {
    color: '#fff',
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 14,
  },
})
