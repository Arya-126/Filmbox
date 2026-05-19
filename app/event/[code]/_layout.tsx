import { Tabs } from 'expo-router'
import { Camera, Grid } from 'lucide-react-native'
import TabBar, { TAB_BAR_HEIGHT } from '@/components/TabBar'
import { BG } from '@/lib/theme'

export default function EventRoomLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: BG },
        tabBarStyle: { height: TAB_BAR_HEIGHT },
      }}
    >
      <Tabs.Screen
        name="camera"
        options={{
          tabBarLabel: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <Camera size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="gallery"
        options={{
          tabBarLabel: 'Gallery',
          tabBarIcon: ({ color, size }) => (
            <Grid size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="download"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
