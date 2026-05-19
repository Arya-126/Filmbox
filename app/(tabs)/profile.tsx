import { useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { AlertModal } from '@/components/ui/AppModal'
import SettingsRow from '@/components/ui/SettingsRow'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import {
    BG,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    TEXT_TERTIARY,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useProfile } from '@/hooks/useProfile'

export default function ProfileScreen() {
    const insets = useSafeAreaInsets()
    const { data: profile } = useProfile()
    const [signOutModal, setSignOutModal] = useState(false)
    const [signingOut, setSigningOut] = useState(false)
    const [errorModal, setErrorModal] = useState<string | null>(null)

    async function handleSignOut() {
        setSigningOut(true)
        try {
            track('logout')
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (e: any) {
            setErrorModal(e?.message ?? 'Sign out failed. Please try again.')
        } finally {
            setSigningOut(false)
        }
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 40, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
            showsVerticalScrollIndicator={false}
        >
            <Card style={s.heroCard}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.01)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={s.avatarWrap}>
                    <Text style={s.avatarText}>{profile?.initials ?? 'G'}</Text>
                </View>

                <Text style={s.name}>{profile?.fullName ?? 'Photographer'}</Text>
                <Text style={s.metaText}>{profile?.email ?? 'Logged in via Code'}</Text>
            </Card>

            <Text style={s.sectionTitle}>Account</Text>
            <Card compact style={s.sectionCard}>
                <SettingsRow icon="help-buoy-outline" label="Support" onPress={() => router.push('/support')} />
                <SettingsRow icon="document-text-outline" label="Privacy Policy" onPress={() => router.push('/privacy')} />
                <SettingsRow icon="shield-checkmark-outline" label="Terms of Service" onPress={() => router.push('/terms')} last={true} />
            </Card>

            <Pressable
                onPress={() => setSignOutModal(true)}
                disabled={signingOut}
                style={({ pressed }) => [s.signOutBtn, (pressed || signingOut) && { opacity: 0.72 }]}
            >
                <Ionicons name="log-out-outline" size={17} color="rgba(255,255,255,0.45)" />
                <Text style={s.signOutText}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
            </Pressable>

            <AlertModal
                visible={signOutModal}
                title="Sign out"
                message="You will be signed out of your account."
                buttons={[
                    { text: 'Cancel', style: 'cancel', onPress: () => setSignOutModal(false) },
                    { text: 'Sign out', style: 'destructive', onPress: () => { setSignOutModal(false); handleSignOut() } },
                ]}
                onDismiss={() => setSignOutModal(false)}
            />

            <AlertModal
                visible={!!errorModal}
                title="Error"
                message={errorModal ?? ''}
                buttons={[{ text: 'OK', onPress: () => setErrorModal(null) }]}
                onDismiss={() => setErrorModal(null)}
            />
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 14 },
    heroCard: {
        overflow: 'hidden',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 24,
    },
    avatarWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginBottom: 8,
    },
    avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
    name: { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.4 },
    metaText: { fontSize: 13, color: TEXT_SECONDARY },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: TEXT_TERTIARY,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: 12,
        marginBottom: -4,
    },
    sectionCard: { padding: 0, overflow: 'hidden' },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: 12,
        marginTop: 10,
    },
    signOutText: { color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: '500' },
})
