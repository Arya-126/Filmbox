import { useEffect } from 'react'
import { View, Pressable, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Camera, Film } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ACCENT, BG, BORDER, TEXT_SECONDARY, TEXT_PRIMARY, ACCENT_DIM, ACCENT_BORDER, ACCENT_GLOW } from '@/lib/theme'
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/lib/constants'

const { width: SW, height: SH } = Dimensions.get('window')

export default function LandingScreen() {
    const insets = useSafeAreaInsets()

    // ── Animations ──
    const iconScale = useSharedValue(0.6)
    const iconOpacity = useSharedValue(0)
    const iconRotate = useSharedValue(-10)
    const heroScale = useSharedValue(0.88)
    const heroOpacity = useSharedValue(0)
    const actionsY = useSharedValue(30)
    const actionsOpacity = useSharedValue(0)
    const footerOpacity = useSharedValue(0)
    const orbOneY = useSharedValue(0)
    const orbTwoY = useSharedValue(0)
    const ringPulse = useSharedValue(1)

    useEffect(() => {
        // Camera icon
        iconScale.value = withDelay(50, withSpring(1, { damping: 12, stiffness: 90 }))
        iconOpacity.value = withDelay(50, withTiming(1, { duration: 400 }))
        iconRotate.value = withDelay(50, withSpring(0, { damping: 10, stiffness: 80 }))

        // Hero text
        heroScale.value = withDelay(200, withSpring(1, { damping: 14, stiffness: 100 }))
        heroOpacity.value = withDelay(200, withTiming(1, { duration: 550 }))

        // Actions
        actionsY.value = withDelay(400, withSpring(0, { damping: 16, stiffness: 110 }))
        actionsOpacity.value = withDelay(400, withTiming(1, { duration: 480 }))

        // Footer
        footerOpacity.value = withDelay(600, withTiming(1, { duration: 500 }))

        // Floating orbs
        orbOneY.value = withRepeat(
            withSequence(
                withTiming(-16, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        )
        orbTwoY.value = withRepeat(
            withSequence(
                withTiming(14, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        )

        // Ring pulse
        ringPulse.value = withRepeat(
            withSequence(
                withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
            ), -1, true
        )
    }, [])

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }, { rotate: `${iconRotate.value}deg` }],
        opacity: iconOpacity.value,
    }))
    const heroStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heroScale.value }],
        opacity: heroOpacity.value,
    }))
    const actionsStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: actionsY.value }],
        opacity: actionsOpacity.value,
    }))
    const footerStyle = useAnimatedStyle(() => ({ opacity: footerOpacity.value }))
    const orbOneStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbOneY.value }] }))
    const orbTwoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: orbTwoY.value }] }))
    const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringPulse.value }] }))

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
            <Animated.View pointerEvents="none" style={[s.orbOne, orbOneStyle]} />
            <Animated.View pointerEvents="none" style={[s.orbTwo, orbTwoStyle]} />

            <View style={s.content}>
                {/* ── Camera Icon ── */}
                <Animated.View style={[s.iconWrap, iconStyle]}>
                    <Animated.View style={[s.iconRing, ringStyle]} />
                    <View style={s.iconCircle}>
                        <Camera size={36} color={BG} strokeWidth={2.2} />
                    </View>
                </Animated.View>

                {/* ── Hero section ── */}
                <Animated.View style={[s.heroWrap, heroStyle]}>
                    <Text style={s.heroTitle}>{APP_NAME}</Text>
                    <Text style={s.heroTagline}>{APP_TAGLINE}</Text>
                    <Text style={s.heroDesc}>{APP_DESCRIPTION}</Text>
                </Animated.View>

                {/* ── Actions ── */}
                <Animated.View style={[s.actionsWrap, actionsStyle]}>
                    <Button 
                        label="Create Event" 
                        size="lg" 
                        fullWidth 
                        onPress={() => router.push('/event/create')} 
                    />
                    <Button 
                        label="Join Event" 
                        variant="outline" 
                        size="lg" 
                        fullWidth 
                        onPress={() => router.push('/event/join')} 
                    />
                </Animated.View>
            </View>

            {/* ── Footer ── */}
            <Animated.View style={[s.footer, footerStyle, { paddingBottom: insets.bottom + 20 }]}>
                <Pressable
                    onPress={() => router.push('/(auth)/login')}
                    hitSlop={8}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                    <Text style={s.signInText}>Host login: <Text style={s.signInLink}>Sign in</Text></Text>
                </Pressable>
            </Animated.View>
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
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    // Grain overlay mock
    grain: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },

    // Floating orbs
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

    // Camera icon
    iconWrap: {
        alignSelf: 'center',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconRing: {
        position: 'absolute',
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 2,
        borderColor: ACCENT_BORDER,
        backgroundColor: ACCENT_GLOW,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: ACCENT,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },

    // Hero
    heroWrap: {
        alignItems: 'center',
        gap: 16,
        marginBottom: 60,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 56,
        fontFamily: 'Arvo_700Bold',
        letterSpacing: 2,
        textShadowColor: 'rgba(255, 210, 0, 0.4)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 12,
    },
    heroTagline: {
        color: ACCENT,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    heroDesc: {
        color: TEXT_SECONDARY,
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
        maxWidth: 300,
        marginTop: 4,
    },

    // Actions
    actionsWrap: {
        gap: 16,
        width: '100%',
    },

    // Footer
    footer: {
        paddingHorizontal: 20,
        gap: 10,
        alignItems: 'center',
    },
    signInText: {
        color: TEXT_SECONDARY,
        fontSize: 14,
    },
    signInLink: {
        color: ACCENT,
        fontWeight: '600',
    },
})
