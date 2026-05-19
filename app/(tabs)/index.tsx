import { View, StyleSheet, Dimensions, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ACCENT, BG, TEXT_SECONDARY } from '@/lib/theme'
import { useProfile } from '@/hooks/useProfile'

const { width: SW, height: SH } = Dimensions.get('window')

export default function DashboardScreen() {
    const insets = useSafeAreaInsets()
    const { data: profile } = useProfile()

    const greeting = (() => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    })()

    const firstName = profile?.fullName?.split(' ')[0] || 'Photographer'

    return (
        <View style={s.root}>
            {/* Background gradient */}
            <LinearGradient
                pointerEvents="none"
                colors={[BG, '#140c00', '#1a1000', BG]}
                locations={[0, 0.3, 0.6, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Grain Overlay */}
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, s.grain]} />

            {/* Floating decorative orbs */}
            <View pointerEvents="none" style={s.orbOne} />
            <View pointerEvents="none" style={s.orbTwo} />

            <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 100 }]}>
                {/* ── Header section ── */}
                <View style={s.headerWrap}>
                    <Text style={s.greeting}>{greeting}, {firstName}</Text>
                    <Text style={s.subtitle}>Ready to shoot some film?</Text>
                </View>

                {/* ── Actions ── */}
                <View style={s.actionsWrap}>
                    <Button 
                        label="Create a New Roll" 
                        size="lg" 
                        fullWidth 
                        onPress={() => router.push('/event/create')} 
                    />
                    <Button 
                        label="Join an Existing Roll" 
                        variant="outline" 
                        size="lg" 
                        fullWidth 
                        onPress={() => router.push('/event/join')} 
                        style={{ marginTop: 16 }}
                    />
                </View>

            </ScrollView>
        </View>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    grain: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    orbOne: {
        position: 'absolute',
        right: -SW * 0.25,
        top: SH * 0.1,
        width: SW * 0.72,
        height: SW * 0.72,
        borderRadius: 999,
        backgroundColor: `${ACCENT}1A`,
        filter: [{ blur: 40 }],
    },
    orbTwo: {
        position: 'absolute',
        left: -SW * 0.32,
        bottom: SH * 0.2,
        width: SW * 0.66,
        height: SW * 0.66,
        borderRadius: 999,
        backgroundColor: `${ACCENT}14`,
        filter: [{ blur: 40 }],
    },
    headerWrap: {
        gap: 8,
        marginBottom: 60,
    },
    greeting: {
        color: '#fff',
        fontSize: 32,
        fontFamily: 'Arvo_700Bold',
        letterSpacing: 0.5,
    },
    subtitle: {
        color: TEXT_SECONDARY,
        fontSize: 16,
        lineHeight: 24,
    },
    actionsWrap: {
        width: '100%',
    },
})
