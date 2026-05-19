import { FlatList, View, StyleSheet } from 'react-native'
import { PhotoCard, MockPhoto } from './PhotoCard'

export function PhotoGrid({ photos, onPhotoPress }: { photos: MockPhoto[], onPhotoPress: (p: MockPhoto) => void }) {
  return (
    <FlatList
      data={photos}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={s.content}
      columnWrapperStyle={s.column}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={s.itemWrap}>
          <PhotoCard photo={item} onPress={() => onPhotoPress(item)} />
        </View>
      )}
    />
  )
}

const s = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 100, // Room for bottom tabs
  },
  column: {
    justifyContent: 'space-between',
  },
  itemWrap: {
    width: '48%',
    marginBottom: 16,
  },
})
